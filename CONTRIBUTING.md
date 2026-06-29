# Contributing

Thanks for your interest in MELLI Public Integration Starter.

This repository is intentionally small and public-safe. Contributions should improve the starter package without adding private MELLI production logic.

## Before Opening a Pull Request

- Run `npm test`.
- Do not commit `.env` files, API keys, tokens, customer data, private prompts, or production configuration.
- Keep examples generic and customer-neutral.
- Keep provider URLs, Telegram examples, and tool examples safe by default.
- Read `SECURITY.md` before changing network, provider, webhook, or tool execution code.

## Good Contributions

- Documentation fixes
- Safer example defaults
- Additional tests for existing starter behavior
- Small provider or adapter improvements that remain generic
- Better validation examples for tool execution

## Out of Scope

- Production MELLI application code
- Customer-specific routing or business logic
- Database schemas, billing, auth, dashboards, analytics, or operational runbooks
- Private prompts or production agent orchestration
- Hardware or physical entrypoint implementation details

## Security

Please do not report security issues in public GitHub issues. Follow `SECURITY.md`.
