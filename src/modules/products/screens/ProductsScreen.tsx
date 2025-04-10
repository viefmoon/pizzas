import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator, Text, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import { useQueryClient } from '@tanstack/react-query';

import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../hooks/useProductsQueries';
import { Product, ProductFormInputs } from '../types/products.types';
import { MenuStackParamList } from '@/modules/menu/navigation/types';
import { useAppTheme, AppTheme } from '@/app/styles/theme';
import { getApiErrorMessage } from '@/app/lib/errorMapping';
import GenericList, { FilterOption } from '@/app/components/crud/GenericList';
import ProductFormModal from '../components/ProductFormModal';
import { useSnackbarStore } from '@/app/store/snackbarStore';
import { FileObject } from '@/app/components/common/CustomImagePicker';

type ProductsScreenRouteProp = RouteProp<MenuStackParamList, 'Products'>;

function ProductsScreen(): JSX.Element {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme as AppTheme), [theme]);
  const navigation = useNavigation();
  const route = useRoute<ProductsScreenRouteProp>();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const { subCategoryId, subCategoryName } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
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

  const handleFilterChange = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value);
  };

  const queryFilters = useMemo(() => ({
    subCategoryId: subCategoryId,
    search: debouncedSearchQuery || undefined,
    limit: 20,
    page: 1,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  }), [subCategoryId, debouncedSearchQuery, statusFilter]);

  const { data: productsResponse, isLoading, error, refetch, isFetching } = useProductsQuery(queryFilters, {
  });

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  // const deleteMutation = useDeleteProductMutation();

  const products = useMemo(() => {
    return (productsResponse?.[0] ?? []).map(p => ({
      ...p,
      _displayDescription: p.hasVariants
        ? `${p.variants?.length || 0} variante(s)`
        : !isNaN(parseFloat(String(p.price)))
        ? `$${parseFloat(String(p.price)).toFixed(2)}`
        : 'Precio no definido',
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

  const handleFormSubmit = useCallback(async (
    formData: ProductFormInputs,
    photoId: string | null | undefined,
    _file?: FileObject | null
  ) => {
    const isEditing = !!editingProduct;
    const mutationData = {
      ...formData,
      // Ensure photoId is included correctly
      ...(photoId !== undefined && { photoId: photoId }),
    };

    // Remove fields not needed for DTO
    delete mutationData.imageUri;

    try {
      if (isEditing && editingProduct) {
        await updateMutation.mutateAsync(
          { id: editingProduct.id, data: mutationData },
          {
            onSuccess: () => {
              showSnackbar({ message: 'Producto actualizado con éxito', type: 'success' });
              handleCloseFormModal();
              queryClient.invalidateQueries({ queryKey: ['products', queryFilters] });
              queryClient.invalidateQueries({ queryKey: ['product', editingProduct.id] });
            },
            onError: (err) => {
              showSnackbar({ message: getApiErrorMessage(err), type: 'error' });
            },
          }
        );
      } else {
        await createMutation.mutateAsync(mutationData, {
          onSuccess: () => {
            showSnackbar({ message: 'Producto creado con éxito', type: 'success' });
            handleCloseFormModal();
            queryClient.invalidateQueries({ queryKey: ['products', queryFilters] });
          },
          onError: (err) => {
            showSnackbar({ message: getApiErrorMessage(err), type: 'error' });
          },
        });
      }
    } catch (err) {
      console.error("Error during product mutation:", err);
      showSnackbar({ message: 'Ocurrió un error inesperado', type: 'error' });
    }
  }, [editingProduct, updateMutation, createMutation, showSnackbar, handleCloseFormModal, queryClient, queryFilters]);

  // Deletion Handling
  const handleDeleteProduct = useCallback((productId: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement actual deletion logic using deleteMutation
            // await deleteMutation.mutateAsync(productId, { ... });
            showSnackbar({ message: 'Funcionalidad de eliminar pendiente', type: 'info' });
          },
        },
      ]
    );
  }, [showSnackbar]); // Add deleteMutation here when implemented

  const listRenderConfig = {
    titleField: 'name' as keyof Product,
    descriptionField: '_displayDescription' as keyof (Product & { _displayDescription: string }),
    imageField: 'photo' as keyof Product,
    statusConfig: {
      field: 'isActive' as keyof Product,
      activeValue: true,
      activeLabel: 'Activo',
      inactiveLabel: 'Inactivo',
    },
  };

  const filterOptions: FilterOption<'all' | 'active' | 'inactive'>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.centered}>
      {isLoading ? (
        <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
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
  ), [isLoading, error, subCategoryName, styles, theme.colors.primary, debouncedSearchQuery]);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: subCategoryName ? `Productos de ${subCategoryName}` : 'Productos' });
  }, [navigation, subCategoryName]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
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
       fabVisible={!isFormModalVisible}
       enableSort={false}
       contentContainerStyle={styles.contentContainer}
       // TODO: Add renderItemActions if needed
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
  contentContainer: {
    paddingBottom: 80,
  },
});

export default ProductsScreen;