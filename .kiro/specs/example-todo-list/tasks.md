# Tareas: Sistema de Lista de Tareas con Pokémon

## Tareas de Implementación

### Fase 1: Estructura Base

#### Tarea 1.1: Crear Estructura de Carpetas
**Prioridad**: Alta  
**Estimación**: 10 min

Crear la estructura de carpetas según el diseño:
`
src/app/core/services/
src/app/shared/components/task-list/
src/app/shared/components/task-form/
src/app/shared/components/pokemon-display/
src/app/shared/models/
`

**Criterios de aceptación**:
- [ ] Todas las carpetas creadas
- [ ] Archivos de rutas configurados

#### Tarea 1.2: Definir Modelos TypeScript
**Prioridad**: Alta  
**Estimación**: 15 min

Crear las interfaces TypeScript en src/app/shared/models/:

- 	odo.model.ts - Interface Todo
- pokemon.model.ts - Interface Pokemon

**Criterios de aceptación**:
- [ ] Interfaces completas
- [ ] Tipado estricto
- [ ] Exportadas correctamente

---

### Fase 2: Servicios

#### Tarea 2.1: Crear TodoService
**Prioridad**: Alta  
**Estimación**: 30 min

Implementar src/app/core/services/todo.service.ts:

- [ ] Crear servicio con @Injectable
- [ ] Implementar getTasks()
- [ ] Implementar addTask()
- [ ] Implementar toggleTask()
- [ ] Implementar deleteTask()
- [ ] Implementar persistencia en localStorage
- [ ] Escribir tests unitarios

**Criterios de aceptación**:
- [ ] Todos los métodos implementados
- [ ] Tests unitarios pasando
- [ ] Persistencia funcional

#### Tarea 2.2: Crear PokemonService
**Prioridad**: Alta  
**Estimación**: 30 min

Implementar src/app/core/services/pokemon.service.ts:

- [ ] Crear servicio con HttpClient
- [ ] Implementar getRandomPokemon()
- [ ] Implementar getPokemonById()
- [ ] Manejar errores
- [ ] Escribir tests unitarios

**Criterios de aceptación**:
- [ ] Servicio consume PokeAPI
- [ ] Manejo de errores implementado
- [ ] Tests unitarios pasando

---

### Fase 3: Componentes

#### Tarea 3.1: Crear TaskListComponent
**Prioridad**: Alta  
**Estimación**: 45 min

Implementar src/app/shared/components/task-list/task-list.component.ts:

- [ ] Crear componente standalone
- [ ] Implementar template con *ngFor
- [ ] Implementar toggling de tareas
- [ ] Implementar eliminación
- [ ] Mostrar contador de tareas pendientes
- [ ] Escribir tests unitarios

**Criterios de aceptación**:
- [ ] Lista mostrada correctamente
- [ ] Interacciones funcionando
- [ ] Tests pasando

#### Tarea 3.2: Crear TaskFormComponent
**Prioridad**: Alta  
**Estimación**: 45 min

Implementar src/app/shared/components/task-form/task-form.component.ts:

- [ ] Crear componente standalone
- [ ] Implementar reactive form
- [ ] Validación de entrada
- [ ] Emitir evento taskAdded
- [ ] Escribir tests unitarios

**Criterios de aceptación**:
- [ ] Formulario funcional
- [ ] Validaciones working
- [ ] Tests pasando

#### Tarea 3.3: Crear PokemonDisplayComponent
**Prioridad**: Media  
**Estimación**: 30 min

Implementar src/app/shared/components/pokemon-display/pokemon-display.component.ts:

- [ ] Crear componente standalone
- [ ] Mostrar imagen del Pokémon
- [ ] Mostrar nombre y tipos
- [ ] Manejar estado de carga
- [ ] Escribir tests unitarios

**Criterios de aceptación**:
- [ ] Pokémon mostrado correctamente
- [ ] Estados de carga funcionando
- [ ] Tests pasando

---

### Fase 4: Integración y Estilo

#### Tarea 4.1: Integrar Componentes en App
**Prioridad**: Alta  
**Estimación**: 30 min

- [ ] Importar componentes en app.component.ts
- [ ] Integrar servicios
- [ ] Configurar rutas
- [ ] Conectar eventos

**Criterios de aceptación**:
- [ ] Aplicación funcionando
- [ ] Datos fluyendo correctamente

#### Tarea 4.2: Estilización
**Prioridad**: Media  
**Estimación**: 30 min

- [ ] Crear estilos globales en styles.css
- [ ] Estilizar componentes
- [ ] Hacer responsive
- [ ] Asegurar accesibilidad

**Criterios de aceptación**:
- [ ] Diseño agradable
- [ ] Responsive en móvil
- [ ] Accesibilidad verificada

---

### Fase 5: Testing y QA

#### Tarea 5.1: Tests de Integración
**Prioridad**: Media  
**Estimación**: 45 min

- [ ] Tests end-to-end con Jest
- [ ] Tests de flujo completo
- [ ] Tests de persistencia

**Criterios de aceptación**:
- [ ] >80% cobertura
- [ ] Tests pasando

#### Tarea 5.2: QA y Revisión
**Prioridad**: Baja  
**Estimación**: 30 min

- [ ] Revisión de código
- [ ] Verificación de performance
- [ ] Verificación de accesibilidad

**Criterios de aceptación**:
- [ ] Code review completado
- [ ] Performance aceptable
- [ ] Accesibilidad verificada

---

## Resumen de Tareas

| Fase | Tareas | Estimación Total | Prioridad |
|------|--------|------------------|-----------|
| 1. Estructura | 2 | 25 min | Alta |
| 2. Servicios | 2 | 60 min | Alta |
| 3. Componentes | 3 | 120 min | Alta |
| 4. Integración | 2 | 60 min | Alta |
| 5. Testing | 2 | 75 min | Media |
| **TOTAL** | **11** | **340 min** | |

## Notas

- Se recomienda ejecutar tareas en orden
- Cada tarea debe pasar sus criterios de aceptación antes de continuar
- Los tests deben ejecutarse después de cada fase
- La documentación debe actualizarse conforme se avance
