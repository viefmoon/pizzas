import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native'; // Añadir Platform
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Title, Paragraph, Button, ActivityIndicator, Divider, IconButton } from 'react-native-paper';
import { Image } from 'expo-image'; // Importar Image de expo-image
import { useAppTheme } from '@/app/styles/theme';
import type { Product, Category, SubCategory } from '../types/orders.types';
import { useGetFullMenu } from '../hooks/useMenuQueries';
import { getApiErrorMessage } from '@/app/lib/errorMapping';
import { getImageUrl } from '@/app/lib/imageUtils';
import OrderCartDetail from '../components/OrderCartDetail'; // Importar el nuevo componente
import { OrderType } from '../types/orders.types'; // Importar OrderType
 
// --- Componente Reutilizable para Selección ---
interface SelectionCardProps {
  id: string;
  name: string;
  imageUrl?: string; // Hacer la URL opcional
  onPress: (id: string) => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ id, name, imageUrl, onPress }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createSelectionCardStyles(theme), [theme]);
  const finalImageUrl = getImageUrl(imageUrl); // Obtener la URL final

  // Placeholder difuminado para expo-image
  const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  return (
    <Card style={styles.card} onPress={() => onPress(id)}>
      {finalImageUrl ? (
        <Image
          style={styles.image}
          source={{ uri: finalImageUrl }} // Usar la URL final calculada
          placeholder={{ blurhash }} // Mostrar blurhash mientras carga
          contentFit="cover"
          transition={300} // Suave transición al cargar
        />
      ) : (
        // Placeholder si no hay imagen
        <View style={[styles.image, styles.selectionPlaceholder]}>
           <Text style={styles.selectionPlaceholderText}>{name}</Text>
        </View>
      )}
      <Card.Content style={styles.content}>
        <Title style={styles.title}>{name}</Title>
      </Card.Content>
    </Card>
  );
};

// --- Pantalla Principal ---
function CreateOrderScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [viewState, setViewState] = useState<'categories' | 'subcategories' | 'products'>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [isCartVisible, setIsCartVisible] = useState(false); // Estado para visibilidad del carrito
 
  const { data: menuData, isLoading, error } = useGetFullMenu();
 
  // TODO: Implementar estado para la orden actual (items, total, etc.)
  // const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setViewState('subcategories');
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
    setViewState('products');
    // TODO: Filtrar productos por subCategoryId si es necesario
  };

  const handleGoBack = () => {
    if (viewState === 'subcategories') {
      setViewState('categories');
      setSelectedCategoryId(null);
    } else if (viewState === 'products') {
      setViewState('subcategories');
      setSelectedSubCategoryId(null);
    }
    // Si estamos en el carrito, el botón "atrás" lo cierra
    if (isCartVisible) {
      setIsCartVisible(false);
    }
  };
 
  const handleAddProduct = (product: Product) => {
    console.log('Añadir producto:', product.name);
    // TODO: Lógica para añadir producto a la orden actual
    // TODO: Lógica para añadir producto a la orden actual (actualizar estado de items)
  };
 
  const handleViewCart = () => {
    setIsCartVisible(true); // Mostrar el detalle del carrito
  };
 
  const handleCloseCart = () => {
    setIsCartVisible(false); // Ocultar el detalle del carrito
  };
 
  const handleConfirmOrder = (details: { orderType: OrderType; tableId?: string }) => {
    console.log('Confirmar orden con detalles:', details);
    // TODO: Implementar lógica para enviar la orden al backend
    setIsCartVisible(false); // Cerrar carrito después de confirmar (o manejar navegación)
  };
 
  // Placeholder difuminado para expo-image
  const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  const renderProductCard = (product: Product) => {
    const productImageUrl = getImageUrl(product.photo?.path); // Acceder a photo.path

    return (
      <Card key={product.id} style={styles.productCard} onPress={() => handleAddProduct(product)}>
        {productImageUrl ? (
          <Image
            style={styles.productImage}
            source={{ uri: productImageUrl }} // Usar la URL calculada
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.productPlaceholderText}>{product.name}</Text>
          </View>
        )}
        <Card.Content>
          <Title style={styles.productTitle}>{product.name}</Title>
          <Paragraph style={styles.productPrice}>${parseFloat(String(product.price)).toFixed(2)}</Paragraph>
        </Card.Content>
      </Card>
    );
  };

  const getTitle = () => {
    if (isCartVisible) return 'Detalle de Orden'; // Título cuando el carrito está visible
    if (viewState === 'categories') return 'Categorías';
    if (viewState === 'subcategories') {
      const category = Array.isArray(menuData) ? menuData.find(cat => cat.id === selectedCategoryId) : undefined;
      return category?.name || 'Subcategorías';
    }
    return 'Productos';
  };
 
  const renderContent = () => {
    // Si el carrito está visible, mostrar OrderCartDetail
    if (isCartVisible) {
      return (
        <OrderCartDetail
          // items={currentOrderItems} // Pasar items reales cuando estén en el estado
          onConfirmOrder={handleConfirmOrder}
          onClose={handleCloseCart}
        />
      );
    }
 
    // --- Lógica existente para mostrar categorías/subcategorías/productos ---
    if (isLoading) {
      return <ActivityIndicator animating={true} color={theme.colors.primary} size="large" style={styles.loader} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{getApiErrorMessage(error)}</Text>;
    }
    if (!menuData) {
      return <Text>No se pudo cargar el menú.</Text>; // Mensaje si no hay datos después de cargar
    }

    if (viewState === 'categories') {
      return (
        <View style={styles.grid}>
          {Array.isArray(menuData) && menuData.map((category: Category) => (
            <SelectionCard
              key={category.id}
              id={category.id}
              name={category.name}
              imageUrl={category.photo?.path} // Acceder a photo.path
              onPress={handleCategorySelect}
            />
          ))}
        </View>
      );
    }

    if (viewState === 'subcategories') {
      const selectedCategory = Array.isArray(menuData) ? menuData.find(cat => cat.id === selectedCategoryId) : undefined;
      if (!selectedCategory) return <Text>Categoría no encontrada.</Text>; // Manejo de error
      return (
        <View style={styles.grid}>
          {selectedCategory.subCategories.map((subCategory: SubCategory) => (
            <SelectionCard
              key={subCategory.id}
              id={subCategory.id}
              name={subCategory.name}
              imageUrl={subCategory.photo?.path} // Acceder a photo.path
              onPress={handleSubCategorySelect}
            />
          ))}
        </View>
      );
    }

    if (viewState === 'products') {
       // TODO: Filtrar productos basados en selectedSubCategoryId si es necesario
       const productsToShow = Array.isArray(menuData)
         ? menuData
             .flatMap(cat => cat.subCategories)
             // .filter(sub => sub.id === selectedSubCategoryId) // Descomentar para filtrar
             .flatMap(sub => sub.products)
         : []; // Fallback a array vacío si menuData no es un array

      return (
        <View style={styles.productsGrid}>
          {productsToShow.length > 0 ? (
             productsToShow.map(renderProductCard)
          ) : (
             <Text>No hay productos en esta sección.</Text>
          )}
        </View>
      );
    }

    return null; // Estado inesperado
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* --- Barra Superior (Título y Botones) --- */}
      <View style={styles.header}>
        {/* Mostrar botón atrás si no estamos en categorías O si el carrito está visible */}
        {(viewState !== 'categories' || isCartVisible) && (
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleGoBack}
            style={styles.backButton}
          />
        )}
        <Title style={styles.headerTitle}>{getTitle()}</Title>
        {/* Mostrar botón carrito solo si NO está visible el carrito */}
        {!isCartVisible ? (
          <IconButton
            icon="cart-outline"
            size={24}
            onPress={handleViewCart}
            style={styles.cartButton}
          />
        ) : (
          // Espaciador para mantener el título centrado cuando el carrito está visible
          <View style={styles.headerSpacer} />
        )}
      </View>
      {/* No mostrar Divider ni Resumen Fijo si el carrito está visible */}
      {!isCartVisible && <Divider />}
 
      {/* --- Área Principal de Contenido (Scrollable o Carrito) --- */}
      {/* El ScrollView ahora está DENTRO de OrderCartDetail si está visible */}
      <View style={styles.contentArea}>
        {renderContent()}
      </View>
 
      {/* No mostrar Divider ni Resumen Fijo si el carrito está visible */}
      {!isCartVisible && (
        <>
          <Divider />
          {/* --- Área Resumen de Orden (Fija - Placeholder) --- */}
          {/* TODO: Este resumen podría actualizarse con datos reales */}
          <View style={styles.orderSummary}>
            <Text>Resumen (Placeholder)</Text>
            <Button mode="contained" onPress={handleViewCart}>
              Ver Carrito
            </Button>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

// --- Estilos ---
const createSelectionCardStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      width: '45%', // Aproximadamente 2 columnas
      margin: theme.spacing.s,
      elevation: 3,
      backgroundColor: theme.colors.surface,
    },
    image: {
      height: 100, // Altura fija para la imagen
      // Asegurar bordes redondeados superiores para expo-image dentro de Card
      borderTopLeftRadius: theme.roundness,
      borderTopRightRadius: theme.roundness,
      // Quitar bordes redondeados inferiores si se usa Card.Cover
      // borderBottomLeftRadius: 0,
      // borderBottomRightRadius: 0,
      overflow: 'hidden', // Necesario para que el redondeo aplique a la imagen
    },
    selectionPlaceholder: { // Placeholder para SelectionCard sin imagen
      backgroundColor: theme.colors.surfaceVariant, // Fondo similar al de producto
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.s,
    },
    selectionPlaceholderText: { // Texto para placeholder de SelectionCard
      fontSize: 16, // Ajustar tamaño según necesidad
      fontWeight: 'bold',
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    imagePlaceholder: { // Este estilo parece no usarse ya con expo-image, pero lo dejamos por si acaso
      height: 100,
      backgroundColor: theme.colors.surfaceVariant, // Mantener por consistencia
      justifyContent: 'center',
      alignItems: 'center',
      // Asegurar bordes redondeados superiores
      borderTopLeftRadius: theme.roundness,
      borderTopRightRadius: theme.roundness,
    },
    placeholderText: {
      fontSize: 30,
      color: theme.colors.onSurfaceVariant,
    },
    content: {
      paddingTop: theme.spacing.s, // Espacio entre imagen y texto
      alignItems: 'center', // Centrar título
    },
    title: {
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'center',
      paddingBottom: theme.spacing.s,
    },
});

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xs, // Menos padding vertical
      minHeight: 50, // Altura mínima
      backgroundColor: theme.colors.surface, // Opcional: color de fondo para header
    },
    backButton: {
      margin: 0, // Quitar margen extra de IconButton
    },
    headerTitle: {
      flex: 1, // Ocupa el espacio disponible
      textAlign: 'center',
      fontSize: 18, // Ajustar tamaño
      fontWeight: 'bold',
    },
    cartButton: { // Estilo para el botón del carrito
      margin: 0,
    },
    headerSpacer: { // Espaciador para centrar título cuando el botón derecho no está
      width: 48, // Ancho similar al IconButton
    },
    contentArea: {
      flex: 1, // Ocupa el espacio principal
    },
    grid: { // Para categorías y subcategorías
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      padding: theme.spacing.s,
    },
    productsGrid: { // Para productos
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      padding: theme.spacing.s,
    },
    productCard: {
      width: '45%',
      margin: theme.spacing.s,
      elevation: 2, // Mantener elevación para sombra
      backgroundColor: theme.colors.surface, // Asegurar fondo por si la imagen no carga
    },
     productImage: { // Estilo para la imagen del producto (expo-image)
      height: 120,
      width: '100%', // Asegurar que ocupe el ancho de la Card
      borderTopLeftRadius: theme.roundness, // Redondeo superior
      borderTopRightRadius: theme.roundness,
     },
     productImagePlaceholder: { // Estilo para el View del placeholder SIN imagen
      height: 120,
      backgroundColor: theme.colors.surfaceVariant, // Fondo para el placeholder
      justifyContent: 'center',
      alignItems: 'center', // Centrar contenido
      borderTopLeftRadius: theme.roundness, // Redondeo superior igual que la imagen
      borderTopRightRadius: theme.roundness,
      padding: theme.spacing.s, // Añadir padding interno
    },
    productPlaceholderText: { // Estilo para el texto del placeholder
       fontSize: 18, // Tamaño de fuente más grande
       fontWeight: 'bold',
       color: theme.colors.onSurfaceVariant, // Color del texto sobre el fondo
       textAlign: 'center', // Centrar texto
    },
    productTitle: {
      fontSize: 16,
      lineHeight: 20,
    },
    productPrice: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: 'bold',
      marginTop: 4,
    },
    orderSummary: {
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    loader: {
      marginTop: 50,
      alignSelf: 'center',
    },
    errorText: {
      textAlign: 'center',
      marginTop: 50,
      color: theme.colors.error,
      paddingHorizontal: theme.spacing.m,
    },
     placeholderText: { // Estilo reutilizado para texto de placeholder '?'
      fontSize: 30,
      color: theme.colors.onSurfaceVariant,
    },
  });

export default CreateOrderScreen;