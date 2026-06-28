function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createMelliCore(config) {
  const providers = config?.providers || {};
  const fallbackOrder = asArray(config?.fallbackOrder);
  const defaultProvider = config?.defaultProvider || fallbackOrder[0] || Object.keys(providers)[0];

  if (!defaultProvider || !providers[defaultProvider]) {
    throw new Error('MELLI Core requires at least one configured provider');
  }

  async function chat(request) {
    const requestedProvider = request?.provider || defaultProvider;
    const order = [
      requestedProvider,
      ...fallbackOrder.filter((name) => name !== requestedProvider),
    ];

    let lastError;
    for (const name of order) {
      const provider = providers[name];
      if (!provider) continue;

      try {
        const result = await provider.chat(request);
        return {
          ...result,
          provider: name,
        };
      } catch (error) {
        lastError = error;
        if (request?.fallback === 'none') break;
      }
    }

    throw lastError || new Error('No MELLI Core provider could satisfy the request');
  }

  return {
    chat,
    providers: () => Object.keys(providers),
  };
}

