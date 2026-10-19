export interface AIProvider {
  readonly name: string;
  readonly defaultModel: string;

  generateStream(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    apiKey?: string,
    baseUrl?: string,
  ): AsyncGenerator<string>;

  generate(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    apiKey?: string,
    baseUrl?: string,
  ): Promise<string>;
}
