# Project Structure Steering

## Directory Layout

```
src/
├── app/
│   ├── core/           # Core module (services, interceptors)
│   ├── shared/         # Shared components, directives, pipes
│   ├── features/       # Feature modules (todos, pokemons)
│   └── app.config.ts   # App configuration
├── assets/
└── environments/
```

## Naming Conventions

- Components: `component-name.component.ts`
- Services: `service-name.service.ts`
- Interfaces: `IEntityName.ts` or `EntityName.ts`
- Types: `type-name.type.ts`

## Import Order

1. Angular/core
2. Angular/common
3. Angular/forms
4. RxJS
5. Project paths (core, shared, features)
6. Relative paths