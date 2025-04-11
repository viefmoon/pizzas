import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
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

const AreasScreen: React.FC<AreasListScreenProps> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
  const deleteAreaMutation = useDeleteArea();

  const isSubmitting = createAreaMutation.isPending || updateAreaMutation.isPending;
  const isDeleting = deleteAreaMutation.isPending;

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
    _photoId: string | null | undefined
  ) => {
    try {
      if (isEditing && selectedArea) {
        await updateAreaMutation.mutateAsync({ id: selectedArea.id, data });
      } else {
        await createAreaMutation.mutateAsync(data as CreateAreaDto);
      }
      handleCloseFormModal();
    } catch (error) {
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
              handleCloseDetailModal();
            } catch (error) {
            }
          },
        },
      ]
    );
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
        onFabPress={() => handleOpenFormModal()}
        renderItemActions={renderItemActions}
        isModalOpen={formModalVisible || detailModalVisible}
        isDrawerOpen={isDrawerOpen}
        showImagePlaceholder={false}
      />

      <AreaFormModal
        visible={formModalVisible}
        onDismiss={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        editingItem={isEditing ? selectedArea : null}
        isSubmitting={isSubmitting}
      />

      <GenericDetailModal<Area>
        visible={detailModalVisible}
        onDismiss={handleCloseDetailModal}
        item={selectedArea}
        titleField="name"
        statusConfig={areaDetailStatusConfig}
        fieldsToDisplay={areaDetailFields}
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