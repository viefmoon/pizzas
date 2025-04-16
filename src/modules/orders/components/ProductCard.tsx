import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme } from 'react-native-paper';
import { Image } from 'expo-image';
import { getImageUrl } from '@/app/lib/imageUtils';
import type { Product } from '../types/orders.types';
import { useAppTheme } from '@/app/styles/theme';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

const ProductCard = ({ product, onPress }: ProductCardProps) => {
  const theme = useAppTheme();  

  const styles = StyleSheet.create({
    productCard: {
      marginVertical: 8,
      marginHorizontal: 12,
      overflow: 'hidden',
    },
    productImage: {
      width: '100%',
      height: 150,
    },
    productImagePlaceholder: {
      width: '100%',
      height: 150,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    productPlaceholderText: {
      fontSize: 40,
      fontWeight: 'bold',
      color: theme.colors.onSurfaceVariant,
    },
    productTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    productPrice: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    productDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    variantsText: {
      color: theme.colors.primary,
      fontStyle: 'italic',
      marginTop: 4,
    },
  });

  const productImageUrl = (product as any).imageUrl
    ? getImageUrl((product as any).imageUrl)
    : null;

  // Placeholder para imágenes
  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  return (
    <Card key={product.id} style={styles.productCard} onPress={() => onPress(product)}>
      {productImageUrl ? (
        <Image
          source={{ uri: productImageUrl }}
          style={styles.productImage}
          contentFit="cover"
          placeholder={blurhash}
          transition={300}
        />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productPlaceholderText}>{product.name.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <Card.Content>
        <Title style={styles.productTitle}>{product.name}</Title>
        {!(product as any).hasVariants && (product as any).price && (
          <Text style={styles.productPrice}>
            ${Number((product as any).price).toFixed(2)}
          </Text>
        )}
        {(product as any).hasVariants && (product as any).variants && Array.isArray((product as any).variants) && (product as any).variants.length > 0 && (
          <Text style={styles.variantsText}>
            Desde ${Math.min(...(product as any).variants.map((v: any) => Number(v.price || 0))).toFixed(2)}
          </Text>
        )}
        {(product as any).description && (
          <Paragraph style={styles.productDescription} numberOfLines={2}>
            {(product as any).description}
          </Paragraph>
        )}
      </Card.Content>
    </Card>
  );
};

export default ProductCard;
