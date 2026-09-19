# Angular Best Practices Skill

## Overview
This skill guides the development of Angular applications following industry best practices, maintainability, and performance standards.

## Principles

### Component Architecture
- Use standalone components by default (Angular 15+)
- Keep components focused on a single responsibility
- Prefer composition over inheritance
- Use `OnPush` change detection for performance

### State Management
- Use services for shared state
- Prefer RxJS observables for reactive data flow
- Avoid direct state mutations
- Consider NgRx for complex state management scenarios

### Services & HTTP
- Always use dependency injection for services
- Implement proper error handling for HTTP requests
- Use interceptors for cross-cutting concerns (auth, logging)
- Implement caching strategies appropriately

### Testing
- Write unit tests for all public APIs
- Test components with ComponentFixture
- Mock external dependencies
- Aim for 80%+ code coverage

### Performance
- Use trackBy in *ngFor loops
- Implement lazy loading for routes
- Use Angular CLI for builds (optimization, AOT)
- Monitor bundle size

### Accessibility
- Use semantic HTML
- Add proper ARIA attributes
- Ensure keyboard navigation
- Test with screen readers

## Project Standards

This project uses:
- TypeScript strict mode
- Angular CLI
- ESLint + Prettier
- Jest for testing