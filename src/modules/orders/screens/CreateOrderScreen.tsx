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
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useGetFullMenu } from "../hooks/useMenuQueries";
import { useCart, CartProvider } from "../context/CartContext";
import {
  OrderType,
  Product,
  Category,
  SubCategory,
} from "../types/orders.types";
import { Image } from "expo-image";
import { getImageUrl } from "@/app/lib/imageUtils";

import OrderCartDetail from "../components/OrderCartDetail";
import ProductCustomizationModal from "../components/ProductCustomizationModal";
import CartButton from "../components/CartButton";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { data: menu, isLoading, error } = useGetFullMenu();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(null);
    setNavigationLevel("subcategories");
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
    setNavigationLevel("products");
  };

  const productNeedsCustomization = (product: Product): boolean => {
    if (!product) return false;
    const hasVariants =
      product.hasVariants &&
      product.variants &&
      Array.isArray(product.variants) &&
      product.variants.length > 0;
    const hasModifiers =
      product.modifierGroups &&
      Array.isArray(product.modifierGroups) &&
      product.modifierGroups.length > 0;
    return hasVariants || hasModifiers;
  };

  const handleProductSelect = (product: Product) => {
    if (productNeedsCustomization(product)) {
      setSelectedProduct(product);
    } else {
      addItem(product, 1);
      setSnackbarMessage(`${product.name} añadido al carrito`);
      setSnackbarVisible(true);
    }
  };

  const handleCloseProductModal = React.useCallback(() => {
    setSelectedProduct(null);
  }, []);

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
    setIsCartVisible(true);
  }, []);

  const handleCloseCart = () => {
    setIsCartVisible(false);
  };

  const handleConfirmOrder = (details: {
    orderType: OrderType;
    tableId?: string;
  }) => {
    console.log("Confirmar orden con detalles:", details);
    setIsCartVisible(false);
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
      ? menu.find((cat: Category) => cat.id === selectedCategoryId)
      : null;

  const selectedSubCategory =
    selectedCategory && Array.isArray(selectedCategory.subCategories)
      ? selectedCategory.subCategories.find(
          (sub: SubCategory) => sub.id === selectedSubCategoryId
        )
      : null;

  const toggleCartVisibility = () => {
    setIsCartVisible(!isCartVisible);
  };

  const getNavTitle = React.useCallback(() => {
    if (selectedProduct) {
      if (navigationLevel === "products") {
        return selectedSubCategory?.name
          ? `Subcategoría: ${selectedSubCategory.name}`
          : "Productos";
      }
    }
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
  }, [navigationLevel, selectedCategory, selectedSubCategory, selectedProduct]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: getNavTitle(),
      headerLeft: () => {
        if (selectedProduct) {
          return (
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={handleCloseProductModal}
            />
          );
        } else if (navigationLevel !== "categories") {
          return (
            <IconButton icon="arrow-left" size={24} onPress={handleGoBack} />
          );
        }
        return undefined;
      },
      headerRight: () =>
        !isCartVisible && !selectedProduct ? (
          <CartButton itemCount={items.length} onPress={handleViewCart} />
        ) : null,
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
      }),
    [theme]
  );

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

    const renderItem = ({
      item,
    }: {
      item: Category | SubCategory | Product;
    }) => {
      const imageUrl = item.photo ? getImageUrl(item.photo.path) : null;

      const handlePress = () => {
        if (navigationLevel === "categories") {
          handleCategorySelect(item.id);
        } else if (navigationLevel === "subcategories") {
          handleSubCategorySelect(item.id);
        } else if ("price" in item) {
          handleProductSelect(item as Product);
        }
      };

      const renderPrice = () => {
        if (
          navigationLevel === "products" &&
          "price" in item &&
          "hasVariants" in item
        ) {
          const productItem = item as Product;
          if (
            !productItem.hasVariants &&
            productItem.price !== null &&
            productItem.price !== undefined
          ) {
            return (
              <Text style={styles.priceText}>
                ${Number(productItem.price).toFixed(2)}
              </Text>
            );
          }
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
          {selectedProduct && productNeedsCustomization(selectedProduct) && (
            <ProductCustomizationModal
              visible={true}
              product={selectedProduct}
              onAddToCart={addItem}
              onDismiss={handleCloseProductModal}
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
  return renderContent();
};

const CreateOrderScreenWithCart = () => (
  <CartProvider>
    <CreateOrderScreen />
  </CartProvider>
);

export default CreateOrderScreenWithCart;
