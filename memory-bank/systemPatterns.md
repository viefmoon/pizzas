# System Patterns _Optional_

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-04-21 11:32:12 - Log of updates made.

-

## Coding Patterns

- Hooks de React Query para la gestión de datos asíncronos y caché.
- Zustand y Context API para la gestión del estado global y local/contextual respectivamente.
- Zod para la validación de esquemas de datos (formularios, respuestas API).
- Componentes genéricos reutilizables para operaciones CRUD en la UI (Listas, Formularios, Detalles).
- TypeScript para seguridad de tipos en todo el código.
- Servicios API dedicados por recurso/módulo para encapsular la lógica de comunicación con el backend.

## Architectural Patterns

- Diseño modular: Separación del código en módulos autocontenidos por funcionalidad principal (`auth`, `menu`, `orders`, etc.).
- Arquitectura por capas (aproximada): UI (Screens/Components) -> Lógica de UI/Estado (Hooks/Stores) -> Lógica de Negocio/Datos (Services) -> API (ApiClient).
- Cliente API centralizado (`apiClient.ts`) con interceptores (Axios) para manejo de autenticación (tokens JWT, refresh tokens) y errores comunes.

## Testing Patterns

-
