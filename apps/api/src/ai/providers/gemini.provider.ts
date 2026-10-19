import { Injectable, Logger } from "@nestjs/common";
import { AIProvider } from "./ai-provider.interface";

@Injectable()
export class GeminiProvider implements AIProvider {
  readonly name = "google";
  readonly defaultModel = "gemini-1.5-pro";
  private readonly logger = new Logger(GeminiProvider.name);

  async *generateStream(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    apiKey?: string,
    baseUrl?: string,
  ): AsyncGenerator<string> {
    if (!apiKey) {
      throw new Error("No se proporcionó API Key de Google Gemini.");
    }

    const host = baseUrl || "https://generativelanguage.googleapis.com";
    const url = `${host}/v1beta/models/${this.defaultModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const formattedContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: formattedContents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`Error de Gemini API: ${err}`);
      throw new Error(`Google Gemini Error (${response.status}): ${err}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No se pudo iniciar el stream de respuesta.");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") return;
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              yield text;
            }
          } catch {
            // Buffer incompleto
          }
        }
      }
    }
  }

  async generate(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    apiKey?: string,
    baseUrl?: string,
  ): Promise<string> {
    let result = "";
    for await (const chunk of this.generateStream(systemPrompt, messages, apiKey, baseUrl)) {
      result += chunk;
    }
    return result;
  }
}
