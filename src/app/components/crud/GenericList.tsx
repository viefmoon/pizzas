import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  ViewStyle,
  StyleProp,
} from "react-native";
import { List, Chip, Text } from "react-native-paper";
import AutoImage from "../common/AutoImage"; // Ajustar ruta si es necesario
import { useAppTheme, AppTheme } from "../../styles/theme"; // Ajustar ruta

// Interfaz para la configuración del estado visual (chip)
interface StatusConfig<TItem> {
  field: keyof TItem; // Campo del item que determina el estado (e.g., 'isActive')
  activeValue: any; // Valor que representa el estado activo
  activeLabel: string; // Etiqueta para el estado activo (e.g., 'Activa')
  inactiveLabel: string; // Etiqueta para el estado inactivo (e.g., 'Inactiva')
}

// Interfaz para la configuración de cómo renderizar un item
interface RenderItemConfig<TItem> {
  titleField: keyof TItem; // Campo para el título principal
  descriptionField?: keyof TItem; // Campo opcional para la descripción
  descriptionMaxLength?: number; // Longitud máxima de la descripción
  imageField?: keyof TItem; // Campo opcional para la imagen (debe contener el path o URI)
  statusConfig?: StatusConfig<TItem>; // Configuración opcional para el chip de estado
}

interface GenericListProps<TItem extends { id: string }> {
  items: TItem[];
  renderConfig: RenderItemConfig<TItem>; // Configuración para renderizar cada item
  onItemPress: (item: TItem) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  ListEmptyComponent: React.ComponentType<any> | React.ReactElement | null;
  isLoading?: boolean; // Opcional para mostrar indicador
  // Estilos opcionales para personalizar
  listStyle?: StyleProp<ViewStyle>;
  listItemStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<any>; // Para AutoImage
}

// Función para generar estilos
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    listContainer: {
      flex: 1,
    },
    listItem: {
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: theme.spacing.s,
      borderRadius: theme.roundness,
      marginHorizontal: theme.spacing.m,
    },
    listItemImage: {
      width: 50,
      height: 50,
      borderRadius: theme.roundness * 0.5,
      marginRight: theme.spacing.m,
      backgroundColor: theme.colors.outlineVariant,
    },
    emptyListContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.l,
    },
    defaultContentContainer: {
      paddingBottom: 80, // Padding por defecto para FAB u otros elementos flotantes
    },
  });

// Componente genérico
const GenericList = <TItem extends { id: string }>({
  items,
  renderConfig,
  onItemPress,
  onRefresh,
  isRefreshing,
  ListEmptyComponent,
  isLoading = false, // Valor por defecto
  listStyle,
  listItemStyle,
  contentContainerStyle,
  imageStyle,
}: GenericListProps<TItem>) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const renderGenericItem = useCallback(
    ({ item }: { item: TItem }) => {
      // --- Título ---
      const title = String(item[renderConfig.titleField] ?? "");

      // --- Descripción ---
      let description = "Sin descripción";
      // Verificar que descriptionField exista antes de usarlo para indexar
      if (
        renderConfig.descriptionField &&
        item.hasOwnProperty(renderConfig.descriptionField)
      ) {
        const rawDescription = String(item[renderConfig.descriptionField]);
        const maxLength = renderConfig.descriptionMaxLength ?? 50;
        description =
          rawDescription.length > maxLength
            ? `${rawDescription.substring(0, maxLength)}...`
            : rawDescription;
      }

      // --- Imagen ---
      // Verificar que imageField exista antes de usarlo para indexar
      const imageSource =
        renderConfig.imageField && item.hasOwnProperty(renderConfig.imageField)
          ? (item[renderConfig.imageField] as string | undefined)
          : undefined;

      // --- Estado (Chip) ---
      let statusChip = null;
      // Verificar que statusConfig y su field existan antes de usarlo para indexar
      if (
        renderConfig.statusConfig &&
        item.hasOwnProperty(renderConfig.statusConfig.field)
      ) {
        const { field, activeValue, activeLabel, inactiveLabel } =
          renderConfig.statusConfig;
        const isActive = item[field] === activeValue;
        const chipLabel = isActive ? activeLabel : inactiveLabel;
        const chipIcon = isActive ? "check-circle" : "close-circle";
        const chipSelectedColor = isActive
          ? theme.colors.success
          : theme.colors.error;
        const chipBackgroundColor = isActive
          ? theme.colors.successContainer
          : theme.colors.errorContainer;

        statusChip = (
          props: any // Recibe props de List.Item
        ) => (
          <Chip
            {...props}
            icon={chipIcon}
            selectedColor={chipSelectedColor}
            style={{ backgroundColor: chipBackgroundColor }}
          >
            {chipLabel}
          </Chip>
        );
      }

      return (
        <List.Item
          title={title}
          description={description}
          left={
            imageSource
              ? (props) => (
                  <AutoImage
                    source={imageSource}
                    placeholder={require("../../../../assets/icon.png")} // Placeholder genérico
                    style={[styles.listItemImage, imageStyle]} // Combina estilos
                    contentFit="cover"
                    transition={300}
                  />
                )
              : undefined
          } // No renderizar si no hay imageField
          right={statusChip ? (props) => statusChip(props) : undefined} // Renderizar chip si está configurado
          onPress={() => onItemPress(item)}
          style={[styles.listItem, listItemStyle]} // Combina estilos
        />
      );
    },
    // Asegurar que todas las dependencias externas estén aquí
    [theme, renderConfig, onItemPress, styles, listItemStyle, imageStyle]
  );

  // Determinar el estilo del contenedor de contenido
  const finalContentContainerStyle = useMemo(() => {
    const baseStyle =
      items.length === 0
        ? styles.emptyListContainer
        : styles.defaultContentContainer;
    // Combina el estilo base con el estilo proporcionado por las props
    return StyleSheet.flatten([baseStyle, contentContainerStyle]);
    // Asegurar que todas las dependencias externas estén aquí
  }, [items, styles, contentContainerStyle]);

  return (
    <FlatList
      data={items}
      renderItem={renderGenericItem}
      keyExtractor={(item) => item.id}
      style={[styles.listContainer, listStyle]} // Combina estilos
      contentContainerStyle={finalContentContainerStyle}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
      // Podríamos añadir un ActivityIndicator aquí si isLoading es true
    />
  );
};

export default GenericList;
