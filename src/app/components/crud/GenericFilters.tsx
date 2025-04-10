import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import { useAppTheme, AppTheme } from "../../styles/theme"; // Ajustar ruta

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

const getStyles = (theme: AppTheme) => StyleSheet.create({
  filterContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface, // Fondo para los filtros
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
  const styles = getStyles(theme); // No necesita useMemo si no depende de props

  // Mapear filterOptions al formato esperado por SegmentedButtons
  // Asegurándose de que 'value' sea string como espera SegmentedButtons
  const buttons = filterOptions.map(option => ({
    value: String(option.value), // Convertir a string
    label: option.label,
    icon: option.icon,
    disabled: option.disabled,
    // Añadir otras props si es necesario
  }));

  return (
    <View style={[styles.filterContainer, containerStyle]}>
      <SegmentedButtons
        value={String(filterValue)} // El valor también debe ser string
        onValueChange={(value) => {
            // Intentar encontrar la opción original para devolver el tipo correcto
            const selectedOption = filterOptions.find(opt => String(opt.value) === value);
            if (selectedOption) {
                onFilterChange(selectedOption.value); // Devolver el valor con el tipo original
            }
            // Considerar qué hacer si no se encuentra (no debería pasar si value viene de los botones)
        }}
        buttons={buttons}
        // density="medium" // Opcional: ajustar densidad
      />
    </View>
  );
};

export default GenericFilters;