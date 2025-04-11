import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import GenericList, { FilterOption } from '../../../app/components/crud/GenericList';
import GenericDetailModal, { DisplayFieldConfig } from '../../../app/components/crud/GenericDetailModal';
// Importar el FormModal
import PreparationScreenFormModal from '../components/PreparationScreenFormModal';
import {
  useGetAllPreparationScreens,
  useGetPreparationScreenById,
  useDeletePreparationScreen, // Solo necesitamos delete aquí
} from '../hooks/usePreparationScreensQueries';
import { PreparationScreen, FindAllPreparationScreensFilter } from '../types/preparationScreens.types';
import { useAppTheme, AppTheme } from '../../../app/styles/theme';
import { BaseListQuery } from '../../../app/types/query.types';

// Definir ProductPlaceholder localmente (si es necesario para detailFields)
type ProductPlaceholder = { id: string; name: string; };

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
    marginTop: 50,
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  }
});

const PreparationScreensScreen = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingScreen, setEditingScreen] = useState<PreparationScreen | null>(null);

  // --- State for Filters & Pagination ---
  const [filters, setFilters] = useState<FindAllPreparationScreensFilter>({});
  const [pagination, setPagination] = useState<BaseListQuery>({ page: 1, limit: 15 });
  const [searchTerm, setSearchTerm] = useState('');

  // --- React Query Hooks ---
  const {
    data: screensData,
    isLoading: isLoadingList,
    isFetching: isFetchingList,
    refetch: refetchList,
    error: errorList,
  } = useGetAllPreparationScreens(filters, pagination);

  const {
    data: selectedScreenData,
    isLoading: isLoadingDetail,
    // error: errorDetail, // Podríamos mostrar este error en el modal
  } = useGetPreparationScreenById(selectedScreenId, {
    enabled: !!selectedScreenId && isDetailModalVisible,
  });

  const { mutate: deleteScreen, isPending: isDeleting } = useDeletePreparationScreen({
      onSuccess: () => {
          handleDismissDetailModal();
      },
      // onError manejado por el hook (snackbar)
  });
  // No necesitamos los hooks de create/update aquí si el modal los maneja

  // --- Refetch on Focus ---
  useFocusEffect(
    useCallback(() => {
      if (!isFetchingList) {
          refetchList();
      }
    }, [refetchList, isFetchingList])
  );

  // --- Event Handlers ---
  const handleRefresh = useCallback(() => {
    refetchList();
  }, [refetchList]);

  const handleItemPress = useCallback((item: PreparationScreen) => {
    setSelectedScreenId(item.id);
    setIsDetailModalVisible(true);
  }, []);

  const handleDismissDetailModal = useCallback(() => {
    setIsDetailModalVisible(false);
    setSelectedScreenId(null);
  }, []);

  const handleOpenFormModal = useCallback((itemToEdit: PreparationScreen | null = null) => {
    setEditingScreen(itemToEdit);
    setIsFormModalVisible(true);
    if (isDetailModalVisible) {
        handleDismissDetailModal();
    }
  }, [isDetailModalVisible, handleDismissDetailModal]);

  const handleDismissFormModal = useCallback(() => {
    setIsFormModalVisible(false);
    setEditingScreen(null);
    // Opcional: Refrescar lista al cerrar el modal (incluso si no hubo cambios guardados)
    // refetchList();
  }, []);

  const handleEditPress = useCallback((item: PreparationScreen) => {
    handleOpenFormModal(item);
  }, [handleOpenFormModal]);

  const handleDeletePress = useCallback((id: string) => {
    Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que deseas eliminar esta pantalla?",
        [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => deleteScreen(id) }
        ]
    );
  }, [deleteScreen]);

  const handleSearchChange = useCallback((query: string) => {
      setSearchTerm(query);
      const timerId = setTimeout(() => {
          setFilters(prev => ({ ...prev, name: query || undefined }));
          setPagination(prev => ({ ...prev, page: 1 }));
      }, 500);
      return () => clearTimeout(timerId);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
      let newIsActive: boolean | undefined;
      if (value === 'true') newIsActive = true;
      else if (value === 'false') newIsActive = false;
      else newIsActive = undefined;
      setFilters(prev => ({ ...prev, isActive: newIsActive }));
      setPagination(prev => ({ ...prev, page: 1 }));
  }, []);


  // --- List Configuration ---
  const listRenderConfig = {
    titleField: 'name' as keyof PreparationScreen,
    descriptionField: 'description' as keyof PreparationScreen,
    statusConfig: {
      field: 'isActive' as keyof PreparationScreen,
      activeValue: true,
      activeLabel: 'Activa',
      inactiveLabel: 'Inactiva',
    },
  };

  const filterOptions: FilterOption<string>[] = [
      { value: '', label: 'Todas' },
      { value: 'true', label: 'Activas' },
      { value: 'false', label: 'Inactivas' },
  ];

  // --- Detail Modal Configuration ---
   const detailFields: DisplayFieldConfig<PreparationScreen>[] = [
    {
        field: 'products',
        label: 'Productos Asociados',
        render: (products) => {
            if (Array.isArray(products) && products.length > 0) {
                return (
                    <Text style={{ flexShrink: 1, textAlign: 'right' }}>
                        {/* Usar ProductPlaceholder si products no tiene el tipo completo */}
                        {products.map((p: ProductPlaceholder) => p.name).join(', ')}
                    </Text>
                );
            }
            return <Text style={{ flexShrink: 1, textAlign: 'right' }}>Ninguno</Text>;
        },
    },
   ];

  // --- Loading/Empty States ---
  const ListEmptyComponent = useMemo(() => {
      if (isLoadingList && !screensData) {
          return <View style={styles.loadingContainer}><ActivityIndicator animating size="large" /></View>;
      }
      if (errorList) {
          return <View style={styles.emptyListContainer}><Text>Error al cargar las pantallas.</Text></View>;
      }
       if (!isLoadingList && screensData && screensData.length === 0) {
           const message = searchTerm ? 'No se encontraron pantallas.' : 'No hay pantallas creadas.';
           return <View style={styles.emptyListContainer}><Text>{message}</Text></View>;
       }
      return null;
  }, [isLoadingList, errorList, screensData, searchTerm, styles]);


  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <GenericList<PreparationScreen>
        items={screensData ?? []}
        renderConfig={listRenderConfig}
        onItemPress={handleItemPress}
        onRefresh={handleRefresh}
        isRefreshing={isFetchingList && !isLoadingList}
        ListEmptyComponent={ListEmptyComponent}
        enableSearch={true}
        searchQuery={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por nombre..."
        filterOptions={filterOptions}
        filterValue={filters.isActive === true ? 'true' : filters.isActive === false ? 'false' : ''}
        onFilterChange={handleFilterChange}
        showFab={true}
        onFabPress={() => handleOpenFormModal()}
        fabLabel="Nueva Pantalla"
        isModalOpen={isDetailModalVisible || isFormModalVisible}
      />

      <GenericDetailModal<PreparationScreen>
        visible={isDetailModalVisible}
        onDismiss={handleDismissDetailModal}
        item={selectedScreenData ?? null}
        // isLoading={isLoadingDetail} // Podríamos mostrar indicador en modal
        titleField="name"
        descriptionField="description"
        statusConfig={listRenderConfig.statusConfig}
        fieldsToDisplay={detailFields}
        onEdit={handleEditPress}
        onDelete={handleDeletePress}
        isDeleting={isDeleting}
        editButtonLabel="Editar"
        deleteButtonLabel="Eliminar"
        closeButtonLabel="Cerrar"
      />

      {/* Integrar el Form Modal */}
      <PreparationScreenFormModal
        visible={isFormModalVisible}
        onDismiss={handleDismissFormModal}
        editingItem={editingScreen}
        // Opcional: Refrescar lista cuando el modal se cierra con éxito
        onSubmitSuccess={() => {
            // Podríamos invalidar queries aquí si fuera necesario,
            // pero los hooks de mutación dentro del modal ya lo hacen.
            // Solo necesitamos asegurarnos de que la lista se actualice.
            // refetchList(); // Opcional, si la invalidación no es suficiente
        }}
      />

    </SafeAreaView>
  );
};

export default PreparationScreensScreen;