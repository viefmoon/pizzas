import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import CartButton from './CartButton';

interface OrderHeaderProps {
  title: string;
  itemCount: number;
  onBackPress?: () => void;
  onCartPress: () => void;
  isCartVisible: boolean;
}

const OrderHeader = ({
  title,
  itemCount,
  onBackPress,
  onCartPress,
  isCartVisible
}: OrderHeaderProps) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      elevation: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      flex: 1,
    },
    headerSpacer: {
      width: 48, // Ancho similar al IconButton
    },
  });

  return (
    <View style={styles.header}>
      {onBackPress ? (
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={onBackPress}
        />
      ) : (
        <View style={styles.headerSpacer} />
      )}
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      {!isCartVisible ? (
        <CartButton
          itemCount={itemCount}
          onPress={onCartPress}
        />
      ) : (
        <View style={styles.headerSpacer} />
      )}
    </View>
  );
};

export default OrderHeader;
