import React, { useState, useCallback, useMemo } from 'react'; // useMemo ya estaba
import { View, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDrawerStatus } from '@react-navigation/drawer'; // Importar hook para estado del drawer
import GenericList, { RenderItemConfig, FilterOption } from '../../../app/components/crud/GenericList'; // Importar FilterOption
import GenericDetailModal, { DisplayFieldConfig } from '../../../app/components/crud/GenericDetailModal';
import TableFormModal from '../components/TableFormModal';
// import TableDetailModal from '../components/TableDetailModal'; // Eliminar import específico
import { useGetAreaById } from '../hooks/useAreasQueries'; // Necesario para el renderer del nombre del área
import {
  useGetTablesByAreaId, // Usar hook específico para obtener por areaId
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
} from '../hooks/useTablesQueries';
import { Table, CreateTableDto, UpdateTableDto } from '../types/table.types';
import { TablesListScreenProps } from '../navigation/types'; // Props de navegación
import { useAppTheme, AppTheme } from '../../../app/styles/theme';

const TablesScreen: React.FC<TablesListScreenProps> = ({ route, navigation }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { areaId, areaName } = route.params; // Obtener areaId y areaName de los parámetros de ruta
  const drawerStatus = useDrawerStatus(); // Obtener estado del drawer
  const isDrawerOpen = drawerStatus === 'open'; // Determinar si está abierto

  // State for modals and selected item
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Estado para búsqueda
  const [filterStatus, setFilterStatus] = useState<string>('all'); // Estado para filtro ('all', 'true', 'false')

  // React Query Hooks
  const {
    data: tablesData = [], // Default to empty array
    isLoading: isLoadingTables,
    isError: isErrorTables,
    refetch: refetchTables,
    isRefetching,
  } = useGetTablesByAreaId(areaId, { enabled: !!areaId }); // Asegurar que areaId exista
  // NOTA: useGetTablesByAreaId actualmente no soporta filtros adicionales (name, isActive).
  // Para implementar filtros aquí, necesitaríamos:
  // 1. Modificar useGetTablesByAreaId para aceptar filtros O
  // 2. Usar useGetTables y pasar areaId como parte de los filtros.
  // Por simplicidad, la búsqueda y filtro de estado se harán en el cliente por ahora.
  // Si el rendimiento se ve afectado, se debe refactorizar para filtrar en el backend.

  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const deleteTableMutation = useDeleteTable();

  const isSubmitting = createTableMutation.isPending || updateTableMutation.isPending;
  const isDeleting = deleteTableMutation.isPending;

  // --- Handlers ---
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
    _photoId: string | null | undefined // Not used for tables
  ) => {
    try {
      // Asegurarse de que areaId esté presente al crear/actualizar si no viene del form
      const dataWithAreaId = { ...data, areaId: data.areaId || areaId };

      if (isEditing && selectedTable) {
        await updateTableMutation.mutateAsync({ id: selectedTable.id, data: dataWithAreaId });
      } else {
        await createTableMutation.mutateAsync(dataWithAreaId as CreateTableDto);
      }
      handleCloseFormModal();
      // refetchTables(); // Invalidation should handle refetching
    } catch (error) {
      console.error('Submit failed:', error);
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
              // Error handled by mutation's onError
            }
          },
        },
      ]
    );
  };

  // --- Render & Detail Config ---

  // Componente interno para mostrar el nombre del área (movido desde TableDetailModal)
  const AreaNameRenderer: React.FC<{ areaId: string }> = ({ areaId }) => {
    const { data: area, isLoading, error } = useGetAreaById(areaId);
    const theme = useAppTheme(); // Theme ya está disponible en el scope de TablesScreen

    if (isLoading) return <Text style={{ color: theme.colors.outline }}>Cargando área...</Text>;
    if (error) return <Text style={{ color: theme.colors.error }}>Error área</Text>;
    // Usar fieldValueStyle genérico si existe, o definir uno localmente
    return <Text style={styles.fieldValueText}>{area?.name ?? 'Desconocida'}</Text>; // Usar estilo definido abajo
  };


  const listRenderConfig: RenderItemConfig<Table> = useMemo(() => ({ // Renombrar para claridad
    titleField: 'name',
    descriptionMaxLength: 30,
    statusConfig: {
      field: 'isActive',
      activeValue: true,
      activeLabel: 'Activa',
      inactiveLabel: 'Inactiva',
    },
  }), []);

  // Configuración para GenericDetailModal (movida desde el componente eliminado)
  const tableDetailFields: DisplayFieldConfig<Table>[] = useMemo(() => [
    {
      field: 'areaId',
      label: 'Área',
      render: (areaIdValue) => <AreaNameRenderer areaId={areaIdValue as string} />,
    },
    {
      field: 'capacity',
      label: 'Capacidad',
      render: (value) => <Text style={styles.fieldValueText}>{value ?? 'No especificada'}</Text>,
    },
    {
      field: 'isAvailable',
      label: 'Disponible',
      render: (value) => <Text style={styles.fieldValueText}>{value ? 'Sí' : 'No'}</Text>,
    },
    {
      field: 'isTemporary',
      label: 'Temporal',
      render: (value, item) => (
        <Text style={styles.fieldValueText}>{value ? `Sí (${item.temporaryIdentifier || 'Sin ID'})` : 'No'}</Text>
      ),
    },
  ], [styles.fieldValueText]); // Dependencia correcta

  const tableDetailStatusConfig = listRenderConfig.statusConfig;

  // --- Filtros (Cliente) ---
  // Usar strings para los valores, incluyendo 'all'
  const filterOptions: FilterOption<string>[] = useMemo(() => [
      { label: 'Todas', value: 'all' },
      { label: 'Activas', value: 'true' }, // Icono eliminado
      { label: 'Inactivas', value: 'false' }, // Icono eliminado
      // Podrían añadirse más filtros (Disponibles, Temporales) si es necesario
  ], []);

  // El valor recibido será 'all', 'true', o 'false'
  const handleFilterChange = (value: string) => {
      setFilterStatus(value);
  };

  const handleSearchChange = (query: string) => {
      setSearchQuery(query);
  };

  const handleRefresh = useCallback(() => {
      setSearchQuery('');
      setFilterStatus('all'); // Resetear a 'all'
      refetchTables();
  }, [refetchTables]);

  // --- Filtrado y Búsqueda en Cliente ---
  // Aplicar filtros y búsqueda localmente ya que el hook actual no los soporta en backend
  const filteredAndSearchedTables = useMemo(() => {
      let processed = [...tablesData];

      // Filtrar por estado (convertir string a boolean)
      const isActiveFilter = filterStatus === 'all' ? undefined : filterStatus === 'true'; // Interpretar 'all' como undefined
      if (isActiveFilter !== undefined) {
          processed = processed.filter(table => table.isActive === isActiveFilter);
      }

      // Filtrar por búsqueda (nombre)
      if (searchQuery.trim()) {
          const lowerCaseQuery = searchQuery.toLowerCase();
          processed = processed.filter(table =>
              table.name.toLowerCase().includes(lowerCaseQuery)
          );
      }

      return processed;
  }, [tablesData, filterStatus, searchQuery]);

  // --- Empty/Loading/Error States ---
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

  // --- Main Render ---
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <GenericList<Table>
        items={filteredAndSearchedTables} // Usar datos procesados localmente
        renderConfig={listRenderConfig}
        onItemPress={handleOpenDetailModal}
        onRefresh={handleRefresh} // Usar handler personalizado
        isRefreshing={isRefetching}
        ListEmptyComponent={ListEmptyComponent}
        // --- Props para búsqueda y filtro ---
        enableSearch={true}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filterOptions={filterOptions}
        filterValue={filterStatus} // Ahora es string ('all', 'true', 'false')
        onFilterChange={handleFilterChange} // Recibe string
        // --- Fin props búsqueda y filtro ---
        showFab={true}
        onFabPress={() => handleOpenFormModal()} // Abrir modal para crear
        // fabLabel="Nueva Mesa" // <-- Eliminado para quitar el texto
        // No renderItemActions needed here, handled by onItemPress
        isModalOpen={formModalVisible || detailModalVisible} // Hide FAB when modals are open
        isDrawerOpen={isDrawerOpen} // Pasar el estado del drawer
      />

      <TableFormModal
        visible={formModalVisible}
        onDismiss={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        editingItem={isEditing ? selectedTable : null}
        isSubmitting={isSubmitting}
        defaultAreaId={areaId}
      />

      {/* Usar GenericDetailModal directamente */}
      <GenericDetailModal<Table>
          visible={detailModalVisible}
          onDismiss={handleCloseDetailModal}
          item={selectedTable}
          titleField="name" // Campo para el título del modal
          statusConfig={tableDetailStatusConfig} // Configuración de estado
          fieldsToDisplay={tableDetailFields} // Campos adicionales a mostrar
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
    // Estilo para el texto del valor en los detalles (similar al genérico)
    fieldValueText: {
        flexShrink: 1,
        textAlign: 'right',
        color: theme.colors.onSurface,
    },
});

export default TablesScreen;