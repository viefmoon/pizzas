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
      fontWeight: "700",
    },
    detailContent: {
      alignItems: "center",
      marginBottom: theme.spacing.m,
    },
    detailImage: {
      width: 180,
      height: 180,
      borderRadius: theme.roundness * 1.5,
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.surfaceDisabled,
    },
    detailDescription: {
      marginBottom: theme.spacing.m,
      textAlign: "center",
      lineHeight: 22,
    },
    statusChipContainer: {
      marginBottom: theme.spacing.m,
      marginTop: theme.spacing.s,
    },
    statusChip: {
      paddingHorizontal: theme.spacing.s,
      height: 36,
    },
    fieldsContainer: {
      width: "100%",
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
      padding: theme.spacing.m,
    },
    fieldRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.s,
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    lastFieldRow: {
      marginBottom: 0,
      borderBottomWidth: 0,
    },
    fieldLabel: {
      fontWeight: "600",
      marginRight: theme.spacing.s,
      color: theme.colors.onSurfaceVariant,
    },
    fieldValue: {
      flexShrink: 1,
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
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.surfaceVariant,
      minWidth: 120,
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      minHeight: 200,
    },
    actionButton: {
      borderRadius: theme.roundness,
      paddingHorizontal: theme.spacing.m,
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
  fieldsToDisplay = [],
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
    if (onEdit && item) {
      onEdit(item);
    }
  };

  const handleDelete = () => {
    if (onDelete && item) {
      onDelete(item.id);
    }
  };

  // Contenido del modal
  const renderContent = () => {
    if (!item) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" />
        </View>
      );
    }

    const title = String(item[titleField] ?? "Detalle");
    const imageSource =
      imageField && item.hasOwnProperty(imageField)
        ? (item[imageField] as string | undefined)
        : undefined;
    const description =
      descriptionField && item.hasOwnProperty(descriptionField)
        ? String(item[descriptionField] ?? "")
        : null;

    // Renderizar Chip de Estado mejorado
    let statusChip = null;
    if (statusConfig && item.hasOwnProperty(statusConfig.field)) {
      const { field, activeValue, activeLabel, inactiveLabel } = statusConfig;
      const isActive = item[field] === activeValue;
      statusChip = (
        <View style={styles.statusChipContainer}>
          <Chip
            // icon={isActive ? "check-circle" : "close-circle"} // Eliminado para evitar duplicado
            mode="flat" // Cambiado de outlined a flat
            // icon={isActive ? "check" : "close"} // Icono eliminado según solicitud
            selectedColor={
              isActive ? theme.colors.success : theme.colors.onSurfaceVariant
            } // Usar color success para activo
            style={[
              styles.statusChip,
              {
                backgroundColor: isActive
                  ? theme.colors.successContainer // Usar successContainer para fondo activo
                  : theme.colors.surfaceVariant,
              },
            ]}
            // elevated // Eliminado para un look más plano
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
          {imageSource && (
            <AutoImage
              source={imageSource}
              placeholder={require("../../../../assets/icon.png")}
              style={[styles.detailImage, imageStyle]}
              contentFit="contain"
              transition={300}
            />
          )}
          {statusChip}
          {description && (
            <Text style={[styles.detailDescription, descriptionStyle]}>
              {description}
            </Text>
          )}
        </View>

        {fieldsToDisplay.length > 0 && (
          <View style={styles.fieldsContainer}>
            {fieldsToDisplay.map(({ field, label, render }, index) => {
              if (!item || !item.hasOwnProperty(field)) return null;
              const value = item[field];
              const isLastItem = index === fieldsToDisplay.length - 1;

              return (
                <View
                  key={String(field)}
                  style={[styles.fieldRow, isLastItem && styles.lastFieldRow]}
                >
                  <Text style={[styles.fieldLabel, fieldLabelStyle]}>
                    {label}
                  </Text>
                  {render ? (
                    render(value, item)
                  ) : (
                    <Text style={[styles.fieldValue, fieldValueStyle]}>
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

        {children}

        {(onEdit || onDelete) && (
          <View style={[styles.detailActions, actionsContainerStyle]}>
            {onEdit && (
              <Button
                icon="pencil"
                mode="contained-tonal"
                onPress={handleEdit}
                disabled={isDeleting}
                style={[styles.actionButton]}
                buttonColor={theme.colors.secondaryContainer}
                textColor={theme.colors.onSecondaryContainer}
              >
                {editButtonLabel}
              </Button>
            )}
            {onDelete && (
              <Button
                icon="delete"
                mode="contained-tonal"
                buttonColor={theme.colors.errorContainer}
                textColor={theme.colors.error}
                onPress={handleDelete}
                loading={isDeleting}
                disabled={isDeleting}
                style={styles.actionButton}
              >
                {deleteButtonLabel}
              </Button>
            )}
          </View>
        )}

        <Button
          mode="contained-tonal"
          onPress={onDismiss}
          style={styles.closeButton}
          disabled={isDeleting}
          buttonColor={theme.colors.surfaceVariant}
          textColor={theme.colors.onSurfaceVariant}
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
        dismissable={!isDeleting}
      >
        <Surface style={[styles.modalSurface, { padding: 0 }]} elevation={0}>
          {renderContent()}
        </Surface>
      </Modal>
    </Portal>
  );
};

export default GenericDetailModal;
