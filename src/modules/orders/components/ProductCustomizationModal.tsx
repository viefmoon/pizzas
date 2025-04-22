import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  RadioButton,
  Checkbox,
  Divider,
  Title,
  TouchableRipple,
  IconButton,
  TextInput,
} from "react-native-paper";
import { Image } from "expo-image";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { useAppTheme } from "@/app/styles/theme";
import {
  Product,
  ProductVariant,
  Modifier,
  ModifierGroup,
} from "../types/orders.types";
import { CartItemModifier } from "../context/CartContext";
import { getImageUrl } from "@/app/lib/imageUtils";
import { AppTheme } from "@/app/styles/theme";

interface ProductCustomizationModalProps {
  visible: boolean;
  onDismiss: () => void;
  product: Product;
  onAddToCart: (
    product: Product,
    quantity: number,
    variantId?: string,
    modifiers?: CartItemModifier[],
    preparationNotes?: string
  ) => void;
}

interface NotesFormData extends FieldValues {
  preparationNotes: string;
}

const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({
  visible,
  onDismiss,
  product,
  onAddToCart,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { control, reset, watch } = useForm<NotesFormData>({
    defaultValues: { preparationNotes: "" },
  });
  const watchedPreparationNotes = watch("preparationNotes");

  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(
    product &&
      product.variants &&
      Array.isArray(product.variants) &&
      product.variants.length > 0
      ? product.variants[0].id
      : undefined
  );
  const [selectedModifiersByGroup, setSelectedModifiersByGroup] = useState<
    Record<string, CartItemModifier[]>
  >({});

  const selectedModifiers = useMemo(() => {
    return Object.values(selectedModifiersByGroup).flat();
  }, [selectedModifiersByGroup]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;

    if (
      product.variants &&
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId(undefined);
    }
    setSelectedModifiersByGroup({});
    setQuantity(1);
    reset({ preparationNotes: "" });
  }, [product, reset]);

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  const handleModifierToggle = (modifier: Modifier, group: ModifierGroup) => {
    const currentGroupModifiers = selectedModifiersByGroup[group.id] || [];
    const isSelected = currentGroupModifiers.some(
      (mod) => mod.id === modifier.id
    );

    const updatedModifiersByGroup = { ...selectedModifiersByGroup };

    if (isSelected) {
      updatedModifiersByGroup[group.id] = currentGroupModifiers.filter(
        (mod) => mod.id !== modifier.id
      );
    } else {
      const newModifier: CartItemModifier = {
        id: modifier.id,
        name: modifier.name,
        price: Number(modifier.price) || 0,
      };

      if (!group.allowMultipleSelections) {
        updatedModifiersByGroup[group.id] = [newModifier];
      } else {
        if (currentGroupModifiers.length < group.maxSelection) {
          updatedModifiersByGroup[group.id] = [
            ...currentGroupModifiers,
            newModifier,
          ];
        } else {
          alert(
            `Solo puedes seleccionar hasta ${group.maxSelection} opciones en ${group.name}`
          );
          return;
        }
      }
    }

    setSelectedModifiersByGroup(updatedModifiersByGroup);
  };

  const handleAddToCart = () => {
    onAddToCart(
      product,
      quantity,
      selectedVariantId,
      selectedModifiers,
      watchedPreparationNotes
    );
    onDismiss();
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (!product) {
    return null;
  }

  const selectedVariant =
    product.variants && Array.isArray(product.variants)
      ? product.variants.find(
          (variant: ProductVariant) => variant.id === selectedVariantId
        )
      : undefined;

  const basePrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product.price) || 0;
  const modifiersPrice = selectedModifiers.reduce(
    (sum, mod) => sum + Number(mod.price || 0),
    0
  );
  const totalPrice = (basePrice + modifiersPrice) * quantity;

  const imageUrl = product.photo ? getImageUrl(product.photo.path) : null;

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            onPress={onDismiss}
            style={styles.backButton}
            size={24}
          />
          <Title style={styles.title}>{product?.name || "Producto"}</Title>
        </View>

        <ScrollView style={styles.scrollView}>
          {product.hasVariants &&
            product.variants &&
            Array.isArray(product.variants) &&
            product.variants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Variantes</Text>
                <RadioButton.Group
                  onValueChange={(value) => handleVariantSelect(value)}
                  value={selectedVariantId || ""}
                >
                  {product.variants.map((variant: ProductVariant) => (
                    <View key={variant.id} style={styles.optionContainer}>
                      <View style={styles.optionRow}>
                        <RadioButton.Item
                          label={variant.name}
                          labelStyle={styles.modifierTitle}
                          value={variant.id}
                          position="leading"
                          style={styles.radioItem}
                        />
                        <Text style={styles.modifierPrice}>
                          ${Number(variant.price).toFixed(2)}
                        </Text>
                      </View>
                      <Divider style={styles.optionDivider} />
                    </View>
                  ))}
                </RadioButton.Group>
              </View>
            )}

          {product.modifierGroups &&
            Array.isArray(product.modifierGroups) &&
            product.modifierGroups.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Modificadores</Text>
                {product.modifierGroups.map((group: ModifierGroup) => (
                  <View key={group.id} style={styles.modifierGroup}>
                    <View style={styles.modifierGroupHeader}>
                      <Text style={styles.groupTitle}>{group.name}</Text>
                      {group.isRequired ? (
                        <Text style={styles.requiredText}>Obligatorio</Text>
                      ) : (
                        <Text style={styles.optionalText}>Opcional</Text>
                      )}
                    </View>
                    {group.minSelection !== undefined &&
                      group.maxSelection !== undefined && (
                        <Text style={styles.selectionRules}>
                          {group.minSelection === 0 && group.maxSelection === 1
                            ? "Puedes elegir hasta 1 opción"
                            : group.minSelection === group.maxSelection
                              ? `Debes elegir ${group.maxSelection}`
                              : `Mín. ${group.minSelection}, máx. ${group.maxSelection}`}
                        </Text>
                      )}

                    {group.allowMultipleSelections ? (
                      <>
                        {Array.isArray(group.modifiers) &&
                          group.modifiers.map((modifier: Modifier) => {
                            const groupModifiers =
                              selectedModifiersByGroup[group.id] || [];
                            const isSelected = groupModifiers.some(
                              (mod) => mod.id === modifier.id
                            );

                            return (
                              <View
                                key={modifier.id}
                                style={styles.optionContainer}
                              >
                                <TouchableRipple
                                  onPress={() =>
                                    handleModifierToggle(modifier, group)
                                  }
                                  style={styles.optionTouchable}
                                >
                                  <View style={styles.optionRow}>
                                    <View style={styles.checkbox}>
                                      <Checkbox
                                        status={
                                          isSelected ? "checked" : "unchecked"
                                        }
                                        onPress={() =>
                                          handleModifierToggle(modifier, group)
                                        }
                                      />
                                    </View>
                                    <View style={styles.optionContent}>
                                      <Text style={styles.modifierTitle}>
                                        {modifier.name}
                                      </Text>
                                      {Number(modifier.price) > 0 && (
                                        <Text style={styles.modifierPrice}>
                                          +${Number(modifier.price).toFixed(2)}
                                        </Text>
                                      )}
                                    </View>
                                  </View>
                                </TouchableRipple>
                                <Divider style={styles.optionDivider} />
                              </View>
                            );
                          })}
                      </>
                    ) : (
                      <RadioButton.Group
                        onValueChange={(value) => {
                          const modifier = group.modifiers.find(
                            (m: Modifier) => m.id === value
                          );
                          if (modifier) {
                            handleModifierToggle(modifier, group);
                          }
                        }}
                        value={
                          selectedModifiersByGroup[group.id]?.[0]?.id || ""
                        }
                      >
                        {Array.isArray(group.modifiers) &&
                          group.modifiers.map((modifier: Modifier) => (
                            <View
                              key={modifier.id}
                              style={styles.optionContainer}
                            >
                              <View style={styles.optionRow}>
                                <RadioButton.Item
                                  label={modifier.name}
                                  labelStyle={styles.modifierTitle}
                                  value={modifier.id}
                                  position="leading"
                                  style={styles.radioItem}
                                />
                                {Number(modifier.price) > 0 && (
                                  <Text style={styles.modifierPrice}>
                                    +${Number(modifier.price).toFixed(2)}
                                  </Text>
                                )}
                              </View>
                              <Divider style={styles.optionDivider} />
                            </View>
                          ))}
                      </RadioButton.Group>
                    )}
                  </View>
                ))}
              </View>
            )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cantidad</Text>
            <View style={styles.quantityContainer}>
              <Button
                mode="outlined"
                onPress={decreaseQuantity}
                style={styles.quantityButton}
                labelStyle={styles.quantityButtonLabel}
              >
                -
              </Button>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Button
                mode="outlined"
                onPress={increaseQuantity}
                style={styles.quantityButton}
                labelStyle={styles.quantityButtonLabel}
              >
                +
              </Button>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas de Preparación</Text>
            <Controller
              control={control}
              name="preparationNotes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  style={styles.preparationInput}
                />
              )}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen</Text>
            <View style={styles.summaryRow}>
              <Text>Precio base:</Text>
              <Text>${basePrice.toFixed(2)}</Text>
            </View>
            {selectedModifiers.length > 0 && (
              <View style={styles.summaryRow}>
                <Text>Modificadores:</Text>
                <Text>${modifiersPrice.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text>Cantidad:</Text>
              <Text>{quantity}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={styles.addButton}
            icon="cart-plus"
          >
            Agregar al Carrito
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};
const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalContent: {
      backgroundColor: theme.colors.background,
      width: "100%",
      height: "100%",
      margin: 0,
      padding: 0,
      position: "absolute",
      top: 0,
      left: 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
      position: "relative",
    },
    backButton: {
      position: "absolute",
      left: 8,
      zIndex: 1,
    },
    modifierGroup: {
      marginBottom: theme.spacing.s,
    },
    modifierGroupHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    groupTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    groupDescription: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    requiredText: {
      fontSize: 12,
      color: theme.colors.error,
      fontWeight: "500",
    },
    optionalText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    selectionRules: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.xs,
      fontStyle: "italic",
    },
    title: {
      flex: 1,
      fontSize: 22,
      textAlign: "center",
      fontWeight: "bold",
      color: theme.colors.primary,
      marginHorizontal: 40,
    },
    productImage: {
      height: 150,
      borderRadius: theme.roundness,
      marginBottom: theme.spacing.m,
    },
    imagePlaceholder: {
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderText: {
      fontSize: 50,
      color: theme.colors.onSurfaceVariant,
    },
    scrollView: {
      flex: 1,
      padding: theme.spacing.m,
    },
    section: {
      marginBottom: theme.spacing.s,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: theme.spacing.s,
      color: theme.colors.primary,
    },
    optionContainer: {
      marginBottom: 2,
    },
    optionTouchable: {
      paddingVertical: 4,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    optionContent: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingRight: 8,
    },
    checkbox: {
      marginRight: 8,
    },
    optionDivider: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
    },
    radioItem: {
      flex: 1,
      paddingVertical: 4,
    },
    modifierTitle: {
      fontSize: 16,
      fontWeight: "500",
    },
    modifierPrice: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginLeft: "auto",
      marginRight: 8,
    },
    quantityContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    quantityButton: {
      margin: 0,
    },
    quantityButtonLabel: {
      fontSize: 18,
    },
    quantityText: {
      fontSize: 18,
      fontWeight: "bold",
      paddingHorizontal: theme.spacing.m,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.xs,
    },
    divider: {
      marginVertical: theme.spacing.s,
    },
    totalText: {
      fontWeight: "bold",
      fontSize: 16,
    },
    totalPrice: {
      fontWeight: "bold",
      fontSize: 16,
      color: theme.colors.primary,
    },
    buttonsContainer: {
      padding: theme.spacing.m,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
    addButton: {
      width: "100%",
      paddingVertical: 8,
    },
    preparationInput: {
      backgroundColor: theme.colors.surfaceVariant,
      marginVertical: theme.spacing.xs,
    },
  });

export default ProductCustomizationModal;
