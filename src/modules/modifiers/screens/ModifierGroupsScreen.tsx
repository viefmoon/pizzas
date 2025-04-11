import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator, Text, Button, IconButton } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDrawerStatus } from '@react-navigation/drawer'; // Importar hook

import { modifierGroupService } from '../services/modifierGroupService';
import { ModifierGroup } from '../types/modifierGroup.types';
import { useAppTheme, AppTheme } from '@/app/styles/theme';
import { useSnackbarStore } from '@/app/store/snackbarStore';
import { getApiErrorMessage } from '@/app/lib/errorMapping';
import { debounce } from 'lodash';
import ModifierGroupFormModal from '../components/ModifierGroupFormModal';
import GenericList, { RenderItemConfig, FilterOption } from '@/app/components/crud/GenericList';
import GenericDetailModal, { DisplayFieldConfig } from '@/app/components/crud/GenericDetailModal';

type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

type StatusFilter = 'all' | 'active' | 'inactive';

const QUERY_KEY = ['modifierGroups'];

const ModifierGroupsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProps>();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const drawerStatus = useDrawerStatus(); // Obtener estado del drawer
  const isDrawerOpen = drawerStatus === 'open'; // Determinar si está abierto

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [selectedGroupForForm, setSelectedGroupForForm] = useState<ModifierGroup | null>(null);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedGroupForDetail, setSelectedGroupForDetail] = useState<ModifierGroup | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const debouncedSetSearch = useCallback(
    debounce((query: string) => setDebouncedSearchQuery(query), 300),
    []
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSetSearch(query);
  };

  const queryParams = useMemo(() => {
    const params: Parameters<typeof modifierGroupService.findAll>[0] = {};
    if (statusFilter !== 'all') {
      params.isActive = statusFilter === 'active';
    }
    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }
    return params;
  }, [statusFilter, debouncedSearchQuery]);

  const { data: modifierGroups = [], isLoading, isError, error, refetch, isRefetching } = useQuery<ModifierGroup[], Error>({
    queryKey: [QUERY_KEY[0], queryParams],
    queryFn: () => modifierGroupService.findAll(queryParams),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => modifierGroupService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showSnackbar({ message: 'Grupo eliminado correctamente', type: 'success' });
      handleCloseDetailModal();
    },
    onError: (err) => {
      const message = getApiErrorMessage(err);
      showSnackbar({ message, type: 'error' });
      console.error("Error deleting modifier group:", err);
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });


  const handleAdd = () => {
    setSelectedGroupForForm(null);
    setIsFormModalVisible(true);
  };

  const handleEditFromDetail = (group: ModifierGroup) => {
    handleCloseDetailModal();
    setSelectedGroupForForm(group);
    setIsFormModalVisible(true);
  };

  const handleDeleteConfirm = (id: string) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar este grupo de modificadores? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            deleteMutation.mutate(id);
          },
        },
      ]
    );
  };

  const handleNavigateToModifiers = (groupId: string, groupName: string) => {
    // Ya no se cierra el modal aquí, se llama desde la lista
    navigation.navigate('ModifiersScreen', { groupId, groupName });
  };

  const handleOpenDetailModal = (group: ModifierGroup) => {
    setSelectedGroupForDetail(group);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedGroupForDetail(null);
  };

  const handleCloseFormModal = () => {
    setIsFormModalVisible(false);
    setSelectedGroupForForm(null);
  };

  const handleFormSaveSuccess = () => {
    handleCloseFormModal();
  };

  const handleFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
  };

  const handleRefresh = () => {
    refetch();
  };

  const listRenderConfig: RenderItemConfig<ModifierGroup> = {
    titleField: 'name',
    descriptionField: 'description',
    statusConfig: {
        field: 'isActive',
        activeValue: true,
        activeLabel: 'Activo',
        inactiveLabel: 'Inactivo',
    }
  };

  const detailFields: DisplayFieldConfig<ModifierGroup>[] = [
    { field: 'minSelections', label: 'Mín. Selecciones' },
    { field: 'maxSelections', label: 'Máx. Selecciones' },
    {
      field: 'isRequired',
      label: 'Requerido',
      render: (value) => <Text style={{ color: theme.colors.onSurface }}>{value ? 'Sí' : 'No'}</Text>
    },
    {
      field: 'allowMultipleSelections',
      label: 'Permite Múltiples',
      render: (value) => <Text style={{ color: theme.colors.onSurface }}>{value ? 'Sí' : 'No'}</Text>
    },
  ];

  const styles = useMemo(() => createStyles(theme), [theme]);

  const filterOptions: FilterOption<StatusFilter>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.centered}>
       <Text style={styles.emptyText}>
         {searchQuery
           ? `No se encontraron grupos para "${searchQuery}"`
           : `No hay grupos de modificadores ${statusFilter !== 'all' ? statusFilter + 's' : ''}.`}
       </Text>
    </View>
  ), [styles, searchQuery, statusFilter]);

  if (isLoading && !isRefetching && !modifierGroups.length) {
    return <ActivityIndicator animating={true} style={styles.centered} />;
  }

  if (isError && !modifierGroups.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {getApiErrorMessage(error)}</Text>
        <Button onPress={handleRefresh}>Reintentar</Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <GenericList<ModifierGroup>
        items={modifierGroups}
        renderConfig={listRenderConfig}
        onItemPress={handleOpenDetailModal}
        onRefresh={handleRefresh}
        isRefreshing={isRefetching}
        ListEmptyComponent={ListEmptyComponent}
        isLoading={isLoading && !isRefetching}
        enableSearch={true}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar grupos..."
        filterValue={statusFilter}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        showFab={true}
        onFabPress={handleAdd}
        isModalOpen={isFormModalVisible || isDetailModalVisible}
        showImagePlaceholder={false}
        isDrawerOpen={isDrawerOpen} // Pasar estado del drawer
        renderItemActions={(item) => (
          <IconButton
            icon="format-list-bulleted"
            size={24} // Tamaño estándar para iconos
            onPress={(e) => {
              e.stopPropagation(); // Evitar que se abra el modal de detalle
              handleNavigateToModifiers(item.id, item.name);
            }}
            // No necesita 'compact' ni 'mode' como el Button
          />
        )}
      />

      <ModifierGroupFormModal
            visible={isFormModalVisible}
            onDismiss={handleCloseFormModal}
            onSaveSuccess={handleFormSaveSuccess}
            initialData={selectedGroupForForm}
          />

      <GenericDetailModal<ModifierGroup>
        visible={isDetailModalVisible}
        onDismiss={handleCloseDetailModal}
        item={selectedGroupForDetail}
        titleField="name"
        descriptionField="description"
        statusConfig={listRenderConfig.statusConfig}
        fieldsToDisplay={detailFields}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
        editButtonLabel="Editar"
        deleteButtonLabel="Eliminar"
      >
        {/* El botón para ver modificadores se ha movido a la lista (renderItemActions) */}
      </GenericDetailModal>

    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  detailActionButton: {
      marginTop: theme.spacing.m,
      alignSelf: 'stretch',
      borderRadius: theme.roundness,
  },
});

export default ModifierGroupsScreen;