# API Integration Skill

## Overview
Guidelines for consuming external APIs in Angular applications, with a focus on reliability, error handling, and user experience.

## Best Practices

### Service Design
- Create dedicated services for each API
- Use TypeScript interfaces for all request/response types
- Implement retry logic for failed requests
- Add timeout handling

### Error Handling
- Display user-friendly error messages
- Log errors for debugging
- Implement fallback strategies when possible
- Handle different error codes appropriately

### Loading States
- Show loading indicators during requests
- Handle empty states gracefully
- Provide feedback for success/failure
- Disable controls during requests

### Security
- Never expose API keys in client code
- Implement proper authentication flow
- Validate all user inputs before sending
- Handle CSRF tokens when required

## Current Project: PokeAPI Integration

For this project, we will consume:
- Base URL: https://pokeapi.co/api/v2
- Endpoints: Pokémon list, Pokémon details, types, abilities
- Rate limits: Be mindful of API rate limiting
- Caching: Consider implementing caching for repeated requests