import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Portal, Text, IconButton } from 'react-native-paper';
import { useFocusEffect, useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme, AppTheme } from '../../../app/styles/theme';
import GenericList from '../../../app/components/crud/GenericList';
import GenericDetailModal from '../../../app/components/crud/GenericDetailModal';
import GenericFormModal, { FormFieldConfig, ImagePickerConfig } from '../../../app/components/crud/GenericFormModal';
import { FilterOption } from '../../../app/components/crud/GenericList';

import { ImageUploadService, FileObject } from '../../../app/lib/imageUploadService';
import {
  useFindAllSubcategories,
  useCreateSubcategory,
  useUpdateSubcategory,
  useRemoveSubcategory,
} from '../hooks/useSubcategoriesQueries';
import {
  SubCategory,
  FindAllSubCategoriesDto,
  createSubCategoryDtoSchema,
  updateSubCategoryDtoSchemaWithOptionalPhoto,
  SubCategoryFormInputs,
  UpdateSubCategoryFormInputs,
} from '../types/subcategories.types';
import { PaginatedResponse } from '../../../app/types/api.types';
import { getImageUrl } from '../../../app/lib/imageUtils';
import { MenuStackParamList } from '@/modules/menu/navigation/types';

// Tipos de Navegación y Ruta usando MenuStackParamList
type SubcategoriesScreenRouteProp = RouteProp<MenuStackParamList, 'SubCategoriesScreen'>;
type SubcategoriesScreenNavigationProp = NativeStackNavigationProp<MenuStackParamList, 'SubCategoriesScreen'>;

type StatusFilter = 'all' | 'active' | 'inactive';

const SubcategoriesScreen: React.FC = () => {
  const theme = useAppTheme();
  const route = useRoute<SubcategoriesScreenRouteProp>();
  const navigation = useNavigation<SubcategoriesScreenNavigationProp>();
  const { categoryId, categoryName } = route.params;
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Estado para filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Estado para modales y selección
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const queryParams = useMemo((): FindAllSubCategoriesDto => {
    let isActive: boolean | undefined;
    if (statusFilter === 'active') isActive = true;
    if (statusFilter === 'inactive') isActive = false;

    const params: FindAllSubCategoriesDto = { categoryId };
    if (isActive !== undefined) {
        params.isActive = isActive;
    }
    return params;
  }, [statusFilter, categoryId]);

  const {
    data: subcategoriesData,
    isLoading: isLoadingList,
    isFetching: isFetchingList,
    refetch: refetchList,
    error: listError,
  } = useFindAllSubcategories(queryParams);

  const createMutation = useCreateSubcategory();
  const updateMutation = useUpdateSubcategory();
  const removeMutation = useRemoveSubcategory();

  const handleRefresh = useCallback(() => {
    refetchList();
  }, [refetchList]);

  useFocusEffect(
    useCallback(() => {
      refetchList();
    }, [refetchList])
  );

  const handleItemPress = (item: SubCategory) => {
    setSelectedSubcategory(item);
    setDetailModalVisible(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedSubcategory(null);
    setIsEditing(false);
    setFormModalVisible(true);
  };

  const handleOpenEditModal = (item: SubCategory) => {
    setSelectedSubcategory(item);
    setIsEditing(true);
    setDetailModalVisible(false);
    setFormModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedSubcategory(null);
  };

  const handleCloseFormModal = () => {
    setFormModalVisible(false);
    setSelectedSubcategory(null);
    setIsEditing(false);
  };

  const handleFormSubmit = async (
    formData: SubCategoryFormInputs | UpdateSubCategoryFormInputs,
    photoId: string | null | undefined
  ) => {
    const { imageUri, ...dataToSubmit } = formData;
    const finalData = {
      ...dataToSubmit,
      ...(photoId !== undefined && { photoId }),
    };

    if (finalData.photoId === undefined && !isEditing) {
        delete (finalData as any).photoId;
    }

    try {
      if (isEditing && selectedSubcategory) {
        await updateMutation.mutateAsync({
          id: selectedSubcategory.id,
          data: finalData as UpdateSubCategoryFormInputs,
        });
      } else {
        await createMutation.mutateAsync(finalData as SubCategoryFormInputs);
      }
      handleCloseFormModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id);
      handleCloseDetailModal();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };

  const listRenderConfig = {
    titleField: 'name' as keyof SubCategory,
    descriptionField: 'description' as keyof SubCategory,
    imageField: 'photo' as keyof SubCategory,
    statusConfig: {
      field: 'isActive' as keyof SubCategory,
      activeValue: true,
      activeLabel: 'Activa',
      inactiveLabel: 'Inactiva',
    },
  };

  const detailFieldsToDisplay: Array<{ field: keyof SubCategory; label: string }> = [];

  const filterOptions: FilterOption<StatusFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' },
  ];

  const formFields: FormFieldConfig<SubCategoryFormInputs | UpdateSubCategoryFormInputs>[] = [
    { name: 'name', label: 'Nombre *', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea', numberOfLines: 3 },
    { name: 'isActive', label: 'Activo', type: 'switch', switchLabel: 'Activo', defaultValue: true },
  ];

  const imagePickerConfig: ImagePickerConfig<SubCategoryFormInputs | UpdateSubCategoryFormInputs, SubCategory> = {
    imageUriField: 'imageUri',
    onImageUpload: async (file: FileObject) => {
      const result = await ImageUploadService.uploadImage(file);
      if (result.success && result.photoId) {
        return { id: result.photoId };
      }
      throw new Error(result.error || 'Error desconocido al subir imagen');
    },
    determineFinalPhotoId: ImageUploadService.determinePhotoId,
    imagePickerSize: 150,
  };

  const renderSubcategoryActions = (item: SubCategory) => (
    <IconButton
      icon="chevron-right"
      size={24}
      onPress={() => navigation.navigate('Products', { subCategoryId: item.id, subCategoryName: item.name })}
    />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {isLoadingList ? (
        <ActivityIndicator animating={true} size="large" />
      ) : listError ? (
        <Text style={styles.errorText}>Error al cargar: {listError.message}</Text>
      ) : (
        <Text>No hay subcategorías para mostrar.</Text>
      )}
    </View>
  );

  const screenTitle = categoryName ? `Subcategorías de ${categoryName}` : 'Subcategorías';

  return (
    <View style={styles.container}>
      {/* GenericList ahora maneja filtros y FAB */}
      <GenericList<SubCategory>
        items={subcategoriesData?.data ?? []}
        enableSort={true}
        enableSearch={true}
        searchPlaceholder="Buscar subcategorías..."
        // Props de filtro
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={filterOptions}
        renderConfig={listRenderConfig}
        onItemPress={handleItemPress}
        onRefresh={handleRefresh}
        isRefreshing={isFetchingList && !isLoadingList}
        ListEmptyComponent={renderEmptyList}
        isLoading={isLoadingList}
        contentContainerStyle={styles.listContentContainer}
        listStyle={styles.listStyle}
        renderItemActions={renderSubcategoryActions}
        // Props para FAB integrado
        showFab={true}
        onFabPress={handleOpenCreateModal}
        isModalOpen={detailModalVisible || formModalVisible}
        showImagePlaceholder={true} 
    />

      {/* Portal para Modales */}
      <Portal>
        {/* Modal de Detalles */}
        <GenericDetailModal<SubCategory>
          visible={detailModalVisible}
          onDismiss={handleCloseDetailModal}
          item={selectedSubcategory}
          titleField="name"
          imageField="photo"
          descriptionField="description"
          statusConfig={listRenderConfig.statusConfig}
          fieldsToDisplay={detailFieldsToDisplay}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          isDeleting={removeMutation.isPending}
        />

        {/* Modal de Formulario */}
        <GenericFormModal<SubCategoryFormInputs | UpdateSubCategoryFormInputs, SubCategory>
          visible={formModalVisible}
          onDismiss={handleCloseFormModal}
          onSubmit={handleFormSubmit}
          formSchema={isEditing ? updateSubCategoryDtoSchemaWithOptionalPhoto : createSubCategoryDtoSchema}
          formFields={formFields}
          imagePickerConfig={imagePickerConfig}
          initialValues={
            isEditing && selectedSubcategory
              ? {
                  name: selectedSubcategory.name,
                  description: selectedSubcategory.description ?? '',
                  isActive: selectedSubcategory.isActive,
                  categoryId: selectedSubcategory.categoryId,
                  imageUri: selectedSubcategory.photo?.path ? getImageUrl(selectedSubcategory.photo.path) : null,
                }
              : {
                  name: '',
                  description: '',
                  isActive: true,
                  categoryId: categoryId,
                  imageUri: null,
                }
          }
          editingItem={selectedSubcategory}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          modalTitle={(editing) => editing ? 'Editar Subcategoría' : 'Crear Subcategoría'}
        />
      </Portal>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // fab style eliminado
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
      padding: theme.spacing.l,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
      margin: 20,
    },
    listStyle: {
        flex: 1,
    },
    listContentContainer: {
        paddingBottom: 80,
        paddingHorizontal: theme.spacing.m,
   },
 });

export default SubcategoriesScreen;