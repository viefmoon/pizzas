import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  StyleProp,
  ViewStyle,
} from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Switch,
  HelperText,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import {
  useForm,
  Controller,
  SubmitHandler,
  FieldValues,
  Path,
  UseFormReturn,
  DeepPartial,
  DefaultValues,
  Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodSchema } from "zod";
import { useAppTheme, AppTheme } from "../../styles/theme";
import CustomImagePicker from "../common/CustomImagePicker";
import {
  ImageUploadService,
  EntityWithOptionalPhoto,
} from "../../lib/imageUploadService";

// Interfaz para el objeto FileObject
interface FileObject {
  uri: string;
  name: string;
  type: string;
}

// Tipos de campo soportados
type FieldType =
  | "text"
  | "textarea"
  | "switch"
  | "number"
  | "email"
  | "password";

// Configuración para cada campo del formulario
export interface FormFieldConfig<TFormData extends FieldValues> {
  name: Path<TFormData>;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  inputProps?: Partial<React.ComponentProps<typeof TextInput>>;
  switchProps?: Partial<React.ComponentProps<typeof Switch>>;
  numberOfLines?: number;
  switchLabel?: string;
}

// Configuración para el Image Picker (opcional)
export interface ImagePickerConfig<TFormData extends FieldValues, TItem> {
  imageUriField: Path<TFormData>;
  onImageUpload: (file: FileObject) => Promise<{ id: string } | null>;
  determineFinalPhotoId?: (
    currentImageUri: string | null,
    editingItem: TItem | null | undefined
  ) => string | null | undefined;
  imagePickerSize?: number;
}

interface GenericFormModalProps<
  TFormData extends FieldValues,
  TItem extends { id: string },
> {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (
    data: TFormData,
    photoId: string | null | undefined
  ) => Promise<void>;
  formSchema: ZodSchema<TFormData>;
  formFields: FormFieldConfig<TFormData>[];
  imagePickerConfig?: ImagePickerConfig<TFormData, TItem>;
  initialValues?: DeepPartial<TFormData>;
  editingItem: TItem | null;
  isSubmitting: boolean;
  modalTitle: (isEditing: boolean) => string;
  submitButtonLabel?: (isEditing: boolean) => string;
  cancelButtonLabel?: string;
  modalStyle?: StyleProp<ViewStyle>;
  formContainerStyle?: StyleProp<ViewStyle>;
}

// Función helper para obtener valor por defecto según tipo
const getDefaultValueForType = (type: FieldType): any => {
  switch (type) {
    case "text":
    case "textarea":
    case "email":
    case "password":
      return "";
    case "number":
      return null;
    case "switch":
      return false;
    default:
      return undefined;
  }
};

// Estilos
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalSurface: {
      padding: 0,
      margin: theme.spacing.l,
      borderRadius: theme.roundness * 2,
      elevation: 4,
      backgroundColor: theme.colors.background,
      maxHeight: "90%",
      overflow: "hidden",
    },
    modalHeader: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.l,
    },
    formContainer: {
      maxHeight: "100%",
    },
    scrollViewContent: {
      padding: theme.spacing.l,
      paddingBottom: theme.spacing.xl,
    },
    modalTitle: {
      color: theme.colors.onPrimary,
      fontWeight: "700",
      textAlign: "center",
    },
    input: {
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
      paddingHorizontal: theme.spacing.m,
    },
    switchLabel: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: "500",
    },
    imagePickerContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.l,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.l,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surface,
    },
    formButton: {
      borderRadius: theme.roundness,
      paddingHorizontal: theme.spacing.s,
    },
    cancelButton: {
      marginRight: theme.spacing.m,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: theme.roundness * 2,
      zIndex: 10,
    },
    helperText: {
      marginTop: -theme.spacing.s,
      marginBottom: theme.spacing.s,
    },
  });

const GenericFormModal = <
  TFormData extends FieldValues,
  TItem extends { id: string },
>({
  visible,
  onDismiss,
  onSubmit,
  formSchema,
  formFields,
  imagePickerConfig,
  initialValues,
  editingItem,
  isSubmitting: isParentSubmitting,
  modalTitle,
  submitButtonLabel = (isEditing: boolean) =>
    isEditing ? "Guardar Cambios" : "Crear",
  cancelButtonLabel = "Cancelar",
  modalStyle,
  formContainerStyle,
}: GenericFormModalProps<TFormData, TItem>) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [isInternalImageUploading, setIsInternalImageUploading] =
    useState(false);
  const [selectedFileObject, setSelectedFileObject] =
    useState<FileObject | null>(null);

  const isEditing = !!editingItem;
  const isActuallySubmitting = isParentSubmitting || isInternalImageUploading;

  // Configuración de react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  }: UseFormReturn<TFormData> = useForm<TFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo((): DefaultValues<TFormData> => {
      const defaults = formFields.reduce((acc, field) => {
        (acc as any)[field.name] =
          field.defaultValue ?? getDefaultValueForType(field.type);
        return acc;
      }, {} as DefaultValues<TFormData>);
      return { ...defaults, ...(initialValues as DefaultValues<TFormData>) };
    }, [formFields, initialValues]),
  });

  // Observar el campo de URI de imagen si está configurado
  const watchedImageUri = imagePickerConfig
    ? watch(imagePickerConfig.imageUriField)
    : undefined;
  const currentImageUri =
    typeof watchedImageUri === "string" ? watchedImageUri : null;

  // Resetear formulario
  useEffect(() => {
    if (visible) {
      const defaults = formFields.reduce((acc, field) => {
        (acc as any)[field.name] =
          field.defaultValue ?? getDefaultValueForType(field.type);
        return acc;
      }, {} as DefaultValues<TFormData>);
      reset({ ...defaults, ...(initialValues as DefaultValues<TFormData>) });
      setSelectedFileObject(null);
      setIsInternalImageUploading(false);
    }
  }, [visible, initialValues, reset, formFields]);

  // Callbacks para CustomImagePicker
  const handleImageSelected = useCallback(
    (uri: string, file: FileObject) => {
      if (imagePickerConfig) {
        setValue(imagePickerConfig.imageUriField, uri as any, {
          shouldValidate: true,
        });
        setSelectedFileObject(file);
      }
    },
    [setValue, imagePickerConfig]
  );

  const handleImageRemoved = useCallback(() => {
    if (imagePickerConfig) {
      setValue(imagePickerConfig.imageUriField, null as any, {
        shouldValidate: true,
      });
      setSelectedFileObject(null);
    }
  }, [setValue, imagePickerConfig]);

  // Lógica de submit
  const processSubmit: SubmitHandler<TFormData> = async (formData) => {
    if (isActuallySubmitting) return;

    let finalPhotoId: string | null | undefined = undefined;

    // --- Manejo de Imagen (si está configurado) ---
    if (imagePickerConfig) {
      const currentUriForLogic = currentImageUri;

      // 1. Determinar acción sobre la foto
      const determineFn =
        imagePickerConfig.determineFinalPhotoId ??
        ImageUploadService.determinePhotoId;

      let photoAction: string | null | undefined;
      if (determineFn === ImageUploadService.determinePhotoId) {
        photoAction = ImageUploadService.determinePhotoId(
          currentUriForLogic,
          editingItem as EntityWithOptionalPhoto | undefined
        );
      } else {
        photoAction = determineFn(currentUriForLogic, editingItem ?? undefined);
      }

      // 2. Subir si es una nueva imagen local
      if (typeof currentUriForLogic === "string") {
        if ((currentUriForLogic as string).startsWith("file://")) {
          if (!selectedFileObject) {
            Alert.alert(
              "Error",
              "Faltan datos del archivo de imagen seleccionado."
            );
            return;
          }
          setIsInternalImageUploading(true);
          try {
            const uploadResult =
              await imagePickerConfig.onImageUpload(selectedFileObject);
            if (uploadResult?.id) {
              finalPhotoId = uploadResult.id;
            } else {
              setIsInternalImageUploading(false);
              return;
            }
          } catch (error) {
            console.error("Error subiendo imagen:", error);
            Alert.alert("Error", "No se pudo subir la imagen.");
            setIsInternalImageUploading(false);
            return;
          } finally {
            setIsInternalImageUploading(false);
          }
        }
      } else {
        finalPhotoId = photoAction;
      }
    }

    // 3. Llamar al onSubmit principal
    await onSubmit(formData, finalPhotoId);
  };

  // Renderizar campo individual
  const renderFormField = (fieldConfig: FormFieldConfig<TFormData>) => {
    const fieldName = fieldConfig.name;
    const errorMessage = (errors[fieldName] as any)?.message;

    switch (fieldConfig.type) {
      case "textarea":
      case "text":
      case "number":
      case "email":
      case "password":
        return (
          <View key={String(fieldName)}>
            <Controller
              name={fieldName}
              control={control as Control<FieldValues>}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label={fieldConfig.label}
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  style={styles.input}
                  placeholder={fieldConfig.placeholder}
                  secureTextEntry={fieldConfig.type === "password"}
                  keyboardType={
                    fieldConfig.type === "number"
                      ? "numeric"
                      : fieldConfig.type === "email"
                        ? "email-address"
                        : "default"
                  }
                  multiline={fieldConfig.type === "textarea"}
                  numberOfLines={
                    fieldConfig.numberOfLines ??
                    (fieldConfig.type === "textarea" ? 3 : 1)
                  }
                  error={!!errorMessage}
                  disabled={isActuallySubmitting}
                  {...fieldConfig.inputProps}
                />
              )}
            />
            {errorMessage && (
              <HelperText
                type="error"
                visible={!!errorMessage}
                style={styles.helperText}
              >
                {errorMessage}
              </HelperText>
            )}
          </View>
        );
      case "switch":
        return (
          <View key={String(fieldName)}>
            <View style={styles.switchContainer}>
              <Text variant="bodyLarge" style={styles.switchLabel}>
                {fieldConfig.switchLabel ?? fieldConfig.label}
              </Text>
              <Controller
                name={fieldName}
                control={control as Control<FieldValues>}
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    disabled={isActuallySubmitting}
                    {...fieldConfig.switchProps}
                  />
                )}
              />
            </View>
            {errorMessage && (
              <HelperText
                type="error"
                visible={!!errorMessage}
                style={styles.helperText}
              >
                {errorMessage}
              </HelperText>
            )}
          </View>
        );
      default:
        console.warn(`Tipo de campo no soportado: ${fieldConfig.type}`);
        return null;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalSurface, modalStyle]}
        dismissable={!isActuallySubmitting}
      >
        <View style={styles.formContainer}>
          {/* Cabecera del modal */}
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {modalTitle(isEditing)}
            </Text>
          </View>

          {/* Contenido del formulario */}
          <ScrollView
            contentContainerStyle={[
              styles.scrollViewContent,
              formContainerStyle,
            ]}
          >
            {/* Image Picker */}
            {imagePickerConfig && (
              <View style={styles.imagePickerContainer}>
                <CustomImagePicker
                  value={currentImageUri}
                  onImageSelected={handleImageSelected}
                  onImageRemoved={handleImageRemoved}
                  isLoading={isInternalImageUploading}
                  disabled={isParentSubmitting}
                  size={imagePickerConfig.imagePickerSize ?? 180}
                />
                {errors[imagePickerConfig.imageUriField] && (
                  <HelperText
                    type="error"
                    visible={!!errors[imagePickerConfig.imageUriField]}
                    style={styles.helperText}
                  >
                    {(errors[imagePickerConfig.imageUriField] as any)?.message}
                  </HelperText>
                )}
              </View>
            )}

            {formFields.map(renderFormField)}
          </ScrollView>

          {/* Overlay de carga */}
          {isActuallySubmitting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                animating={true}
                size="large"
                color={theme.colors.primary}
              />
            </View>
          )}

          {/* Acciones */}
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={[styles.formButton, styles.cancelButton]}
              disabled={isActuallySubmitting}
            >
              {cancelButtonLabel}
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(processSubmit)}
              loading={isActuallySubmitting}
              disabled={isActuallySubmitting}
              style={styles.formButton}
            >
              {submitButtonLabel(isEditing)}
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

export default GenericFormModal;
