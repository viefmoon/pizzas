import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDrawerStatus } from '@react-navigation/drawer';
import GenericList, { RenderItemConfig, FilterOption } from '../../../app/components/crud/GenericList';
import GenericDetailModal, { DisplayFieldConfig } from '../../../app/components/crud/GenericDetailModal';
import TableFormModal from '../components/TableFormModal';
import {
  useGetTablesByAreaId,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
} from '../hooks/useTablesQueries';
import { Table, CreateTableDto, UpdateTableDto } from '../schema/table.schema';
import { TablesListScreenProps } from '../navigation/types';
import { useAppTheme, AppTheme } from '../../../app/styles/theme';
import { useCrudScreenLogic } from '../../../app/hooks/useCrudScreenLogic';

const TablesScreen: React.FC<TablesListScreenProps> = ({ route }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { areaId, areaName } = route.params;
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');

  const {
    data: tablesData = [],
    isLoading: isLoadingTables,
    isError: isErrorTables,
    refetch: refetchTables,
    isRefetching,
  } = useGetTablesByAreaId(areaId, { enabled: !!areaId });

  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const { mutateAsync: deleteTable } = useDeleteTable();

  const {
    isFormModalVisible,
    isDetailModalVisible,
    editingItem,
    selectedItem,
    isDeleting,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenDetailModal,
    handleCloseModals,
    handleDeleteItem,
  } = useCrudScreenLogic<Table, CreateTableDto, UpdateTableDto>({
    entityName: 'Mesa',
    queryKey: ['tables', areaId],
    deleteMutationFn: deleteTable,
  });

  const isSubmitting = createTableMutation.isPending || updateTableMutation.isPending;

  const handleFormSubmit = async (
    data: CreateTableDto | UpdateTableDto,
    _photoId: string | null | undefined
  ) => {
    try {
      const dataWithAreaId = { ...data, areaId: areaId };

      if (editingItem) {
        await updateTableMutation.mutateAsync({ id: editingItem.id, data: dataWithAreaId as UpdateTableDto });
      } else {
        await createTableMutation.mutateAsync(dataWithAreaId as CreateTableDto);
      }
      handleCloseModals();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };


  const listRenderConfig: RenderItemConfig<Table> = useMemo(() => ({
    titleField: 'name',
    descriptionMaxLength: 30,
    statusConfig: {
      field: 'isActive',
      activeValue: true,
      activeLabel: 'Activa',
      inactiveLabel: 'Inactiva',
    },
  }), []);

  const tableDetailFields: DisplayFieldConfig<Table>[] = useMemo(() => [
    {
      field: 'capacity',
      label: 'Capacidad',
      render: (value) => <Text style={styles.fieldValueText}>{value !== null && value !== undefined ? String(value) : 'No especificada'}</Text>
    }
  ], [styles.fieldValueText]);

  const tableDetailStatusConfig = listRenderConfig.statusConfig;

  const filterOptions: FilterOption<string>[] = useMemo(() => [
      { label: 'Todas', value: 'all' },
      { label: 'Activas', value: 'true' },
      { label: 'Inactivas', value: 'false' },
  ], []);

  const handleFilterChange = (value: string | number) => {
      setFilterStatus(String(value));
  };

  const handleSearchChange = (query: string) => {
      setSearchQuery(query);
  };

  const handleRefresh = useCallback(() => {
      setSearchQuery('');
      setFilterStatus('all');
      refetchTables();
  }, [refetchTables]);

  const filteredAndSearchedTables = useMemo(() => {
      let processed = [...tablesData];

      const isActiveFilter = filterStatus === 'all' ? undefined : filterStatus === 'true';
      if (isActiveFilter !== undefined) {
          processed = processed.filter(table => table.isActive === isActiveFilter);
      }

      if (searchQuery.trim()) {
          const lowerCaseQuery = searchQuery.toLowerCase();
          processed = processed.filter(table =>
              table.name.toLowerCase().includes(lowerCaseQuery)
          );
      }

      return processed;
  }, [tablesData, filterStatus, searchQuery]);

  const ListEmptyComponent = (
    <View style={styles.centered}>
      <Text variant="bodyLarge">No hay mesas creadas para "{areaName}".</Text>
      <Text variant="bodyMedium">Presiona el botón (+) para añadir una.</Text>
    </View>
  );

  if (isLoadingTables && !isRefetching) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Cargando mesas...</Text>
      </SafeAreaView>
    );
  }

  if (isErrorTables) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: theme.colors.error }}>
          Error al cargar las mesas.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <GenericList<Table>
        items={filteredAndSearchedTables}
        renderConfig={listRenderConfig}
        onItemPress={handleOpenDetailModal}
        onRefresh={handleRefresh}
        isRefreshing={isRefetching}
        ListEmptyComponent={ListEmptyComponent}
        enableSearch={true}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filterOptions={filterOptions}
        filterValue={filterStatus}
        onFilterChange={handleFilterChange}
        showFab={true}
        onFabPress={handleOpenCreateModal}
        isModalOpen={isFormModalVisible || isDetailModalVisible}
        showImagePlaceholder={false}
        isDrawerOpen={isDrawerOpen}
      />

      <TableFormModal
        visible={isFormModalVisible}
        onDismiss={handleCloseModals}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        isSubmitting={isSubmitting}
      />

      <GenericDetailModal<Table>
          visible={isDetailModalVisible}
          onDismiss={handleCloseModals}
          item={selectedItem}
          titleField="name"
          statusConfig={tableDetailStatusConfig}
          fieldsToDisplay={tableDetailFields}
          onEdit={() => {
              if (selectedItem) {
                  handleOpenEditModal(selectedItem);
              }
          }}
          onDelete={handleDeleteItem}
          isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: AppTheme) => StyleSheet.create({
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
    fieldValueText: {
        flexShrink: 1,
        textAlign: 'right',
        color: theme.colors.onSurface,
    },
});

export default TablesScreen;