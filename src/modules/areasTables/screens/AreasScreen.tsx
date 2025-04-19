import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, IconButton } from 'react-native-paper';
import { useDrawerStatus } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import GenericList, { RenderItemConfig, FilterOption } from '../../../app/components/crud/GenericList';
import GenericDetailModal, { DisplayFieldConfig } from '../../../app/components/crud/GenericDetailModal';
import AreaFormModal from '../components/AreaFormModal';
import {
  useGetAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
} from '../hooks/useAreasQueries';
import { Area, CreateAreaDto, UpdateAreaDto } from '../types/area.types';
import { AreasListScreenProps } from '../navigation/types';
import { useAppTheme, AppTheme } from '../../../app/styles/theme';
import { useCrudScreenLogic } from '../../../app/hooks/useCrudScreenLogic';

const AreasScreen: React.FC<AreasListScreenProps> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');

  const {
    data: areasData = [],
    isLoading: isLoadingAreas,
    isError: isErrorAreas,
    refetch: refetchAreas,
    isRefetching,
  } = useGetAreas(
      { name: searchQuery || undefined, isActive: filterStatus === 'all' ? undefined : filterStatus === 'true' },
      { page: 1, limit: 100 }
  );

  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();
  const { mutateAsync: deleteArea } = useDeleteArea();

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
  } = useCrudScreenLogic<Area, CreateAreaDto, UpdateAreaDto>({
    entityName: 'Área',
    queryKey: ['areas', { name: searchQuery || undefined, isActive: filterStatus === 'all' ? undefined : filterStatus === 'true' }],
    deleteMutationFn: deleteArea,
  });

  const isSubmitting = createAreaMutation.isPending || updateAreaMutation.isPending;

  const handleFormSubmit = async (
    data: CreateAreaDto | UpdateAreaDto,
    _photoId: string | null | undefined
  ) => {
    try {
      if (editingItem) {
        await updateAreaMutation.mutateAsync({ id: editingItem.id, data: data as UpdateAreaDto });
      } else {
        await createAreaMutation.mutateAsync(data as CreateAreaDto);
      }
      handleCloseModals();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleNavigateToTables = (area: Area) => {
    navigation.navigate('TablesList', { areaId: area.id, areaName: area.name });
  };

  const listRenderConfig: RenderItemConfig<Area> = {
    titleField: 'name',
    descriptionField: 'description',
    statusConfig: {
      field: 'isActive',
      activeValue: true,
      activeLabel: 'Activa',
      inactiveLabel: 'Inactiva',
    },
  };

  const areaDetailFields: DisplayFieldConfig<Area>[] = [
    { field: 'description', label: 'Descripción' },
  ];
  const areaDetailStatusConfig = listRenderConfig.statusConfig;

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
      refetchAreas();
  }, [refetchAreas]);

  const renderItemActions = (item: Area) => (
    <IconButton
      icon="format-list-bulleted"
      size={28}
      onPress={() => handleNavigateToTables(item)}
      iconColor={theme.colors.primary}
    />
  );

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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <GenericList<Area>
        items={areasData}
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
        renderItemActions={renderItemActions}
        isModalOpen={isFormModalVisible || isDetailModalVisible}
        isDrawerOpen={isDrawerOpen}
        showImagePlaceholder={false}
      />

      <AreaFormModal
        visible={isFormModalVisible}
        onDismiss={handleCloseModals}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        isSubmitting={isSubmitting}
      />

      <GenericDetailModal<Area>
        visible={isDetailModalVisible}
        onDismiss={handleCloseModals}
        item={selectedItem}
        titleField="name"
        statusConfig={areaDetailStatusConfig}
        fieldsToDisplay={areaDetailFields}
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
});


export default AreasScreen;