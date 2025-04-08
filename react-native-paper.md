# Documentación de React Native Paper

## Introducción

React Native Paper es una colección de componentes personalizables y listos para producción para React Native, siguiendo las directrices de Material Design de Google. Esta biblioteca proporciona una amplia gama de componentes UI que facilitan el desarrollo de aplicaciones móviles con una apariencia profesional y consistente tanto en iOS como en Android.

## Componentes

### ActivityIndicator

El componente ActivityIndicator muestra un indicador de carga circular.

#### Uso

```jsx
import * as React from "react";
import { ActivityIndicator } from "react-native-paper";

const MyComponent = () => (
  <ActivityIndicator animating={true} color="#00ff00" />
);

export default MyComponent;
```

#### Propiedades

- **animating**: boolean - Determina si el indicador está animándose.
- **color**: string - Color del indicador.
- **size**: 'small' | 'large' | number - Tamaño del indicador.
- **hidesWhenStopped**: boolean - Oculta el indicador cuando no está animándose.

### Appbar

El componente Appbar muestra información y acciones relacionadas con la pantalla actual.

#### Uso

```jsx
import * as React from "react";
import { Appbar } from "react-native-paper";

const MyComponent = () => (
  <Appbar.Header>
    <Appbar.BackAction onPress={() => {}} />
    <Appbar.Content title="Título" subtitle="Subtítulo" />
    <Appbar.Action icon="magnify" onPress={() => {}} />
    <Appbar.Action icon="dots-vertical" onPress={() => {}} />
  </Appbar.Header>
);

export default MyComponent;
```

#### Subcomponentes

- **Appbar.Header**: Contenedor principal para la barra de aplicaciones.
- **Appbar.BackAction**: Botón de retroceso.
- **Appbar.Content**: Contenido principal (título y subtítulo).
- **Appbar.Action**: Botón de acción con icono.

#### Propiedades principales

- **dark**: boolean - Determina si la barra de aplicaciones utiliza el tema oscuro.
- **statusBarHeight**: number - Altura de la barra de estado.
- **elevated**: boolean - Determina si la barra de aplicaciones tiene elevación.
- **style**: object - Estilo personalizado para la barra de aplicaciones.

### Avatar

El componente Avatar muestra una imagen de perfil, iniciales o icono.

#### Uso

```jsx
import * as React from "react";
import { Avatar } from "react-native-paper";

const MyComponent = () => (
  <>
    <Avatar.Icon size={24} icon="folder" />
    <Avatar.Image size={24} source={require("../assets/avatar.png")} />
    <Avatar.Text size={24} label="XD" />
  </>
);

export default MyComponent;
```

#### Subcomponentes

- **Avatar.Icon**: Avatar con un icono.
- **Avatar.Image**: Avatar con una imagen.
- **Avatar.Text**: Avatar con texto (iniciales).

#### Propiedades principales

- **size**: number - Tamaño del avatar.
- **style**: object - Estilo personalizado para el avatar.
- **icon**: string - Nombre del icono (para Avatar.Icon).
- **source**: object - Fuente de la imagen (para Avatar.Image).
- **label**: string - Texto a mostrar (para Avatar.Text).

### Badge

El componente Badge muestra un pequeño indicador numérico o de estado.

#### Uso

```jsx
import * as React from "react";
import { Badge } from "react-native-paper";

const MyComponent = () => <Badge>3</Badge>;

export default MyComponent;
```

#### Propiedades

- **visible**: boolean - Determina si el badge es visible.
- **size**: number - Tamaño del badge.
- **style**: object - Estilo personalizado para el badge.

### Banner

El componente Banner muestra un mensaje importante y acciones relacionadas.

#### Uso

```jsx
import * as React from "react";
import { Banner } from "react-native-paper";

const MyComponent = () => {
  const [visible, setVisible] = React.useState(true);

  return (
    <Banner
      visible={visible}
      actions={[
        {
          label: "Arreglar ahora",
          onPress: () => setVisible(false),
        },
        {
          label: "Más tarde",
          onPress: () => setVisible(false),
        },
      ]}
      icon={({ size }) => (
        <Image
          source={require("../assets/notification.png")}
          style={{ width: size, height: size }}
        />
      )}
    >
      Hay problemas con tu conexión a internet.
    </Banner>
  );
};

export default MyComponent;
```

#### Propiedades

- **visible**: boolean - Determina si el banner es visible.
- **actions**: Array - Acciones disponibles en el banner.
- **icon**: ({ size }) => React.ReactNode - Icono a mostrar.
- **children**: React.ReactNode - Contenido del banner.

### BottomNavigation

El componente BottomNavigation proporciona navegación entre vistas principales en una aplicación.

#### Uso

```jsx
import * as React from "react";
import { BottomNavigation, Text } from "react-native-paper";

const MusicRoute = () => <Text>Music</Text>;
const AlbumsRoute = () => <Text>Albums</Text>;
const RecentsRoute = () => <Text>Recents</Text>;

const MyComponent = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "music", title: "Music", icon: "music" },
    { key: "albums", title: "Albums", icon: "album" },
    { key: "recents", title: "Recents", icon: "history" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    music: MusicRoute,
    albums: AlbumsRoute,
    recents: RecentsRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

export default MyComponent;
```

#### Propiedades

- **navigationState**: object - Estado de navegación con índice y rutas.
- **onIndexChange**: function - Función llamada cuando cambia el índice.
- **renderScene**: function - Función para renderizar la escena para una ruta.
- **shifting**: boolean - Determina si la navegación utiliza el modo shifting.
- **labeled**: boolean - Determina si se muestran las etiquetas.

### Button

El componente Button permite a los usuarios realizar acciones y tomar decisiones con un solo toque.

#### Uso

```jsx
import * as React from "react";
import { Button } from "react-native-paper";

const MyComponent = () => (
  <>
    <Button
      icon="camera"
      mode="contained"
      onPress={() => console.log("Pressed")}
    >
      Press me
    </Button>
    <Button
      icon="camera"
      mode="outlined"
      onPress={() => console.log("Pressed")}
    >
      Press me
    </Button>
    <Button icon="camera" mode="text" onPress={() => console.log("Pressed")}>
      Press me
    </Button>
  </>
);

export default MyComponent;
```

#### Propiedades

- **mode**: 'text' | 'outlined' | 'contained' - Modo del botón.
- **dark**: boolean - Determina si el botón utiliza el tema oscuro.
- **compact**: boolean - Determina si el botón es compacto.
- **icon**: string - Icono a mostrar.
- **loading**: boolean - Muestra un indicador de carga.
- **disabled**: boolean - Deshabilita el botón.
- **onPress**: function - Función llamada cuando se presiona el botón.
- **style**: object - Estilo personalizado para el botón.

### CardComponent

El componente Card es una hoja de material que sirve como punto de entrada a información más detallada.

#### Uso

```jsx
import * as React from "react";
import { Avatar, Button, Card, Text } from "react-native-paper";

const LeftContent = (props) => <Avatar.Icon {...props} icon="folder" />;

const MyComponent = () => (
  <Card>
    <Card.Title
      title="Card Title"
      subtitle="Card Subtitle"
      left={LeftContent}
    />
    <Card.Content>
      <Text variant="titleLarge">Card title</Text>
      <Text variant="bodyMedium">Card content</Text>
    </Card.Content>
    <Card.Cover source={{ uri: "https://picsum.photos/700" }} />
    <Card.Actions>
      <Button>Cancel</Button>
      <Button>Ok</Button>
    </Card.Actions>
  </Card>
);

export default MyComponent;
```

#### Subcomponentes

- **Card.Title**: Título de la tarjeta.
- **Card.Content**: Contenido de la tarjeta.
- **Card.Cover**: Imagen de portada de la tarjeta.
- **Card.Actions**: Acciones de la tarjeta.

#### Propiedades principales

- **mode**: 'elevated' | 'outlined' | 'contained' - Modo de la tarjeta.
- **elevation**: number - Elevación de la tarjeta.
- **onPress**: function - Función llamada cuando se presiona la tarjeta.
- **style**: object - Estilo personalizado para la tarjeta.

### Checkbox

El componente Checkbox permite la selección de múltiples opciones de un conjunto.

#### Uso

```jsx
import * as React from "react";
import { Checkbox } from "react-native-paper";

const MyComponent = () => {
  const [checked, setChecked] = React.useState(false);

  return (
    <Checkbox
      status={checked ? "checked" : "unchecked"}
      onPress={() => {
        setChecked(!checked);
      }}
    />
  );
};

export default MyComponent;
```

#### Subcomponentes

- **Checkbox.Android**: Checkbox con estilo de Android.
- **Checkbox.IOS**: Checkbox con estilo de iOS.
- **Checkbox.Item**: Checkbox con etiqueta.

#### Propiedades principales

- **status**: 'checked' | 'unchecked' | 'indeterminate' - Estado del checkbox.
- **disabled**: boolean - Deshabilita el checkbox.
- **onPress**: function - Función llamada cuando se presiona el checkbox.
- **color**: string - Color del checkbox cuando está marcado.
- **uncheckedColor**: string - Color del checkbox cuando no está marcado.

### Chip

El componente Chip es un elemento compacto que representa una entrada, atributo o acción.

#### Uso

```jsx
import * as React from "react";
import { Chip } from "react-native-paper";

const MyComponent = () => (
  <Chip icon="information" onPress={() => console.log("Pressed")}>
    Example Chip
  </Chip>
);

export default MyComponent;
```

#### Propiedades

- **mode**: 'flat' | 'outlined' - Modo del chip.
- **selected**: boolean - Determina si el chip está seleccionado.
- **disabled**: boolean - Deshabilita el chip.
- **icon**: string - Icono a mostrar.
- **avatar**: React.ReactNode - Avatar a mostrar.
- **onPress**: function - Función llamada cuando se presiona el chip.
- **onClose**: function - Función llamada cuando se presiona el botón de cierre.
- **style**: object - Estilo personalizado para el chip.

### DataTable

El componente DataTable permite mostrar conjuntos de datos.

#### Uso

```jsx
import * as React from "react";
import { DataTable } from "react-native-paper";

const MyComponent = () => {
  const [page, setPage] = React.useState(0);
  const [numberOfItemsPerPageList] = React.useState([2, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0]
  );

  const [items] = React.useState([
    {
      key: 1,
      name: "Cupcake",
      calories: 356,
      fat: 16,
    },
    {
      key: 2,
      name: "Eclair",
      calories: 262,
      fat: 16,
    },
    {
      key: 3,
      name: "Frozen yogurt",
      calories: 159,
      fat: 6,
    },
    {
      key: 4,
      name: "Gingerbread",
      calories: 305,
      fat: 3.7,
    },
  ]);

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Dessert</DataTable.Title>
        <DataTable.Title numeric>Calories per piece</DataTable.Title>
        <DataTable.Title numeric>Fat (g)</DataTable.Title>
      </DataTable.Header>

      {items
        .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
        .map((item) => (
          <DataTable.Row key={item.key}>
            <DataTable.Cell>{item.name}</DataTable.Cell>
            <DataTable.Cell numeric>{item.calories}</DataTable.Cell>
            <DataTable.Cell numeric>{item.fat}</DataTable.Cell>
          </DataTable.Row>
        ))}

      <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(items.length / itemsPerPage)}
        onPageChange={(page) => setPage(page)}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        showFastPaginationControls
        selectPageDropdownLabel={"Rows per page"}
      />
    </DataTable>
  );
};

export default MyComponent;
```

#### Subcomponentes

- **DataTable.Header**: Encabezado de la tabla.
- **DataTable.Title**: Título de columna.
- **DataTable.Row**: Fila de la tabla.
- **DataTable.Cell**: Celda de la tabla.
- **DataTable.Pagination**: Paginación de la tabla.

### Dialog

El componente Dialog informa a los usuarios sobre una tarea específica y puede contener información crítica, requerir decisiones o involucrar múltiples tareas.

#### Uso

```jsx
import * as React from "react";
import { View } from "react-native";
import {
  Button,
  Dialog,
  Portal,
  PaperProvider,
  Text,
} from "react-native-paper";

const MyComponent = () => {
  const [visible, setVisible] = React.useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  return (
    <PaperProvider>
      <View>
        <Button onPress={showDialog}>Show Dialog</Button>
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Alert</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">This is simple dialog</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
};

export default MyComponent;
```

#### Subcomponentes

- **Dialog.Title**: Título del diálogo.
- **Dialog.Content**: Contenido del diálogo.
- **Dialog.Actions**: Acciones del diálogo.
- **Dialog.Icon**: Icono del diálogo.

#### Propiedades principales

- **visible**: boolean - Determina si el diálogo es visible.
- **dismissable**: boolean - Determina si el diálogo se puede cerrar tocando fuera de él.
- **onDismiss**: function - Función llamada cuando se cierra el diálogo.

### Divider

Un Divider es un separador delgado y ligero que agrupa contenido en listas y diseños de página.

#### Uso

```jsx
import * as React from "react";
import { View } from "react-native";
import { Divider, Text } from "react-native-paper";

const MyComponent = () => (
  <View>
    <Text>Lemon</Text>
    <Divider />
    <Text>Mango</Text>
    <Divider />
  </View>
);

export default MyComponent;
```

#### Propiedades

- **leftInset**: boolean - (Renombrado de `inset` en v5.x) Determina si el divisor tiene un margen izquierdo.
- **horizontalInset**: boolean - (Disponible en v5.x con versión de tema 3, valor predeterminado: `false`) Determina si el divisor tiene un margen horizontal en ambos lados.
- **bold**: boolean - (Disponible en v5.x con versión de tema 3, valor predeterminado: `false`) Determina si el divisor debe ser más grueso (negrita).
- **style**: StyleProp<ViewStyle> - Estilo personalizado para el divisor.
- **theme**: ThemeProp - Tema para aplicar al componente.

#### Colores del Tema (MD3)

- **dividerColor**: `theme.colors.outlineVariant`

**Nota:** Puedes personalizar los colores utilizando la prop `theme`. Ejemplo: `<Divider theme={{ colors: { dividerColor: 'red' } }} />`

### Drawer.CollapsedItem

El componente Drawer.CollapsedItem se utiliza para mostrar un elemento de acción con un icono y opcionalmente una etiqueta en un cajón de navegación colapsado.

#### Uso

```jsx
import * as React from "react";
import { Drawer } from "react-native-paper";

const MyComponent = () => (
  <Drawer.CollapsedItem
    focusedIcon="inbox"
    unfocusedIcon="inbox-outline"
    label="Inbox"
  />
);

export default MyComponent;
```

#### Propiedades

- **label**: string - El texto de la etiqueta del elemento.
- **badge**: string | number | boolean - Insignia para mostrar en el icono, puede ser true para mostrar un punto, string o número para mostrar texto.
- **disabled**: boolean - Determina si el elemento está deshabilitado.
- **focusedIcon**: IconSource - Icono a utilizar como icono de destino enfocado, puede ser una cadena, una fuente de imagen o un componente de React.
- **unfocusedIcon**: IconSource - Icono a utilizar como icono de destino no enfocado, puede ser una cadena, una fuente de imagen o un componente de React.
- **active**: boolean - Determina si se debe resaltar el elemento del cajón como activo.
- **onPress**: function - Función a ejecutar al presionar.
- **labelMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente de la etiqueta.
- **accessibilityLabel**: string - Etiqueta de accesibilidad para el botón.
- **style**: StyleProp<ViewStyle> - Estilo personalizado para el elemento.
- **theme**: ThemeProp - Tema para aplicar al componente.

#### Colores del Tema (MD3)

| modo     | backgroundColor                 | textColor                     | iconColor                         |
| -------- | ------------------------------- | ----------------------------- | --------------------------------- |
| active   | theme.colors.secondaryContainer | theme.colors.onSurface        | theme.colors.onSecondaryContainer |
| inactive |                                 | theme.colors.onSurfaceVariant | theme.colors.onSurfaceVariant     |

### Drawer.Item

El componente Drawer.Item se utiliza para mostrar un elemento de acción con un icono y una etiqueta en un cajón de navegación.

#### Uso

```jsx
import * as React from "react";
import { Drawer } from "react-native-paper";

const MyComponent = () => (
  <Drawer.Item
    style={{ backgroundColor: "#64ffda" }}
    icon="star"
    label="First Item"
  />
);

export default MyComponent;
```

#### Propiedades

- **label**: string (requerido) - El texto de la etiqueta del elemento.
- **icon**: IconSource - Icono a mostrar para el DrawerItem.
- **active**: boolean - Determina si se debe resaltar el elemento del cajón como activo.
- **disabled**: boolean - Determina si el elemento está deshabilitado.
- **onPress**: function - Función a ejecutar al presionar.
- **background**: PressableAndroidRippleConfig - Tipo de fondo para mostrar el feedback (Android).
- **accessibilityLabel**: string - Etiqueta de accesibilidad para el botón.
- **right**: function - Callback que devuelve un elemento React para mostrar en el lado derecho.
- **labelMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente de la etiqueta.
- **rippleColor**: ColorValue - Color del efecto de ondulación.
- **style**: StyleProp<ViewStyle> - Estilo personalizado para el elemento.
- **theme**: ThemeProp - Tema para aplicar al componente.

#### Colores del Tema (MD3)

| modo     | backgroundColor                 | iconColor/textColor               |
| -------- | ------------------------------- | --------------------------------- |
| active   | theme.colors.secondaryContainer | theme.colors.onSecondaryContainer |
| inactive |                                 | theme.colors.onSurfaceVariant     |

### Drawer.Section

El componente Drawer.Section se utiliza para agrupar contenido dentro de un cajón de navegación.

#### Uso

```jsx
import * as React from "react";
import { Drawer } from "react-native-paper";

const MyComponent = () => {
  const [active, setActive] = React.useState("");

  return (
    <Drawer.Section title="Some title">
      <Drawer.Item
        label="First Item"
        active={active === "first"}
        onPress={() => setActive("first")}
      />
      <Drawer.Item
        label="Second Item"
        active={active === "second"}
        onPress={() => setActive("second")}
      />
    </Drawer.Section>
  );
};

export default MyComponent;
```

#### Propiedades

- **title**: string - Título para mostrar como encabezado de la sección.
- **children**: React.ReactNode (requerido) - Contenido del Drawer.Section.
- **showDivider**: boolean - Determina si se muestra un Divider al final de la sección. True por defecto.
- **titleMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente del título.
- **style**: StyleProp<ViewStyle> - Estilo personalizado para la sección.
- **theme**: ThemeProp - Tema para aplicar al componente.

#### Colores del Tema (MD3)

| modo | titleColor                    |
| ---- | ----------------------------- |
| -    | theme.colors.onSurfaceVariant |

### FAB (Floating Action Button)

El componente FAB (Floating Action Button) representa la acción principal en una pantalla. Aparece por encima de todo el contenido de la pantalla.

#### Uso

```jsx
import * as React from "react";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

const MyComponent = () => (
  <FAB icon="plus" style={styles.fab} onPress={() => console.log("Pressed")} />
);

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default MyComponent;
```

#### Propiedades

- **icon**: IconSource - Icono a mostrar en el FAB. Es opcional solo si label está definido.
- **label**: string - Etiqueta opcional para FAB extendido. Es opcional solo si icon está definido.
- **uppercase**: boolean - Hace que el texto de la etiqueta esté en mayúsculas.
- **background**: PressableAndroidRippleConfig - Tipo de fondo para mostrar el feedback (Android).
- **accessibilityLabel**: string - Etiqueta de accesibilidad para el FAB. Usa label por defecto si está especificado.
- **accessibilityState**: AccessibilityState - Estado de accesibilidad para el FAB.
- **animated**: boolean - Determina si el cambio de icono está animado. Valor por defecto: true.
- **small**: boolean - (Obsoleto en v.5x - use prop size="small") Determina si el FAB es de tamaño mini.
- **color**: string - Color personalizado para el icono y la etiqueta del FAB.
- **rippleColor**: ColorValue - Color del efecto de ondulación.
- **disabled**: boolean - Determina si el FAB está deshabilitado.
- **visible**: boolean - Determina si el FAB está actualmente visible. Valor por defecto: true.
- **loading**: boolean - Determina si se muestra un indicador de carga.
- **onPress**: function - Función a ejecutar al presionar.
- **onLongPress**: function - Función a ejecutar al mantener presionado.
- **delayLongPress**: number - Número de milisegundos que un usuario debe tocar el elemento antes de ejecutar onLongPress.
- **size**: 'small' | 'medium' | 'large' - Tamaño del FAB. Valor por defecto: 'medium'.
  - small - FAB con altura pequeña (40).
  - medium - FAB con altura media predeterminada (56).
  - large - FAB con altura grande (96).
- **customSize**: number - Tamaño personalizado para el FAB. Esta prop tiene prioridad sobre la prop size.
- **mode**: 'flat' | 'elevated' - Modo del FAB. Valor por defecto: 'elevated'.
  - flat - botón sin sombra.
  - elevated - botón con sombra.
- **variant**: 'primary' | 'secondary' | 'tertiary' | 'surface' - Variante de mapeo de colores para combinaciones de colores de contenedor e icono. Valor por defecto: 'primary'.
- **labelMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente de la etiqueta.
- **style**: StyleProp<ViewStyle> - Estilo personalizado para el FAB.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **testID**: string - ID de prueba utilizado con fines de testing. Valor por defecto: 'fab'.
- **ref**: React.RefObject<View> - Referencia para el componente.

#### Colores del Tema (MD3)

| modo      | backgroundColor                 | textColor/iconColor               |
| --------- | ------------------------------- | --------------------------------- |
| disabled  | theme.colors.surfaceDisabled    | theme.colors.onSurfaceDisabled    |
| primary   | theme.colors.primaryContainer   | theme.colors.onPrimaryContainer   |
| secondary | theme.colors.secondaryContainer | theme.colors.onSecondaryContainer |
| tertiary  | theme.colors.tertiaryContainer  | theme.colors.onTertiaryContainer  |
| surface   | theme.colors.elevarion.level3   | theme.colors.primary              |

### AnimatedFAB

El componente AnimatedFAB es un botón de acción flotante animado que se extiende horizontalmente y representa la acción principal en una aplicación.

#### Uso

```jsx
import React from "react";
import {
  StyleProp,
  ViewStyle,
  Animated,
  StyleSheet,
  Platform,
  ScrollView,
  Text,
  SafeAreaView,
  I18nManager,
} from "react-native";
import { AnimatedFAB } from "react-native-paper";

const MyComponent = ({
  animatedValue,
  visible,
  extended,
  label,
  animateFrom,
  style,
  iconMode,
}) => {
  const [isExtended, setIsExtended] = React.useState(true);

  const isIOS = Platform.OS === "ios";

  const onScroll = ({ nativeEvent }) => {
    const currentScrollPosition =
      Math.floor(nativeEvent?.contentOffset?.y) ?? 0;

    setIsExtended(currentScrollPosition <= 0);
  };

  const fabStyle = { [animateFrom]: 16 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView onScroll={onScroll}>
        {[...new Array(100).keys()].map((_, i) => (
          <Text>{i}</Text>
        ))}
      </ScrollView>
      <AnimatedFAB
        icon={"plus"}
        label={"Label"}
        extended={isExtended}
        onPress={() => console.log("Pressed")}
        visible={visible}
        animateFrom={"right"}
        iconMode={"static"}
        style={[styles.fabStyle, style, fabStyle]}
      />
    </SafeAreaView>
  );
};

export default MyComponent;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: "absolute",
  },
});
```

#### Propiedades

- **icon**: IconSource (requerido) - Icono a mostrar en el FAB.
- **label**: string (requerido) - Etiqueta para el FAB extendido.
- **uppercase**: boolean - Hace que el texto de la etiqueta esté en mayúsculas.
- **background**: PressableAndroidRippleConfig - Tipo de fondo para mostrar el feedback (Android).
- **accessibilityLabel**: string - Etiqueta de accesibilidad para el FAB. Usa label por defecto si está especificado.
- **accessibilityState**: AccessibilityState - Estado de accesibilidad para el FAB.
- **color**: string - Color personalizado para el icono y la etiqueta del FAB.
- **rippleColor**: ColorValue - Color del efecto de ondulación.
- **disabled**: boolean - Determina si el FAB está deshabilitado.
- **visible**: boolean - Determina si el FAB está actualmente visible. Valor por defecto: true.
- **onPress**: function - Función a ejecutar al presionar.
- **onLongPress**: function - Función a ejecutar al mantener presionado.
- **delayLongPress**: number - Número de milisegundos que un usuario debe tocar el elemento antes de ejecutar onLongPress.
- **iconMode**: 'static' | 'dynamic' - Indica si el icono debe traducirse al final del FAB extendido o permanecer estático en el mismo lugar. Valor por defecto: 'dynamic'.
- **animateFrom**: 'left' | 'right' - Indica desde qué dirección se debe realizar la animación. Valor por defecto: 'right'.
- **extended**: boolean - Determina si el FAB debe iniciar la animación para extenderse. Valor por defecto: false.
- **labelMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente de la etiqueta.
- **variant**: 'primary' | 'secondary' | 'tertiary' | 'surface' - Variante de mapeo de colores para combinaciones de colores de contenedor e icono. Valor por defecto: 'primary'.
- **style**: Animated.WithAnimatedValue<StyleProp<ViewStyle>> - Estilo personalizado para el FAB.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **testID**: string - ID de prueba utilizado con fines de testing. Valor por defecto: 'animated-fab'.

#### Colores del Tema (MD3)

| modo      | backgroundColor                 | textColor/iconColor               |
| --------- | ------------------------------- | --------------------------------- |
| disabled  | theme.colors.surfaceDisabled    | theme.colors.onSurfaceDisabled    |
| primary   | theme.colors.primaryContainer   | theme.colors.onPrimaryContainer   |
| secondary | theme.colors.secondaryContainer | theme.colors.onSecondaryContainer |
| tertiary  | theme.colors.tertiaryContainer  | theme.colors.onTertiaryContainer  |
| surface   | theme.colors.elevarion.level3   | theme.colors.primary              |

### HelperText

El componente HelperText se utiliza junto con elementos de entrada para proporcionar sugerencias adicionales al usuario.

#### Uso

```jsx
import * as React from "react";
import { View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";

const MyComponent = () => {
  const [text, setText] = React.useState("");

  const onChangeText = (text) => setText(text);

  const hasErrors = () => {
    return !text.includes("@");
  };

  return (
    <View>
      <TextInput label="Email" value={text} onChangeText={onChangeText} />
      <HelperText type="error" visible={hasErrors()}>
        Email address is invalid!
      </HelperText>
    </View>
  );
};

export default MyComponent;
```

#### Propiedades

- **type**: 'error' | 'info' - Tipo del texto de ayuda. Valor por defecto: 'info'.
- **children**: React.ReactNode (requerido) - Contenido de texto del HelperText.
- **visible**: boolean - Determina si se muestra el texto de ayuda. Valor por defecto: true.
- **padding**: 'none' | 'normal' - Determina si se aplica relleno al texto de ayuda. Valor por defecto: 'normal'.
- **disabled**: boolean - Determina si la entrada de texto vinculada con el texto de ayuda está deshabilitada.
- **style**: StyleProp<TextStyle> - Estilo personalizado para el texto de ayuda.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **testID**: string - ID de prueba utilizado con fines de testing.

#### Colores del Tema (MD3)

| modo     | textColor                      |
| -------- | ------------------------------ |
| disabled | theme.colors.onSurfaceDisabled |
| default  | theme.colors.onSurfaceVariant  |
| error    | theme.colors.error             |

### Icon

Un componente de icono que renderiza iconos de bibliotecas vectoriales.

#### Uso

```jsx
import * as React from "react";
import { Icon, MD3Colors } from "react-native-paper";

const MyComponent = () => (
  <Icon source="camera" color={MD3Colors.error50} size={20} />
);

export default MyComponent;
```

#### Propiedades

- **size**: number (requerido) - Tamaño del icono.
- **allowFontScaling**: boolean - Permite el escalado de fuente.
- **source**: any (requerido) - Icono a mostrar.
- **color**: string - Color del icono.
- **testID**: string - ID de prueba utilizado con fines de testing.
- **theme**: ThemeProp - Tema para aplicar al componente.

### IconButton

Un botón de icono es un botón que muestra solo un icono sin etiqueta.

Estilos disponibles:

- default
- outlined
- contained
- contained-tonal

#### Uso

```jsx
import * as React from "react";
import { IconButton, MD3Colors } from "react-native-paper";

const MyComponent = () => (
  <IconButton
    icon="camera"
    iconColor={MD3Colors.error50}
    size={20}
    onPress={() => console.log("Pressed")}
  />
);

export default MyComponent;
```

#### Propiedades

- **TouchableRipple props** - Extiende las propiedades de TouchableRipple.
- **icon**: IconSource (requerido) - Icono a mostrar.
- **mode**: 'outlined' | 'contained' | 'contained-tonal' - Modo del botón de icono. Por defecto no hay un modo específico, solo se renderizará el icono presionable. Disponible en v5.x con la versión 3 del tema.
- **iconColor**: string - Color del icono. Renombrado de 'color' a 'iconColor' en v5.x.
- **containerColor**: string - Color de fondo del contenedor del icono.
- **rippleColor**: ColorValue - Color del efecto de ondulación.
- **selected**: boolean - Determina si el botón de icono está seleccionado. Un botón seleccionado recibe una combinación alternativa de colores de icono y contenedor. Disponible en v5.x con la versión 3 del tema. Valor por defecto: false.
- **size**: number - Tamaño del icono. Valor por defecto: 24.
- **disabled**: boolean - Determina si el botón está deshabilitado. Un botón deshabilitado aparece en gris y no se llama a onPress al tocarlo.
- **animated**: boolean - Determina si el cambio de icono está animado. Valor por defecto: false.
- **accessibilityLabel**: string - Etiqueta de accesibilidad para el botón. Esto es leído por el lector de pantalla cuando el usuario toca el botón.
- **onPress**: (e: GestureResponderEvent) => void - Función a ejecutar al presionar.
- **style**: Animated.WithAnimatedValue<StyleProp<ViewStyle>> - Estilo personalizado para el botón.
- **ref**: React.RefObject<View> - Referencia para el componente.
- **testID**: string - ID de prueba utilizado con fines de testing. Valor por defecto: 'icon-button'.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **loading**: boolean - Determina si se muestra un indicador de carga. Valor por defecto: false.

#### Colores del Tema (MD3)

| selected        | mode            | iconColor                         | backgroundColor                 | borderColor |
| --------------- | --------------- | --------------------------------- | ------------------------------- | ----------- |
| no seleccionado | default         | theme.colors.primary              |                                 |             |
| no seleccionado | outlined        | theme.colors.inverseOnSurface     | theme.colors.inverseSurface     |             |
| no seleccionado | contained       | theme.colors.onPrimary            | theme.colors.primary            |             |
| no seleccionado | contained-tonal | theme.colors.onSecondaryContainer | theme.colors.secondaryContainer |             |
| seleccionado    |                 |                                   |                                 |             |
| deshabilitado   |                 |                                   |                                 |             |

### List.Accordion

El componente List.Accordion se utiliza para mostrar un elemento de lista expandible.

#### Uso

```jsx
import * as React from "react";
import { List } from "react-native-paper";

const MyComponent = () => {
  const [expanded, setExpanded] = React.useState(true);

  const handlePress = () => setExpanded(!expanded);

  return (
    <List.Section title="Accordions">
      <List.Accordion
        title="Uncontrolled Accordion"
        left={(props) => <List.Icon {...props} icon="folder" />}
      >
        <List.Item title="First item" />
        <List.Item title="Second item" />
      </List.Accordion>

      <List.Accordion
        title="Controlled Accordion"
        left={(props) => <List.Icon {...props} icon="folder" />}
        expanded={expanded}
        onPress={handlePress}
      >
        <List.Item title="First item" />
        <List.Item title="Second item" />
      </List.Accordion>
    </List.Section>
  );
};

export default MyComponent;
```

#### Propiedades

- **title**: React.ReactNode (requerido) - Texto del título para el acordeón.
- **description**: React.ReactNode - Texto de descripción para el acordeón.
- **left**: (props: { color: string; style: Style }) => React.ReactNode - Callback que devuelve un elemento React para mostrar en el lado izquierdo.
- **right**: (props: { isExpanded: boolean }) => React.ReactNode - Callback que devuelve un elemento React para mostrar en el lado derecho.
- **expanded**: boolean - Determina si el acordeón está expandido. Si se proporciona, el acordeón se comportará como un "componente controlado". Necesitarás actualizar esta prop cuando desees alternar el componente o en onPress.
- **onPress**: (e: GestureResponderEvent) => void - Función a ejecutar al presionar.
- **onLongPress**: (e: GestureResponderEvent) => void - Función a ejecutar al mantener presionado.
- **delayLongPress**: number - Número de milisegundos que un usuario debe tocar el elemento antes de ejecutar onLongPress.
- **children**: React.ReactNode (requerido) - Contenido de la sección.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **background**: PressableAndroidRippleConfig - Tipo de fondo a mostrar para el feedback (Android).
- **style**: StyleProp<ViewStyle> - Estilo personalizado para el elemento TouchableRipple.
- **titleStyle**: StyleProp<TextStyle> - Estilo personalizado para el elemento Title.
- **descriptionStyle**: StyleProp<TextStyle> - Estilo personalizado para el elemento Description.
- **rippleColor**: ColorValue - Color del efecto de ondulación.
- **titleNumberOfLines**: number - Trunca el texto del título para que no exceda este número de líneas. Valor por defecto: 1.
- **descriptionNumberOfLines**: number - Trunca el texto de la descripción para que no exceda este número de líneas. Valor por defecto: 2.
- **titleMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente del título.
- **descriptionMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente de la descripción.
- **id**: string | number - ID utilizado para distinguir un acordeón específico cuando se utiliza List.AccordionGroup. Esta propiedad es requerida cuando se utiliza List.AccordionGroup y no tiene impacto en el comportamiento cuando se utiliza List.Accordion de forma independiente.
- **testID**: string - ID de prueba utilizado con fines de testing.
- **accessibilityLabel**: string - Etiqueta de accesibilidad para el TouchableRipple. Esto es leído por el lector de pantalla cuando el usuario toca el elemento.
- **pointerEvents**: ViewProps['pointerEvents'] - Eventos de puntero pasados a la vista del contenedor. Valor por defecto: 'none'.

### Menu.Item

Un componente para mostrar un único elemento de lista dentro de un Menú.

#### Uso

```jsx
import * as React from "react";
import { View } from "react-native";
import { Menu } from "react-native-paper";

const MyComponent = () => (
  <View style={{ flex: 1 }}>
    <Menu.Item leadingIcon="redo" onPress={() => {}} title="Redo" />
    <Menu.Item leadingIcon="undo" onPress={() => {}} title="Undo" />
    <Menu.Item
      leadingIcon="content-cut"
      onPress={() => {}}
      title="Cut"
      disabled
    />
    <Menu.Item
      leadingIcon="content-copy"
      onPress={() => {}}
      title="Copy"
      disabled
    />
    <Menu.Item leadingIcon="content-paste" onPress={() => {}} title="Paste" />
  </View>
);

export default MyComponent;
```

#### Propiedades

- **title**: React.ReactNode (requerido) - Texto del título para el elemento del menú.
- **leadingIcon**: IconSource - Icono principal a mostrar para el elemento del menú. Renombrado de 'icon' a 'leadingIcon' en v5.x.
- **trailingIcon**: IconSource - Icono secundario a mostrar para el elemento del menú. Disponible en v5.x con versión de tema 3.
- **disabled**: boolean - Determina si el elemento está deshabilitado. Un elemento deshabilitado aparece en gris y no se llama a onPress al tocarlo.
- **dense**: boolean - Establece la altura mínima con diseño compacto. Disponible en v5.x con versión de tema 3.
- **background**: PressableAndroidRippleConfig - Tipo de fondo drawable para mostrar el feedback (Android). https://reactnative.dev/docs/pressable#rippleconfig
- **onPress**: (e: GestureResponderEvent) => void - Función a ejecutar al presionar.
- **titleMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente del título. Valor por defecto: 1.5.
- **style**: StyleProp<ViewStyle> - Estilo personalizado para el elemento.
- **contentStyle**: StyleProp<ViewStyle> - Estilo personalizado para el contenido.
- **titleStyle**: StyleProp<TextStyle> - Estilo personalizado para el título.
- **rippleColor**: ColorValue - Color del efecto de ondulación.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **testID**: string - ID de prueba utilizado con fines de testing. Valor por defecto: 'menu-item'.
- **accessibilityLabel**: string - Etiqueta de accesibilidad para el Touchable. Esto es leído por el lector de pantalla cuando el usuario toca el componente.
- **accessibilityState**: AccessibilityState - Estado de accesibilidad para el Touchable. Esto es leído por el lector de pantalla cuando el usuario toca el componente.

#### Colores del Tema (MD3)

| modo     | textColor                      | iconColor                      |
| -------- | ------------------------------ | ------------------------------ |
| default  | theme.colors.onSurface         | theme.colors.onSurfaceVariant  |
| disabled | theme.colors.onSurfaceDisabled | theme.colors.onSurfaceDisabled |

### List.AccordionGroup

El componente List.AccordionGroup permite controlar un grupo de List.Accordion. La prop id para List.Accordion es necesaria para que el grupo funcione. List.AccordionGroup puede ser un componente controlado o no controlado. El ejemplo muestra la versión no controlada. Solamente un Accordion puede estar expandido en un momento dado.

#### Uso

```jsx
import * as React from "react";
import { View, Text } from "react-native";
import { List } from "react-native-paper";

const MyComponent = () => (
  <List.AccordionGroup>
    <List.Accordion title="Accordion 1" id="1">
      <List.Item title="Item 1" />
    </List.Accordion>
    <List.Accordion title="Accordion 2" id="2">
      <List.Item title="Item 2" />
    </List.Accordion>
    <View>
      <Text>
        List.Accordion puede ser envuelto porque la implementación utiliza
        React.Context.
      </Text>
      <List.Accordion title="Accordion 3" id="3">
        <List.Item title="Item 3" />
      </List.Accordion>
    </View>
  </List.AccordionGroup>
);

export default MyComponent;
```

#### Propiedades

- **onAccordionPress**: (expandedId: string | number) => void - Función a ejecutar al cambiar la selección.
- **expandedId**: string | number - ID del acordeón actualmente expandido.
- **children**: React.ReactNode (requerido) - Elementos React que contienen acordeones de lista.

### List.Icon

Un componente para mostrar un icono en un elemento de lista.

#### Uso

```jsx
import * as React from "react";
import { List, MD3Colors } from "react-native-paper";

const MyComponent = () => (
  <>
    <List.Icon color={MD3Colors.tertiary70} icon="folder" />
    <List.Icon color={MD3Colors.tertiary70} icon="equal" />
    <List.Icon color={MD3Colors.tertiary70} icon="calendar" />
  </>
);

export default MyComponent;
```

#### Propiedades

- **icon**: IconSource (requerido) - Icono a mostrar.
- **color**: string - Color para el icono.
- **style**: StyleProp<ViewStyle> - Estilo personalizado para el icono.
- **theme**: ThemeProp - Tema para aplicar al componente.

### List.Item

Un componente para mostrar elementos dentro de una Lista.

#### Uso

```jsx
import * as React from "react";
import { List } from "react-native-paper";

const MyComponent = () => (
  <List.Item
    title="First Item"
    description="Item description"
    left={(props) => <List.Icon {...props} icon="folder" />}
  />
);

export default MyComponent;
```

#### Propiedades

- **TouchableRipple props** - Extiende las propiedades de TouchableRipple.
- **title**: React.ReactNode | ((props: { selectable: boolean; ellipsizeMode: EllipsizeProp | undefined; color: string; fontSize: number; }) => React.ReactNode) (requerido) - Texto del título para el elemento de lista.
- **description**: React.ReactNode | ((props: { selectable: boolean; ellipsizeMode: EllipsizeProp | undefined; color: string; fontSize: number; }) => React.ReactNode) - Texto de descripción para el elemento de lista o callback que devuelve un elemento React para mostrar la descripción.
- **left**: (props: { color: string; style: Style }) => React.ReactNode - Callback que devuelve un elemento React para mostrar en el lado izquierdo.
- **right**: (props: { color: string; style?: Style }) => React.ReactNode - Callback que devuelve un elemento React para mostrar en el lado derecho.
- **onPress**: (e: GestureResponderEvent) => void - Función a ejecutar al presionar.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **style**: StyleProp<ViewStyle> - Estilo personalizado para el elemento TouchableRipple.
- **contentStyle**: StyleProp<ViewStyle> - Estilo personalizado para el contenedor que envuelve el título y la descripción.
- **titleStyle**: StyleProp<TextStyle> - Estilo personalizado para el elemento Title.
- **descriptionStyle**: StyleProp<TextStyle> - Estilo personalizado para el elemento Description.
- **titleNumberOfLines**: number - Trunca el texto del título para que no exceda este número de líneas. Valor por defecto: 1.
- **descriptionNumberOfLines**: number - Trunca el texto de la descripción para que no exceda este número de líneas. Valor por defecto: 2.
- **titleEllipsizeMode**: EllipsizeProp - Modo de elipsis para el título. Uno de 'head', 'middle', 'tail', 'clip'.
- **descriptionEllipsizeMode**: EllipsizeProp - Modo de elipsis para la descripción. Uno de 'head', 'middle', 'tail', 'clip'.
- **titleMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente del título.
- **descriptionMaxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente de la descripción.
- **testID**: string - ID de prueba utilizado con fines de testing.

### List.Section

Un componente utilizado para agrupar elementos de lista.

#### Uso

```jsx
import * as React from "react";
import { List, MD3Colors } from "react-native-paper";

const MyComponent = () => (
  <List.Section>
    <List.Subheader>Some title</List.Subheader>
    <List.Item title="First Item" left={() => <List.Icon icon="folder" />} />
    <List.Item
      title="Second Item"
      left={() => <List.Icon color={MD3Colors.tertiary70} icon="folder" />}
    />
  </List.Section>
);

export default MyComponent;
```

#### Propiedades

- **title**: string - Texto del título para la sección.
- **children**: React.ReactNode (requerido) - Contenido de la sección.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **titleStyle**: StyleProp<TextStyle> - Estilo personalizado para el elemento Title.
- **style**: StyleProp<ViewStyle> - Estilo personalizado para la sección.

### List.Subheader

Un componente utilizado para mostrar un encabezado en listas.

#### Uso

```jsx
import * as React from "react";
import { List } from "react-native-paper";

const MyComponent = () => <List.Subheader>My List Title</List.Subheader>;

export default MyComponent;
```

#### Propiedades

- **theme**: ThemeProp - Tema para aplicar al componente.
- **style**: StyleProp<TextStyle> - Estilo personalizado para el elemento Text.
- **maxFontSizeMultiplier**: number - Especifica la escala más grande posible que puede alcanzar la fuente de texto.

### FAB.Group

Un componente para mostrar un grupo de FABs con acciones relacionadas en un marcado de velocidad. Para renderizar el grupo por encima de otros componentes, necesitarás envolverlo con el componente Portal.

#### Uso

```jsx
import * as React from "react";
import { FAB, Portal, PaperProvider } from "react-native-paper";

const MyComponent = () => {
  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
    <PaperProvider>
      <Portal>
        <FAB.Group
          open={open}
          visible
          icon={open ? "calendar-today" : "plus"}
          actions={[
            { icon: "plus", onPress: () => console.log("Pressed add") },
            {
              icon: "star",
              label: "Star",
              onPress: () => console.log("Pressed star"),
            },
            {
              icon: "email",
              label: "Email",
              onPress: () => console.log("Pressed email"),
            },
            {
              icon: "bell",
              label: "Remind",
              onPress: () => console.log("Pressed notifications"),
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>
    </PaperProvider>
  );
};

export default MyComponent;
```

#### Propiedades

- **actions**: Array (requerido) - Elementos de acción para mostrar en forma de marcado de velocidad. Un elemento de acción debe contener las siguientes propiedades:
  - icon: icono a mostrar (requerido)
  - label: texto de etiqueta opcional
  - color: color de icono personalizado del elemento de acción
  - labelTextColor: color de texto de etiqueta personalizado del elemento de acción
  - accessibilityLabel: etiqueta de accesibilidad para la acción, usa label por defecto si está especificado
  - accessibilityHint: sugerencia de accesibilidad para la acción
  - style: estilos adicionales para el elemento fab
  - containerStyle: estilos adicionales para el contenedor de etiqueta del elemento fab
  - labelStyle: estilos adicionales para la etiqueta del elemento fab
  - labelMaxFontSizeMultiplier: especifica la escala más grande posible que puede alcanzar la fuente de un título
  - onPress: callback que se llama cuando se presiona el FAB (requerido)
  - onLongPress: callback que se llama cuando se mantiene presionado el FAB
  - toggleStackOnLongPress: callback que se llama cuando se mantiene presionado el FAB
  - size: tamaño del elemento de acción. Por defecto es small
  - testID: testID para usar en pruebas
  - rippleColor: color del efecto de ondulación
- **icon**: IconSource (requerido) - Icono a mostrar para el FAB. Puedes alternarlo según si el marcado de velocidad está abierto para mostrar un icono diferente.
- **accessibilityLabel**: string - Etiqueta de accesibilidad para el FAB.
- **color**: string - Color personalizado para el FAB.
- **backdropColor**: string - Color de fondo personalizado para el fondo del marcado de velocidad abierto.
- **rippleColor**: ColorValue - Color del efecto de ondulación.
- **onPress**: function - Función a ejecutar al presionar el FAB.
- **onLongPress**: function - Función a ejecutar al mantener presionado el FAB.
- **toggleStackOnLongPress**: boolean - Hace que las acciones aparezcan al mantener presionado en lugar de al presionar.
- **delayLongPress**: number - Cambia el retraso para la reacción de presión larga. Valor por defecto: 200.
- **enableLongPressWhenStackOpened**: boolean - Permite onLongPress cuando la pila está abierta. Valor por defecto: false.
- **open**: boolean (requerido) - Determina si el marcado de velocidad está abierto.
- **onStateChange**: function (requerido) - Callback que se llama al abrir y cerrar el marcado de velocidad.
- **visible**: boolean (requerido) - Determina si FAB está actualmente visible.
- **style**: StyleProp<ViewStyle> - Estilo para el grupo.
- **fabStyle**: Animated.WithAnimatedValue<StyleProp<ViewStyle>> - Estilo para el FAB.
- **variant**: 'primary' | 'secondary' | 'tertiary' | 'surface' - Variante de mapeo de colores para combinaciones de colores de contenedor e icono. Valor por defecto: 'primary'.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **label**: string - Etiqueta opcional para FAB.
- **testID**: string - ID de prueba para pasar desde las props del Grupo al FAB.

### Modal

El componente Modal es una forma simple de presentar contenido por encima de una vista envolvente. Para renderizar el Modal por encima de otros componentes, necesitarás envolverlo con el componente Portal.

#### Uso

```jsx
import * as React from "react";
import { Modal, Portal, Text, Button, PaperProvider } from "react-native-paper";

const MyComponent = () => {
  const [visible, setVisible] = React.useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: "white", padding: 20 };

  return (
    <PaperProvider>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={containerStyle}
        >
          <Text>Example Modal. Click outside this area to dismiss.</Text>
        </Modal>
      </Portal>
      <Button style={{ marginTop: 30 }} onPress={showModal}>
        Show
      </Button>
    </PaperProvider>
  );
};

export default MyComponent;
```

#### Propiedades

- **dismissable**: boolean - Determina si hacer clic fuera del modal lo cierra. Valor por defecto: true.
- **dismissableBackButton**: boolean - Determina si al presionar el botón de hardware Atrás de Android se cierra el diálogo. Valor por defecto: valor de dismissable.
- **onDismiss**: () => void - Función que se llama cuando el usuario cierra el modal. Valor por defecto: () => {}.
- **overlayAccessibilityLabel**: string - Etiqueta de accesibilidad para la superposición. Esto es leído por el lector de pantalla cuando el usuario toca fuera del modal. Valor por defecto: 'Close modal'.
- **visible**: boolean - Determina si el modal es visible. Valor por defecto: false.
- **children**: React.ReactNode (requerido) - Contenido del Modal.
- **contentContainerStyle**: Animated.WithAnimatedValue<StyleProp<ViewStyle>> - Estilo para el contenido del modal.
- **style**: StyleProp<ViewStyle> - Estilo para el contenedor del modal. Usa esta prop para cambiar el estilo del contenedor predeterminado o para sobrescribir los márgenes de seguridad con marginTop y marginBottom.
- **theme**: ThemeProp - Tema para aplicar al componente.
- **testID**: string - ID de prueba utilizado con fines de testing. Valor por defecto: 'modal'.

#### Colores del Tema (MD3)

| modo | backgroundColor       |
| ---- | --------------------- |
| -    | theme.colors.backdrop |

## Guía de Implementación

### Instalación

Para instalar React Native Paper en tu proyecto, ejecuta uno de los siguientes comandos dependiendo de tu gestor de paquetes:

```bash
npm install react-native-paper
```

o

```bash
yarn add react-native-paper
```

React Native Paper tiene dependencias que requieren instalación adicional:

```bash
npm install react-native-vector-icons
```

Para proyectos que utilizan Expo, puedes simplemente instalar:

```bash
expo install react-native-paper
```

### Configuración básica

Para utilizar React Native Paper en tu aplicación, debes envolver tu componente raíz con el proveedor `PaperProvider`:

```jsx
import * as React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import App from "./src/App";

export default function Main() {
  return (
    <PaperProvider>
      <App />
    </PaperProvider>
  );
}
```

### Configuración de iconos

React Native Paper utiliza `react-native-vector-icons` para mostrar iconos. Necesitas configurar los iconos según la plataforma:

#### Para proyectos React Native CLI:

**Android**: Edita `android/app/build.gradle`:

```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

**iOS**: Edita `ios/Podfile` y ejecuta `pod install`:

```ruby
pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
```

#### Para proyectos Expo:

No se requiere configuración adicional, ya que Expo incluye los iconos por defecto.

### Tema

React Native Paper proporciona un sistema de temas completo que te permite personalizar la apariencia de tu aplicación.

#### Tema básico

```jsx
import * as React from "react";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#3498db",
    accent: "#f1c40f",
  },
};

export default function Main() {
  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}
```

#### Tema oscuro

```jsx
import * as React from "react";
import { Provider as PaperProvider, DarkTheme } from "react-native-paper";

export default function Main() {
  return (
    <PaperProvider theme={DarkTheme}>
      <App />
    </PaperProvider>
  );
}
```

#### Cambio dinámico de tema

```jsx
import * as React from "react";
import {
  Provider as PaperProvider,
  DefaultTheme,
  DarkTheme,
} from "react-native-paper";
import { useColorScheme } from "react-native";

export default function Main() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}
```

### Mejores Prácticas

#### Organización del código

1. **Estructura de componentes**: Organiza tus componentes en carpetas lógicas.
2. **Reutilización**: Crea componentes reutilizables basados en React Native Paper.
3. **Temas**: Define un tema consistente para toda tu aplicación.

#### Rendimiento

1. **Memoización**: Utiliza React.memo para componentes que no cambian frecuentemente.
2. **Lazy loading**: Carga componentes solo cuando sean necesarios.
3. **Optimización de listas**: Utiliza FlatList o SectionList con renderización optimizada.

#### Accesibilidad

1. **Etiquetas de accesibilidad**: Proporciona etiquetas de accesibilidad para todos los elementos interactivos.
2. **Contraste**: Asegúrate de que el contraste de color sea suficiente.
3. **Tamaño de toque**: Haz que los elementos táctiles sean lo suficientemente grandes.

### Ejemplos de Uso Común

#### Formulario de inicio de sesión

```jsx
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";

const LoginForm = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);

  const hasErrors = () => {
    return !email.includes("@");
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={styles.input}
        mode="outlined"
      />
      <HelperText type="error" visible={hasErrors()}>
        Email address is invalid!
      </HelperText>

      <TextInput
        label="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={secureTextEntry}
        right={
          <TextInput.Icon
            icon={secureTextEntry ? "eye" : "eye-off"}
            onPress={() => setSecureTextEntry(!secureTextEntry)}
          />
        }
        style={styles.input}
        mode="outlined"
      />

      <Button
        mode="contained"
        onPress={() => console.log("Login")}
        style={styles.button}
      >
        Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
});

export default LoginForm;
```

#### Lista de elementos con acciones

```jsx
import * as React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { List, Divider, FAB } from "react-native-paper";

const data = [
  { id: "1", title: "Item 1", description: "Description for Item 1" },
  { id: "2", title: "Item 2", description: "Description for Item 2" },
  { id: "3", title: "Item 3", description: "Description for Item 3" },
];

const ItemList = () => {
  const renderItem = ({ item }) => (
    <List.Item
      title={item.title}
      description={item.description}
      left={(props) => <List.Icon {...props} icon="folder" />}
      right={(props) => <List.Icon {...props} icon="dots-vertical" />}
      onPress={() => console.log("Pressed", item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => console.log("Add new item")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ItemList;
```

### Solución de Problemas

#### Problemas comunes y soluciones

1. **Los iconos no se muestran**

   - Asegúrate de haber configurado correctamente react-native-vector-icons.
   - Verifica que estás utilizando los nombres de iconos correctos.

2. **Problemas de rendimiento**

   - Utiliza componentes puros (React.memo) para evitar renderizaciones innecesarias.
   - Optimiza las listas con FlatList y sus propiedades de rendimiento.

3. **Problemas de estilo**

   - Utiliza el sistema de temas de React Native Paper en lugar de estilos inline.
   - Asegúrate de que tus estilos personalizados no entren en conflicto con los estilos de los componentes.

4. **Problemas con el Portal**

   - Asegúrate de que el componente Portal esté dentro de un PaperProvider.
   - Verifica que no haya múltiples instancias de PaperProvider.

5. **Problemas con la navegación**
   - Si utilizas react-navigation, asegúrate de integrar correctamente los temas.
   - Utiliza los componentes de navegación de React Native Paper (Appbar, BottomNavigation) de manera consistente.

### Recursos adicionales

- [Documentación oficial de React Native Paper](https://callstack.github.io/react-native-paper/)
- [GitHub de React Native Paper](https://github.com/callstack/react-native-paper)
- [Ejemplos de React Native Paper](https://callstack.github.io/react-native-paper/docs/showcase)
- [Comunidad de React Native](https://reactnative.dev/community/overview)
