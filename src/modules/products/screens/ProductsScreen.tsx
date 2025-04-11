import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { ActivityIndicator, Text, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useDrawerStatus } from '@react-navigation/drawer'; // Importar hook
import { debounce } from "lodash";
import { useQueryClient } from "@tanstack/react-query";

import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../hooks/useProductsQueries";
import { Product, ProductFormInputs } from "../types/products.types";
import { MenuStackParamList } from "@/modules/menu/navigation/types";
import { useAppTheme, AppTheme } from "@/app/styles/theme";
import { getApiErrorMessage } from "@/app/lib/errorMapping";
import GenericList, { FilterOption } from "@/app/components/crud/GenericList";
import ProductFormModal from "../components/ProductFormModal";
import { useSnackbarStore } from "@/app/store/snackbarStore";
import { FileObject } from "@/app/components/common/CustomImagePicker";

type ProductsScreenRouteProp = RouteProp<MenuStackParamList, "Products">;

function ProductsScreen(): JSX.Element {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme as AppTheme), [theme]);
  const navigation = useNavigation();
  const route = useRoute<ProductsScreenRouteProp>();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const drawerStatus = useDrawerStatus(); // Obtener estado del drawer
  const isDrawerOpen = drawerStatus === 'open'; // Determinar si está abierto

  const { subCategoryId, subCategoryName } = route.params;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const debouncedSetSearch = useCallback(
    debounce((query: string) => setDebouncedSearchQuery(query), 300),
    []
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSetSearch(query);
  };

  const handleFilterChange = (value: "all" | "active" | "inactive") => {
    setStatusFilter(value);
  };

  const queryFilters = useMemo(
    () => ({
      subCategoryId: subCategoryId,
      search: debouncedSearchQuery || undefined,
      limit: 20,
      page: 1,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    }),
    [subCategoryId, debouncedSearchQuery, statusFilter]
  );

  const {
    data: productsResponse,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useProductsQuery(queryFilters, {});

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  const products = useMemo(() => {
    return (productsResponse?.[0] ?? []).map((p) => ({
      ...p,
      _displayDescription: p.hasVariants
        ? `${p.variants?.length || 0} variante(s)`
        : !isNaN(parseFloat(String(p.price)))
          ? `$${parseFloat(String(p.price)).toFixed(2)}`
          : "Precio no definido",
    }));
  }, [productsResponse]);

  const totalProducts = productsResponse?.[1] ?? 0;

  const handleOpenCreateModal = useCallback(() => {
    setEditingProduct(null);
    setIsFormModalVisible(true);
  }, []);

  const handleOpenEditModal = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsFormModalVisible(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalVisible(false);
    setEditingProduct(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (
      formData: ProductFormInputs,
      photoId: string | null | undefined,
      _file?: FileObject | null
    ) => {
      const isEditing = !!editingProduct;

      // Preparar datos para la mutación, incluyendo modifierGroupIds
      // imageUri se maneja internamente en el modal y no se envía directamente
      const { imageUri, ...dataToSend } = formData;

      const mutationData = {
        ...dataToSend,
        modifierGroupIds: dataToSend.modifierGroupIds ?? [], // Asegurar que sea un array
        // Ensure photoId is included correctly
        ...(photoId !== undefined && { photoId: photoId }),
      };

      // Logs de depuración eliminados

      try {
        // Lógica simplificada: solo una llamada para crear/actualizar
        const handleMutationSuccess = (createdOrUpdatedProduct: Product) => {
          const message = isEditing
            ? "Producto actualizado con éxito"
            : "Producto creado con éxito";

          showSnackbar({ message, type: "success" });

          // Cerrar modal e invalidar queries relevantes
          handleCloseFormModal();
          queryClient.invalidateQueries({
            queryKey: ["products", queryFilters],
          }); // Invalidar lista
          // Invalidar detalles del producto específico para refrescar datos (incluyendo grupos)
          if (createdOrUpdatedProduct?.id) {
            queryClient.invalidateQueries({
              queryKey: ["product", createdOrUpdatedProduct.id],
            });
          }
        };

        const handleMutationError = (err: unknown) => {
          showSnackbar({
            message: `Error al ${isEditing ? "actualizar" : "crear"} producto: ${getApiErrorMessage(err)}`,
            type: "error",
          });
        };

        // Paso 1: Crear o Actualizar el producto
        if (isEditing && editingProduct) {
          await updateMutation.mutateAsync(
            { id: editingProduct.id, data: mutationData },
            {
              onSuccess: handleMutationSuccess,
              onError: handleMutationError,
            }
          );
        } else {
          await createMutation.mutateAsync(mutationData, {
            onSuccess: handleMutationSuccess,
            onError: handleMutationError,
          });
        }
      } catch (err) {
        // Catch genérico por si algo más falla fuera de las mutaciones
        console.error("Unexpected error during form submission:", err);
        showSnackbar({ message: "Ocurrió un error inesperado", type: "error" });
      }
    },
    [
      editingProduct,
      updateMutation,
      createMutation,
      showSnackbar,
      handleCloseFormModal,
      queryClient,
      queryFilters,
      // assignGroupsMutation,
    ]
  );

  // Deletion Handling
  const handleDeleteProduct = useCallback(
    (productId: string) => {
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              // TODO: Implement actual deletion logic using deleteMutation
              // await deleteMutation.mutateAsync(productId, { ... });
              showSnackbar({
                message: "Funcionalidad de eliminar pendiente",
                type: "info",
              });
            },
          },
        ]
      );
    },
    [showSnackbar]
  ); // Add deleteMutation here when implemented

  const listRenderConfig = {
    titleField: "name" as keyof Product,
    descriptionField: "_displayDescription" as keyof (Product & {
      _displayDescription: string;
    }),
    imageField: "photo" as keyof Product,
    statusConfig: {
      field: "isActive" as keyof Product,
      activeValue: true,
      activeLabel: "Activo",
      inactiveLabel: "Inactivo",
    },
  };

  const filterOptions: FilterOption<"all" | "active" | "inactive">[] = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Activos" },
    { value: "inactive", label: "Inactivos" },
  ];

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.centered}>
        {isLoading ? (
          <ActivityIndicator
            animating={true}
            color={theme.colors.primary}
            size="large"
          />
        ) : error ? (
          <Text style={styles.errorText}>{getApiErrorMessage(error)}</Text>
        ) : (
          <Text>
            {debouncedSearchQuery
              ? `No se encontraron productos para "${debouncedSearchQuery}"`
              : `No hay productos en "${subCategoryName}".`}
          </Text>
        )}
      </View>
    ),
    [
      isLoading,
      error,
      subCategoryName,
      styles,
      theme.colors.primary,
      debouncedSearchQuery,
    ]
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: subCategoryName ? `Productos de ${subCategoryName}` : "Productos",
    });
  }, [navigation, subCategoryName]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <GenericList<Product & { _displayDescription: string }>
        items={products}
        renderConfig={listRenderConfig}
        onItemPress={handleOpenEditModal}
        onRefresh={refetch}
        isRefreshing={isFetching && !isLoading}
        ListEmptyComponent={ListEmptyComponent}
        isLoading={isLoading && !isFetching}
        filterValue={statusFilter}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        enableSearch={true}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar productos..."
        showFab={true}
        onFabPress={handleOpenCreateModal}
        isModalOpen={isFormModalVisible}
        enableSort={false}
        contentContainerStyle={styles.contentContainer}
        showImagePlaceholder={true}
        isDrawerOpen={isDrawerOpen} // Pasar estado del drawer
      />

      <Portal>
        <ProductFormModal
          visible={isFormModalVisible}
          onDismiss={handleCloseFormModal}
          onSubmit={handleFormSubmit}
          initialData={editingProduct}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          productId={editingProduct?.id}
          subCategoryId={subCategoryId}
        />
      </Portal>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.l,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: "center",
    },
    contentContainer: {
      paddingBottom: 80,
    },
  });

export default ProductsScreen;
