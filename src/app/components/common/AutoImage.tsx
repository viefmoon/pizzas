// src/app/components/common/AutoImage.tsx (Adaptado con expo-image y caché)
import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, View, ActivityIndicator } from 'react-native';
import { Image, ImageProps as ExpoImageProps, ImageStyle } from 'expo-image'; // Importar ImageStyle
import { getCachedImageUri } from '../../lib/imageCache'; // Ajusta ruta si es necesario
import { getImageUrl } from '../../lib/imageUtils'; // Ajusta ruta si es necesario
import { StyleProp, ViewStyle } from 'react-native'; // Importar StyleProp y ViewStyle
import { useAppTheme } from '../../styles/theme'; // Ajusta ruta si es necesario

// Combinar props de ExpoImage y las nuestras
export interface AutoImageProps extends Omit<ExpoImageProps, 'source'> {
  source: string | null | undefined; // Espera solo la URL/path como string
  maxWidth?: number;
  maxHeight?: number;
  useCache?: boolean;
  placeholder?: ExpoImageProps['placeholder']; // Permitir pasar placeholder de expo-image
  // Añadir otras props de expo-image que quieras exponer, como contentFit, transition, etc.
  contentFit?: ExpoImageProps['contentFit'];
  transition?: ExpoImageProps['transition'];
}

// Hook para calcular dimensiones. Devolvemos números o undefined.
// El '100%' se manejará en el estilo de relleno de la imagen interna.
function useAutoImageSize(uri?: string, maxWidth?: number, maxHeight?: number): { width?: number, height?: number } {
    // Devolver dimensiones numéricas si se proporcionan, sino undefined.
    return { width: maxWidth, height: maxHeight };
}

export const AutoImage: React.FC<AutoImageProps> = ({
  source: originalSourceProp, // Renombrar para claridad
  maxWidth,
  maxHeight,
  useCache = true,
  style,
  placeholder,
  contentFit = 'cover', // Default a 'cover'
  transition = 300, // Default a 300ms
  ...restExpoImageProps // Resto de props para expo-image
}) => {
  const theme = useAppTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoadingUri, setIsLoadingUri] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false); // Para debug o lógica condicional

  // Hook para calcular tamaño (actualmente simplificado)
  const { width, height } = useAutoImageSize(imageUri ?? undefined, maxWidth, maxHeight);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingUri(true);
    setIsFromCache(false); // Resetear estado de caché

    // No procesar si la fuente original es null/undefined
    if (!originalSourceProp) {
         setImageUri(null);
         setIsLoadingUri(false);
         return;
    }

    // 1. Construir la URL completa si es una ruta relativa
    const fullRemoteUrl = getImageUrl(originalSourceProp); // Usa imageUtils

    // Si getImageUrl devuelve null (ej. API_URL no definida), no continuar
    if (!fullRemoteUrl) {
        console.warn(`[AutoImage] No se pudo construir la URL para: ${originalSourceProp}`);
        if (isMounted) {
            setImageUri(null);
            setIsLoadingUri(false);
        }
        return;
    }

    // 2. Intentar obtener del caché si está habilitado y no es web
    const attemptCache = async () => {
      if (useCache && Platform.OS !== 'web') {
        try {
          const cachedUri = await getCachedImageUri(fullRemoteUrl); // Usa imageUtils -> imageCache
          if (isMounted) {
            if (cachedUri && cachedUri.startsWith('file://')) {
              // console.log(`🖼️ [CACHE] Usando imagen en caché: ${originalSourceProp}`);
              setImageUri(cachedUri);
              setIsFromCache(true);
            } else {
              // No está en caché o hubo error, usar URL remota
              // console.log(`🌐 [CACHE] Imagen no encontrada en caché, usando remota: ${originalSourceProp}`);
              setImageUri(fullRemoteUrl);
               setIsFromCache(false); // Asegurar que no esté marcado como caché
            }
            setIsLoadingUri(false);
          }
        } catch (error) {
          console.error(`❌ [CACHE] Error obteniendo imagen (${originalSourceProp}):`, error);
          if (isMounted) {
            setImageUri(fullRemoteUrl); // Fallback a URL remota
            setIsLoadingUri(false);
             setIsFromCache(false); // Asegurar que no esté marcado como caché
          }
        }
      } else {
         // No usar caché (web o deshabilitado)
         // console.log(`🚫 [CACHE] Caché no usado, usando remota: ${originalSourceProp}`);
         if (isMounted) {
            setImageUri(fullRemoteUrl);
            setIsLoadingUri(false);
            setIsFromCache(false); // Asegurar que no esté marcado como caché
         }
      }
    };

    attemptCache();

    return () => {
      isMounted = false;
    };
  }, [originalSourceProp, useCache]); // Depende de la fuente original y opción de caché

  // Estilo base con propiedades comunes (fondo, overflow)
  const baseStyle: ViewStyle & ImageStyle = { // Tipo unión para compatibilidad
      backgroundColor: theme.colors.surfaceVariant,
      overflow: 'hidden',
  };

  // Objeto solo con dimensiones numéricas o undefined
  const dimensionStyle: ViewStyle = { width: width, height: height };

  // Estilo para que la imagen interna llene el contenedor
  const imageFillStyle: ImageStyle = { width: '100%', height: '100%' };

   // Mostrar indicador mientras se resuelve la URI (caché o remota)
  if (isLoadingUri) {
      // Estilo para el View contenedor de carga (solo dimensiones y estilos de View)
      const loadingViewStyle: StyleProp<ViewStyle> = [
          dimensionStyle,
          baseStyle, // Fondo y overflow
          styles.loadingContainer,
          style as ViewStyle // Castear estilo externo
      ];
      return (
          <View style={loadingViewStyle}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
      );
  }

   // Si después de cargar, la URI es null (porque originalSourceProp era null o getImageUrl falló),
   // renderizamos expo-image sin source, lo que debería mostrar el placeholder si se proporcionó.
   if (!imageUri) {
       // Estilo para el View contenedor de placeholder
       const placeholderViewStyle: StyleProp<ViewStyle> = [
           dimensionStyle,
           baseStyle, // Fondo y overflow
           styles.placeholderContainer,
           style as ViewStyle // Castear estilo externo
       ];
       return (
           <View style={placeholderViewStyle}>
               {/* Imagen interna usa fill style */}
               <Image
                   style={imageFillStyle} // Imagen llena el contenedor
                   placeholder={placeholder}
                   contentFit={contentFit}
                   transition={transition}
                   {...restExpoImageProps}
               />
           </View>
       );
   }


  // Renderizar expo-image final

  // Estilo para el View contenedor (dimensiones y estilo externo como ViewStyle)
  const finalWrapperStyle: StyleProp<ViewStyle> = [
      dimensionStyle,
      baseStyle, // Incluir fondo/overflow en el wrapper también
      style as ViewStyle
  ];

  // Estilo para la Imagen interna (llena el contenedor y aplica estilo externo como ImageStyle)
  const finalImageStyle: StyleProp<ImageStyle> = [
      imageFillStyle, // Llenar contenedor
      // No necesitamos baseStyle aquí si está en el wrapper
      style as ImageStyle // Aplicar estilo externo como ImageStyle
  ];


  return (
    <View style={finalWrapperStyle}>
        <Image
          source={imageUri}
          style={finalImageStyle}
          placeholder={placeholder}
          contentFit={contentFit}
          transition={transition}
          {...restExpoImageProps}
          onLoad={(e) => { restExpoImageProps.onLoad?.(e); }}
          onError={(e) => { restExpoImageProps.onError?.(e); }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
    // No necesitamos defaultImage aquí si se define como baseStyle arriba
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderContainer: {
         justifyContent: 'center',
         alignItems: 'center',
     },
     // imageFillStyle se define inline o arriba
});


export default AutoImage;