import type { ModelCallInput, ModelCallOutput } from "../types";

const NVIDIA_CHAT_COMPLETIONS_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function callNvidiaModel(input: ModelCallInput): Promise<ModelCallOutput> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("AI_PROVIDER_NOT_CONFIGURED");

  const startedAt = Date.now();
  const timeoutMs = Number(process.env.HCIL_AI_TIMEOUT_MS ?? 30_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(NVIDIA_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        messages: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userPrompt },
        ],
        temperature: input.temperature,
        max_tokens: input.maxTokens,
        stream: false,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      // Do not expose provider response bodies; they can contain operational details.
      if (response.status === 429) throw new Error("AI_PROVIDER_RATE_LIMITED");
      if (response.status >= 500) throw new Error("AI_PROVIDER_UNAVAILABLE");
      throw new Error("AI_PROVIDER_REQUEST_REJECTED");
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload)) throw new Error("AI_PROVIDER_INVALID_RESPONSE");
    const choices = payload.choices;
    if (!Array.isArray(choices) || !isRecord(choices[0])) {
      throw new Error("AI_PROVIDER_INVALID_RESPONSE");
    }
    const message = choices[0].message;
    if (!isRecord(message) || typeof message.content !== "string" || !message.content.trim()) {
      throw new Error("AI_PROVIDER_EMPTY_RESPONSE");
    }

    return {
      text: message.content,
      provider: "nvidia",
      model: input.model,
      requestId: typeof payload.id === "string" ? payload.id : undefined,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AI_PROVIDER_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
