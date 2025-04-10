import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
  Button,
  Switch,
  HelperText,
} from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Quitar ImagePicker y Image de expo
import { useAppTheme, AppTheme } from '../../../app/styles/theme';
import CustomImagePicker from '../../../app/components/common/CustomImagePicker'; // Importar el nuevo picker
import { ImageUploadService } from '../../../app/lib/imageUploadService'; // Importar el servicio
// Importar FileObject o definirla aquí si no está en un archivo compartido
// Asumiendo que la definimos en CategoriesScreen y necesitamos importarla o redefinirla
interface FileObject {
  uri: string;
  name: string;
  type: string;
}
import {
  CategoryFormData,
  categoryFormSchema,
  Category,
} from '../types/category.types';

interface CategoryFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  // onSubmit ahora recibe formData y la decisión sobre photoId
  onSubmit: (data: CategoryFormData, photoId: string | null | undefined) => Promise<void>;
  initialValues?: Partial<CategoryFormData>;
  isSubmitting: boolean; // Estado de carga general (mutaciones)
  editingCategory: Category | null;
  // Función para manejar la subida de imagen, ahora espera FileObject
  onImageUpload: (file: FileObject) => Promise<{ id: string } | null>;
}

// Definición de estilos (similar a los del modal en CategoriesScreen)
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
    input: {
        marginBottom: theme.spacing.m,
        backgroundColor: theme.colors.surface,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.m,
        paddingVertical: theme.spacing.s,
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    imagePreview: {
        width: 150,
        height: 150,
        borderRadius: theme.roundness,
        marginBottom: theme.spacing.s,
        backgroundColor: theme.colors.outlineVariant,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: theme.spacing.l,
    },
    formButton: {
        // Quitado marginTop: theme.spacing.s; para que esté alineado
    },
    cancelButton: {
        marginRight: theme.spacing.s,
    },
});


const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  initialValues,
  isSubmitting: isParentSubmitting, // Renombrado para claridad
  editingCategory,
  onImageUpload,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  // Estado local para la carga específica de la imagen dentro del modal
  const [isInternalImageUploading, setIsInternalImageUploading] = useState(false);
  // Estado local para guardar el objeto FileObject cuando se selecciona una nueva imagen
  const [selectedFileObject, setSelectedFileObject] = useState<FileObject | null>(null);

  // Estado de carga combinado para deshabilitar UI
  const isActuallySubmitting = isParentSubmitting || isInternalImageUploading;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    // Valores por defecto iniciales, sobreescritos por initialValues si existen
    defaultValues: {
      name: '',
      description: null,
      isActive: true,
      imageUri: null,
    },
  });

  const currentImageUri = watch('imageUri');

  // Efecto para resetear/inicializar el formulario cuando cambia la visibilidad o los datos iniciales
  useEffect(() => {
    if (visible) {
      // Resetea con los valores iniciales (o los defaults si initialValues es undefined)
      reset({
        name: initialValues?.name ?? '',
        description: initialValues?.description ?? null,
        isActive: initialValues?.isActive ?? true,
        imageUri: initialValues?.imageUri ?? null,
      });
      // Limpiar el file object seleccionado al abrir/resetear
      setSelectedFileObject(null);
    }
    // No reseteamos al cerrar para mantener los datos si se reabre rápido,
    // el reset al abrir con nuevos initialValues es suficiente.
  }, [visible, initialValues, reset]);


  // Eliminar handleImagePick, CustomImagePicker lo maneja internamente

  // Callbacks para CustomImagePicker
  const handleImageSelected = (uri: string, file: FileObject) => {
      setValue('imageUri', uri, { shouldValidate: true });
      setSelectedFileObject(file);
  };

  const handleImageRemoved = () => {
      setValue('imageUri', null);
      setSelectedFileObject(null);
  };

  // Manejador interno que se llama al presionar el botón de guardar/crear
  const processSubmit: SubmitHandler<CategoryFormData> = async (formData) => {
    if (isActuallySubmitting) return; // Prevenir doble submit

    let finalPhotoId: string | null | undefined = undefined; // Valor final para el DTO

    // 1. Determinar la acción sobre la foto usando ImageUploadService
    // Pasamos la URI del formulario (asegurando que sea string o null) y la entidad existente
    const photoAction = ImageUploadService.determinePhotoId(formData.imageUri ?? null, editingCategory ?? undefined);
    // photoAction será: undefined (mantener/nueva), null (quitar)

    // 2. Subir imagen si es necesario (si se seleccionó una nueva)
    if (formData.imageUri && formData.imageUri.startsWith('file://')) {
        if (!selectedFileObject) {
            Alert.alert("Error", "Se seleccionó una nueva imagen pero faltan los datos del archivo.");
            return; // Detener si falta el objeto
        }
        setIsInternalImageUploading(true);
        try {
            // Llamar a la prop onImageUpload (que viene de CategoriesScreen y usa ImageUploadService.uploadImage)
            const uploadResult = await onImageUpload(selectedFileObject);
            if (uploadResult && uploadResult.id) {
                finalPhotoId = uploadResult.id; // Usar el ID de la imagen recién subida
            } else {
                // La subida falló (onImageUpload devolvió null o error)
                // El error ya debería haberse mostrado o logueado en onImageUpload
                setIsInternalImageUploading(false);
                return; // No continuar si la subida falla
            }
        } catch (error) {
             // Manejo adicional por si acaso onImageUpload lanza una excepción no capturada
             console.error("Error inesperado durante onImageUpload:", error);
             Alert.alert("Error", "No se pudo subir la imagen.");
             setIsInternalImageUploading(false);
             return;
        } finally {
            setIsInternalImageUploading(false);
        }
    } else {
        // Si no se subió una nueva imagen, usar la acción determinada por determinePhotoId
        finalPhotoId = photoAction;
    }

    // 2. Llamar a la prop onSubmit pasada desde CategoriesScreen
    //    con los datos del formulario y el ID final determinado.
    await onSubmit(formData, finalPhotoId);
  };


  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss} // Usa la prop para cerrar
        contentContainerStyle={styles.modalSurface}
        // Evitar cierre al tocar fuera si está cargando? Podría ser útil.
        // dismissable={!isActuallySubmitting}
      >
        <Surface style={styles.modalSurface}>
          <Text variant="headlineSmall" style={styles.modalTitle}>
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </Text>

          {/* --- Image Picker --- */}
          <View style={styles.imagePickerContainer}>
             <CustomImagePicker
                value={currentImageUri}
                onImageSelected={handleImageSelected}
                onImageRemoved={handleImageRemoved}
                isLoading={isInternalImageUploading} // Usar estado de carga interno
                disabled={isParentSubmitting} // Deshabilitar si el form principal está enviando
                size={150} // Ajustar tamaño si es necesario
                // placeholderIcon="..." // Opcional
                // placeholderText="..." // Opcional
             />
          </View>

          {/* --- Form Fields --- */}
          {/* Campo Nombre */}
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Nombre"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                disabled={isActuallySubmitting}
              />
            )}
          />
          {errors.name && <HelperText type="error" visible={!!errors.name}>{errors.name.message}</HelperText>}

          {/* Campo Descripción */}
          <Controller
            name="description"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Descripción (Opcional)"
                value={value ?? ''} // Asegurar string vacío si es null
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
                error={!!errors.description}
                disabled={isActuallySubmitting}
              />
            )}
          />
          {errors.description && <HelperText type="error" visible={!!errors.description}>{errors.description.message}</HelperText>}

          {/* Switch Activo/Inactivo */}
          <Controller
            name="isActive"
            control={control}
            render={({ field: { onChange, value } }) => (
              // Añadir un contenedor para el label y el switch si es necesario
              <View style={styles.switchContainer}>
                 <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>Activa</Text>
                 <Switch
                    value={value} // El valor viene del form state
                    onValueChange={onChange} // Actualiza el form state
                    disabled={isActuallySubmitting}
                 />
              </View>
            )}
          />
          {/* No suele haber error para un boolean con default */}

          {/* --- Modal Actions --- */}
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={onDismiss} // Usa la prop para cerrar
              style={styles.cancelButton}
              disabled={isActuallySubmitting}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              // Llama al handleSubmit de react-hook-form, que valida y luego llama a processSubmit
              onPress={handleSubmit(processSubmit)}
              loading={isActuallySubmitting} // Muestra el spinner si carga imagen o envía form
              disabled={isActuallySubmitting}
              style={styles.formButton}
            >
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

export default CategoryFormModal;