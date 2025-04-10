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
  Surface,
  Text,
  TextInput,
  Button,
  Switch,
  HelperText,
  ActivityIndicator,
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
} from "react-hook-form"; // Importar Control
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodSchema } from "zod";
import { useAppTheme, AppTheme } from "../../styles/theme"; // Ajustar ruta
import CustomImagePicker from "../common/CustomImagePicker"; // Ajustar ruta
import {
  ImageUploadService,
  EntityWithOptionalPhoto,
} from "../../lib/imageUploadService"; // Ajustar ruta

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
  required?: boolean; // Solo para UI, Zod maneja la validación
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
    editingItem: TItem | null | undefined // Aceptar TItem, null, o undefined
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
  initialValues?: DeepPartial<TFormData>; // Usar DeepPartial para valores iniciales
  editingItem: TItem | null;
  isSubmitting: boolean;
  modalTitle: (isEditing: boolean) => string;
  submitButtonLabel?: (isEditing: boolean) => string;
  cancelButtonLabel?: string;
  modalStyle?: StyleProp<ViewStyle>;
  formContainerStyle?: StyleProp<ViewStyle>;
}

// Función helper para obtener valor por defecto según tipo (definida fuera del componente)
const getDefaultValueForType = (type: FieldType): any => {
  switch (type) {
    case "text":
    case "textarea":
    case "email":
    case "password":
      return "";
    case "number":
      return null; // o 0 según la lógica de negocio
    case "switch":
      return false; // o true según la lógica
    default:
      return undefined;
  }
};

// Estilos
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalSurface: {
      padding: theme.spacing.l,
      margin: theme.spacing.l,
      borderRadius: theme.roundness * 2,
      elevation: 4,
      backgroundColor: theme.colors.elevation.level2,
      maxHeight: "90%",
    },
    scrollViewContent: {
      paddingBottom: theme.spacing.l,
    },
    modalTitle: {
      marginBottom: theme.spacing.m,
      textAlign: "center",
    },
    input: {
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.surface,
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.m,
      paddingVertical: theme.spacing.s,
    },
    imagePickerContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.m,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: theme.spacing.l,
      paddingTop: theme.spacing.m,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.outlineVariant,
    },
    formButton: {},
    cancelButton: {
      marginRight: theme.spacing.s,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: theme.roundness * 2,
      zIndex: 10,
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
    // Usar DefaultValues<TFormData> para el tipo de retorno de useMemo
    defaultValues: useMemo((): DefaultValues<TFormData> => {
      const defaults = formFields.reduce((acc, field) => {
        (acc as any)[field.name] =
          field.defaultValue ?? getDefaultValueForType(field.type);
        return acc;
      }, {} as DefaultValues<TFormData>);
      // Sobrescribir con initialValues si existen (asegurarse que initialValues sea compatible)
      return { ...defaults, ...(initialValues as DefaultValues<TFormData>) };
    }, [formFields, initialValues]),
  });

  // Observar el campo de URI de imagen si está configurado
  const watchedImageUri = imagePickerConfig
    ? watch(imagePickerConfig.imageUriField)
    : undefined;
  // Asegurar que currentImageUri sea string | null
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
      // Pasar el tipo correcto a reset
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
      const currentUriForLogic = currentImageUri; // string | null

      // 1. Determinar acción sobre la foto
      const determineFn =
        imagePickerConfig.determineFinalPhotoId ??
        ImageUploadService.determinePhotoId;

      let photoAction: string | null | undefined;
      if (determineFn === ImageUploadService.determinePhotoId) {
        // Llama a la función por defecto, pasando EntityWithOptionalPhoto | undefined
        photoAction = ImageUploadService.determinePhotoId(
          currentUriForLogic,
          // Cast explícito para asegurar que pasamos el tipo correcto o undefined
          editingItem as EntityWithOptionalPhoto | undefined
        );
      } else {
        // Llama a la función personalizada, pasando TItem | null | undefined
        photoAction = determineFn(currentUriForLogic, editingItem ?? undefined);
      }

      // 2. Subir si es una nueva imagen local
      // Usar && y verificar que currentUriForLogic no sea null
      // Primero, aseguramos que es una cadena
      if (typeof currentUriForLogic === "string") {
        // Ahora usamos la cadena verificada
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
          // Acceso seguro a onImageUpload ya que estamos dentro de if(imagePickerConfig)
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
              control={control as Control<FieldValues>} // Cast Control a tipo más genérico si es necesario
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
            {/* Usar && para renderizado condicional */}
            {errorMessage && (
              <HelperText type="error" visible={!!errorMessage}>
                {errorMessage}
              </HelperText>
            )}
          </View>
        );
      case "switch":
        return (
          <View key={String(fieldName)} style={styles.switchContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {fieldConfig.switchLabel ?? fieldConfig.label}
            </Text>
            <Controller
              name={fieldName}
              control={control as Control<FieldValues>} // Cast Control
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  disabled={isActuallySubmitting}
                  {...fieldConfig.switchProps}
                />
              )}
            />
            {/* Usar && para renderizado condicional */}
            {errorMessage && (
              <HelperText type="error" visible={!!errorMessage}>
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
        <Surface style={[styles.modalSurface, { padding: 0 }]} elevation={0}>
          <Text
            variant="headlineSmall"
            style={[styles.modalTitle, { marginTop: theme.spacing.l }]}
          >
            {modalTitle(isEditing)}
          </Text>

          {/* <ScrollView contentContainerStyle={styles.scrollViewContent}> */}
          <View
            style={[{ paddingHorizontal: theme.spacing.l }, formContainerStyle]}
          >
            {/* Image Picker (si está configurado) */}
            {/* Usar && y verificar imagePickerConfig */}
            {imagePickerConfig && (
              <View style={styles.imagePickerContainer}>
                <CustomImagePicker
                  value={currentImageUri} // Ya es string | null
                  onImageSelected={handleImageSelected}
                  onImageRemoved={handleImageRemoved}
                  isLoading={isInternalImageUploading}
                  disabled={isParentSubmitting}
                  // Acceso seguro a imagePickerSize
                  size={imagePickerConfig.imagePickerSize ?? 150}
                />
                {/* Usar && y verificar imagePickerConfig y el campo de error */}
                {errors[imagePickerConfig.imageUriField] && (
                  <HelperText
                    type="error"
                    visible={!!errors[imagePickerConfig.imageUriField]}
                  >
                    {(errors[imagePickerConfig.imageUriField] as any)?.message}
                  </HelperText>
                )}
              </View>
            )}

            {formFields.map(renderFormField)}
          </View>
          {/* </ScrollView> */}

          {/* Overlay de carga */}
          {/* Usar && para renderizado condicional */}
          {isActuallySubmitting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                animating={true}
                size="large"
                color={theme.colors.primary}
              />
            </View>
          )}

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.cancelButton}
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
        </Surface>
      </Modal>
    </Portal>
  );
};

export default GenericFormModal;
