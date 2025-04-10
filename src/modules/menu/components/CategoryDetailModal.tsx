import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Modal,
  Portal,
  Surface,
  Text,
  Button,
  Chip,
} from 'react-native-paper';
// import { Image } from 'expo-image'; // Quitar import
import AutoImage from '../../../app/components/common/AutoImage'; // Importar AutoImage
import { useAppTheme, AppTheme } from '../../../app/styles/theme';
import { Category } from '../types/category.types';

interface CategoryDetailModalProps {
  visible: boolean;
  onDismiss: () => void;
  category: Category | null;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean; // Para mostrar estado de carga en botón eliminar
}

// Estilos específicos del modal de detalle (reutilizados de CategoriesScreen)
const getStyles = (theme: AppTheme) => StyleSheet.create({
    modalSurface: {
        padding: theme.spacing.l,
        margin: theme.spacing.l,
        borderRadius: theme.roundness * 2,
        elevation: 4,
        backgroundColor: theme.colors.elevation.level2,
    },
    modalTitle: {
        marginBottom: theme.spacing.m,
        textAlign: 'center',
    },
    detailContent: {
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    detailImage: {
        width: 200,
        height: 200,
        borderRadius: theme.roundness,
        marginBottom: theme.spacing.m,
        backgroundColor: theme.colors.outlineVariant,
    },
    detailText: {
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    detailActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: theme.spacing.l,
        width: '100%',
    },
    closeButton: {
        marginTop: theme.spacing.l,
        alignSelf: 'center',
    }
});

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  visible,
  onDismiss,
  category,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // No renderizar si no hay categoría o no es visible
  if (!visible || !category) {
    return null;
  }

  const handleEdit = () => {
    onEdit(category);
  };

  const handleDelete = () => {
    onDelete(category.id);
  };

  return (
    <Portal>
      <Modal
        visible={visible} // Controlado por la prop
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalSurface}
      >
        <Surface style={styles.modalSurface}>
          <>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              {category.name}
            </Text>
            <View style={styles.detailContent}>
              <AutoImage
                source={category.photo?.path} // Pasar path directamente
                placeholder={require('../../../../assets/icon.png')}
                style={styles.detailImage}
                contentFit="contain" // AutoImage acepta contentFit
                transition={300} // AutoImage acepta transition
                // useCache es true por defecto
              />
              <Text style={styles.detailText}>
                {category.description || 'Sin descripción'}
              </Text>
              <Chip
                icon={category.isActive ? 'check-circle' : 'close-circle'}
                selectedColor={
                  category.isActive ? theme.colors.success : theme.colors.error
                }
                style={{
                  backgroundColor: category.isActive
                    ? theme.colors.successContainer
                    : theme.colors.errorContainer,
                }}
              >
                {category.isActive ? 'Activa' : 'Inactiva'}
              </Chip>
            </View>
            <View style={styles.detailActions}>
              <Button
                icon="pencil"
                mode="contained"
                onPress={handleEdit}
                disabled={isDeleting}
              >
                Editar
              </Button>
              <Button
                icon="delete"
                mode="contained"
                buttonColor={theme.colors.error}
                textColor={theme.colors.onError}
                onPress={handleDelete}
                loading={isDeleting}
                disabled={isDeleting}
              >
                Eliminar
              </Button>
              {/* TODO: Añadir navegación a subcategorías aquí si es necesario */}
            </View>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.closeButton}
              disabled={isDeleting}
            >
              Cerrar
            </Button>
          </>
        </Surface>
      </Modal>
    </Portal>
  );
};

export default CategoryDetailModal;