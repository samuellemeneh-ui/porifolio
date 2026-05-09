# Contributing to TanaCare

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

1. Fork the repository
2. Clone your fork
3. Create a branch: \`git checkout -b feature/your-feature\`
4. Follow the setup instructions in README.md

## Code Style

### TypeScript
- Use strict mode
- Add types to all function parameters and returns
- Avoid \`any\` type

### React Components
- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic to custom hooks
- Add JSDoc comments to complex components

### File Naming
- Components: PascalCase (\`UserProfile.tsx\`)
- Utils: camelCase (\`formatDate.ts\`)
- Pages: kebab-case (\`user-profile.tsx\`)

## Testing

Write tests for:
- New API utilities
- Complex logic
- Form validation
- Authentication flows

\`\`\`bash
npm run test
\`\`\`

## Commit Messages

Use conventional commits:
\`\`\`
feat: add doctor search filtering
fix: resolve appointment slot conflict
docs: update deployment guide
style: reformat code
test: add unit tests for dates
\`\`\`

## Pull Request Process

1. Update tests and documentation
2. Ensure all tests pass
3. Describe changes clearly
4. Link related issues
5. Wait for code review
6. Address feedback
7. Squash commits if needed

## Reporting Bugs

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs
- Environment details

## Feature Requests

Describe:
- Use case and motivation
- Proposed solution
- Alternative solutions
- Potential impact

## Code Review Guidelines

- Be respectful and constructive
- Ask questions instead of making demands
- Praise good solutions
- Suggest improvements

---

Questions? Open an issue or email support@tanacare.com
\`\`\`
