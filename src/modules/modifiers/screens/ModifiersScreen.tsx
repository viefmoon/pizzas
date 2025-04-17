import React, { useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { FAB, ActivityIndicator, Text, Portal, Button } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDrawerStatus } from '@react-navigation/drawer'; // Importar hook

import { modifierService } from '../services/modifierService';
import { Modifier } from '../types/modifier.types';
import { useAppTheme } from '@/app/styles/theme';
import { useSnackbarStore } from '@/app/store/snackbarStore';
import { getApiErrorMessage } from '@/app/lib/errorMapping';
import { debounce } from 'lodash';

import ModifierFormModal from '@/modules/modifiers/components/ModifierFormModal';
import GenericList, { RenderItemConfig, FilterOption } from '@/app/components/crud/GenericList';
import GenericDetailModal, { DisplayFieldConfig } from '@/app/components/crud/GenericDetailModal';

type StatusFilter = 'all' | 'active' | 'inactive';

type ModifiersScreenRouteParams = {
  groupId: string;
  groupName: string;
};

type ModifiersScreenRouteProp = RouteProp<{ params: ModifiersScreenRouteParams }, 'params'>;

type NavigationProps = {
  goBack: () => void;
  setOptions: (options: object) => void;
};

const ModifiersScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<ModifiersScreenRouteProp>();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const drawerStatus = useDrawerStatus(); // Obtener estado del drawer
  const isDrawerOpen = drawerStatus === 'open'; // Determinar si está abierto

  const { groupId, groupName } = route.params ?? {};

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [selectedModifierForForm, setSelectedModifierForForm] = useState<Modifier | null>(null);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedModifierForDetail, setSelectedModifierForDetail] = useState<Modifier | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const QUERY_KEY = ['modifiers', groupId];

  const debouncedSetSearch = useCallback(
    debounce((query: string) => setDebouncedSearchQuery(query), 300),
    []
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSetSearch(query);
  };

  useLayoutEffect(() => {
    if (groupName) {
        navigation.setOptions({
        headerTitle: `Modificadores: ${groupName}`,
        });
    }
  }, [navigation, groupName]);

  const queryParams = useMemo(() => {
    const params: Parameters<typeof modifierService.findByGroupId>[1] = {};
    if (statusFilter !== 'all') {
      params.isActive = statusFilter === 'active';
    }
    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }
    return params;
  }, [statusFilter, debouncedSearchQuery]);

  const { data: modifiers = [], isLoading, isError, error, refetch, isRefetching } = useQuery<Modifier[], Error>({
    queryKey: [QUERY_KEY[0], groupId, queryParams],
    queryFn: () => modifierService.findByGroupId(groupId, queryParams),
    enabled: !!groupId,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => modifierService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showSnackbar({ message: 'Modificador eliminado correctamente', type: 'success' });
      handleCloseDetails(); // Cerrar modal de detalles si está abierto
    },
    onError: (err) => {
      const message = getApiErrorMessage(err);
      showSnackbar({ message, type: 'error' });
      console.error("Error deleting modifier:", err);
    },
  });


  const handleAdd = () => {
    setSelectedModifierForForm(null);
    setIsFormModalVisible(true);
  };

  const openEditModal = (modifier: Modifier) => {
    setSelectedModifierForForm(modifier);
    setIsFormModalVisible(true);
  };

  const handleFormModalClose = () => {
    setIsFormModalVisible(false);
    setSelectedModifierForForm(null);
  };

  const handleFormModalSave = () => {
    handleFormModalClose();
  };

  const handleShowDetails = (modifier: Modifier) => {
    setSelectedModifierForDetail(modifier);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetails = () => {
    setIsDetailModalVisible(false);
    setSelectedModifierForDetail(null);
  };

  const handleEditFromDetails = (modifier: Modifier) => {
    handleCloseDetails();
    setTimeout(() => openEditModal(modifier), 100);
  };

  const executeDelete = (id: string) => {
    handleCloseDetails();
    deleteMutation.mutate(id);
  };

  const handleDeleteRequest = (id: string) => {
    Alert.alert(
      "Confirmar Eliminación",
      `¿Estás seguro de que deseas eliminar este modificador? (${selectedModifierForDetail?.name})`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => executeDelete(id) },
      ]
    );
  };

  const handleFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
  };

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.centered}>
       <Text style={styles.emptyText}>
         {searchQuery
           ? `No se encontraron modificadores para "${searchQuery}"`
           : `No hay modificadores ${statusFilter !== 'all' ? statusFilter + 's' : ''} en este grupo.`}
       </Text>
      <Text style={styles.emptySubText}>Puedes añadir uno nuevo con el botón (+).</Text>
    </View>
  ), [styles, searchQuery, statusFilter]);

  if (!groupId) {
      return (
          <View style={styles.centered}>
              <Text style={styles.errorText}>Error: No se proporcionó ID del grupo.</Text>
              <Button onPress={() => navigation.goBack()}>Volver</Button>
          </View>
      );
  }

  if (isLoading && !isRefetching) {
    return <ActivityIndicator animating={true} style={styles.centered} />;
  }

  if (isError) {
    return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>Error al cargar modificadores: {getApiErrorMessage(error)}</Text>
            <Button onPress={() => refetch()}>Reintentar</Button>
        </View>
    );
  }

  const listRenderConfig: RenderItemConfig<Modifier> = {
    titleField: 'name',
    priceField: 'price',
    sortOrderField: 'sortOrder',
    statusConfig: {
        field: 'isActive',
        activeValue: true,
        activeLabel: 'Activo',
        inactiveLabel: 'Inactivo',
    }
  };

  const detailFields: DisplayFieldConfig<Modifier>[] = [
    {
      field: 'price',
      label: 'Precio Adicional',
      render: (value) => <Text style={styles.fieldValue}>{value !== null ? `$${Number(value).toFixed(2)}` : 'N/A'}</Text>,
    },
    {
      field: 'sortOrder',
      label: 'Orden',
    },
    {
      field: 'isDefault',
      label: 'Por Defecto',
    },
  ];

  const filterOptions: FilterOption<StatusFilter>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
       <GenericList<Modifier>
         items={modifiers}
         renderConfig={listRenderConfig}
         onItemPress={handleShowDetails}
         onRefresh={refetch}
         isRefreshing={isRefetching}
         ListEmptyComponent={ListEmptyComponent}
         isLoading={isLoading && !isRefetching}
         enableSearch={true}
         searchQuery={searchQuery}
         onSearchChange={handleSearchChange}
         searchPlaceholder="Buscar modificadores..."
         filterValue={statusFilter}
         onFilterChange={handleFilterChange}
         filterOptions={filterOptions}
         showFab={true}
         onFabPress={handleAdd}
         fabLabel="Añadir Modificador"
         fabVisible={!isFormModalVisible && !isDetailModalVisible} // fabVisible ya existe, no lo tocamos
         showImagePlaceholder={false}
         isDrawerOpen={isDrawerOpen} // Pasar estado del drawer
       />

      <Portal>
          <ModifierFormModal
            visible={isFormModalVisible}
            onDismiss={handleFormModalClose}
            onSaveSuccess={handleFormModalSave}
            initialData={selectedModifierForForm}
            groupId={groupId}
          />

          <GenericDetailModal<Modifier>
            visible={isDetailModalVisible}
            onDismiss={handleCloseDetails}
            item={selectedModifierForDetail}
            titleField="name"
            descriptionField="description"
            statusConfig={listRenderConfig.statusConfig}
            fieldsToDisplay={detailFields}
            onEdit={handleEditFromDetails}
            onDelete={handleDeleteRequest}
            isDeleting={deleteMutation.isPending}
          />
      </Portal>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
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
    emptySubText: {
        textAlign: 'center',
        fontSize: 14,
        color: theme.colors.onSurfaceVariant,
    },
    errorText: {
        color: theme.colors.error,
        marginBottom: 10,
        textAlign: 'center',
    },
    fieldValue: {
       flexShrink: 1,
       textAlign: "right",
       color: theme.colors.onSurface,
    },
});

export default ModifiersScreen;