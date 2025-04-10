import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  Modal,
  Portal,
  Surface,
  Text,
  Button,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import AutoImage from "../common/AutoImage"; // Ajustar ruta
import { useAppTheme, AppTheme } from "../../styles/theme"; // Ajustar ruta

// Configuración para mostrar un campo específico
interface DisplayFieldConfig<TItem> {
  field: keyof TItem;
  label: string;
  render?: (value: TItem[keyof TItem], item: TItem) => React.ReactNode; // Función de renderizado personalizada
}

// Configuración para el chip de estado (reutilizada)
interface StatusConfig<TItem> {
  field: keyof TItem;
  activeValue: any;
  activeLabel: string;
  inactiveLabel: string;
}

interface GenericDetailModalProps<TItem extends { id: string }> {
  visible: boolean;
  onDismiss: () => void;
  item: TItem | null;
  titleField: keyof TItem; // Campo para el título principal
  imageField?: keyof TItem; // Campo opcional para la imagen
  descriptionField?: keyof TItem; // Campo opcional para la descripción principal
  statusConfig?: StatusConfig<TItem>; // Configuración opcional para el chip de estado
  fieldsToDisplay?: DisplayFieldConfig<TItem>[]; // Campos adicionales a mostrar
  onEdit?: (item: TItem) => void; // Hacer opcional si no siempre se edita
  onDelete?: (id: string) => void; // Hacer opcional si no siempre se elimina
  isDeleting?: boolean;
  editButtonLabel?: string;
  deleteButtonLabel?: string;
  closeButtonLabel?: string;
  // Estilos opcionales
  modalStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  imageStyle?: StyleProp<any>;
  descriptionStyle?: StyleProp<TextStyle>;
  fieldLabelStyle?: StyleProp<TextStyle>;
  fieldValueStyle?: StyleProp<TextStyle>;
  actionsContainerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode; // Para contenido adicional
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalSurface: {
      padding: theme.spacing.l,
      margin: theme.spacing.l,
      borderRadius: theme.roundness * 2,
      elevation: 4,
      backgroundColor: theme.colors.elevation.level2,
    },
    modalTitle: {
      marginBottom: theme.spacing.m,
      textAlign: "center",
    },
    detailContent: {
      alignItems: "center",
      marginBottom: theme.spacing.m,
    },
    detailImage: {
      width: 150, // Tamaño más genérico
      height: 150,
      borderRadius: theme.roundness,
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.outlineVariant,
    },
    detailDescription: {
      marginBottom: theme.spacing.m, // Más espacio si hay campos debajo
      textAlign: "center",
    },
    statusChipContainer: {
      marginBottom: theme.spacing.m,
    },
    fieldsContainer: {
      width: "100%",
      marginBottom: theme.spacing.m,
    },
    fieldRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.s,
      paddingHorizontal: theme.spacing.m, // Algo de padding
    },
    fieldLabel: {
      fontWeight: "bold",
      marginRight: theme.spacing.s,
      color: theme.colors.onSurfaceVariant,
    },
    fieldValue: {
      flexShrink: 1, // Permitir que el valor se ajuste
      textAlign: "right",
      color: theme.colors.onSurface,
    },
    detailActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: theme.spacing.l,
      width: "100%",
    },
    closeButton: {
      marginTop: theme.spacing.l,
      alignSelf: "center",
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      minHeight: 200, // Altura mínima para el spinner
    },
  });

const GenericDetailModal = <TItem extends { id: string }>({
  visible,
  onDismiss,
  item,
  titleField,
  imageField,
  descriptionField,
  statusConfig,
  fieldsToDisplay = [], // Default a array vacío
  onEdit,
  onDelete,
  isDeleting = false,
  editButtonLabel = "Editar",
  deleteButtonLabel = "Eliminar",
  closeButtonLabel = "Cerrar",
  modalStyle,
  titleStyle,
  imageStyle,
  descriptionStyle,
  fieldLabelStyle,
  fieldValueStyle,
  actionsContainerStyle,
  children,
}: GenericDetailModalProps<TItem>) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const handleEdit = () => {
    // Asegurarse que onEdit existe y item no es null antes de llamar
    if (onEdit && item) {
      onEdit(item);
    }
  };

  const handleDelete = () => {
    // Asegurarse que onDelete existe y item no es null antes de llamar
    if (onDelete && item) {
      onDelete(item.id);
    }
  };

  // Contenido del modal
  const renderContent = () => {
    if (!item) {
      // Podríamos mostrar un spinner si visible es true pero item es null (cargando)
      // O simplemente no mostrar nada o un mensaje. Por ahora, spinner.
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" />
        </View>
      );
    }

    const title = String(item[titleField] ?? "Detalle");
    // Verificar que imageField existe y que item tiene esa propiedad
    const imageSource =
      imageField && item.hasOwnProperty(imageField)
        ? (item[imageField] as string | undefined)
        : undefined;
    // Verificar que descriptionField existe y que item tiene esa propiedad
    const description =
      descriptionField && item.hasOwnProperty(descriptionField)
        ? String(item[descriptionField] ?? "")
        : null;

    // Renderizar Chip de Estado
    let statusChip = null;
    // Verificar que statusConfig existe y que item tiene la propiedad field definida en statusConfig
    if (statusConfig && item.hasOwnProperty(statusConfig.field)) {
      const { field, activeValue, activeLabel, inactiveLabel } = statusConfig;
      const isActive = item[field] === activeValue;
      statusChip = (
        <View style={styles.statusChipContainer}>
          <Chip
            icon={isActive ? "check-circle" : "close-circle"}
            selectedColor={isActive ? theme.colors.success : theme.colors.error}
            style={{
              backgroundColor: isActive
                ? theme.colors.successContainer
                : theme.colors.errorContainer,
            }}
          >
            {isActive ? activeLabel : inactiveLabel}
          </Chip>
        </View>
      );
    }

    return (
      <>
        <Text variant="headlineSmall" style={[styles.modalTitle, titleStyle]}>
          {title}
        </Text>
        <View style={styles.detailContent}>
          {/* Usar && para renderizado condicional */}
          {imageSource && (
            <AutoImage
              source={imageSource}
              placeholder={require("../../../../assets/icon.png")}
              style={[styles.detailImage, imageStyle]}
              contentFit="contain"
              transition={300}
            />
          )}
          {description && (
            <Text style={[styles.detailDescription, descriptionStyle]}>
              {description}
            </Text>
          )}
          {statusChip}
        </View>

        {/* Campos Adicionales */}
        {/* Usar && para renderizado condicional */}
        {fieldsToDisplay.length > 0 && (
          <View style={styles.fieldsContainer}>
            {fieldsToDisplay.map(({ field, label, render }) => {
              // Asegurarse que item no es null y tiene la propiedad
              if (!item || !item.hasOwnProperty(field)) return null;
              const value = item[field];
              return (
                <View key={String(field)} style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, fieldLabelStyle]}>
                    {label}:
                  </Text>
                  {render ? (
                    render(value, item) // Usar renderizador personalizado
                  ) : (
                    <Text style={[styles.fieldValue, fieldValueStyle]}>
                      {/* Mostrar booleanos como Sí/No, formatear fechas, etc. */}
                      {typeof value === "boolean"
                        ? value
                          ? "Sí"
                          : "No"
                        : String(value ?? "N/A")}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Contenido Adicional */}
        {children}

        {/* Acciones */}
        {/* Usar && para renderizado condicional */}
        {(onEdit || onDelete) && (
          <View style={[styles.detailActions, actionsContainerStyle]}>
            {/* Usar && para renderizado condicional */}
            {onEdit && (
              <Button
                icon="pencil"
                mode="contained"
                onPress={handleEdit}
                disabled={isDeleting}
              >
                {editButtonLabel}
              </Button>
            )}
            {/* Usar && para renderizado condicional */}
            {onDelete && (
              <Button
                icon="delete"
                mode="contained"
                buttonColor={theme.colors.error}
                textColor={theme.colors.onError}
                onPress={handleDelete}
                loading={isDeleting}
                disabled={isDeleting}
              >
                {deleteButtonLabel}
              </Button>
            )}
          </View>
        )}

        <Button
          mode="outlined"
          onPress={onDismiss}
          style={styles.closeButton}
          disabled={isDeleting}
        >
          {closeButtonLabel}
        </Button>
      </>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalSurface, modalStyle]}
        dismissable={!isDeleting} // No cerrar si se está eliminando
      >
        {/* Usar Surface aquí puede ser redundante si contentContainerStyle ya lo define */}
        <Surface style={[styles.modalSurface, modalStyle]} elevation={0}>
          {renderContent()}
        </Surface>
      </Modal>
    </Portal>
  );
};

export default GenericDetailModal;
