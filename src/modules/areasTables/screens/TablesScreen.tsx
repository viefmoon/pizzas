import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
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
import { Table, CreateTableDto, UpdateTableDto } from '../types/table.types';
import { TablesListScreenProps } from '../navigation/types';
import { useAppTheme, AppTheme } from '../../../app/styles/theme';

const TablesScreen: React.FC<TablesListScreenProps> = ({ route, navigation }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { areaId, areaName } = route.params;
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    data: tablesData = [],
    isLoading: isLoadingTables,
    isError: isErrorTables,
    refetch: refetchTables,
    isRefetching,
  } = useGetTablesByAreaId(areaId, { enabled: !!areaId });

  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const deleteTableMutation = useDeleteTable();

  const isSubmitting = createTableMutation.isPending || updateTableMutation.isPending;
  const isDeleting = deleteTableMutation.isPending;

  const handleOpenFormModal = (table: Table | null = null) => {
    setSelectedTable(table);
    setIsEditing(!!table);
    setFormModalVisible(true);
  };

  const handleCloseFormModal = () => {
    setFormModalVisible(false);
    setSelectedTable(null);
  };

  const handleOpenDetailModal = (table: Table) => {
    setSelectedTable(table);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedTable(null);
  };

  const handleFormSubmit = async (
    data: CreateTableDto | UpdateTableDto,
    _photoId: string | null | undefined
  ) => {
    try {
      const dataWithAreaId = { ...data, areaId: areaId };

      if (isEditing && selectedTable) {
        await updateTableMutation.mutateAsync({ id: selectedTable.id, data: dataWithAreaId });
      } else {
        await createTableMutation.mutateAsync(dataWithAreaId as CreateTableDto);
      }
      handleCloseFormModal();
    } catch (error) {
      console.error('Submit failed:', error); // Mantener este log
    }
  };

  const handleDeleteTable = (id: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar esta mesa? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTableMutation.mutateAsync(id);
              handleCloseDetailModal();
            } catch (error) {
            }
          },
        },
      ]
    );
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
      render: (value) => <Text style={styles.fieldValueText}>{value ?? 'No especificada'}</Text>
    }
  ], [styles.fieldValueText]);

  const tableDetailStatusConfig = listRenderConfig.statusConfig;

  const filterOptions: FilterOption<string>[] = useMemo(() => [
      { label: 'Todas', value: 'all' },
      { label: 'Activas', value: 'true' },
      { label: 'Inactivas', value: 'false' },
  ], []);

  const handleFilterChange = (value: string) => {
      setFilterStatus(value);
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
        onFabPress={() => handleOpenFormModal()}
        isModalOpen={formModalVisible || detailModalVisible}
        showImagePlaceholder={false}
        isDrawerOpen={isDrawerOpen}
      />

      <TableFormModal
        visible={formModalVisible}
        onDismiss={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        editingItem={isEditing ? selectedTable : null}
        isSubmitting={isSubmitting}
        defaultAreaId={areaId}
      />

      <GenericDetailModal<Table>
          visible={detailModalVisible}
          onDismiss={handleCloseDetailModal}
          item={selectedTable}
          titleField="name"
          statusConfig={tableDetailStatusConfig}
          fieldsToDisplay={tableDetailFields}
          onEdit={() => {
              handleCloseDetailModal();
              handleOpenFormModal(selectedTable);
          }}
          onDelete={handleDeleteTable}
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