import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import {
  Text,
  Portal,
  Button,
  ActivityIndicator,
  Card,
  Title,
  Snackbar,
  IconButton,
} from "react-native-paper"; // Eliminado useTheme no usado
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useGetFullMenu } from "../hooks/useMenuQueries";
import { useCart, CartProvider } from "../context/CartContext";
import { OrderType } from "../types/orders.types";
import { Image } from "expo-image";
import { getImageUrl } from "@/app/lib/imageUtils";

// Componentes
import OrderCartDetail from "../components/OrderCartDetail";
import ProductCustomizationModal from "../components/ProductCustomizationModal";
import CartButton from "../components/CartButton";

// Custom hook
import { useAppTheme } from "@/app/styles/theme";

const CreateOrderScreen = () => {
  const theme = useAppTheme();
  const { colors } = theme;
  const navigation = useNavigation();
  const {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    isCartEmpty,
    subtotal,
    total,
  } = useCart();

  // Estados para la navegación y selección
  const [navigationLevel, setNavigationLevel] = useState<
    "categories" | "subcategories" | "products"
  >("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    string | null
  >(null);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null); // Estado que controla el modal de producto
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { data: menu, isLoading, error } = useGetFullMenu();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(null); // Reiniciar selección de subcategoría
    setNavigationLevel("subcategories");
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
    setNavigationLevel("products");
  };

  // Función auxiliar para verificar si un producto necesita personalización
  const productNeedsCustomization = (product: any): boolean => {
    if (!product) return false;

    // Verificar si tiene variantes
    const hasVariants =
      product.hasVariants &&
      product.variants &&
      Array.isArray(product.variants) &&
      product.variants.length > 0;

    // Verificar si tiene modificadores
    const hasModifiers =
      product.modifierGroups &&
      Array.isArray(product.modifierGroups) &&
      product.modifierGroups.length > 0;

    return hasVariants || hasModifiers;
  };

  const handleProductSelect = (product: any) => {
    if (productNeedsCustomization(product)) {
      // Si necesita personalización, abrir el modal
      setSelectedProduct(product);
    } else {
      // Si no necesita personalización, añadir directamente al carrito
      addItem(product, 1);
      // Mostrar mensaje de confirmación
      setSnackbarMessage(`${product.name} añadido al carrito`);
      setSnackbarVisible(true);
    }
  };

  // Esta función CIERRA el modal de personalización de producto
  const handleCloseProductModal = React.useCallback(() => {
    setSelectedProduct(null);
  }, []); // useCallback para estabilidad en useEffect

  const handleGoBack = () => {
    if (navigationLevel === "products") {
      setNavigationLevel("subcategories");
      setSelectedSubCategoryId(null);
    } else if (navigationLevel === "subcategories") {
      setNavigationLevel("categories");
      setSelectedCategoryId(null);
    }
  };

  const handleViewCart = React.useCallback(() => {
    // Envuelto en useCallback
    setIsCartVisible(true);
  }, []);

  const handleCloseCart = () => {
    setIsCartVisible(false); // Ocultar el detalle del carrito
  };

  const handleConfirmOrder = (details: {
    orderType: OrderType;
    tableId?: string;
  }) => {
    console.log("Confirmar orden con detalles:", details);
    // TODO: Implementar lógica para enviar la orden al backend
    setIsCartVisible(false); // Cerrar carrito después de confirmar (o manejar navegación)
  };

  const getCategories = () => {
    if (!menu || !Array.isArray(menu)) return [];
    return menu;
  };

  const getSubCategories = () => {
    if (!selectedCategory || !Array.isArray(selectedCategory.subCategories))
      return [];
    return selectedCategory.subCategories;
  };

  const getProducts = () => {
    if (!selectedSubCategory || !Array.isArray(selectedSubCategory.products))
      return [];
    return selectedSubCategory.products;
  };

  const selectedCategory =
    menu && Array.isArray(menu)
      ? menu.find((cat: any) => cat.id === selectedCategoryId)
      : null;

  const selectedSubCategory =
    selectedCategory && Array.isArray(selectedCategory.subCategories)
      ? selectedCategory.subCategories.find(
          (sub: any) => sub.id === selectedSubCategoryId
        )
      : null;

  // Función para mostrar u ocultar el carrito
  const toggleCartVisibility = () => {
    setIsCartVisible(!isCartVisible);
  };

  // Obtener el título según el nivel de navegación (movido ANTES de useEffect)
  const getNavTitle = React.useCallback(() => {
    // Si el modal de producto está abierto, mantenemos el título anterior o uno específico
    if (selectedProduct) {
      // Podríamos querer mantener el título de productos/subcategorías o poner "Personalizar Producto"
      // Por ahora, mantenemos el título anterior para consistencia
      if (navigationLevel === "products") {
        return selectedSubCategory?.name
          ? `Subcategoría: ${selectedSubCategory.name}`
          : "Productos";
      }
      // Añadir más lógica si se abre desde subcategorías o categorías directamente (si fuera posible)
    }
    // Títulos normales si el modal no está abierto
    switch (navigationLevel) {
      case "categories":
        return "Categorías";
      case "subcategories":
        return selectedCategory?.name
          ? `Categoría: ${selectedCategory.name}`
          : "Subcategorías";
      case "products":
        return selectedSubCategory?.name
          ? `Subcategoría: ${selectedSubCategory.name}`
          : "Productos";
      default:
        return "Categorías";
    }
  }, [navigationLevel, selectedCategory, selectedSubCategory, selectedProduct]); // Añadir selectedProduct

  // --- Configuración dinámica del Header ---
  useEffect(() => {
    navigation.setOptions({
      headerTitle: getNavTitle(),
      // Configurar botón izquierdo: Manejar la navegación interna
      headerLeft: () => {
        if (selectedProduct) {
          // Botón para cerrar el modal de producto
          return (
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={handleCloseProductModal}
            />
          );
        } else if (navigationLevel !== "categories") {
          // Botón de retroceso interno para subcategorías y productos
          return (
            <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
          );
        }
        // En el nivel de categorías, mostrar el botón del drawer
        return undefined;
      },
      // Configurar botón derecho: Muestra el botón del carrito solo si el modal de producto Y el carrito NO están visibles.
      headerRight: () =>
        !isCartVisible && !selectedProduct ? (
          <CartButton itemCount={items.length} onPress={handleViewCart} />
        ) : null,
      // Deshabilitar el gesto de retroceso por defecto cuando estamos en subcategorías o productos
      gestureEnabled: navigationLevel === "categories",
    });
  }, [
    navigation,
    navigationLevel,
    selectedCategory,
    selectedSubCategory,
    items,
    isCartVisible,
    selectedProduct,
    handleViewCart,
    handleCloseProductModal,
    getNavTitle,
  ]);

  const renderContent = () => {
    if (isCartVisible) {
      return (
        <OrderCartDetail
          visible={isCartVisible}
          onClose={handleCloseCart}
          onConfirmOrder={handleConfirmOrder}
        />
      );
    }

    const blurhash =
      "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

    const renderItem = ({ item }: { item: any }) => {
      // Obtener URL de la imagen
      const imageUrl = item.photo ? getImageUrl(item.photo.path) : null;

      // Determinar la acción según el nivel de navegación
      const handlePress = () => {
        if (navigationLevel === "categories") {
          handleCategorySelect(item.id);
        } else if (navigationLevel === "subcategories") {
          handleSubCategorySelect(item.id);
        } else {
          handleProductSelect(item);
        }
      };

      // Determinar el precio (solo para productos)
      const renderPrice = () => {
        if (navigationLevel === "products" && !item.hasVariants && item.price) {
          return (
            <Text style={styles.priceText}>
              ${Number(item.price).toFixed(2)}
            </Text>
          );
        }
        return null;
      };

      return (
        <Card style={styles.cardItem} onPress={handlePress}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.itemImage}
              contentFit="cover"
              placeholder={blurhash}
              transition={300}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.cardContent}>
            <Title style={styles.cardTitle}>{item.name}</Title>
            {renderPrice()}
          </View>
        </Card>
      );
    };

    // Determinar qué items mostrar según el nivel de navegación
    const getItemsToDisplay = () => {
      switch (navigationLevel) {
        case "categories":
          return getCategories();
        case "subcategories":
          return getSubCategories();
        case "products":
          return getProducts();
        default:
          return [];
      }
    };

    const itemsToDisplay = getItemsToDisplay();

    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <View style={styles.container}>
          {/* Eliminamos el botón de navegación interno, ahora se maneja en el header */}
          {/* {navigationLevel !== 'categories' && (
            <View style={styles.internalNav}>
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={handleGoBack}
                style={styles.backButtonInternal}
              />
            </View>
          )} */}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2e7d32" />
              <Text>Cargando...</Text>
            </View>
          ) : itemsToDisplay.length > 0 ? (
            <FlatList
              data={itemsToDisplay}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.gridContainer}
              numColumns={2}
              columnWrapperStyle={styles.row}
              initialNumToRender={6}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          ) : (
            <Text style={styles.noItemsText}>
              {navigationLevel === "products"
                ? "No hay productos disponibles"
                : navigationLevel === "subcategories"
                  ? "No hay subcategorías disponibles"
                  : "No hay categorías disponibles"}
            </Text>
          )}
        </View>

        <Portal>
          {/* El modal ahora usa handleCloseProductModal que solo cambia el estado */}
          {selectedProduct && productNeedsCustomization(selectedProduct) && (
            <ProductCustomizationModal
              visible={true} // La visibilidad depende de si selectedProduct tiene valor
              product={selectedProduct}
              onAddToCart={addItem}
              onDismiss={handleCloseProductModal} // Esta función solo cierra el modal
            />
          )}
        </Portal>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          action={{
            label: "OK",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: colors.background,
        },
        container: {
          flex: 1,
        },
        content: {
          flex: 1,
          padding: 12,
        },
        gridContainer: {
          padding: 4,
        },
        row: {
          justifyContent: "flex-start",
        },
        cardItem: {
          width: "48%",
          marginHorizontal: "1%",
          marginVertical: 4,
          overflow: "hidden",
          borderRadius: 8,
          elevation: 2,
        },
        itemImage: {
          width: "100%",
          height: 120,
        },
        imagePlaceholder: {
          width: "100%",
          height: 120,
          backgroundColor: "#eeeeee",
          justifyContent: "center",
          alignItems: "center",
        },
        placeholderText: {
          fontSize: 24,
          fontWeight: "bold",
          color: "#999",
        },
        cardContent: {
          padding: 12,
        },
        cardTitle: {
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 4,
        },
        priceText: {
          color: "#2e7d32",
          fontWeight: "bold",
          marginTop: 4,
        },
        noItemsText: {
          textAlign: "center",
          marginTop: 40,
          fontSize: 16,
          color: "#666",
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        // internalNav ya no es necesario, se maneja en el header
        // internalNav: {
        //   flexDirection: 'row',
        //   alignItems: 'center',
        //   paddingHorizontal: theme.spacing.s,
        //   paddingVertical: theme.spacing.xs,
        // },
        // backButtonInternal: {
        //   margin: 0,
        // },
      }),
    [theme]
  ); // theme -> colors

  return renderContent();
};

const CreateOrderScreenWithCart = () => (
  <CartProvider>
    <CreateOrderScreen />
  </CartProvider>
);

export default CreateOrderScreenWithCart;
