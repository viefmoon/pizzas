import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, View, ActivityIndicator } from 'react-native';
import { Image, ImageProps as ExpoImageProps, ImageStyle } from 'expo-image';
import { getCachedImageUri } from '../../lib/imageCache';
import { getImageUrl } from '../../lib/imageUtils';
import { StyleProp, ViewStyle } from 'react-native';
import { useAppTheme } from '../../styles/theme';

export interface AutoImageProps extends Omit<ExpoImageProps, 'source'> {
  source: string | null | undefined;
  maxWidth?: number;
  maxHeight?: number;
  useCache?: boolean;
  placeholder?: ExpoImageProps['placeholder'];
  contentFit?: ExpoImageProps['contentFit'];
  transition?: ExpoImageProps['transition'];
}

function useAutoImageSize(uri?: string, maxWidth?: number, maxHeight?: number): { width?: number, height?: number } {
    return { width: maxWidth, height: maxHeight };
}

export const AutoImage: React.FC<AutoImageProps> = ({
  source: originalSourceProp,
  maxWidth,
  maxHeight,
  useCache = true,
  style,
  placeholder,
  contentFit = 'cover',
  transition = 300,
  ...restExpoImageProps
}) => {
  const theme = useAppTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoadingUri, setIsLoadingUri] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  const { width, height } = useAutoImageSize(imageUri ?? undefined, maxWidth, maxHeight);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingUri(true);
    setIsFromCache(false);

    if (!originalSourceProp) {
         setImageUri(null);
         setIsLoadingUri(false);
         return;
    }

    const fullRemoteUrl = getImageUrl(originalSourceProp);

    if (!fullRemoteUrl) {
        console.warn(`[AutoImage] No se pudo construir la URL para: ${originalSourceProp}`);
        if (isMounted) {
            setImageUri(null);
            setIsLoadingUri(false);
        }
        return;
    }

    const attemptCache = async () => {
      if (useCache && Platform.OS !== 'web') {
        try {
          const cachedUri = await getCachedImageUri(fullRemoteUrl);
          if (isMounted) {
            if (cachedUri && cachedUri.startsWith('file://')) {
              setImageUri(cachedUri);
              setIsFromCache(true);
            } else {
              setImageUri(fullRemoteUrl);
               setIsFromCache(false);
            }
            setIsLoadingUri(false);
          }
        } catch (error) {
          console.error(`❌ [CACHE] Error obteniendo imagen (${originalSourceProp}):`, error);
          if (isMounted) {
            setImageUri(fullRemoteUrl);
            setIsLoadingUri(false);
             setIsFromCache(false);
          }
        }
      } else {
         if (isMounted) {
            setImageUri(fullRemoteUrl);
            setIsLoadingUri(false);
            setIsFromCache(false);
         }
      }
    };

    attemptCache();

    return () => {
      isMounted = false;
    };
  }, [originalSourceProp, useCache]);

  const baseStyle: ViewStyle & ImageStyle = {
      backgroundColor: theme.colors.surfaceVariant,
      overflow: 'hidden',
  };

  const dimensionStyle: ViewStyle = { width: width, height: height };

  const imageFillStyle: ImageStyle = { width: '100%', height: '100%' };

  if (isLoadingUri) {
      const loadingViewStyle: StyleProp<ViewStyle> = [
          dimensionStyle,
          baseStyle,
          styles.loadingContainer,
          style as ViewStyle
      ];
      return (
          <View style={loadingViewStyle}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
      );
  }

   if (!imageUri) {
       const placeholderViewStyle: StyleProp<ViewStyle> = [
           dimensionStyle,
           baseStyle,
           styles.placeholderContainer,
           style as ViewStyle
       ];
       return (
           <View style={placeholderViewStyle}>
               <Image
                   style={imageFillStyle}
                   placeholder={placeholder}
                   contentFit={contentFit}
                   transition={transition}
                   {...restExpoImageProps}
               />
           </View>
       );
   }



  const finalWrapperStyle: StyleProp<ViewStyle> = [
      dimensionStyle,
      baseStyle,
      style as ViewStyle
  ];

  const finalImageStyle: StyleProp<ImageStyle> = [
      imageFillStyle,
      style as ImageStyle
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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderContainer: {
         justifyContent: 'center',
         alignItems: 'center',
     },
});


export default AutoImage;