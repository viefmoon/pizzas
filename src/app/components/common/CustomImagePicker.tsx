// src/app/components/common/CustomImagePicker.tsx (Adaptado con Paper)
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Button, Surface, Text, Avatar, IconButton, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { AppTheme } from '../../styles/theme'; // Ajusta la ruta si es necesario

// Interfaz para el objeto de archivo que se pasa al padre
export interface FileObject {
  uri: string;
  name: string;
  type: string;
}

interface CustomImagePickerProps {
  value?: string | null; // URI de la imagen actual o null
  onImageSelected?: (imageUri: string, file: FileObject) => void; // Pasa URI y FileObject
  onImageRemoved?: () => void; // Callback para cuando se quita la imagen
  style?: object;
  size?: number;
  placeholderIcon?: string;
  placeholderText?: string;
  isLoading?: boolean; // Para mostrar indicador de carga externo (ej. subiendo)
  disabled?: boolean; // Para deshabilitar la interacción
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
    setImageUri(value); // Actualizar cuando el valor externo cambie
  }, [value]);

  useEffect(() => {
    (async () => {
      try {
        // Verificar permisos existentes sin preguntar
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch {
        setHasPermission(false);
      }
    })();
  }, []);

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

  const handlePickImage = async () => {
    if (isLoading || disabled) return; // No hacer nada si está cargando o deshabilitado

    const permissionGranted = await requestPermission();
    if (!permissionGranted) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Mantener cuadrado, ajustar si es necesario
        quality: 0.8, // Calidad de compresión
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const selectedUri = selectedAsset.uri;
        const fileName = selectedUri.split('/').pop() || 'image.jpg';
        const fileType = selectedAsset.mimeType || (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg');

        const fileObject: FileObject = {
          uri: selectedUri,
          name: fileName,
          type: fileType,
        };
        setImageUri(selectedUri); // Actualiza preview local
        onImageSelected?.(selectedUri, fileObject); // Notifica al padre con URI y FileObject
      }
    } catch (error) {
      Alert.alert("Error", `No se pudo abrir la galería: ${error instanceof Error ? error.message : 'Inténtalo de nuevo.'}`);
    }
  };

  const handleRemoveImage = () => {
    if (isLoading || disabled) return; // No hacer nada si está cargando o deshabilitado
    setImageUri(null);
    onImageRemoved?.(); // Notifica al padre que se quitó
  };

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: theme.roundness, // Usar roundness del tema
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative', // Para posicionar el botón de eliminar
      backgroundColor: theme.colors.surfaceVariant, // Fondo placeholder
    },
    touchable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
      // Avatar.Image maneja su propio tamaño, no necesita width/height aquí
    },
    placeholderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.s, // Añadir padding interno
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
      borderRadius: theme.roundness, // Coincidir con el contenedor
    },
    removeButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo semitransparente para contraste
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
          <Avatar.Image size={size} source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Avatar.Icon size={size * 0.4} icon={placeholderIcon} style={{backgroundColor: 'transparent'}} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.placeholderText} variant="bodySmall">{placeholderText}</Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

         {imageUri && !isLoading && !disabled && (
            <IconButton
                icon="close-circle"
                size={24}
                iconColor={theme.colors.onErrorContainer} // Color que contraste bien
                style={styles.removeButton}
                onPress={handleRemoveImage}
                rippleColor="rgba(255, 255, 255, 0.32)" // Efecto ripple claro
                />
         )}
      </TouchableOpacity>
    </Surface>
  );
};

export default CustomImagePicker; // Exportar por defecto