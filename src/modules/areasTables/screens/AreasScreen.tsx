import React, { useState, useCallback, useMemo } from 'react'; // Añadir useMemo
import { View, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator, Text, IconButton } from 'react-native-paper';
import { useDrawerStatus } from '@react-navigation/drawer'; // Importar hook para estado del drawer
import { SafeAreaView } from 'react-native-safe-area-context';
import GenericList, { RenderItemConfig, FilterOption } from '../../../app/components/crud/GenericList'; // Importar FilterOption
import GenericDetailModal, { DisplayFieldConfig } from '../../../app/components/crud/GenericDetailModal';
import AreaFormModal from '../components/AreaFormModal';
// import AreaDetailModal from '../components/AreaDetailModal'; // Eliminar import específico
import {
  useGetAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
} from '../hooks/useAreasQueries';
import { Area, CreateAreaDto, UpdateAreaDto } from '../types/area.types';
import { AreasListScreenProps } from '../navigation/types'; // Props de navegación
import { useAppTheme, AppTheme } from '../../../app/styles/theme'; // Importar AppTheme también

const AreasScreen: React.FC<AreasListScreenProps> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const drawerStatus = useDrawerStatus(); // Obtener estado del drawer
  const isDrawerOpen = drawerStatus === 'open'; // Determinar si está abierto

  // State for modals and selected item
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Estado para la búsqueda
  const [filterStatus, setFilterStatus] = useState<string>('all'); // Estado para el filtro ('all', 'true', 'false')

  // React Query Hooks
  const {
    data: areasData = [], // Default to empty array
    isLoading: isLoadingAreas,
    isError: isErrorAreas,
    refetch: refetchAreas,
    isRefetching,
  } = useGetAreas( // Pasar filtros al hook
      { name: searchQuery || undefined, isActive: filterStatus === 'all' ? undefined : filterStatus === 'true' }, // Convertir 'all' a undefined, 'true'/'false' a boolean
      { page: 1, limit: 100 }
  );

  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();
  const deleteAreaMutation = useDeleteArea();

  const isSubmitting = createAreaMutation.isPending || updateAreaMutation.isPending;
  const isDeleting = deleteAreaMutation.isPending;

  // --- Handlers ---
  const handleOpenFormModal = (area: Area | null = null) => {
    setSelectedArea(area);
    setIsEditing(!!area);
    setFormModalVisible(true);
  };

  const handleCloseFormModal = () => {
    setFormModalVisible(false);
    setSelectedArea(null);
  };

  const handleOpenDetailModal = (area: Area) => {
    setSelectedArea(area);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedArea(null);
  };

  const handleFormSubmit = async (
    data: CreateAreaDto | UpdateAreaDto,
    _photoId: string | null | undefined // Not used for areas
  ) => {
    try {
      if (isEditing && selectedArea) {
        await updateAreaMutation.mutateAsync({ id: selectedArea.id, data });
      } else {
        await createAreaMutation.mutateAsync(data as CreateAreaDto);
      }
      handleCloseFormModal();
      // refetchAreas(); // Invalidation should handle refetching
    } catch (error) {
      // Error is handled by the mutation's onError
      console.error('Submit failed:', error);
    }
  };

  const handleDeleteArea = (id: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar esta área? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAreaMutation.mutateAsync(id);
              handleCloseDetailModal(); // Close detail modal if open
            } catch (error) {
              // Error handled by mutation's onError
            }
          },
        },
      ]
    );
  };

  const handleNavigateToTables = (area: Area) => {
    navigation.navigate('TablesList', { areaId: area.id, areaName: area.name });
  };

  // --- Render & Detail Config ---
  const listRenderConfig: RenderItemConfig<Area> = { // Renombrar para claridad
    titleField: 'name',
    descriptionField: 'description',
    statusConfig: {
      field: 'isActive',
      activeValue: true,
      activeLabel: 'Activa',
      inactiveLabel: 'Inactiva',
    },
  };

  // Configuración para GenericDetailModal (movida desde el componente eliminado)
  const areaDetailFields: DisplayFieldConfig<Area>[] = [
    { field: 'description', label: 'Descripción' },
    // { field: 'createdAt', label: 'Creado', render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
  ];
  const areaDetailStatusConfig = listRenderConfig.statusConfig;

  // --- Filtros ---
  // Usar strings para los valores, incluyendo 'all'
  const filterOptions: FilterOption<string>[] = useMemo(() => [
      { label: 'Todas', value: 'all' },
      { label: 'Activas', value: 'true' }, // Icono eliminado
      { label: 'Inactivas', value: 'false' }, // Icono eliminado
  ], []);

  // El valor recibido de SegmentedButtons será 'all', 'true', o 'false'
  const handleFilterChange = (value: string) => {
      setFilterStatus(value);
      // Opcional: Limpiar búsqueda al cambiar filtro
      // setSearchQuery('');
  };

  const handleSearchChange = (query: string) => {
      setSearchQuery(query);
  };

  const handleRefresh = useCallback(() => {
      // Limpiar filtros y búsqueda al hacer refresh manual
      setSearchQuery('');
      setFilterStatus('all'); // Resetear a 'all'
      refetchAreas();
  }, [refetchAreas]);

  const renderItemActions = (item: Area) => (
    <IconButton
      icon="chevron-right"
      size={28}
      onPress={() => handleNavigateToTables(item)}
      iconColor={theme.colors.primary}
    />
  );

  // --- Empty/Loading/Error States ---
  const ListEmptyComponent = (
    <View style={styles.centered}>
      <Text variant="bodyLarge">No hay áreas creadas todavía.</Text>
      <Text variant="bodyMedium">Presiona el botón (+) para añadir una.</Text>
    </View>
  );

  if (isLoadingAreas && !isRefetching) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Cargando áreas...</Text>
      </SafeAreaView>
    );
  }

  if (isErrorAreas) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: theme.colors.error }}>
          Error al cargar las áreas.
        </Text>
        {/* Consider adding a retry button */}
      </SafeAreaView>
    );
  }

  // --- Main Render ---
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <GenericList<Area>
        items={areasData}
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
        onFabPress={() => handleOpenFormModal()}
        // fabLabel="Nueva Área" // <-- Eliminado para quitar el texto
        renderItemActions={renderItemActions} // Add action button
        isModalOpen={formModalVisible || detailModalVisible} // Hide FAB when modals are open
        isDrawerOpen={isDrawerOpen} // Pasar el estado del drawer
      />

      <AreaFormModal
        visible={formModalVisible}
        onDismiss={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        editingItem={isEditing ? selectedArea : null}
        isSubmitting={isSubmitting}
      />

      {/* Usar GenericDetailModal directamente */}
      <GenericDetailModal<Area>
        visible={detailModalVisible}
        onDismiss={handleCloseDetailModal}
        item={selectedArea}
        titleField="name" // Campo para el título del modal
        statusConfig={areaDetailStatusConfig} // Configuración de estado
        fieldsToDisplay={areaDetailFields} // Campos adicionales a mostrar
        onEdit={() => {
          handleCloseDetailModal();
          handleOpenFormModal(selectedArea);
        }}
        onDelete={handleDeleteArea}
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
});


export default AreasScreen;