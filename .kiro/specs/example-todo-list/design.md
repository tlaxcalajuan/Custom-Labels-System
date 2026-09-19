# Diseño: Sistema de Lista de Tareas con Pokémon

## Arquitectura General

El sistema se implementará como una aplicación Angular standalone con la siguiente estructura:

`
src/app/
├── core/                    # Módulo core
│   └── services/
│       ├── todo.service.ts  # Gestión de tareas
│       └── pokemon.service.ts # Integración con PokeAPI
├── shared/                  # Componentes compartidos
│   ├── components/
│   │   ├── task-list/
│   │   ├── task-form/
│   │   └── pokemon-display/
│   └── models/
│       └── todo.model.ts    # Interfaces TypeScript
└── app.component.ts         # Componente principal
`

## Componentes

### 1. TodoService
**Ubicación**: src/app/core/services/todo.service.ts

**Responsabilidades**:
- Gestionar la lista de tareas
- Persistir datos en localStorage
- Manejar operaciones CRUD

**Métodos**:
- getTasks(): Todo[] - Obtener todas las tareas
- ddTask(task: Todo): void - Agregar nueva tarea
- 	oggleTask(id: string): void - Marcar/desmarcar como completada
- deleteTask(id: string): void - Eliminar tarea
- updateTask(id: string, updates: Partial<Todo>): void - Editar tarea

### 2. PokemonService
**Ubicación**: src/app/core/services/pokemon.service.ts

**Responsabilidades**:
- Consumir la PokeAPI
- Obtener datos de Pokémon aleatorios
- Mapear respuestas a modelos TypeScript

**Métodos**:
- getRandomPokemon(): Observable<Pokemon> - Obtener Pokémon aleatorio
- getPokemonById(id: number): Observable<Pokemon> - Obtener Pokémon por ID

### 3. TaskListComponent
**Ubicación**: src/app/shared/components/task-list/task-list.component.ts

**Responsabilidades**:
- Mostrar la lista de tareas
- Permitir toggling de estado
- Mostrar contador de tareas pendientes

**Inputs**:
- 	asks: Todo[] - Lista de tareas a mostrar

**Outputs**:
- 	askToggled: EventEmitter<Todo> - Evento cuando se toggla una tarea
- 	askDeleted: EventEmitter<string> - Evento cuando se elimina una tarea

### 4. TaskFormComponent
**Ubicación**: src/app/shared/components/task-form/task-form.component.ts

**Responsabilidades**:
- Formulario para agregar nuevas tareas
- Validación de entrada

**Outputs**:
- 	askAdded: EventEmitter<Partial<Todo>> - Evento con nueva tarea

### 5. PokemonDisplayComponent
**Ubicación**: src/app/shared/components/pokemon-display/pokemon-display.component.ts

**Responsabilidades**:
- Mostrar información del Pokémon actual
- Mostrar imagen del Pokémon

**Inputs**:
- pokemon: Pokemon | null - Datos del Pokémon a mostrar

## Modelos de Datos

### Todo Interface
`	ypescript
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
}
`

### Pokemon Interface
`	ypescript
export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}
`

## Flujo de Datos

`
App Component
├── TaskListComponent
│   └── TodoService (getTasks)
├── TaskFormComponent
│   └── TodoService (addTask)
└── PokemonDisplayComponent
    └── PokemonService (getRandomPokemon)
`

## Estado Global

Se utilizará **localStorage** para persistencia de tareas:
- Clave: 	odo-list:pokemons
- Valor: JSON string con array de tareas

## Patrones de Diseño

1. **Service Pattern**: Separación de lógica de negocio en servicios
2. **Component Communication**: Eventos (EventEmitter) para comunicación hijo-padre
3. **State Management**: Servicio como single source of truth
4. **Reactive Programming**: RxJS para manejo de observables

## Consideraciones de Rendimiento

1. **OnPush Change Detection**: Usar en componentes donde sea posible
2. **Async Pipe**: Usar en plantillas para observables
3. **Lazy Loading**: Implementar para módulos futuros
4. **TrackBy**: Usar en *ngFor para optimización

## Consideraciones de Accesibilidad

1. **Semantic HTML**: Usar etiquetas apropiadas
2. **ARIA Labels**: Agregar donde sea necesario
3. **Keyboard Navigation**: Asegurar navegación con teclado
4. **Color Contrast**: Verificar contrastes adecuados
