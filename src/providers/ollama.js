function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

function isPrivateIpv4(hostname) {
  const parts = hostname.split('.').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = parts;
  return a === 10
    || a === 127
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168);
}

function assertAllowedBaseUrl(baseUrl, allowRemote) {
  const url = new URL(baseUrl);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Ollama baseUrl must use http or https');
  }

  const hostname = url.hostname.toLowerCase();
  const isLocalHost = hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '::1'
    || hostname.endsWith('.local');

  if (!allowRemote && !isLocalHost && !isPrivateIpv4(hostname)) {
    throw new Error('Ollama baseUrl must be local/private unless allowRemote is true');
  }
}

export function createOllamaProvider(options = {}) {
  const model = options.model || 'llama3.1';
  const baseUrl = normalizeBaseUrl(options.baseUrl || 'http://localhost:11434');
  const allowRemote = options.allowRemote === true;
  assertAllowedBaseUrl(baseUrl, allowRemote);

  return {
    async chat(request) {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: request?.model || model,
          messages: request?.messages || [],
          stream: false,
          ...(request?.json ? { format: 'json' } : {}),
          options: {
            temperature: request?.temperature ?? 0.2,
            num_predict: request?.maxTokens ?? 800,
          },
        }),
        signal: AbortSignal.timeout(request?.timeoutMs ?? 30000),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || `Ollama request failed: ${response.status}`);
      }

      const content = payload?.message?.content;
      if (!content) throw new Error('Ollama returned empty content');
      return { content, raw: payload };
    },
  };
}

