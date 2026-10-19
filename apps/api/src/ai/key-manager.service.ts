import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class KeyManagerService {
  private readonly logger = new Logger(KeyManagerService.name);
  private readonly algorithm = "aes-256-gcm";
  private readonly encryptionKey: Buffer;

  // Cache en memoria para cuando PostgreSQL no esté configurado
  private memoryConfigStore = new Map<string, { provider: string; modelId: string; encryptedKey: string; baseUrl?: string | undefined }>();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const rawSecret =
      this.configService.get<string>("ENCRYPTION_KEY") ||
      this.configService.get<string>("JWT_SECRET") ||
      "devpilot-master-secret-key-32-chars-long!";
    
    // Generar clave de 32 bytes exactamente con sha256
    this.encryptionKey = crypto.createHash("sha256").update(rawSecret).digest();
  }

  /**
   * Cifra un texto plano mediante AES-256-GCM con IV aleatorio.
   * Formato de retorno: iv:authTag:ciphertext en base64
   */
  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag().toString("base64");

    return `${iv.toString("base64")}:${authTag}:${encrypted}`;
  }

  /**
   * Descifra una cadena previamente cifrada con AES-256-GCM.
   */
  decrypt(payload: string): string {
    const parts = payload.split(":");
    if (parts.length !== 3) {
      throw new Error("Formato de carga cifrada inválido.");
    }

    const [ivB64, authTagB64, dataB64] = parts;
    if (!ivB64 || !authTagB64 || !dataB64) {
      throw new Error("Componentes de cifrado incompletos.");
    }

    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(dataB64, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Almacena de forma segura la clave de un proveedor para un usuario o a nivel global.
   */
  async saveProviderConfig(
    provider: string,
    modelId: string,
    apiKey: string,
    baseUrl?: string,
    userId?: string,
  ): Promise<{ provider: string; modelId: string; configured: boolean }> {
    const encryptedKey = this.encrypt(apiKey);

    try {
      if (userId) {
        await this.prisma.modelConfiguration.upsert({
          where: {
            userId_provider_modelName: {
              userId,
              provider,
              modelName: modelId,
            },
          },
          update: {
            encryptedApiKey: encryptedKey,
            baseUrl,
            isDefault: true,
          },
          create: {
            userId,
            provider,
            modelName: modelId,
            encryptedApiKey: encryptedKey,
            baseUrl,
            isDefault: true,
          },
        });
      }
    } catch {
      this.logger.warn(`Prisma no disponible para guardar clave de ${provider}. Usando almacén en memoria.`);
    }

    // Almacén en memoria como respaldo
    this.memoryConfigStore.set(provider, { provider, modelId, encryptedKey, baseUrl });

    return {
      provider,
      modelId,
      configured: true,
    };
  }

  /**
   * Obtiene la clave descifrada para su uso seguro dentro del proceso de llamada a la IA.
   * NUNCA devolver este valor al frontend.
   */
  async getDecryptedApiKey(provider: string, userId?: string): Promise<{ apiKey: string; baseUrl?: string | undefined } | null> {
    // 1. Intentar variable de entorno del sistema
    const envKeyName = `${provider.toUpperCase()}_API_KEY`;
    const envKey = process.env[envKeyName] || this.configService.get<string>(envKeyName);
    if (envKey) {
      return { apiKey: envKey };
    }

    // 2. Intentar base de datos Prisma
    try {
      if (userId) {
        const config = await this.prisma.modelConfiguration.findFirst({
          where: { userId, provider },
        });
        if (config?.encryptedApiKey) {
          return {
            apiKey: this.decrypt(config.encryptedApiKey),
            baseUrl: config.baseUrl || undefined,
          };
        }
      }
    } catch {
      // Continuar a almacén en memoria
    }

    // 3. Intentar memoria de la sesión
    const mem = this.memoryConfigStore.get(provider);
    if (mem?.encryptedKey) {
      return {
        apiKey: this.decrypt(mem.encryptedKey),
        baseUrl: mem.baseUrl,
      };
    }

    return null;
  }

  /**
   * Lista los proveedores configurados sin revelar las credenciales.
   */
  async listConfiguredProviders(userId?: string): Promise<Array<{ provider: string; configured: boolean }>> {
    const providers = ["google", "anthropic", "openai", "ollama"];
    const results = [];

    for (const p of providers) {
      // Ollama no requiere clave por defecto
      if (p === "ollama") {
        results.push({ provider: p, configured: true });
        continue;
      }

      const hasEnv = !!(process.env[`${p.toUpperCase()}_API_KEY`]);
      const hasMem = this.memoryConfigStore.has(p);
      let hasDb = false;

      try {
        if (userId) {
          const count = await this.prisma.modelConfiguration.count({
            where: { userId, provider: p },
          });
          hasDb = count > 0;
        }
      } catch {
        // Ignorar
      }

      results.push({
        provider: p,
        configured: hasEnv || hasMem || hasDb,
      });
    }

    return results;
  }
}
