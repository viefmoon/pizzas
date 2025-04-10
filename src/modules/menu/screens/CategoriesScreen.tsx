// src/modules/menu/screens/CategoriesScreen.tsx
import React, { useState, useMemo, useCallback } from "react"; // Añadir useCallback
import { View, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  FAB,
  Portal,
  Text,
} from "react-native-paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppTheme } from "../../../app/styles/theme";
import { useSnackbarStore } from "../../../app/store/snackbarStore";
import { getApiErrorMessage } from "../../../app/lib/errorMapping";
import { getImageUrl } from "../../../app/lib/imageUtils"; // Importar getImageUrl
import GenericFilters, {
  FilterOption,
} from "../../../app/components/crud/GenericFilters";
import GenericList from "../../../app/components/crud/GenericList";
import GenericDetailModal from "../../../app/components/crud/GenericDetailModal";
import GenericFormModal, { // Importar como default
  FormFieldConfig,
  ImagePickerConfig,
} from "../../../app/components/crud/GenericFormModal";
import { ImageUploadService, EntityWithOptionalPhoto, FileObject } from "../../../app/lib/imageUploadService"; // Importar servicio y tipo
import categoryService from "../services/categoryService";
import {
  Category,
  CategoryFormData,
  CreateCategoryDto,
  UpdateCategoryDto,
  categoryFormSchema,
  ActiveFilter,
} from "../types/category.types";


const CategoriesScreen: React.FC = () => {
  // --- Hooks Principales ---
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  // --- Estados Locales ---
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [localSelectedFile, setLocalSelectedFile] = useState<FileObject | null>(null);

  // --- React Query: Fetching ---
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
    // Considerar staleTime para evitar refetching inmediato
    // staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // --- React Query: Mutaciones ---
  const commonMutationOptions = {
    onSuccess: (/* data, variables, context */) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModals();
      // El mensaje específico se pone en cada mutación
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error);
      showSnackbar({ message, type: "error" });
      setIsUploadingImage(false); // Asegurarse de resetear el estado de subida en error
    },
  };

  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryService.createCategory(data),
    ...commonMutationOptions,
    onSuccess: () => {
        commonMutationOptions.onSuccess(); // Llamar al onSuccess común
        showSnackbar({ message: "Categoría creada exitosamente", type: "success" });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryService.updateCategory(id, data),
    ...commonMutationOptions,
     onSuccess: () => {
        commonMutationOptions.onSuccess(); // Llamar al onSuccess común
        showSnackbar({ message: "Categoría actualizada exitosamente", type: "success" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    ...commonMutationOptions,
     onSuccess: () => {
        commonMutationOptions.onSuccess(); // Llamar al onSuccess común
        showSnackbar({ message: "Categoría eliminada", type: "success" });
    }
  });
// --- Callbacks y Handlers ---
const openAddModal = useCallback(() => {
  setEditingCategory(null);
  setModalVisible(true);
}, []);

const openEditModal = useCallback((category: Category) => {
  setEditingCategory(category);
  setDetailModalVisible(false); // Cerrar detalle si estaba abierto
  setModalVisible(true);
}, []);

const openDetailModal = useCallback((category: Category & { photoUrl?: string | null }) => {
  setSelectedCategory(category);
  setDetailModalVisible(true);
}, []);

const closeModals = useCallback(() => {
  setModalVisible(false);
  setDetailModalVisible(false);
  setEditingCategory(null);
  setSelectedCategory(null);
  setIsUploadingImage(false); // Resetear estado de subida al cerrar
  setLocalSelectedFile(null); // Limpiar archivo local al cerrar
}, []);

  // --- Lógica de Subida de Imagen y Submit del Formulario ---

  // Esta función se pasará al GenericFormModal para que la llame CustomImagePicker
  // y actualice el estado local con el FileObject seleccionado.
  const handleFileSelectedForUpload = useCallback((file: FileObject | null) => {
      setLocalSelectedFile(file);
  }, []);

  // Esta es la función onSubmit que se pasa a GenericFormModal.
  // GenericFormModal ahora maneja la subida interna y nos pasa el photoId final.
  const handleFormSubmit = async (
    formData: CategoryFormData,
    photoIdResult: string | null | undefined // Recibido desde GenericFormModal
  ) => {

    // 1. Preparar DTO para crear/actualizar categoría
    const categoryDto = {
        name: formData.name,
        description: formData.description || null,
        isActive: formData.isActive,
        // Incluir photoId SOLO si es un string (nuevo ID) o null (eliminar)
        // Si es undefined (sin cambios o nueva imagen ya subida), no se incluye.
        ...(photoIdResult !== undefined && { photoId: photoIdResult }),
    };

    // 2. Llamar a la mutación correspondiente
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryDto as UpdateCategoryDto });
    } else {
      createCategoryMutation.mutate(categoryDto as CreateCategoryDto);
    }

     // Resetear estado del archivo local seleccionado después del submit
     // closeModals() ya lo hace, pero por seguridad lo ponemos aquí también.
     setLocalSelectedFile(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.",
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

  // --- Valores Memoizados ---
  const categories = useMemo(() => {
    return (categoriesResponse?.data ?? []).map((cat) => ({
      ...cat,
      photoUrl: getImageUrl(cat.photo?.path), // Usar getImageUrl
    }));
  }, [categoriesResponse?.data]);

  const styles = useMemo(() => StyleSheet.create({
      container: { flex: 1, backgroundColor: theme.colors.background },
      filtersContainer: {
          backgroundColor: theme.colors.surface,
          paddingBottom: theme.spacing.xs,
      },
      fab: {
          position: "absolute", margin: 16, right: 0, bottom: 0,
          backgroundColor: theme.colors.primary,
      },
      loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
      emptyListContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.l },
      emptyListText: { marginBottom: theme.spacing.m, color: theme.colors.onSurfaceVariant },
  }), [theme]);
  // Preparar initialValues para el formulario
  const formInitialValues = useMemo((): CategoryFormData => {
    if (editingCategory) {
      return {
        name: editingCategory.name,
        description: editingCategory.description ?? null,
        isActive: editingCategory.isActive,
        imageUri: getImageUrl(editingCategory.photo?.path) ?? null, // Usa getImageUrl
      };
    }
    // Valores por defecto para creación
    return {
      name: "",
      description: null,
      isActive: true, // Default a activo
      imageUri: null,
    };
  }, [editingCategory]);

  const selectedCategoryMapped = useMemo(() => {
    if (!selectedCategory) return null;
    return {
      ...selectedCategory,
      photoUrl: getImageUrl(selectedCategory.photo?.path), // Asegurar que use getImageUrl
    };
  }, [selectedCategory]);

  // --- Configuraciones Constantes (o casi) ---
  // --- Configuraciones para Componentes Genéricos ---

  const filterOptions: FilterOption<ActiveFilter>[] = [
    { value: "all", label: "Todas" },
    { value: "active", label: "Activas" },
    { value: "inactive", label: "Inactivas" },
  ];

  const listRenderConfig = {
    titleField: "name" as keyof Category,
    descriptionField: "description" as keyof Category,
    descriptionMaxLength: 60,
    imageField: "photoUrl" as keyof (Category & { photoUrl?: string | null }),
    statusConfig: {
      field: "isActive" as keyof Category,
      activeValue: true,
      activeLabel: "Activa",
      inactiveLabel: "Inactiva",
    },
  };

  const formFieldsConfig: FormFieldConfig<CategoryFormData>[] = [
    { name: "name", label: "Nombre", type: "text", required: true },
    { name: "description", label: "Descripción", type: "textarea", numberOfLines: 3 },
    { name: "isActive", label: "Estado", type: "switch", switchLabel:"Activa" },
    // imageUri se maneja con imagePickerConfig
  ];

  // Configuración del ImagePicker para GenericFormModal
  const imagePickerConfig: ImagePickerConfig<CategoryFormData, Category> = {
    imageUriField: "imageUri", // Nombre del campo en CategoryFormData
    // La función que se llamará cuando CustomImagePicker seleccione una imagen.
    // Esta función AHORA se ejecuta DENTRO de GenericFormModal.
    onImageUpload: async (file: FileObject) => {
        // Reutilizar ImageUploadService para la subida real
        setIsUploadingImage(true); // Indicar inicio de subida VISUAL en CategoriesScreen
        try {
            const result = await ImageUploadService.uploadImage(file);
            if (result.success && result.photoId) {
                return { id: result.photoId }; // Devolver el ID según espera GenericFormModal
            }
            // Lanzar error si falla, GenericFormModal lo manejará
            throw new Error(result.error || "Error desconocido al subir imagen");
        } finally {
            setIsUploadingImage(false); // Indicar fin de subida VISUAL
        }
    },
    // Usar la lógica por defecto de ImageUploadService para decidir el photoId final
    determineFinalPhotoId: ImageUploadService.determinePhotoId,
    imagePickerSize: 150,
  };

  // Variable para el estado general de carga (se define después de las mutaciones)
  const isProcessing = isUploadingImage || createCategoryMutation.isPending || updateCategoryMutation.isPending || deleteCategoryMutation.isPending || (isLoadingCategories && !categoriesResponse);

  // --- Lógica de Renderizado Condicional (Early Returns) ---
  if (isLoadingCategories && !categoriesResponse) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isErrorCategories && !categoriesResponse) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: theme.colors.error }}>Error al cargar categorías:</Text>
        <Text style={{ color: theme.colors.error }}>{getApiErrorMessage(errorCategories)}</Text>
        <Button onPress={() => refetchCategories()} mode="contained" style={{ marginTop: theme.spacing.m }}>
          Reintentar
        </Button>
      </View>
    );
  }

  // --- Renderizado Principal ---
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <GenericFilters
          filterValue={activeFilter}
          onFilterChange={setActiveFilter}
          filterOptions={filterOptions}
        />
      </View>

      {/* Lista */}
      <GenericList
        items={categories}
        renderConfig={listRenderConfig}
        onItemPress={openDetailModal}
        onRefresh={refetchCategories}
        isRefreshing={isFetchingCategories && !isLoadingCategories} // Mostrar refresh solo si no es la carga inicial
        ListEmptyComponent={
            <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>No hay categorías {activeFilter !== 'all' ? activeFilter + 's' : ''} para mostrar.</Text>
                <Button mode="contained" onPress={openAddModal}>Añadir Categoría</Button>
            </View>
        }
        // isLoading={isLoadingCategories && !categoriesResponse} // Indicador opcional para carga inicial
      />

      {/* Botón Flotante */}
      <FAB
        icon="plus"
        style={styles.fab}
        color={theme.colors.onPrimary} // Color del icono
        onPress={openAddModal}
        visible={!modalVisible && !detailModalVisible} // Ocultar si hay modales abiertos
        loading={isProcessing} // Mostrar indicador si algo está procesando
      />

      {/* Portal para Modales */}
      <Portal>
        {/* Modal de Formulario */}
        <GenericFormModal
          visible={modalVisible}
          onDismiss={closeModals}
          onSubmit={handleFormSubmit} // Pasar el nuevo onSubmit simplificado
          formSchema={categoryFormSchema}
          formFields={formFieldsConfig}
          imagePickerConfig={imagePickerConfig} // Pasar la configuración
          initialValues={formInitialValues}
          editingItem={editingCategory}
          isSubmitting={createCategoryMutation.isPending || updateCategoryMutation.isPending} // Solo mutaciones de guardar
          modalTitle={(isEditing) => isEditing ? "Editar Categoría" : "Nueva Categoría"}
          submitButtonLabel={(isEditing) => isEditing ? "Guardar Cambios" : "Crear Categoría"}
           // Pasar la nueva prop para actualizar el estado del archivo local
          onFileSelected={handleFileSelectedForUpload}
        />

        {/* Modal de Detalle */}
        <GenericDetailModal
          visible={detailModalVisible}
          onDismiss={closeModals}
          item={selectedCategoryMapped}
          titleField="name"
          imageField="photoUrl" // Asegurar que usa el campo mapeado correcto
          descriptionField="description"
          statusConfig={listRenderConfig.statusConfig}
          // fieldsToDisplay={[{ field: 'id', label: 'ID' }]} // Ejemplo
          onEdit={openEditModal as (item: any) => void}
          onDelete={handleDelete}
          isDeleting={deleteCategoryMutation.isPending}
        />
      </Portal>
    </SafeAreaView>
  );
};

export default CategoriesScreen;
