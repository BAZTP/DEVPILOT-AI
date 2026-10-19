import { Injectable, Logger } from "@nestjs/common";
import { AIProvider } from "./ai-provider.interface";

@Injectable()
export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly defaultModel = "gpt-4o";
  private readonly logger = new Logger(OpenAIProvider.name);

  async *generateStream(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    apiKey?: string,
    baseUrl?: string,
  ): AsyncGenerator<string> {
    if (!apiKey) {
      throw new Error("No se proporcionó API Key de OpenAI.");
    }

    const host = baseUrl || "https://api.openai.com/v1";
    const url = `${host}/chat/completions`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: formattedMessages,
        stream: true,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`Error de OpenAI API: ${err}`);
      throw new Error(`OpenAI Error (${response.status}): ${err}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No se pudo iniciar el stream de OpenAI.");

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
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              yield delta;
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
