import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  ViewStyle,
  StyleProp,
  View,
} from "react-native";
import { List, Chip, Text, Surface } from "react-native-paper";
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
      backgroundColor: theme.colors.surface,
      marginVertical: theme.spacing.xs,
      marginHorizontal: theme.spacing.m,
      borderRadius: theme.roundness * 1.5,
      elevation: 2,
      overflow: "hidden",
    },
    listItemContent: {
      paddingVertical: theme.spacing.xs,
    },
    listItemImage: {
      width: 60,
      height: 60,
      borderRadius: theme.roundness,
      marginRight: theme.spacing.m,
      backgroundColor: theme.colors.surfaceDisabled,
    },
    statusChip: {
      borderRadius: theme.roundness * 1.5,
      height: 40, // Aumentado
      alignSelf: "center", // Centrado verticalmente
    },
    title: {
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    description: {
      color: theme.colors.onSurfaceVariant,
    },
    emptyListContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.l,
    },
    defaultContentContainer: {
      paddingBottom: 80, // Padding por defecto para FAB u otros elementos flotantes
      paddingTop: theme.spacing.xs,
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
      let description = "";
      if (
        renderConfig.descriptionField &&
        item.hasOwnProperty(renderConfig.descriptionField)
      ) {
        const rawDescription = String(
          item[renderConfig.descriptionField] || ""
        );
        if (rawDescription && rawDescription.toLowerCase() !== "null") {
          const maxLength = renderConfig.descriptionMaxLength ?? 50;
          description =
            rawDescription.length > maxLength
              ? `${rawDescription.substring(0, maxLength)}...`
              : rawDescription;
        }
      }

      // --- Imagen ---
      const imageSource =
        renderConfig.imageField && item.hasOwnProperty(renderConfig.imageField)
          ? (item[renderConfig.imageField] as string | undefined)
          : undefined;

      // --- Estado (Chip) ---
      let statusChip = null;
      if (
        renderConfig.statusConfig &&
        item.hasOwnProperty(renderConfig.statusConfig.field)
      ) {
        const { field, activeValue, activeLabel, inactiveLabel } =
          renderConfig.statusConfig;
        const isActive = item[field] === activeValue;
        const chipLabel = isActive ? activeLabel : inactiveLabel;
        const chipIcon = isActive ? "check-circle" : "close-circle";

        statusChip = (props: any) => (
          <Chip
            {...props}
            // icon={isActive ? "check" : "close"} // Icono eliminado según solicitud
            mode="flat" // Cambiado de outlined a flat
            selectedColor={
              isActive ? theme.colors.success : theme.colors.onSurfaceVariant
            } // Usar color success para activo
            style={[
              styles.statusChip,
              {
                backgroundColor: isActive
                  ? theme.colors.successContainer // Usar successContainer para fondo activo
                  : theme.colors.surfaceVariant,
              },
            ]}
            // elevated // Eliminado para un look más plano
          >
            {chipLabel}
          </Chip>
        );
      }

      return (
        <Surface style={[styles.listItem, listItemStyle]} elevation={1}>
          <List.Item
            title={(props) => (
              <Text variant="titleMedium" style={styles.title}>
                {title}
              </Text>
            )}
            description={
              description
                ? (props) => (
                    <Text variant="bodyMedium" style={styles.description}>
                      {description}
                    </Text>
                  )
                : undefined
            }
            left={
              imageSource
                ? (props) => (
                    <AutoImage
                      source={imageSource}
                      placeholder={require("../../../../assets/icon.png")}
                      style={[styles.listItemImage, imageStyle]}
                      contentFit="cover"
                      transition={300}
                    />
                  )
                : undefined
            }
            right={statusChip ? (props) => statusChip(props) : undefined}
            onPress={() => onItemPress(item)}
            style={styles.listItemContent}
          />
        </Surface>
      );
    },
    [theme, renderConfig, onItemPress, styles, listItemStyle, imageStyle]
  );

  // Determinar el estilo del contenedor de contenido
  const finalContentContainerStyle = useMemo(() => {
    const baseStyle =
      items.length === 0
        ? styles.emptyListContainer
        : styles.defaultContentContainer;
    return StyleSheet.flatten([baseStyle, contentContainerStyle]);
  }, [items, styles, contentContainerStyle]);

  return (
    <FlatList
      data={items}
      renderItem={renderGenericItem}
      keyExtractor={(item) => item.id}
      style={[styles.listContainer, listStyle]}
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
    />
  );
};

export default GenericList;
