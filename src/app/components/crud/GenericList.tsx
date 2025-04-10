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
import AutoImage from "../common/AutoImage";
import { useAppTheme, AppTheme } from "../../styles/theme";
import { getImageUrl } from "../../lib/imageUtils"; // Importar getImageUrl

interface StatusConfig<TItem> {
  field: keyof TItem;
  activeValue: any;
  activeLabel: string;
  inactiveLabel: string;
}

interface RenderItemConfig<TItem> {
  titleField: keyof TItem;
  descriptionField?: keyof TItem;
  descriptionMaxLength?: number;
  imageField?: keyof TItem;
  statusConfig?: StatusConfig<TItem>;
}

interface GenericListProps<TItem extends { id: string }> {
  items: TItem[];
  renderConfig: RenderItemConfig<TItem>;
  onItemPress: (item: TItem) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  ListEmptyComponent: React.ComponentType<any> | React.ReactElement | null;
  isLoading?: boolean;
  listStyle?: StyleProp<ViewStyle>;
  listItemStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<any>;
  itemActionsContainerStyle?: StyleProp<ViewStyle>; // Estilo opcional para el contenedor de acciones
  renderItemActions?: (item: TItem) => React.ReactNode; // Añadir prop aquí
}

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
      height: 40,
      alignSelf: "center",
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
      paddingBottom: 80,
      paddingTop: theme.spacing.xs,
    },
    itemActionsContainer: {
      // Definición correcta DENTRO de StyleSheet.create
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: theme.spacing.s,
    },
  });
// Eliminar la definición duplicada que estaba aquí fuera

const GenericList = <TItem extends { id: string }>({
  items,
  renderConfig,
  onItemPress,
  onRefresh,
  isRefreshing,
  ListEmptyComponent,
  isLoading = false,
  listStyle,
  listItemStyle,
  contentContainerStyle,
  imageStyle,
  renderItemActions,
  itemActionsContainerStyle,
}: GenericListProps<TItem>) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const renderGenericItem = useCallback(
    ({ item }: { item: TItem }) => {
      const title = String(item[renderConfig.titleField] ?? "");

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

      let imageSource: string | undefined = undefined;
      if (
        renderConfig.imageField &&
        item.hasOwnProperty(renderConfig.imageField)
      ) {
        const imageFieldValue = item[renderConfig.imageField];
        // Verificar si es un objeto con 'path' (como nuestro objeto Photo)
        if (
          typeof imageFieldValue === "object" &&
          imageFieldValue !== null &&
          "path" in imageFieldValue &&
          typeof imageFieldValue.path === "string"
        ) {
          const url = getImageUrl(imageFieldValue.path);
          imageSource = url ?? undefined; // Asignar undefined si getImageUrl devuelve null
        }
        // Fallback: si es directamente una URL string
        else if (typeof imageFieldValue === "string") {
          imageSource = imageFieldValue;
        }
      }

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
            mode="flat"
            selectedColor={
              isActive ? theme.colors.success : theme.colors.onSurfaceVariant
            }
            style={[
              styles.statusChip,
              {
                backgroundColor: isActive
                  ? theme.colors.successContainer
                  : theme.colors.surfaceVariant,
              },
            ]}
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
            left={(props) =>
              imageSource ? (
                <AutoImage
                  source={imageSource}
                  placeholder={require("../../../../assets/icon.png")}
                  style={[styles.listItemImage, imageStyle]}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                // Renderiza un View vacío con el mismo estilo para reservar el espacio
                <View style={[styles.listItemImage, imageStyle]} />
              )
            }
            // Modificar 'right' para incluir tanto statusChip como renderItemActions
            right={(props) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {statusChip && statusChip(props)}
                {/* Usar las props desestructuradas */}
                {renderItemActions && (
                  <View
                    style={[
                      styles.itemActionsContainer,
                      itemActionsContainerStyle,
                    ]}
                  >
                    {renderItemActions(item)}
                  </View>
                )}
              </View>
            )}
            onPress={() => onItemPress(item)}
            style={styles.listItemContent} // Este estilo es para el contenedor del List.Item, no solo el texto
          />
        </Surface>
      );
    },
    [theme, renderConfig, onItemPress, styles, listItemStyle, imageStyle]
  );

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
