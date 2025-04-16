import React, { useState, useMemo, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  Title,
  Divider,
  List,
  Button,
  RadioButton,
  HelperText,
  Menu,
  ActivityIndicator,
  IconButton,
  Modal,
  Portal,
} from "react-native-paper";
import { useAppTheme } from "@/app/styles/theme";
import { OrderType } from "../types/orders.types";
import { useGetAreas } from "@/modules/areasTables/services/areaService";
import { useGetTablesByArea } from "@/modules/areasTables/services/tableService";
import type {
  Area,
  Table,
} from "@/modules/areasTables/types/areasTables.types";
import { useCart } from "../context/CartContext";

interface OrderCartDetailProps {
  visible: boolean;
  onConfirmOrder: (details: { orderType: OrderType; tableId?: string }) => void;
  onClose?: () => void;
}

const OrderCartDetail: React.FC<OrderCartDetailProps> = ({
  visible,
  onConfirmOrder,
  onClose,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { items, removeItem, updateItemQuantity, subtotal, total } = useCart();

  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  // Estado para selección de área y mesa
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [areaMenuVisible, setAreaMenuVisible] = useState(false);
  const [tableMenuVisible, setTableMenuVisible] = useState(false);
  // Separar los mensajes de error
  const [areaError, setAreaError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);

  // Obtener datos de áreas y mesas
  const {
    data: areasData,
    isLoading: isLoadingAreas,
    error: errorAreas,
  } = useGetAreas();
  const {
    data: tablesData,
    isLoading: isLoadingTables,
    error: errorTables,
  } = useGetTablesByArea(selectedAreaId);

  // Validar selección de área y mesa cuando es DINE_IN
  useEffect(() => {
    if (orderType === OrderType.DINE_IN) {
      if (!selectedAreaId) {
        setAreaError("Debe seleccionar un área");
      } else {
        setAreaError(null);
      }
      if (!selectedTableId) {
        setTableError("Debe seleccionar una mesa");
      } else {
        setTableError(null);
      }
    } else {
      setAreaError(null);
      setTableError(null);
    }
  }, [orderType, selectedAreaId, selectedTableId]);

  const handleConfirm = () => {
    // Validar que haya items en el carrito
    if (items.length === 0) {
      return;
    }

    // Validar área y mesa para DINE_IN
    if (
      orderType === OrderType.DINE_IN &&
      (!selectedAreaId || !selectedTableId)
    ) {
      if (!selectedAreaId) setAreaError("Debe seleccionar un área");
      if (!selectedTableId) setTableError("Debe seleccionar una mesa");
      return;
    }
    onConfirmOrder({
      orderType,
      tableId:
        orderType === OrderType.DINE_IN
          ? (selectedTableId ?? undefined)
          : undefined,
    });
  };

  // Nombres seleccionados para mostrar en los botones
  const selectedAreaName = useMemo(
    () => areasData?.find((a) => a.id === selectedAreaId)?.name,
    [areasData, selectedAreaId]
  );
  const selectedTableName = useMemo(
    () => tablesData?.find((t) => t.id === selectedTableId)?.name,
    [tablesData, selectedTableId]
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              onPress={onClose}
              style={styles.backButton}
              size={24}
            />
            <Title style={styles.title}>Resumen de Orden</Title>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Selección de Tipo de Orden */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TIPO DE ORDEN</Text>
              <RadioButton.Group
                onValueChange={(newValue) =>
                  setOrderType(newValue as OrderType)
                }
                value={orderType}
              >
                <View style={styles.radioGroupHorizontal}>
                  <View style={styles.radioOptionHorizontal}>
                    <RadioButton value={OrderType.DINE_IN} />
                    <Text style={styles.radioLabel}>COMER AQUÍ</Text>
                  </View>
                  <View style={styles.radioOptionHorizontal}>
                    <RadioButton value={OrderType.TAKE_AWAY} />
                    <Text style={styles.radioLabel}>PARA LLEVAR</Text>
                  </View>
                  <View style={styles.radioOptionHorizontal}>
                    <RadioButton value={OrderType.DELIVERY} />
                    <Text style={styles.radioLabel}>DOMICILIO</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>

            {/* Selección de Área y Mesa (Condicional) */}
            {orderType === OrderType.DINE_IN && (
              <>
                {/* --- Selector de Área --- */}
                <View style={styles.sectionCompact}>
                  <Text style={styles.sectionTitle}>ÁREA</Text>
                  {isLoadingAreas ? (
                    <ActivityIndicator animating={true} />
                  ) : errorAreas ? (
                    <Text style={styles.errorText}>Error al cargar áreas</Text>
                  ) : (
                    <Menu
                      visible={areaMenuVisible}
                      onDismiss={() => setAreaMenuVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setAreaMenuVisible(true)}
                          style={styles.dropdownAnchor}
                          contentStyle={styles.dropdownContent}
                          labelStyle={styles.dropdownLabel}
                          icon="chevron-down"
                        >
                          <Text>{selectedAreaName ?? "Seleccionar Área"}</Text>
                        </Button>
                      }
                    >
                      {areasData?.map((area: Area) => (
                        <Menu.Item
                          key={area.id}
                          onPress={() => {
                            setSelectedAreaId(area.id);
                            setSelectedTableId(null);
                            setAreaMenuVisible(false);
                          }}
                          title={area.name}
                        />
                      ))}
                    </Menu>
                  )}
                  {areaError && (
                    <HelperText type="error" visible={true}>
                      {areaError}
                    </HelperText>
                  )}
                </View>

                {/* --- Selector de Mesa --- */}
                <View style={styles.sectionCompact}>
                  <Text style={styles.sectionTitle}>MESA</Text>
                  {isLoadingTables ? (
                    <ActivityIndicator animating={true} />
                  ) : errorTables ? (
                    <Text style={styles.errorText}>Error al cargar mesas</Text>
                  ) : (
                    <Menu
                      visible={tableMenuVisible}
                      onDismiss={() => setTableMenuVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setTableMenuVisible(true)}
                          style={styles.dropdownAnchor}
                          contentStyle={styles.dropdownContent}
                          labelStyle={styles.dropdownLabel}
                          icon="chevron-down"
                          disabled={
                            !selectedAreaId ||
                            isLoadingTables ||
                            tablesData?.length === 0
                          }
                        >
                          <Text>{selectedTableName ?? "Seleccionar Mesa"}</Text>
                        </Button>
                      }
                    >
                      {tablesData?.map((table: Table) => (
                        <Menu.Item
                          key={table.id}
                          onPress={() => {
                            setSelectedTableId(table.id);
                            setTableMenuVisible(false);
                          }}
                          title={table.name}
                        />
                      ))}
                      {selectedAreaId &&
                        tablesData?.length === 0 &&
                        !isLoadingTables && (
                          <Menu.Item
                            title="No hay mesas en esta área"
                            disabled
                          />
                        )}
                    </Menu>
                  )}
                  {tableError && (
                    <HelperText type="error" visible={true}>
                      {tableError}
                    </HelperText>
                  )}
                </View>
              </>
            )}

            {/* TODO: Añadir campos para Domicilio si orderType es DELIVERY */}

            {/* Separador antes de la lista */}
            <Divider style={styles.divider} />

            {/* Lista de Items (Movido aquí) */}
            <List.Section>
              {items.map((item) => {
                // Log para depurar el item
                console.log("Rendering item:", JSON.stringify(item, null, 2));
                return (
                  <List.Item
                    key={item.id}
                    // Asegurar que productName y variantName sean strings
                    title={`${item.quantity}x ${String(item.productName ?? "")}${item.variantName ? ` (${String(item.variantName ?? "")})` : ""}`}
                    description={
                      item.modifiers && item.modifiers.length > 0
                        ? item.modifiers.map((mod) => mod.name).join(", ")
                        : null // Devolver null explícitamente si no hay descripción
                    }
                    right={() => {
                      // Log para depurar el renderizado del prop 'right'
                      console.log("Rendering right prop for item:", item.id);
                      return (
                        <View style={styles.itemActionsContainer}>
                          <View style={styles.quantityActions}>
                            <IconButton
                              icon="minus"
                              size={16}
                              onPress={() =>
                                updateItemQuantity(item.id, item.quantity - 1)
                              }
                            />
                            <Text>{item.quantity}</Text>
                            <IconButton
                              icon="plus"
                              size={16}
                              onPress={() =>
                                updateItemQuantity(item.id, item.quantity + 1)
                              }
                            />
                          </View>
                          <Text style={styles.itemPrice}>
                            ${item.totalPrice.toFixed(2)}
                          </Text>
                          <IconButton
                            icon="delete"
                            size={16}
                            onPress={() => removeItem(item.id)}
                            style={styles.deleteButton}
                          />
                        </View>
                      );
                    }}
                  />
                );
              })}
            </List.Section>

            {/* Separador antes de totales */}
            <Divider style={styles.divider} />

            {/* Totales (Movido aquí) */}
            <View style={styles.totalsContainer}>
              <Text style={styles.totalsText}>Subtotal:</Text>
              <Text style={styles.totalsValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsContainer}>
              <Text style={[styles.totalsText, styles.totalLabel]}>Total:</Text>
              <Text style={[styles.totalsValue, styles.totalValue]}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </ScrollView>

          {/* Botón de Enviar Orden */}
          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleConfirm}
              disabled={
                items.length === 0 || // Deshabilitar si no hay items
                (orderType === OrderType.DINE_IN &&
                  (!selectedAreaId || !selectedTableId))
              }
              style={styles.confirmButton}
            >
              Enviar Orden
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

// --- Estilos ---
const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
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
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
    title: {
      flex: 1,
      fontSize: 22,
      textAlign: "center",
      fontWeight: "bold",
      color: theme.colors.primary,
      marginHorizontal: 40,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
    },
    divider: {
      marginVertical: theme.spacing.xs,
    },
    itemActionsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    quantityActions: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: theme.spacing.s,
    },
    itemPrice: {
      alignSelf: "center",
      marginRight: theme.spacing.s,
      color: theme.colors.onSurfaceVariant,
      width: 60,
      textAlign: "right",
    },
    deleteButton: {
      margin: 0,
    },
    totalsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
    },
    totalsText: {
      fontSize: 16,
    },
    totalsValue: {
      fontSize: 16,
      fontWeight: "bold",
    },
    totalLabel: {
      fontWeight: "bold",
      fontSize: 18,
    },
    totalValue: {
      fontSize: 18,
      color: theme.colors.primary,
    },
    section: {
      marginBottom: theme.spacing.s,
    },
    sectionCompact: {
      marginBottom: theme.spacing.xs,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: theme.spacing.xs,
    },
    radioGroupHorizontal: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    radioOptionHorizontal: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 1,
    },
    radioLabel: {
      marginLeft: 2,
      fontSize: 11,
      textTransform: "uppercase",
      flexShrink: 1,
    },
    dropdownAnchor: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
      borderWidth: 1,
      justifyContent: "center",
    },
    dropdownContent: {
      height: 50,
      justifyContent: "center",
    },
    dropdownLabel: {
      textAlign: "left",
      flexGrow: 1,
      color: theme.colors.onSurface,
    },
    errorText: {
      color: theme.colors.error,
      marginTop: theme.spacing.s,
      textAlign: "center",
    },
    footer: {
      padding: theme.spacing.m,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surface,
    },
    confirmButton: {
      marginBottom: theme.spacing.s,
    },
  });

export default OrderCartDetail;
