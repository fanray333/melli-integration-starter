function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

export function createOpenAICompatibleProvider(options = {}) {
  const name = options.name || 'openai-compatible';
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const model = options.model;
  const apiKey = options.apiKey;

  if (!baseUrl) throw new Error(`${name} provider requires baseUrl`);
  if (!model) throw new Error(`${name} provider requires model`);

  return {
    async chat(request) {
      if (!apiKey) throw new Error(`${name} provider requires apiKey`);

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: request?.model || model,
          messages: request?.messages || [],
          temperature: request?.temperature ?? 0.2,
          max_tokens: request?.maxTokens ?? 800,
          ...(request?.json ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: AbortSignal.timeout(request?.timeoutMs ?? 30000),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload?.error?.message || payload?.error || `${name} request failed: ${response.status}`;
        throw new Error(message);
      }

      const content = payload?.choices?.[0]?.message?.content;
      if (!content) throw new Error(`${name} returned empty content`);
      return { content, raw: payload };
    },
  };
}

