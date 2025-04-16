import React from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from 'react-native';
import type { Product } from '../types/orders.types';
import ProductCard from './ProductCard';
import { useAppTheme } from '@/app/styles/theme';

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  error: any;
  onProductPress: (product: Product) => void;
}

const ProductsGrid = ({ 
  products, 
  isLoading, 
  error, 
  onProductPress 
}: ProductsGridProps) => {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 50,
      color: theme.colors.error,
      paddingHorizontal: theme.spacing.m,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginTop: 40,
      marginHorizontal: 20,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error al cargar los productos: {error}
        </Text>
      </View>
    );
  }

  if (!products || products.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          No hay productos disponibles en esta categoría.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProductCard 
          product={item} 
          onPress={onProductPress} 
        />
      )}
      contentContainerStyle={{ paddingBottom: 80 }}
    />
  );
};

export default ProductsGrid;
