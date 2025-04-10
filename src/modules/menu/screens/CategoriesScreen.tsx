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
// Quitar Image de expo-image si no se usa directamente
// import { Image } from "expo-image";
import { useAppTheme } from "../../../app/styles/theme";
import { useSnackbarStore } from "../../../app/store/snackbarStore";
import { getApiErrorMessage } from "../../../app/lib/errorMapping";
import { getImageUrl } from "../../../app/lib/imageUtils";
import GenericFilters, {
  FilterOption,
} from "../../../app/components/crud/GenericFilters";
import GenericList from "../../../app/components/crud/GenericList";
import GenericDetailModal from "../../../app/components/crud/GenericDetailModal";
import GenericFormModal, {
  FormFieldConfig,
  ImagePickerConfig,
} from "../../../app/components/crud/GenericFormModal"; // Cambiado a import default
import { ImageUploadService } from "../../../app/lib/imageUploadService"; // Para config por defecto
import categoryService from "../services/categoryService";
import fileService from "../services/fileService";
import {
  Category,
  CategoryFormData,
  CreateCategoryDto,
  UpdateCategoryDto,
  categoryFormSchema, // Importar schema
  ActiveFilter, // Mover import de ActiveFilter aquí
} from "../types/category.types";

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

  // Mapear categorías para incluir la URL completa en 'photoUrl' para GenericList/GenericDetailModal
  const categories = useMemo(() => {
    return (categoriesResponse?.data ?? []).map((cat) => ({
      ...cat,
      // Añadir un campo con la URL completa para los componentes genéricos
      photoUrl: getImageUrl(cat.photo?.path),
    }));
  }, [categoriesResponse?.data]);

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

  // Ajustar para recibir el item mapeado si es necesario, o mapear aquí
  const openDetailModal = (
    category: Category & { photoUrl?: string | null }
  ) => {
    // El item ya viene mapeado desde GenericList
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
        console.error(
          "handleImageUpload: Respuesta de subida inválida",
          uploadResponse
        );
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

  // --- Configuraciones para Componentes Genéricos ---

  const filterOptions: FilterOption<ActiveFilter>[] = [
    { value: "all", label: "Todas" },
    { value: "active", label: "Activas" },
    { value: "inactive", label: "Inactivas" },
  ];

  const listRenderConfig = {
    titleField: "name" as keyof Category,
    descriptionField: "description" as keyof Category,
    descriptionMaxLength: 50,
    imageField: "photoUrl" as keyof (Category & { photoUrl?: string | null }), // Usar el campo mapeado
    statusConfig: {
      field: "isActive" as keyof Category,
      activeValue: true,
      activeLabel: "Activa",
      inactiveLabel: "Inactiva",
    },
  };

  const formFieldsConfig: FormFieldConfig<CategoryFormData>[] = [
    { name: "name", label: "Nombre", type: "text", required: true },
    {
      name: "description",
      label: "Descripción (Opcional)",
      type: "textarea",
      numberOfLines: 3,
    },
    {
      name: "isActive",
      label: "Activa",
      type: "switch",
      switchLabel: "Activa",
      defaultValue: true,
    },
    // imageUri se maneja con imagePickerConfig
  ];

  const imagePickerConfig: ImagePickerConfig<CategoryFormData, Category> = {
    imageUriField: "imageUri",
    onImageUpload: handleImageUpload, // Usar la función existente
    // determineFinalPhotoId: ImageUploadService.determinePhotoId, // Usar el por defecto
    imagePickerSize: 150,
  };

  // Mapear selectedCategory para GenericDetailModal
  const selectedCategoryMapped = useMemo(() => {
    if (!selectedCategory) return null;
    return {
      ...selectedCategory,
      photoUrl: getImageUrl(selectedCategory.photo?.path),
    };
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Usar GenericFilters */}
      <GenericFilters
        filterValue={activeFilter}
        onFilterChange={setActiveFilter}
        filterOptions={filterOptions}
      />

      {/* Usar GenericList */}
      <GenericList
        items={categories} // Ya están mapeadas con photoUrl
        renderConfig={listRenderConfig}
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
        {/* Usar GenericFormModal */}
        <GenericFormModal
          visible={modalVisible}
          onDismiss={closeModals}
          onSubmit={handleFormSubmit}
          formSchema={categoryFormSchema}
          formFields={formFieldsConfig}
          imagePickerConfig={imagePickerConfig}
          initialValues={formInitialValues}
          editingItem={editingCategory}
          isSubmitting={
            createCategoryMutation.isPending || updateCategoryMutation.isPending
          }
          // Añadir tipo explícito a isEditing
          modalTitle={(isEditing: boolean) =>
            isEditing ? "Editar Categoría" : "Nueva Categoría"
          }
          submitButtonLabel={(isEditing: boolean) =>
            isEditing ? "Guardar Cambios" : "Crear Categoría"
          }
        />

        {/* Usar GenericDetailModal */}
        <GenericDetailModal
          visible={detailModalVisible}
          onDismiss={closeModals}
          item={selectedCategoryMapped} // Usar el item mapeado
          titleField="name"
          imageField="photoUrl" // Usar el campo mapeado
          descriptionField="description"
          statusConfig={listRenderConfig.statusConfig} // Reutilizar config
          // fieldsToDisplay={[{ field: 'id', label: 'ID' }]} // Ejemplo campos adicionales
          onEdit={openEditModal as (item: any) => void} // Cast si es necesario por el mapeo
          onDelete={handleDelete}
          isDeleting={deleteCategoryMutation.isPending}
        />
      </Portal>
    </SafeAreaView>
  );
};

export default CategoriesScreen;
