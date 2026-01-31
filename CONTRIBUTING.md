# Contributing to openpmkit

Thank you for your interest in contributing to openpmkit! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/graemerycyk/openpmkit.git
cd openpmkit

# Install dependencies
npm install

# Build
npm run build

# Run CLI in development
npx tsx src/cli/index.ts list
```

## Project Structure

```
openpmkit/
├── src/
│   ├── cli/              # CLI commands (Commander.js)
│   ├── lib/              # Core: types, config, runner, storage
│   ├── crawlers/         # AI Crawlers (Social, Web, News)
│   ├── integrations/     # Integration clients (Slack, Jira, etc.)
│   └── workflows/        # Workflow definitions
├── packages/
│   ├── core/             # Shared utilities, crawlers, telemetry
│   └── prompts/          # LLM prompt templates
├── prompts/              # Workflow prompt definitions
└── skills/               # Skill definitions (SKILL.md files)
```

## Development Workflow

### Running Commands

```bash
# Build everything
npm run build

# Run CLI in development (no build needed)
npx tsx src/cli/index.ts <command>

# Run a specific workflow
npm run run:daily-brief
npm run run:competitor

# Type check
npm run typecheck
```

### Testing with Stubs

```bash
# Run without API key (uses stub responses)
USE_STUB_LLM=true npx tsx src/cli/index.ts run daily-brief

# Run with real API
npx tsx src/cli/index.ts run daily-brief
```

## Code Conventions

### TypeScript

- Use TypeScript strict mode
- Define types in `src/lib/types.ts`
- Use async/await for all async operations

### CLI Commands

- Use Commander.js for command definitions
- Commands are defined in `src/cli/index.ts`
- Follow the existing command patterns

### Credentials

- All credentials stored in `~/.openpmkit/config.json`
- Use `getCredential()` and `setCredential()` from `src/lib/config.ts`
- Never log or expose API keys

## Making Changes

### Adding a New Workflow

1. Create workflow definition in `src/workflows/{name}.ts`
2. Add prompt template in `prompts/{nn}-{name}.md`
3. Register in `src/lib/runner.ts`
4. Add CLI command in `src/cli/index.ts`
5. Add npm script in `package.json`
6. Create skill definition in `skills/pm-{name}/SKILL.md`

### Adding a New Integration

1. Create client in `src/integrations/{name}.ts`
2. Export from `src/integrations/index.ts`
3. Add credential to `CREDENTIALS` array in `src/lib/types.ts`
4. Update setup wizard in `src/cli/index.ts`

### Adding a New Crawler

1. Create crawler in `src/crawlers/{name}.ts`
2. Export from `src/crawlers/index.ts`
3. Add required credentials to `src/lib/types.ts`
4. Create skill definition in `skills/crawler-{name}/SKILL.md`

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Run type check: `npm run typecheck`
5. Test your changes manually
6. Submit a pull request

### PR Guidelines

- Keep PRs focused on a single change
- Write clear commit messages
- Update documentation if needed
- Test with both stub and real API modes

## Documentation

- `README.md` - User-facing documentation
- `CLAUDE.md` - Quick reference for AI agents
- `AGENTS.md` - Detailed documentation for contributors
- `skills/*/SKILL.md` - Individual skill documentation

## Questions?

- Check existing issues for similar questions
- Open a new issue for bugs or feature requests
- Start a discussion for general questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
