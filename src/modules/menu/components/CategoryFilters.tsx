import React from "react";
import { View, StyleSheet } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import { useAppTheme } from "../../../app/styles/theme"; // Ajustar ruta si es necesario
import { ActiveFilter } from "../types/category.types"; // Asumiendo que ActiveFilter está en types

interface CategoryFiltersProps {
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    filterContainer: {
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface, // Fondo para los filtros
    },
  });

  return (
    <View style={styles.filterContainer}>
      <SegmentedButtons
        value={activeFilter}
        onValueChange={(value) => onFilterChange(value as ActiveFilter)} // Asegurar el tipo
        buttons={[
          { value: "all", label: "Todas" },
          { value: "active", label: "Activas" },
          { value: "inactive", label: "Inactivas" },
        ]}
      />
    </View>
  );
};

export default CategoryFilters;