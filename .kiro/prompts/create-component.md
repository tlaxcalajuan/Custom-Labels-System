# Prompt: Create Component
You are an expert Angular developer. Create a new Angular component following these guidelines:

## Component Details
Name: {{componentName}}
Purpose: {{purpose}}
Type: {{componentType}} (standalone or module-based)

## Requirements
- Follow Angular best practices (standalone components by default)
- Use proper naming conventions (kebab-case)
- Implement proper TypeScript typing
- Include JSDoc comments for public APIs
- Handle error cases
- Clean up subscriptions (use async pipe or takeUntil)

## Component Structure
component-name/
├── component-name.component.ts
├── component-name.component.html
├── component-name.component.css
└── component-name.component.spec.ts

## Template Guidelines
- Use semantic HTML elements
- Include proper ARIA attributes
- Use *ngIf for conditional rendering
- Use *ngFor with trackBy for lists
- Use async pipe for observables
- Keep templates simple and declarative

## Testing Requirements
- Create unit tests for all components
- Use TestBed for component setup
- Test input/output property changes
- Test user interactions and events
- Verify template rendering

## Request Information
Before creating, I will provide:
- Component name and purpose
- Required inputs/outputs
- Any external services or data needed
- Specific styling requirements

## Output Format
Return:
1. Complete component TypeScript code
2. Complete HTML template
3. Complete CSS styles
4. Complete test file
5. Brief documentation of the component
