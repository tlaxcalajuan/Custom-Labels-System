# Guía de Spec y Steering para el Proyecto

## ¿Qué es un Spec?

Un **Spec** (especificación) es un documento estructurado que describe cómo se implementará una característica o corrección.

### Estructura de un Spec

```
.kiro/specs/nombre-caracteristica/
├── requirements.md     → ¿Qué se debe hacer? (quién, qué, por qué)
├── design.md          → ¿Cómo se va a hacer? (arquitectura, componentes)
└── tasks.md           → Lista de tareas implementables
```

### Tipos de Spec

#### 1. Feature Spec (nuevas funcionalidades)
Se utiliza cuando quieres agregar nuevas características al sistema.

**Workflows disponibles:**
- **Requirements-First**: Empezar con requerimientos → diseño → tareas
  - Mejor para: Cuando tienes claros los requerimientos de negocio
  - Ejemplo: "Necesito un sistema de autenticación de usuarios"

- **Design-First**: Empezar con diseño → requerimientos → tareas
  - Mejor para: Cuando ya sabes la solución técnica
  - Ejemplo: "Quiero implementar microservices con event sourcing"

- **Quick Spec**: Generación automática rápida
  - Mejor para: Características simples y bien entendidas

#### 2. Bugfix Spec (corrección de errores)
Se utiliza cuando necesitas corregir un bug o problema existente.

**Workflow:**
- Usa metodología de **bug condition** (condición de bug)
- Documenta el comportamiento actual vs esperado
- Define condiciones de preservación y fix

#### 3. Verify First (enfoque iterativo)
Ejecuta código inmediatamente mientras el spec se construye en paralelo.

**Workflow:**
1. Clarify - Entender el contexto
2. Execute - Crear implementación inicial
3. Accumulate - Construir spec en paralelo
4. Refine - Iterar basado en resultados

## ¿Qué es un Steering?

Un **Steering** (guía/norma) es un archivo markdown que define estándares, buenas prácticas y reglas para tu proyecto. Se incluyen automáticamente en el contexto del agente.

### Archivos de Steering Actuales

#### 1. project-structure.md
Define la estructura de carpetas del proyecto y convenciones de nombrado.

**Ejemplo:**
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

#### 2. coding-standards.md
Define estándares de codificación para TypeScript y Angular.

**Incluye:**
- Directrices de TypeScript (strict mode, tipado explícito)
- Directrices de Angular (standalone components, OnPush, signals)
- Calidad de código (DRY, funciones pequeñas)
- Estándares de testing

## Agentes Disponibles

### 1. create-component
Crea componentes Angular siguiendo las mejores prácticas.

**Uso:**
- Crear nuevos componentes
- Agregar lógica de presentación
- Implementar interacciones de usuario

### 2. create-service
Crea servicios Angular para gestión de datos y API.

**Uso:**
- Crear servicios de API
- Implementar lógica de negocio
- Gestionar estado reactivamente

### 3. code-reviewer (NUEVO)
Realiza revisiones de código completas.

**Uso:**
- Revisar calidad de código
- Verificar seguridad
- Revisar accesibilidad (a11y)
- Verificar testing

**Tags:** `code-review`, `angular`, `quality`, `security`, `a11y`

### 4. documentation-specialist (NUEVO)
Crea y mantiene documentación técnica.

**Uso:**
- Documentar APIs
- Documentar componentes
- Crear tutoriales
- Documentar arquitectura

**Tags:** `documentation`, `docs`, `writing`, `tutorials`

### 5. unit-testing
Crea pruebas unitarias completas.

**Uso:**
- Crear tests para componentes
- Crear tests para servicios
- Verificar lógica de negocio

## Workflow Recomendado

### Para nueva funcionalidad (ej. autenticación):

1. **Iniciar Spec**
   ```
   - Seleccionar "Build a Feature"
   - Elegir workflow (Requirements-First o Design-First)
   ```

2. **Crear Especificación**
   ```
   requirements.md → ¿Qué necesita hacerse?
   design.md → ¿Cómo se va a hacer?
   tasks.md → Tareas implementables
   ```

3. **Implementar**
   - Ejecutar tareas una por una
   - Revisar con code-reviewer
   - Verificar tests

4. **Documentar**
   - Usar documentation-specialist para docs

### Para corrección de bug:

1. **Iniciar Bugfix Spec**
   ```
   - Seleccionar "Fix a Bug"
   - Describir el problema
   ```

2. **Analizar**
   ```
   bugfix.md → ¿Cuál es el bug?
   design.md → ¿Cómo se va a arreglar?
   tasks.md → Tareas para corregir
   ```

3. **Corregir**
   - Ejecutar tareas
   - Verificar que el bug se soluciona
   - Agregar tests para prevenir regresión

## Trabajar con Specs

### Crear un nuevo Spec

1. Desde el explorador de agentes, selecciona "Create Spec"
2. Elige el tipo (Feature o Bugfix)
3. Proporciona una descripción clara
4. El sistema creará la estructura de archivos

### Editar un Spec existente

1. Abre los archivos en `.kiro/specs/nombre-caracteristica/`
2. Modifica los documentos según necesites
3. Usa los links en la interfaz para navegar entre fases

### Ejecutar un Spec

1. En el archivo `tasks.md`, haz clic en "Run All Tasks"
2. O ejecuta tareas individualmente para control detallado

## Buenas Prácticas

### Para Specs
- Sé específico en los requerimientos
- Incluye ejemplos cuando sea posible
- Divide tareas en pasos pequeños y manejables
- Revisa y actualiza el spec a medida que evoluciona el proyecto

### Para Steering
- Mantén las guías actualizadas con el código
- Incluye ejemplos prácticos
- Documenta decisiones de diseño importantes
- Usa referencias cruzadas entre documentos

### Para Agentes
- Define systemPrompt claramente
- Usa tags para clasificar agentes
- Configura hooks para automatización
- Ajusta temperatura según necesidad (baja para código, alta para creative)
