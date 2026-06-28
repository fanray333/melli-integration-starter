import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMelliCore,
  createOllamaProvider,
} from '../src/index.js';

test('routes to configured provider', async () => {
  const core = createMelliCore({
    defaultProvider: 'fake',
    providers: {
      fake: {
        async chat() {
          return { content: 'hello' };
        },
      },
    },
  });

  const result = await core.chat({ messages: [] });
  assert.equal(result.content, 'hello');
  assert.equal(result.provider, 'fake');
});

test('falls back to second provider', async () => {
  const core = createMelliCore({
    defaultProvider: 'first',
    fallbackOrder: ['first', 'second'],
    providers: {
      first: {
        async chat() {
          throw new Error('first failed');
        },
      },
      second: {
        async chat() {
          return { content: 'fallback' };
        },
      },
    },
  });

  const result = await core.chat({ messages: [] });
  assert.equal(result.content, 'fallback');
  assert.equal(result.provider, 'second');
});

test('blocks public Ollama base URLs by default', () => {
  assert.throws(
    () => createOllamaProvider({ baseUrl: 'https://example.com', model: 'llama3.1' }),
    /local\/private/,
  );
});

test('allows local Ollama base URL', () => {
  assert.doesNotThrow(() => createOllamaProvider({ baseUrl: 'http://localhost:11434', model: 'llama3.1' }));
});
