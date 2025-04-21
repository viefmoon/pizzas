# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-04-21 11:31:45 - Log of updates made will be appended as footnotes to the end of this file.

-

## Project Goal

- Crear una aplicación móvil (React Native/Expo) de Punto de Venta (POS) o gestión de restaurante.

## Key Features

- Autenticación: Flujo de Login/Registro basado en email/usuario y contraseña, con validación Zod (`auth` module).
- Gestión de Menú: Estructura jerárquica (Categorías -> Subcategorías -> Productos), soporte para variantes de productos, gestión de imágenes (`fileService`), asignación de grupos de modificadores (`menu` module).
- Gestión de Modificadores: Creación/edición de grupos (con reglas de selección min/max) y modificadores individuales (con precio adicional opcional) para personalizar productos (`modifiers` module).
- Gestión de Áreas/Mesas: Definición de áreas físicas y mesas asociadas con capacidad opcional (`areasTables` module).
- Creación de Órdenes: Flujo de selección de menú, personalización con variantes/modificadores, gestión de carrito (`CartContext`), selección de tipo de orden (Dine-in, Take Away, Delivery) y asignación de mesa (para Dine-in) (`orders` module).
- Gestión de Pantallas de Preparación: Configuración de pantallas destino para la preparación de ítems (ej. Cocina, Barra) (`preparationScreens` module).

## Overall Architecture

- Tecnologías Base: React Native, Expo, TypeScript.
- UI: React Native Paper, componentes genéricos reutilizables (`GenericList`, `GenericFormModal`, `GenericDetailModal` en `app` core).
- Navegación: React Navigation (Drawer principal, Stacks por módulo).
- Gestión de Estado: Zustand (global: auth, theme), React Context API (local: carrito - `CartContext`).
- Gestión de Datos: React Query (hooks personalizados) para fetching, caching y mutaciones; Servicios API dedicados por módulo; Cliente API centralizado (`apiClient`) con Axios e interceptores para manejo de tokens y errores.
- Validación: Zod para definición y validación de esquemas de datos.
- Otros: Manejo de caché de imágenes, servicio de subida de archivos (`fileService`).
- Estructura: Modular (`app` core + módulos por funcionalidad: `auth`, `menu`, `modifiers`, `areasTables`, `orders`, `preparationScreens`).

[2025-04-21 11:33:01] - Actualizada la sección Overall Architecture con la estructura del directorio src.
[2025-04-21 12:11:03] - Expandidas secciones Key Features y Overall Architecture con detalles específicos adicionales del análisis de módulos.
