export function createTool(definition) {
  if (!definition?.name) throw new Error('Tool requires a name');
  if (typeof definition.execute !== 'function') throw new Error('Tool requires execute(input, context)');

  return {
    name: definition.name,
    description: definition.description || '',
    schema: definition.schema || { type: 'object', additionalProperties: true },
    execute: definition.execute,
  };
}

export function normalizeToolCall(value) {
  if (!value || typeof value !== 'object') return null;
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  if (!name) return null;

  return {
    name,
    input: value.input && typeof value.input === 'object' ? value.input : {},
  };
}

