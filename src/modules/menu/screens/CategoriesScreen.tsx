import React, { useState, useMemo } from "react";
import { View, Alert, SafeAreaView, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Button,
  FAB,
  Portal,
  Text,
} from "react-native-paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";

import { useAppTheme } from "../../../app/styles/theme";
import { useSnackbarStore } from "../../../app/store/snackbarStore";
import { getApiErrorMessage } from "../../../app/lib/errorMapping";
import { getImageUrl } from "../../../app/lib/imageUtils"; // Importar getImageUrl
import categoryService from "../services/categoryService";
import fileService from "../services/fileService";
import {
  Category,
  CategoryFormData,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category.types";

import CategoryFilters from "../components/CategoryFilters";
import CategoryList from "../components/CategoryList";
import { ActiveFilter } from "../types/category.types";
import CategoryFormModal from "../components/CategoryFormModal";
import CategoryDetailModal from "../components/CategoryDetailModal";

const CategoriesScreen: React.FC = () => {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: errorCategories,
    refetch: refetchCategories,
    isFetching: isFetchingCategories,
  } = useQuery({
    queryKey: ["categories", { filter: activeFilter }],
    queryFn: () =>
      categoryService.getCategories({
        isActive:
          activeFilter === "all" ? undefined : activeFilter === "active",
      }),
  });

  const categories = categoriesResponse?.data ?? [];

  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModals();
      showSnackbar({ message: "Operación exitosa", type: "success" });
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error);
      showSnackbar({ message, type: "error" });
    },
  };

  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryDto) =>
      categoryService.createCategory(data),
    ...commonMutationOptions,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryService.updateCategory(id, data),
    ...commonMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModals();
      showSnackbar({ message: "Categoría actualizada", type: "success" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    ...commonMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModals();
      showSnackbar({ message: "Categoría eliminada", type: "success" });
    },
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setDetailModalVisible(false);
    setModalVisible(true);
  };

  const openDetailModal = (category: Category) => {
    setSelectedCategory(category);
    setDetailModalVisible(true);
  };

  const closeModals = () => {
    setModalVisible(false);
    setDetailModalVisible(false);
    setEditingCategory(null);
    setSelectedCategory(null);
  };

  // Importar FileObject si está definido en otro lugar, o definirlo aquí/inline
  interface FileObject {
    uri: string;
    name: string;
    type: string;
  }

  const handleImageUpload = async (
    file: FileObject // Aceptar el objeto FileObject completo
  ): Promise<{ id: string } | null> => {
    if (!file || !file.uri) {
        console.error("handleImageUpload: No se proporcionó archivo válido.");
        return null;
    }
    try {
      // Usar uploadFile (o uploadImage si se mantuvo el alias) y pasar el objeto file
      const uploadResponse = await fileService.uploadFile(file);
      // Extraer el id del objeto anidado 'file'
      if (uploadResponse && uploadResponse.file && uploadResponse.file.id) {
        return { id: uploadResponse.file.id };
      } else {
        console.error("handleImageUpload: Respuesta de subida inválida", uploadResponse);
        return null;
      }
    } catch (error) {
      // El fileService ya debería loguear el error
      console.error("handleImageUpload: Error durante la subida:", error);
      return null;
    }
  };

  const handleFormSubmit = async (
    formData: CategoryFormData,
    photoId: string | null | undefined
  ) => {
    const categoryData = {
      name: formData.name,
      description: formData.description || null,
      isActive: formData.isActive,
      ...(photoId !== undefined && { photoId }),
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: categoryData as UpdateCategoryDto,
      });
    } else {
      createCategoryMutation.mutate(categoryData as CreateCategoryDto);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que quieres eliminar esta categoría?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteCategoryMutation.mutate(id),
        },
      ]
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        fab: {
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary,
        },
        modalSurface: {
          padding: theme.spacing.l,
          margin: theme.spacing.l,
          borderRadius: theme.roundness * 2,
          elevation: 4,
          backgroundColor: theme.colors.elevation.level2,
        },
        modalTitle: {
          marginBottom: theme.spacing.m,
          textAlign: "center",
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        },
        emptyListContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: theme.spacing.l,
        },
        emptyListText: {
          marginBottom: theme.spacing.m,
          color: theme.colors.onSurfaceVariant,
        },
      }),
    [theme]
  );

  const formInitialValues = useMemo(() => {
    if (editingCategory) {
      return {
        name: editingCategory.name,
        description: editingCategory.description ?? null,
        isActive: editingCategory.isActive,
        // Convertir el path a URL completa usando getImageUrl
        imageUri: getImageUrl(editingCategory.photo?.path) ?? null,
      };
    }
    return {
      name: "",
      description: null,
      isActive: true,
      imageUri: null,
    };
  }, [editingCategory]);

  if (isLoadingCategories && !isFetchingCategories) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
      </View>
    );
  }

  if (isErrorCategories) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: theme.colors.error }}>
          Error al cargar categorías:
        </Text>
        <Text style={{ color: theme.colors.error }}>
          {getApiErrorMessage(errorCategories)}
        </Text>
        <Button
          onPress={() => refetchCategories()}
          mode="contained"
          style={{ marginTop: theme.spacing.m }}
        >
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CategoryFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <CategoryList
        categories={categories}
        onItemPress={openDetailModal}
        onRefresh={refetchCategories}
        isRefreshing={isFetchingCategories && !isLoadingCategories}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              No hay categorías para mostrar.
            </Text>
            <Button mode="contained" onPress={openAddModal}>
              Añadir Primera Categoría
            </Button>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={openAddModal}
        visible={!modalVisible && !detailModalVisible}
      />

      <Portal>
        <CategoryFormModal
          visible={modalVisible}
          onDismiss={closeModals}
          onSubmit={handleFormSubmit}
          initialValues={formInitialValues}
          isSubmitting={
            createCategoryMutation.isPending || updateCategoryMutation.isPending
          }
          editingCategory={editingCategory}
          onImageUpload={handleImageUpload}
        />

        <CategoryDetailModal
          visible={detailModalVisible}
          onDismiss={closeModals}
          category={selectedCategory}
          onEdit={openEditModal}
          onDelete={handleDelete}
          isDeleting={deleteCategoryMutation.isPending}
        />
      </Portal>
    </SafeAreaView>
  );
};

export default CategoriesScreen;
