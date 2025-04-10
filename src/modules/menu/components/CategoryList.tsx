import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, RefreshControl } from "react-native";
import { List, Chip } from "react-native-paper";
// import { Image } from "expo-image"; // Quitar import de expo-image
import AutoImage from "../../../app/components/common/AutoImage"; // Importar AutoImage
import { Category } from "../types/category.types";
import { useAppTheme, AppTheme } from "../../../app/styles/theme";

interface CategoryListProps {
  categories: Category[];
  onItemPress: (category: Category) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  ListEmptyComponent: React.ComponentType<any> | React.ReactElement | null;
  isLoading?: boolean; // Opcional para mostrar indicador si es necesario
}

// Función para generar estilos, separada para claridad
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
    emptyListContainer: { // Mantenemos este estilo aquí por si ListEmptyComponent lo necesita
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: theme.spacing.l,
    },
    // Podríamos añadir un estilo para el contenedor de FlatList si es necesario
    // contentContainer: { paddingBottom: 80 } // Ejemplo si se necesita padding
});

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onItemPress,
  onRefresh,
  isRefreshing,
  ListEmptyComponent,
  // isLoading = false, // Descomentar si se usa
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const renderCategoryItem = useCallback(
    ({ item }: { item: Category }) => (
      <List.Item
        title={item.name}
        description={
          item.description
            ? item.description.length > 50
              ? `${item.description.substring(0, 50)}...`
              : item.description
            : "Sin descripción"
        }
        left={(props) => (
          // Usar AutoImage en lugar de Image
          <AutoImage
            // Pasar la ruta directamente a 'source'. AutoImage maneja la URL completa y el caché.
            source={item.photo?.path}
            placeholder={require("../../../../assets/icon.png")} // Mantener placeholder
            style={styles.listItemImage} // Aplicar el estilo existente
            contentFit="cover" // Mantener contentFit
            transition={300} // Mantener transición
            // No necesitamos pasar {...props} aquí a menos que AutoImage los necesite explícitamente
            // useCache es true por defecto
          />
        )}
        right={(props) => (
          <Chip
            {...props}
            icon={item.isActive ? "check-circle" : "close-circle"}
            selectedColor={
              item.isActive ? theme.colors.success : theme.colors.error
            }
            style={{
              backgroundColor: item.isActive
                ? theme.colors.successContainer
                : theme.colors.errorContainer,
            }}
          >
            {item.isActive ? "Activa" : "Inactiva"}
          </Chip>
        )}
        onPress={() => onItemPress(item)}
        style={styles.listItem}
      />
    ),
    [theme, onItemPress, styles] // Incluir styles en dependencias
  );

  return (
    <FlatList
      data={categories}
      renderItem={renderCategoryItem}
      keyExtractor={(item) => item.id}
      style={styles.listContainer}
      contentContainerStyle={
        categories.length === 0
          ? styles.emptyListContainer // Usar el estilo definido aquí
          : { paddingBottom: 80 } // Padding para FAB
      }
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
      // Podríamos añadir un indicador de carga aquí si isLoading es true
    />
  );
};

export default CategoryList;