import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView, FlatList, Alert } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Switch,
  HelperText,
  ActivityIndicator,
  Divider,
  List,
  Checkbox,
  Searchbar,
  Surface,
} from "react-native-paper";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useAppTheme, AppTheme } from "../../../app/styles/theme";
import {
  PreparationScreen,
  PreparationScreenFormData, // Tipo para el formulario (inferido del schema original)
  // preparationScreenFormSchema, // Schema original (no usado directamente en useForm)
  CreatePreparationScreenDto,
  UpdatePreparationScreenDto,
} from "../types/preparationScreens.types";
import {
  useCreatePreparationScreen,
  useUpdatePreparationScreen,
} from "../hooks/usePreparationScreensQueries";
import { useProductsQuery } from "../../menu/hooks/useProductsQueries";
import { Product } from "../../menu/types/products.types"; // Ruta actualizada

interface PreparationScreenFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  editingItem: PreparationScreen | null;
  onSubmitSuccess?: (item: PreparationScreen) => void;
}

// Schema específico para la validación del resolver
const preparationScreenResolverSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().max(255).nullable().optional(),
  isActive: z.boolean(), // Requerido para el resolver
});

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalSurface: {
      padding: 0,
      margin: theme.spacing.m,
      borderRadius: theme.roundness * 2,
      elevation: 4,
      backgroundColor: theme.colors.background,
      maxHeight: "90%",
      overflow: "hidden",
    },
    modalHeader: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.l,
    },
    modalTitle: {
      color: theme.colors.onPrimary,
      fontWeight: "700",
      textAlign: "center",
    },
    formContainer: {
      flexGrow: 1,
    },
    scrollViewContent: {
      padding: theme.spacing.l,
      paddingBottom: theme.spacing.xl,
    },
    input: {
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.surfaceVariant,
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.m,
      paddingVertical: theme.spacing.s,
    },
    switchLabel: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 16,
      marginRight: theme.spacing.m,
    },
    divider: {
      marginVertical: theme.spacing.l,
    },
    productsSectionTitle: {
      marginBottom: theme.spacing.m,
      fontWeight: "600",
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    productsListContainer: {
      maxHeight: 250,
      borderColor: theme.colors.outlineVariant,
      borderWidth: 1,
      borderRadius: theme.roundness,
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.surface,
    },
    productItem: {
      backgroundColor: theme.colors.surface,
      borderBottomColor: theme.colors.outlineVariant,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    productSearchbar: {
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.elevation.level2,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.l,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surface,
    },
    formButton: {
      borderRadius: theme.roundness * 1.5,
      paddingHorizontal: theme.spacing.m,
    },
    cancelButton: {
      marginRight: theme.spacing.m,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: theme.roundness * 2,
      zIndex: 10,
    },
    helperText: {
      marginTop: -theme.spacing.s,
      marginBottom: theme.spacing.s,
    },
    listLoadingContainer: {
      height: 100,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.m,
    },
  });

// Asegurar que el componente devuelve ReactNode (JSX)
const PreparationScreenFormModal: React.FC<PreparationScreenFormModalProps> = ({
  visible,
  onDismiss,
  editingItem,
  onSubmitSuccess,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const queryClient = useQueryClient();

  const isEditing = !!editingItem;
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // --- Fetch Products ---
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useProductsQuery(
    { page: 1, limit: 1000 }, // Fetch many products
    { enabled: visible } // Only fetch when modal is visible
  );
  // Extraer items de la tupla [items, count] devuelta por useProductsQuery
  const allProducts = useMemo(
    () => productsResponse?.[0] ?? [],
    [productsResponse]
  );

  // --- Form Hook ---
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PreparationScreenFormData>({
    // Usar el tipo FormData que coincide con el resolverSchema
    resolver: zodResolver(preparationScreenResolverSchema), // Usar el schema específico
    defaultValues: useMemo(
      () => ({
        // Default values deben coincidir con FormData
        name: "",
        description: null,
        isActive: true,
      }),
      []
    ),
  });

  // --- Mutations ---
  const { mutate: createScreen, isPending: isCreating } =
    useCreatePreparationScreen({
      onSuccess: (newItem) => {
        onSubmitSuccess?.(newItem);
        onDismiss();
      },
    });
  const { mutate: updateScreen, isPending: isUpdating } =
    useUpdatePreparationScreen({
      onSuccess: (updatedItem) => {
        onSubmitSuccess?.(updatedItem);
        onDismiss();
      },
    });

  const isSubmitting = isCreating || isUpdating;

  // --- Effects ---
  useEffect(() => {
    if (visible) {
      // Reset form based on editingItem or defaults
      const defaultValues = {
        name: editingItem?.name ?? "",
        description: editingItem?.description ?? null,
        isActive: editingItem?.isActive ?? true, // Default to true for new items
      };
      reset(defaultValues);

      // Reset selected products
      const initialProductIds = new Set(
        // Usar un tipo más simple para 'p' si editingItem.products no es el tipo Product completo
        Array.isArray(editingItem?.products)
          ? editingItem.products.map((p: { id: string }) => p.id)
          : []
      );
      setSelectedProductIds(initialProductIds);
      setProductSearchTerm("");
    }
    // No reset on close needed unless explicitly desired
  }, [visible, editingItem, reset]);

  // --- Handlers ---
  const handleProductToggle = useCallback((productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const processSubmit: SubmitHandler<PreparationScreenFormData> = (
    formData
  ) => {
    if (isSubmitting) return;

    const productIds: string[] = [...selectedProductIds]; // Convert Set to Array

    if (isEditing && editingItem) {
      // Construct DTO only with fields that changed or productIds might have changed
      const updateDto: UpdatePreparationScreenDto = {};
      let changed = false;

      if (formData.name !== editingItem.name) {
        updateDto.name = formData.name;
        changed = true;
      }
      // Check description change carefully (null vs empty string vs undefined)
      const formDesc = formData.description ?? null;
      const editDesc = editingItem.description ?? null;
      if (formDesc !== editDesc) {
        updateDto.description = formDesc;
        changed = true;
      }
      if (formData.isActive !== editingItem.isActive) {
        updateDto.isActive = formData.isActive;
        changed = true;
      }

      const initialProductIds = new Set(
        // Usar un tipo más simple para 'p'
        Array.isArray(editingItem?.products)
          ? editingItem.products.map((p: { id: string }) => p.id)
          : []
      );
      const productIdsChanged =
        productIds.length !== initialProductIds.size ||
        productIds.some((id) => !initialProductIds.has(id));

      // Always include productIds in the DTO if they changed, as per backend logic
      if (productIdsChanged) {
        updateDto.productIds = productIds;
        changed = true; // Mark as changed if product IDs were modified
      }

      if (changed) {
        // If only productIds changed, the DTO will only contain productIds
        updateScreen({ id: editingItem.id, data: updateDto });
      } else {
        onDismiss(); // No changes, just dismiss
      }
    } else {
      // Creating new item
      const createDto: CreatePreparationScreenDto = {
        name: formData.name,
        // Usar la versión corregida de description una sola vez
        description: formData.description ?? null, // Ensure null if empty
        isActive: formData.isActive, // Comes from form state (default true)
        productIds,
      };
      createScreen(createDto);
    }
  };

  // --- Product List Filtering ---
  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) return allProducts;
    const lowerCaseSearch = productSearchTerm.toLowerCase();
    // Ensure p.name exists before calling toLowerCase
    return allProducts.filter((p: Product) =>
      p.name?.toLowerCase().includes(lowerCaseSearch)
    );
  }, [allProducts, productSearchTerm]);

  // --- Render Logic ---
  const renderProductItem = ({ item }: { item: Product }) => (
    <List.Item
      title={item.name}
      titleNumberOfLines={2}
      style={styles.productItem}
      onPress={() => handleProductToggle(item.id)}
      right={() => (
        <Checkbox.Android
          status={selectedProductIds.has(item.id) ? "checked" : "unchecked"}
          onPress={() => handleProductToggle(item.id)}
          disabled={isSubmitting}
        />
      )}
    />
  );

  // --- RETURN JSX ---
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalSurface}
        dismissable={!isSubmitting}
      >
        {/* Fragmento para envolver el contenido */}
        <>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {isEditing ? "Editar Pantalla" : "Nueva Pantalla"}
            </Text>
          </View>

          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name Field */}
            <Controller
              name="name"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Nombre *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.name}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.name && (
              <HelperText
                type="error"
                visible={!!errors.name}
                style={styles.helperText}
              >
                {errors.name.message}
              </HelperText>
            )}

            {/* Description Field */}
            <Controller
              name="description"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Descripción (Opcional)"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  disabled={isSubmitting}
                />
              )}
            />
            {/* No error display needed for optional field unless schema requires it */}

            {/* IsActive Field */}
            <View style={styles.switchContainer}>
              <Text variant="bodyLarge" style={styles.switchLabel}>
                Activa
              </Text>
              <Controller
                name="isActive"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value} // Value should be boolean here due to resolver schema
                    onValueChange={onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </View>
            {/* No error display needed for boolean */}

            <Divider style={styles.divider} />

            {/* Products Section */}
            <Text variant="titleMedium" style={styles.productsSectionTitle}>
              Productos Asociados
            </Text>
            <Searchbar
              placeholder="Buscar producto..."
              onChangeText={setProductSearchTerm}
              value={productSearchTerm}
              style={styles.productSearchbar}
              inputStyle={{ color: theme.colors.onSurface }}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              iconColor={theme.colors.onSurfaceVariant}
              clearIcon={
                productSearchTerm
                  ? (props) => <List.Icon {...props} icon="close-circle" />
                  : undefined
              }
              onClearIconPress={() => setProductSearchTerm("")}
              // Usar 'editable' en lugar de 'disabled' para Searchbar
              editable={!(isLoadingProducts || isSubmitting)}
            />

            <Surface style={styles.productsListContainer} elevation={1}>
              {isLoadingProducts ? (
                <View style={styles.listLoadingContainer}>
                  <ActivityIndicator animating size="small" />
                </View>
              ) : errorProducts ? (
                <View style={styles.listLoadingContainer}>
                  <Text style={{ color: theme.colors.error }}>
                    Error al cargar productos.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredProducts}
                  renderItem={renderProductItem}
                  keyExtractor={(item) => item.id}
                  ListEmptyComponent={
                    <List.Item
                      title={
                        productSearchTerm
                          ? "No se encontraron productos"
                          : "No hay productos disponibles"
                      }
                    />
                  }
                />
              )}
            </Surface>
          </ScrollView>

          {/* Loading Overlay */}
          {isSubmitting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                animating={true}
                size="large"
                color={theme.colors.primary}
              />
            </View>
          )}

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={[styles.formButton, styles.cancelButton]}
              disabled={isSubmitting}
              textColor={theme.colors.primary}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(processSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting || isLoadingProducts}
              style={styles.formButton}
            >
              {isEditing ? "Guardar"
               : "Crear"}
            </Button>
          </View>
          {/* Cerrar Fragmento */}
        </>
        {/* Cerrar Modal */}
      </Modal>
    </Portal>
  ); // Fin del return
}; // Fin del componente

export default PreparationScreenFormModal;
