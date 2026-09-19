# Coding Standards Steering

## TypeScript Guidelines

- Use strict mode (`strict: true` in tsconfig)
- Prefer `const` over `let`, avoid `var`
- Use explicit types for all public APIs
- Use interfaces for object shapes, type aliases for unions/primitives
- Enable `noImplicitAny` and `strictNullChecks`

## Angular Guidelines

- Use standalone components by default
- Implement `OnPush` change detection where appropriate
- Use signals for reactive state when possible (Angular 16+)
- Prefer observables for async data flow
- Use Angular CLI for all schematics

## Code Quality

- Follow DRY principle
- Keep functions small and focused
- Use meaningful names
- Add JSDoc comments for public APIs
- Handle all error cases
- Clean up subscriptions (use async pipe or takeUntil)

## Testing Standards

- Unit tests for all services and components
- Integration tests for key user flows
- E2E tests for critical paths
- Maintain >80% code coverage