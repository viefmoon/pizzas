import React, { useCallback, useMemo, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  ViewStyle,
  StyleProp,
  View,
} from "react-native";
import {
  List,
  Chip,
  Text,
  Surface,
  Searchbar,
  SegmentedButtons,
  FAB,
  Portal,
} from "react-native-paper";
import AutoImage from "../common/AutoImage";
import { useAppTheme, AppTheme } from "../../styles/theme";
import { getImageUrl } from "../../lib/imageUtils";
export interface FilterOption<TValue> {
  value: TValue;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface StatusConfig<TItem> {
  field: keyof TItem;
  activeValue: any;
  activeLabel: string;
  inactiveLabel: string;
}

export interface RenderItemConfig<TItem> {
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
  itemActionsContainerStyle?: StyleProp<ViewStyle>;
  renderItemActions?: (item: TItem) => React.ReactNode;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  enableSort?: boolean;
  filterValue?: string | number;
  onFilterChange?: (value: any) => void;
  filterOptions?: FilterOption<any>[];
  showFab?: boolean;
  onFabPress?: () => void;
  fabIcon?: string;
  fabLabel?: string;
  fabVisible?: boolean;
  showImagePlaceholder?: boolean;
  isModalOpen?: boolean;
  isDrawerOpen?: boolean; // Prop para saber si el drawer está abierto
}

const getStyles = (theme: AppTheme) => {
  const listItemHorizontalMargin = theme.spacing.m;
  return StyleSheet.create({
    listContainer: {
      flex: 1,
    },
    searchbarContainer: {
      paddingHorizontal: listItemHorizontalMargin - theme.spacing.xs,
      paddingTop: theme.spacing.s,
      paddingBottom: theme.spacing.xs,
      backgroundColor: theme.colors.background,
    },
    searchbar: {
      backgroundColor: theme.colors.elevation.level2,
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
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: theme.spacing.s,
    },
    filtersOuterContainer: {
      paddingTop: theme.spacing.s,
      paddingBottom: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs, // Reducimos padding horizontal
      backgroundColor: theme.colors.background,
    },
    segmentedButtons: {
      backgroundColor: "transparent",
      borderRadius: theme.roundness,
      minHeight: 40,
    },
    filterButton: {
      borderWidth: 0,
      paddingVertical: theme.spacing.xs, // Reducimos padding vertical del botón
    },
    filterButtonLabel: {
      fontSize: 15,
      letterSpacing: 0.15,
      paddingVertical: theme.spacing.xs,
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });
};

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
  enableSearch = false,
  searchPlaceholder = "Buscar...",
  enableSort = false,
  filterValue,
  onFilterChange,
  filterOptions,
  searchQuery: externalSearchQuery,
  onSearchChange,
  showFab = false,
  onFabPress,
  fabIcon = "plus",
  fabLabel,
  fabVisible = true,
  showImagePlaceholder = true,
  isModalOpen = false,
  isDrawerOpen = false, // Valor por defecto para isDrawerOpen
}: GenericListProps<TItem>) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const isSearchControlled =
    externalSearchQuery !== undefined && onSearchChange !== undefined;
  const currentSearchTerm = isSearchControlled
    ? externalSearchQuery
    : internalSearchTerm;
  const isFocused = useIsFocused();

  const processedItems = useMemo(() => {
    let processed = [...items];

    if (enableSort && renderConfig.titleField) {
      processed.sort((a, b) => {
        const titleA = String(a[renderConfig.titleField] ?? "").toLowerCase();
        const titleB = String(b[renderConfig.titleField] ?? "").toLowerCase();
        return titleA.localeCompare(titleB);
      });
    }

    if (enableSearch && !isSearchControlled && currentSearchTerm.trim()) {
      const lowerCaseSearchTerm = currentSearchTerm.toLowerCase();
      processed = processed.filter((item) => {
        const title = String(item[renderConfig.titleField] ?? "").toLowerCase();
        if (title.includes(lowerCaseSearchTerm)) {
          return true;
        }
        if (renderConfig.descriptionField) {
          const description = String(
            item[renderConfig.descriptionField] ?? ""
          ).toLowerCase();
          if (description.includes(lowerCaseSearchTerm)) {
            return true;
          }
        }
        return false;
      });
    }

    return processed;
  }, [
    items,
    enableSort,
    enableSearch,
    isSearchControlled,
    currentSearchTerm,
    renderConfig,
  ]);
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
        if (
          typeof imageFieldValue === "object" &&
          imageFieldValue !== null &&
          "path" in imageFieldValue &&
          typeof imageFieldValue.path === "string"
        ) {
          const url = getImageUrl(imageFieldValue.path);
          imageSource = url ?? undefined;
        } else if (typeof imageFieldValue === "string") {
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
            left={(props) => {
              if (imageSource) {
                return (
                  <AutoImage
                    source={imageSource}
                    placeholder={require("../../../../assets/icon.png")}
                    style={[styles.listItemImage, imageStyle]}
                    contentFit="cover"
                    transition={300}
                  />
                );
              } else if (showImagePlaceholder) {
                return <View style={[styles.listItemImage, imageStyle]} />;
              } else {
                return null;
              }
            }}
            right={(props) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {statusChip && statusChip(props)}
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
            style={styles.listItemContent}
          />
        </Surface>
      );
    },
    [
      theme,
      renderConfig,
      onItemPress,
      styles,
      listItemStyle,
      imageStyle,
      renderItemActions,
      itemActionsContainerStyle,
    ]
  );

  const finalContentContainerStyle = useMemo(() => {
    const baseStyle =
      processedItems.length === 0 && !currentSearchTerm
        ? styles.emptyListContainer
        : styles.defaultContentContainer;
    return StyleSheet.flatten([baseStyle, contentContainerStyle]);
  }, [processedItems, currentSearchTerm, styles, contentContainerStyle]);

  return (
    <View style={styles.listContainer}>
      {filterOptions && filterValue !== undefined && onFilterChange && (
        <Surface style={styles.filtersOuterContainer} elevation={0}>
          <SegmentedButtons
            value={String(filterValue)}
            onValueChange={(value) => {
              const selectedOption = filterOptions.find(
                (opt) => String(opt.value) === value
              );
              if (selectedOption) {
                onFilterChange(selectedOption.value);
              }
            }}
            buttons={filterOptions.map((option) => ({
              value: String(option.value),
              label: option.label,
              icon: option.icon,
              disabled: option.disabled,
              style: styles.filterButton,
              labelStyle: styles.filterButtonLabel,
              showSelectedCheck: false,
            }))}
            style={styles.segmentedButtons}
            density="medium"
          />
        </Surface>
      )}

      {enableSearch && (
        <View style={styles.searchbarContainer}>
          <Searchbar
            placeholder={searchPlaceholder}
            onChangeText={
              isSearchControlled ? onSearchChange : setInternalSearchTerm
            }
            value={currentSearchTerm}
            style={styles.searchbar}
            inputStyle={{ color: theme.colors.onSurface }}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            iconColor={theme.colors.onSurfaceVariant}
            clearIcon={
              currentSearchTerm
                ? (props) => <List.Icon {...props} icon="close-circle" />
                : undefined
            }
            onClearIconPress={() =>
              isSearchControlled
                ? onSearchChange("")
                : setInternalSearchTerm("")
            }
          />
        </View>
      )}

      <FlatList
        data={processedItems}
        renderItem={renderGenericItem}
        keyExtractor={(item) => item.id}
        style={listStyle}
        contentContainerStyle={finalContentContainerStyle}
        ListEmptyComponent={
          processedItems.length === 0 ? ListEmptyComponent : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              if (isSearchControlled) {
                onSearchChange("");
              } else {
                setInternalSearchTerm("");
              }
              onRefresh();
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
      />
      {showFab && onFabPress && (
        <Portal>
          <FAB
            icon={fabIcon}
            style={styles.fab}
            onPress={onFabPress}
            visible={
              isFocused &&
              showFab &&
              fabVisible &&
              !isModalOpen &&
              !isDrawerOpen
            } // Ocultar si el drawer está abierto
            label={fabLabel}
            color={theme.colors.onPrimary}
            theme={{ colors: { primaryContainer: theme.colors.primary } }}
          />
        </Portal>
      )}
    </View>
  );
};

export default GenericList;
