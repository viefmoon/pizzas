import React, { useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { IconButton, Badge, useTheme } from 'react-native-paper';

interface CartButtonProps {
  itemCount: number;
  onPress: () => void;
}

const CartButton = ({ itemCount, onPress }: CartButtonProps) => {
  const theme = useTheme();
  const cartBadgeScale = useRef(new Animated.Value(1)).current;
  const cartBounceAnimation = useRef(new Animated.Value(1)).current;

  const styles = StyleSheet.create({
    cartButton: {
      margin: 0,
      backgroundColor: theme.colors.surfaceVariant,
    },
    cartBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: theme.colors.error,
    },
  });

  const animateCartButton = () => {
    // Secuencia de animación: escala hacia arriba y hacia abajo
    Animated.sequence([
      Animated.timing(cartBounceAnimation, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cartBounceAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animar el badge del carrito
    Animated.sequence([
      Animated.timing(cartBadgeScale, {
        toValue: 1.6,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cartBadgeScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Exponer la función de animación
  React.useImperativeHandle(
    React.createRef(),
    () => ({
      animate: animateCartButton
    })
  );

  return (
    <View>
      <Animated.View style={{ transform: [{ scale: cartBounceAnimation }] }}>
        <IconButton
          icon="cart-outline"
          iconColor={theme.colors.primary}
          size={24}
          onPress={onPress}
          style={styles.cartButton}
        />
      </Animated.View>
      {itemCount > 0 && (
        <Animated.View style={{
          transform: [{ scale: cartBadgeScale }],
          position: 'absolute',
          top: 0,
          right: 0,
        }}>
          <Badge
            style={styles.cartBadge}
            size={18}
          >
            {itemCount}
          </Badge>
        </Animated.View>
      )}
    </View>
  );
};

export default CartButton;
