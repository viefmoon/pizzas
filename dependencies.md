## `@expo/vector-icons`

**Propósito General:** Proporciona un conjunto amplio y popular de iconos vectoriales (`FontAwesome`, `Material Icons`, `Ionicons`, etc.) listos para usar en Expo.

**Uso en tu App:** Fundamental para la interfaz de usuario (UI). Los usarás para:
*   Botones (ej: "Añadir Pedido", "Editar Menú", "Confirmar", "Cancelar").
*   Elementos de navegación (íconos en pestañas, menú lateral/drawer).
*   Indicadores visuales (estado del pedido: pendiente, en cocina, listo, entregado).
*   Iconos junto a elementos de menú, categorías, opciones de configuración.
*   Mejorar la usabilidad y el atractivo visual general de la app.

## `@hookform/resolvers`

**Propósito General:** Actúa como un puente entre `react-hook-form` y librerías de validación de esquemas como `Zod`, `Yup`, etc.

**Uso en tu App:** Se usará junto con `react-hook-form` y `zod` para validar los datos introducidos en los formularios.
*   Ejemplo: Definirás un esquema con `zod` para un nuevo plato del menú (nombre obligatorio, precio numérico positivo, descripción opcional). Este resolver conectará ese esquema a tu formulario de "Añadir Plato", mostrando errores automáticamente si el usuario introduce datos inválidos. Lo mismo aplicará para formularios de pedidos, datos de clientes, configuración, etc.

## `@react-native-async-storage/async-storage`

**Propósito General:** Almacenamiento persistente simple de clave-valor en el dispositivo (similar al `localStorage` en web, pero asíncrono).

**Uصo en tu App:**
*   Guardar preferencias del usuario (tema claro/oscuro, impresora predeterminada).
*   Guardar tokens de autenticación o información básica de sesión (aunque para tokens sensibles, considera opciones más seguras si es necesario).

## `@react-native-community/datetimepicker`

**Propósito General:** Muestra el selector nativo de fecha y hora del sistema operativo (iOS/Android).

**Uso en tu App:**
*   Permitir al usuario seleccionar la fecha y hora deseada para un pedido (recogida o entrega).
*   Filtrar pedidos o reportes por un rango de fechas.
*   Establecer horarios de apertura/cierre del restaurante en la configuración.

## `@react-native-community/netinfo`

**Propósito General:** Detecta el estado y tipo de conexión de red del dispositivo (conectado/desconectado, WiFi/Celular).

**Uso en tu App:**
*   Verificar si hay conexión antes de intentar sincronizar pedidos con el servidor backend.
*   Mostrar un indicador visual al usuario si está offline.
*   Deshabilitar funcionalidades que requieran conexión (ej: realizar un nuevo pedido online, buscar clientes en la base de datos central).
*   Quizás habilitar un modo offline básico si la app lo soporta.

## `@react-navigation/drawer`

**Propósito General:** Implementa un patrón de navegación de tipo "menú lateral deslizable" (Drawer).

**Uso en tu App:** Probablemente será tu navegación principal. El menú lateral podría contener enlaces a secciones como:
*   Panel Principal / Dashboard
*   Pedidos Pendientes
*   Historial de Pedidos
*   Gestión de Menú
*   Clientes
*   Reportes
*   Configuración
*   Cerrar Sesión

## `@react-navigation/native`

**Propósito General:** El núcleo fundamental de la librería de navegación `React Navigation`. Proporciona el contexto y los hooks básicos para la navegación.

**Uso en tu App:** Es la base sobre la que funcionan `@react-navigation/drawer` y `@react-navigation/native-stack`. No interactuarás directamente con ella tanto como con los navegadores específicos, pero es indispensable.

## `@react-navigation/native-stack`

**Propósito General:** Implementa un patrón de navegación de tipo "pila" (Stack), donde las pantallas se apilan una encima de otra y puedes retroceder.

**Uso en tu App:** Se usará dentro de las secciones definidas en el Drawer o como navegador principal si no usas Drawer.
*   Ejemplo: Desde la lista de "Pedidos Pendientes" (pantalla 1), al tocar un pedido, navegas a "Detalles del Pedido" (pantalla 2). Desde ahí, quizás a "Editar Pedido" (pantalla 3). El Stack te permite volver atrás fácilmente. Indispensable para flujos de tareas detalladas.

## `@tanstack/react-query` (React Query)

**Propósito General:** Una librería muy potente para gestionar el "estado del servidor": fetching, caching, sincronización y actualización de datos remotos.

**Uso en tu App:** Fundamental para interactuar con tu API backend.
*   **Fetching:** Obtener listas de pedidos, detalles de un pedido, menú, clientes, etc., manejando automáticamente estados de carga (loading) y error.
*   **Caching:** Guarda los datos obtenidos para no tener que pedirlos repetidamente, mejorando la velocidad y reduciendo el uso de red.
*   **Sincronización:** Mantiene los datos de la app actualizados con el servidor (ej: puede refetchear automáticamente la lista de pedidos cuando la app vuelve a estar activa).
*   **Mutations:** Manejar operaciones de escritura (crear pedido, actualizar estado, eliminar plato del menú) con gestión de estados y invalidación automática de caché (ej: después de crear un pedido, invalida el caché de la lista de pedidos para que se actualice).

## `apisauce`

**Propósito General:** Un wrapper ligero sobre `axios` (un cliente HTTP popular) que simplifica la realización de peticiones API y el manejo de respuestas y errores comunes.

**Uso en tu App:** Será la librería que uses (probablemente dentro de las funciones que llames con React Query) para comunicarte con tu API backend.
*   Definir la URL base de tu API.
*   Configurar cabeceras (como tokens de autenticación).
*   Realizar peticiones GET (obtener datos), POST (crear), PUT/PATCH (actualizar), DELETE (eliminar).
*   Manejar de forma estandarizada las respuestas (éxito/error).

## `date-fns`

**Propósito General:** Una librería moderna y completa para manipulación y formateo de fechas y horas.

**Uso en tu App:**
*   Formatear fechas y horas para mostrarlas al usuario de manera legible (ej: "15 Jul 2024, 10:30 AM", "hace 5 minutos").
*   Calcular diferencias de tiempo (ej: ¿cuánto tiempo lleva un pedido pendiente?).
*   Parsear fechas recibidas de la API.
*   Realizar comparaciones de fechas (ej: para filtros).

## `expo-audio`

**Propósito General:** Permite grabar y reproducir audio.

**Uso en tu App:**
*   Caso principal: Reproducir un sonido de notificación claro y distintivo cuando llega un nuevo pedido. Esto es crucial en un ambiente de restaurante ruidoso.
*   Menos común: Permitir grabar notas de voz asociadas a un pedido (ej: instrucciones especiales del cliente o notas internas de cocina), aunque la entrada de texto suele ser más práctica.

## `expo-file-system`

**Propósito General:** Proporciona acceso al sistema de archivos local del dispositivo.

**Uso en tu App:**
*   Guardar archivos generados, como recibos en PDF creados con `expo-print` antes de compartirlos o imprimirlos.
*   Descargar y almacenar temporalmente imágenes o reportes del servidor.
*   Posiblemente para caching de assets grandes si es necesario.

## `expo-image`

**Propósito General:** Un componente de imagen más avanzado y performante que el `Image` de React Native, con mejor manejo de caché y formatos (como WebP).

**Uso en tu App:**
*   Mostrar imágenes de los platos en el menú de forma eficiente.
*   Mostrar logos o imágenes de marca.
*   Potencialmente, fotos de perfil de empleados o clientes (si aplica).

## `expo-image-picker`

**Propósito General:** Permite al usuario seleccionar imágenes o videos de la galería del dispositivo o tomar una foto/video nuevo con la cámara.

**Uso en tu App:**
*   Permitir al personal del restaurante añadir o actualizar fotos de los platos del menú directamente desde la app.
*   Potencialmente, adjuntar una foto a un pedido para documentar un problema o una entrega especial.

## `expo-notifications`

**Propósito General:** Gestionar notificaciones push (remotas, enviadas desde un servidor) y locales (programadas desde la app).

**Uso en tu App:** Esencial para la comunicación en tiempo real.
*   **Notificaciones Push:** Alertar instantáneamente al personal (en la app) cuando llega un nuevo pedido online.
*   **Notificaciones Push/Locales:** Informar sobre cambios de estado importantes de un pedido (ej: "Pedido #123 listo para recoger").
*   Alertas sobre inventario bajo (si la app gestiona inventario).
*   Recordatorios para el personal.

## `expo-print`

**Propósito General:** Permite generar documentos (usualmente HTML formateado como PDF) y enviarlos al sistema de impresión del dispositivo.

**Uso en tu App:**
*   Generar recibos/tickets para los pedidos.
*   Generar reportes de ventas o inventario en formato imprimible (PDF).
*   Importante: Para imprimir directamente en impresoras térmicas de tickets (comunes en restaurantes), necesitarás combinar esto o usar directamente `react-native-bluetooth-escpos-printer`. `expo-print` es más para impresión estándar (AirPrint, Android Print Service).

## `lottie-react-native`

**Propósito General:** Renderiza animaciones creadas en Adobe After Effects (exportadas como JSON con Bodymovin/Lottie).

**Uso en tu App:**
*   Mejorar la experiencia de usuario (UX) con animaciones fluidas.
*   Indicadores de carga atractivos mientras se obtienen datos.
*   Animaciones de éxito (ej: al confirmar un pedido).
*   Pequeñas animaciones para feedback visual en interacciones.

## `react-hook-form`

**Propósito General:** Una librería popular para manejar el estado, la validación y el envío de formularios en React/React Native de manera eficiente y sencilla usando hooks.

**Uso en tu App:**
*   Gestionar todos los formularios de entrada de datos: crear/editar pedidos, añadir/modificar platos del menú, registrar clientes, configurar ajustes.
*   Controlar los valores de los inputs, manejar el estado de envío (`submitting`), y mostrar errores de validación (junto con `@hookform/resolvers` y `zod`). Simplifica enormemente la lógica de formularios complejos.

## `react-native-bluetooth-escpos-printer`

**Propósito General:** Librería específica para comunicarse directamente con impresoras térmicas de recibos que usan el protocolo ESC/POS (muy común en TPVs y cocinas) a través de Bluetooth.

**Uso en tu App:** Crucial para la funcionalidad de impresión de tickets.
*   Descubrir y conectar con impresoras Bluetooth cercanas.
*   Enviar comandos ESC/POS para imprimir texto formateado (negrita, tamaño), códigos de barras/QR, imágenes simples y cortar el papel en los recibos de pedidos (para cocina, cliente, etc.).
*   Esta es la librería que probablemente usarás para la impresión directa en las impresoras del restaurante.

## `react-native-gesture-handler`

**Propósito General:** Proporciona una API más potente y nativa para manejar gestos táctiles (taps, swipes, pans, etc.).

**Uso en tu App:** Es una dependencia requerida por `react-navigation` (especialmente para el Drawer y transiciones suaves). También la podrías usar para implementar gestos personalizados, como deslizar un elemento de la lista para revelar opciones (ej: "Marcar como listo", "Eliminar").

## `react-native-paper`

**Propósito General:** Una librería de componentes UI de alta calidad que implementa las directrices de Material Design.

**Uso en tu App:**
*   Proporciona componentes listos para usar y estilizados: `Button`, `Card`, `TextInput`, `Modal`, `Appbar`, `DataTable`, etc.
*   Acelera enormemente el desarrollo de la interfaz de usuario.
*   Asegura una apariencia consistente y profesional (siguiendo Material Design).
*   Ofrece temas (`theming`) para personalizar colores y fuentes fácilmente.

## `react-native-reanimated`

**Propósito General:** Una librería avanzada para crear animaciones fluidas y performantes, ejecutando la lógica de animación en el hilo nativo.

**Uso en tu App:** Es una dependencia requerida por `react-native-gesture-handler` y `react-navigation` para animaciones suaves (como la apertura del Drawer o las transiciones de pantalla). También puedes usarla directamente para crear animaciones personalizadas complejas si es necesario.

## `react-native-safe-area-context`

**Propósito General:** Proporciona una forma de asegurar que tu contenido no se solape con elementos de la interfaz del sistema operativo (como la barra de estado, el notch en iPhones, las barras de navegación).

**Uso en tu App:** Indispensable para un diseño correcto en todos los dispositivos. Usarás su `SafeAreaView` para envolver tus pantallas o vistas principales y evitar que los elementos importantes queden ocultos.

## `react-native-screens`

**Propósito General:** Optimiza el uso de memoria y el rendimiento de la navegación utilizando primitivas de pantalla nativas.

**Uso en tu App:** Es una dependencia requerida por `react-navigation` para mejorar el rendimiento, especialmente en apps con muchas pantallas.

## `zod`

**Propósito General:** Una librería para declarar esquemas y validar datos en TypeScript/JavaScript. Es muy potente y tiene excelente integración con TypeScript.

**Uso en tu App:**
*   Definir la "forma" esperada de tus datos (objetos de pedido, items de menú, respuestas de API).
*   Validar los datos de los formularios (usando `@hookform/resolvers` y `react-hook-form`).
*   Opcionalmente, validar las respuestas recibidas de tu API para asegurar que cumplen el contrato esperado. Aumenta la robustez de tu app.

## `zustand`

**Propósito General:** Una librería de gestión de estado global pequeña, rápida y escalable, basada en hooks. Es más simple que Redux.

**Uso en tu App:** Para gestionar el estado que necesita ser compartido entre diferentes componentes o pantallas no directamente relacionadas.
*   Estado de autenticación del usuario (logueado/no logueado, datos del usuario).
*   Configuración global de la app (ej: restaurante/sucursal seleccionada).
*   Quizás el estado de un "carrito" temporal antes de confirmar un pedido.
*   Estado de la conexión de la impresora Bluetooth.

## `expo-dev-client`

**Propósito General:** Te permite crear "builds de desarrollo" de tu app Expo. Estas builds incluyen el código nativo necesario para usar librerías que tienen partes nativas (como `react-native-bluetooth-escpos-printer`) durante el desarrollo, sin necesidad de usar la app Expo Go (que tiene un conjunto limitado de APIs nativas).

**Uso en tu Desarrollo:** Fundamental porque estás usando `react-native-bluetooth-escpos-printer` y otras librerías comunitarias con código nativo. Necesitarás crear una build de desarrollo (`eas build --profile development` o `npx expo run:android`/`npx expo run:ios`) e instalarla en tu dispositivo/emulador para poder probar esas funcionalidades nativas mientras desarrollas.
