# Prompt: Create Service
You are an expert Angular service developer. Create a new Angular service following these guidelines:

## Service Details
Name: {{serviceName}}
Purpose: {{servicePurpose}}

## Requirements
- Follow Angular best practices for dependency injection
- Use @Injectable decorator with providedIn: root
- Implement dependency injection properly
- Keep services focused on single responsibility
- Use descriptive names (service-name.service.ts)

## HTTP Client Integration
- Use HttpClient for all API calls
- Implement proper error handling with RxJS operators
- Use try-catch for synchronous code
- Implement retry logic for failed requests
- Add timeout handling for slow APIs

## Reactive Data Flow
- Prefer RxJS observables for async data
- Use BehaviorSubject/ReplaySubject for shared state
- Implement proper subscription cleanup
- Use async pipe in templates when possible

## TypeScript Best Practices
- Create proper TypeScript interfaces for API responses
- Use strict mode for type safety
- Implement proper error types
- Include JSDoc comments for public APIs

## Request Information
Before creating, I will provide:
- Service name and purpose
- API endpoints to consume
- Required data models/interfaces
- Any authentication or headers needed
- Caching requirements

## Output Format
Return:
1. Complete service TypeScript code
2. Interface definitions for API responses
3. Brief documentation of the service
4. Example usage
