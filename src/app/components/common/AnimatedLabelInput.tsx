import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Animated,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useAppTheme } from '@/app/styles/theme';

interface AnimatedLabelInputProps extends TextInputProps {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelColor?: string;
  inactiveLabelColor?: string;
  borderColor?: string;
  activeBorderColor?: string;
  error?: boolean;
  errorColor?: string;
}

const AnimatedLabelInput: React.FC<AnimatedLabelInputProps> = ({
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  style,
  containerStyle,
  inputStyle,
  labelStyle,
  activeLabelColor,
  inactiveLabelColor,
  borderColor: defaultBorderColor,
  activeBorderColor: focusedBorderColor,
  error = false,
  errorColor: customErrorColor,
  ...rest
}) => {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

  const isActive = isFocused || (value != null && value !== '');

  const finalActiveLabelColor = activeLabelColor || theme.colors.primary;
  const finalInactiveLabelColor = inactiveLabelColor || theme.colors.onSurfaceVariant;
  const finalBorderColor = defaultBorderColor || theme.colors.outline;
  const finalActiveBorderColor = focusedBorderColor || theme.colors.primary;
  const finalErrorColor = customErrorColor || theme.colors.error;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive, animation]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const labelTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });

  const labelScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  const labelColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [finalInactiveLabelColor, finalActiveLabelColor],
  });

  const currentBorderColor = error
    ? finalErrorColor
    : isFocused
      ? finalActiveBorderColor
      : isActive
        ? finalBorderColor
        : finalBorderColor;

  const styles = StyleSheet.create({
    container: {
      borderWidth: 1,
      borderRadius: theme.roundness,
      paddingHorizontal: 12,
      paddingTop: 18,
      paddingBottom: 6,
      marginBottom: 8,
      position: 'relative',
      backgroundColor: theme.colors.background,
    },
    label: {
      position: 'absolute',
      left: 12,
      top: 12,
      fontSize: 16,
      color: finalInactiveLabelColor,
    },
    input: {
      fontSize: 16,
      color: theme.colors.onSurface,
      paddingVertical: Platform.OS === 'ios' ? 8 : 4,
      paddingHorizontal: 0,
      margin: 0,
      borderWidth: 0,
      backgroundColor: 'transparent',
      minHeight: 24,
    },
  });

  const animatedLabelStyle = {
    transform: [
      { translateY: labelTranslateY },
      { scale: labelScale },
    ],
    color: labelColor,
    backgroundColor: animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', theme.colors.background]
    }),
    paddingHorizontal: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 4]
    }),
  };

  return (
    <View style={[styles.container, { borderColor: currentBorderColor }, containerStyle]}>
      <Animated.Text style={[styles.label, labelStyle, animatedLabelStyle]}>
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.input, inputStyle, style]}
        placeholder=""
        underlineColorAndroid="transparent"
        {...rest}
      />
    </View>
  );
};

export default AnimatedLabelInput;