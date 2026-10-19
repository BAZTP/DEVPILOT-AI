import { Injectable, Logger } from "@nestjs/common";
import { AIProvider } from "./ai-provider.interface";

@Injectable()
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly defaultModel = "claude-3-5-sonnet-20241022";
  private readonly logger = new Logger(AnthropicProvider.name);

  async *generateStream(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    apiKey?: string,
    baseUrl?: string,
  ): AsyncGenerator<string> {
    if (!apiKey) {
      throw new Error("No se proporcionó API Key de Anthropic.");
    }

    const host = baseUrl || "https://api.anthropic.com";
    const url = `${host}/v1/messages`;

    const formattedMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.defaultModel,
        system: systemPrompt,
        messages: formattedMessages,
        max_tokens: 8192,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`Error de Anthropic API: ${err}`);
      throw new Error(`Anthropic Error (${response.status}): ${err}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No se pudo iniciar el stream de Anthropic.");

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
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              yield parsed.delta.text;
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
