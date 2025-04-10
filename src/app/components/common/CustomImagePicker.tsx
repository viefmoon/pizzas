import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Avatar, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image'; // Importar Image directamente
import { AppTheme } from '../../styles/theme';

export interface FileObject {
  uri: string;
  name: string;
  type: string;
}

interface CustomImagePickerProps {
  value?: string | null; // La URI de la imagen (local o remota)
  onImageSelected?: (imageUri: string, file: FileObject) => void; // Devuelve URI y objeto FileObject
  onImageRemoved?: () => void; // Se llama cuando se quita la imagen
  style?: object;
  size?: number;
  placeholderIcon?: string;
  placeholderText?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export const CustomImagePicker: React.FC<CustomImagePickerProps> = ({
  value,
  onImageSelected,
  onImageRemoved,
  style,
  size = 150,
  placeholderIcon = "camera-plus-outline",
  placeholderText = "Añadir imagen",
  isLoading = false,
  disabled = false,
}) => {
  const theme = useTheme<AppTheme>();
  const [imageUri, setImageUri] = useState<string | null | undefined>(value);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch {
        setHasPermission(false);
      }
    })();
  }, []);

  // Función para solicitar permisos si no se tienen
  const requestPermission = async (): Promise<boolean> => {
    if (hasPermission) return true;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        return true;
      } else {
        Alert.alert("Permiso requerido", "Se necesita acceso a la galería para seleccionar imágenes.");
        setHasPermission(false);
        return false;
      }
    } catch (e) {
      Alert.alert("Error", "No se pudieron solicitar los permisos de la galería.");
      setHasPermission(false);
      return false;
    }
  };

  // Manejador para abrir la galería
  const handlePickImage = async () => {
    if (isLoading || disabled) return;

    const permissionGranted = await requestPermission();
    if (!permissionGranted) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', // Usar el valor literal de cadena según el tipo MediaType
        allowsEditing: true,
        aspect: [1, 1], // Forzar cuadrado
        quality: 0.8, // Reducir calidad para optimizar tamaño
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const selectedUri = selectedAsset.uri;
        const fileName = selectedUri.split('/').pop() || 'image.jpg';
        // Determinar mimeType de forma más robusta si es posible
        const fileType = selectedAsset.mimeType || (fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');

        const fileObject: FileObject = {
          uri: selectedUri,
          name: fileName,
          type: fileType,
        };
        setImageUri(selectedUri); // Actualizar UI localmente
        onImageSelected?.(selectedUri, fileObject); // Notificar al padre
      }
    } catch (error) {
      Alert.alert("Error", `No se pudo abrir la galería: ${error instanceof Error ? error.message : 'Inténtalo de nuevo.'}`);
    }
  };

  // Manejador para quitar la imagen seleccionada
  const handleRemoveImage = () => {
    if (isLoading || disabled) return;
    setImageUri(null);
    onImageRemoved?.(); // Notificar al padre
  };

  // Estilos dinámicos basados en el tema
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: theme.roundness * 1.5, // Más redondeado
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative', // Para el botón de borrar
      backgroundColor: theme.colors.surfaceVariant, // Color de fondo placeholder
    },
    touchable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.s,
    },
    placeholderText: {
      marginTop: theme.spacing.xs,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.roundness * 1.5,
    },
    removeButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo semitransparente
    }
  });

  return (
    <Surface style={[styles.container, style]} elevation={1}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePickImage}
        disabled={isLoading || disabled}
      >
        {imageUri ? (
          // Usar Image de expo-image directamente para depurar
          <Image
            source={{ uri: imageUri }} // Asegurar que imageUri es string aquí
            style={styles.image}
            contentFit="cover"
            // Placeholder básico mientras carga (opcional para expo-image)
            placeholder={require('../../../../assets/icon.png')} // Re-añadir placeholder básico si se desea
          />
        ) : (
          // Mostrar placeholder si no hay imagen
          <View style={styles.placeholderContainer}>
            <Avatar.Icon
              size={size * 0.4}
              icon={placeholderIcon}
              style={{backgroundColor: 'transparent'}}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.placeholderText} variant="bodySmall">{placeholderText}</Text>
          </View>
        )}

        {/* Overlay de carga */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

         {/* Botón para remover la imagen (solo si hay imagen y no está cargando/deshabilitado) */}
         {imageUri && !isLoading && !disabled && (
            <IconButton
                icon="close-circle" // Icono de 'x' en círculo
                size={24}
                iconColor={theme.colors.onErrorContainer} // Color rojo claro para el icono
                style={styles.removeButton}
                onPress={handleRemoveImage}
                rippleColor="rgba(255, 255, 255, 0.32)" // Efecto ripple blanco
                />
         )}
      </TouchableOpacity>
    </Surface>
  );
};

export default CustomImagePicker;