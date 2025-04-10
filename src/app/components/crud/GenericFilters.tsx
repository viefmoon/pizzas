import React, { useMemo } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { SegmentedButtons, Surface, Text } from "react-native-paper";
import { useAppTheme, AppTheme } from "../../styles/theme";

// Tipo para las opciones de filtro
export interface FilterOption<TValue> {
  value: TValue;
  label: string;
  icon?: string; // Opcional
  disabled?: boolean; // Opcional
  // Otras props de SegmentedButtons.Button si son necesarias
}

interface GenericFiltersProps<TValue> {
  filterValue: TValue;
  onFilterChange: (value: TValue) => void;
  filterOptions: FilterOption<TValue>[]; // Array de opciones de filtro
  containerStyle?: StyleProp<ViewStyle>; // Estilo opcional para el contenedor
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    outerContainer: {
      marginHorizontal: theme.spacing.s,
      marginVertical: theme.spacing.m,
      backgroundColor: "transparent",
    },
    filterContainer: {
      paddingHorizontal: theme.spacing.s,
    },
    segmentedButtons: {
      backgroundColor: "transparent",
      borderRadius: theme.roundness,
      minHeight: 48,
    },
    button: {
      borderWidth: 0,
      paddingVertical: theme.spacing.s,
    },
    buttonLabel: {
      fontSize: 15,
      letterSpacing: 0.15,
      paddingVertical: theme.spacing.xs,
    },
  });

// Restringir TValue a tipos válidos para el 'value' de SegmentedButtons (string o number)
const GenericFilters = <TValue extends string | number>({
  filterValue,
  onFilterChange,
  filterOptions,
  containerStyle,
}: GenericFiltersProps<TValue>) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Mapear filterOptions al formato esperado por SegmentedButtons
  const buttons = filterOptions.map((option) => ({
    value: String(option.value), // Convertir a string
    label: option.label,
    icon: option.icon,
    disabled: option.disabled,
    style: styles.button,
    labelStyle: styles.buttonLabel,
    showSelectedCheck: false,
  }));

  return (
    <Surface style={styles.outerContainer} elevation={0}>
      <View style={[styles.filterContainer, containerStyle]}>
        <SegmentedButtons
          value={String(filterValue)}
          onValueChange={(value) => {
            const selectedOption = filterOptions.find(
              (opt) => String(opt.value) === value
            );
            if (selectedOption) {
              onFilterChange(selectedOption.value);
            }
          }}
          buttons={buttons}
          style={styles.segmentedButtons}
          density="medium"
        />
      </View>
    </Surface>
  );
};

export default GenericFilters;
