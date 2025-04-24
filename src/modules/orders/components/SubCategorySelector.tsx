import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { SubCategory } from '../../../app/types/domain/subcategory.types';
import { useAppTheme } from '@/app/styles/theme';

interface SubCategorySelectorProps {
  subCategories: SubCategory[];
  selectedSubCategoryId: string | null;
  onSelectSubCategory: (subCategoryId: string) => void;
}

const SubCategorySelector = ({
  subCategories,
  selectedSubCategoryId,
  onSelectSubCategory,
}: SubCategorySelectorProps) => {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    subCategoriesContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.s,
      paddingBottom: theme.spacing.s,
    },
    subCategoryCard: {
      marginHorizontal: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      minWidth: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedSubCategory: {
      backgroundColor: theme.colors.primaryContainer,
    },
    subCategoryText: {
      fontSize: 14,
      textAlign: 'center',
    },
    selectedSubCategoryText: {
      color: theme.colors.onPrimaryContainer,
      fontWeight: 'bold',
    },
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.subCategoriesContainer}
    >
      {subCategories.map((subcategory) => (
        <Card
          key={subcategory.id}
          style={[
            styles.subCategoryCard,
            selectedSubCategoryId === subcategory.id && styles.selectedSubCategory,
          ]}
          onPress={() => onSelectSubCategory(subcategory.id)}
        >
          <Text
            style={[
              styles.subCategoryText,
              selectedSubCategoryId === subcategory.id && styles.selectedSubCategoryText,
            ]}
          >
            {subcategory.name}
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
};

export default SubCategorySelector;
