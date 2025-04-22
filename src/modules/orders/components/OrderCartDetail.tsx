import React, { useState, useMemo, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  Divider,
  List,
  Button,
  RadioButton,
  HelperText,
  Menu,
  IconButton,
  Modal,
  Portal,
} from "react-native-paper";
import { useAppTheme } from "@/app/styles/theme";
import { OrderType } from "../types/orders.types";
import { useGetAreas } from "@/modules/areasTables/services/areaService";
import OrderHeader from "./OrderHeader";
import AnimatedLabelSelector from "@/app/components/common/AnimatedLabelSelector";
import AnimatedLabelInput from "@/app/components/common/AnimatedLabelInput";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ConfirmationModal from "@/app/components/common/ConfirmationModal";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGetTablesByArea } from "@/modules/areasTables/services/tableService";
import type { Table } from "@/modules/areasTables/types/areasTables.types";
import { useCart } from "../context/CartContext";

interface OrderCartDetailProps {
  visible: boolean;
  onConfirmOrder: (details: { orderType: OrderType; tableId?: string; scheduledAt?: Date; phoneNumber?: string; notes?: string }) => void;
  onClose?: () => void;
}

const OrderCartDetail: React.FC<OrderCartDetailProps> = ({
  visible,
  onConfirmOrder,
  onClose,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { items, removeItem, updateItemQuantity, subtotal, total, isCartVisible } = useCart();

  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [areaMenuVisible, setAreaMenuVisible] = useState(false);
  const [tableMenuVisible, setTableMenuVisible] = useState(false);
  const [areaError, setAreaError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isTimeAlertVisible, setTimeAlertVisible] = useState(false);

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

  useEffect(() => {
    if (orderType !== OrderType.DINE_IN) {
      setAreaError(null);
      setTableError(null);
    }
    if (orderType !== OrderType.DELIVERY && orderType !== OrderType.TAKE_AWAY) {
        setPhoneError(null);
    }
  }, [orderType]);

  const handleConfirm = () => {
    setAreaError(null);
    setTableError(null);
    setPhoneError(null);

    if (items.length === 0) {
      return;
    }

    let isValid = true;

    if (orderType === OrderType.DINE_IN) {
      if (!selectedAreaId) {
        setAreaError("Debe seleccionar un área");
        isValid = false;
      }
      if (!selectedTableId) {
        setTableError("Debe seleccionar una mesa");
        isValid = false;
      }
    }

    
    if (orderType === OrderType.DELIVERY) {
      if (!phoneNumber || phoneNumber.trim() === '') {
        setPhoneError("El teléfono es obligatorio para Domicilio");
        isValid = false;
      }
      
    } else if (orderType === OrderType.TAKE_AWAY) {
        
    }


    
    if (!isValid) {
      return;
    }

    
    onConfirmOrder({
      orderType,
      tableId: orderType === OrderType.DINE_IN ? selectedTableId ?? undefined : undefined,
      scheduledAt: scheduledTime ?? undefined,
      phoneNumber: (orderType === OrderType.TAKE_AWAY || orderType === OrderType.DELIVERY) ? phoneNumber : undefined, 
      notes: orderNotes || undefined, 
    });
  };

  
  const selectedAreaName = useMemo(
    () => areasData?.find((a: any) => a.id === selectedAreaId)?.name, 
    [areasData, selectedAreaId]
  );
  const selectedTableName = useMemo(
    () => tablesData?.find((t) => t.id === selectedTableId)?.name,
    [tablesData, selectedTableId]
  );

  const showTimePicker = () => setTimePickerVisible(true);
  const hideTimePicker = () => setTimePickerVisible(false);
  const handleTimeConfirm = (date: Date) => {
    const now = new Date();

    now.setSeconds(0, 0);
    date.setSeconds(0, 0);

    if (date < now) {
      hideTimePicker();
      setTimeAlertVisible(true);
    } else {
      setScheduledTime(date);
      hideTimePicker();
    }
  };

  const formattedScheduledTime = useMemo(() => {
    if (!scheduledTime) return null;
    try {
      return format(scheduledTime, "p", { locale: es });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Hora inválida";
    }
  }, [scheduledTime]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.container}>
          <OrderHeader
            title="Resumen de Orden"
            onBackPress={onClose}
            itemCount={items.length}
            onCartPress={() => {}}
            isCartVisible={isCartVisible}
          />

          <ScrollView style={styles.scrollView}>
            <View style={styles.sectionCompact}>
              <RadioButton.Group
                onValueChange={(newValue) =>
                  setOrderType(newValue as OrderType)
                }
                value={orderType}
              >
                <View style={styles.radioGroupHorizontal}>
                  <RadioButton.Item
                    label="COMER AQUÍ"
                    value={OrderType.DINE_IN}
                    style={styles.radioButtonItem}
                    labelStyle={styles.radioLabel}
                    position="leading"
                  />
                  <RadioButton.Item
                    label="PARA LLEVAR"
                    value={OrderType.TAKE_AWAY}
                    style={styles.radioButtonItem}
                    labelStyle={styles.radioLabel}
                    position="leading"
                  />
                  <RadioButton.Item
                    label="DOMICILIO"
                    value={OrderType.DELIVERY}
                    style={styles.radioButtonItem}
                    labelStyle={styles.radioLabel}
                    position="leading"
                  />
                </View>
              </RadioButton.Group>
            </View>

            {orderType === OrderType.DINE_IN && (
              <View style={styles.dineInSelectorsRow}>
                <View style={styles.dineInSelectorContainer}>
                  <Menu
                    visible={areaMenuVisible}
                    onDismiss={() => setAreaMenuVisible(false)}
                    anchor={
                      <AnimatedLabelSelector
                        label="Área"
                        value={selectedAreaName}
                        onPress={() => setAreaMenuVisible(true)}
                        isLoading={isLoadingAreas}
                        error={!!areaError || !!errorAreas} 
                        disabled={isLoadingAreas} 
                      />
                    }
                  >
                    {areasData?.map((area: any) => ( 
                      <Menu.Item
                        key={area.id}
                        onPress={() => {
                          setSelectedAreaId(area.id);
                          setSelectedTableId(null); 
                          setAreaMenuVisible(false);
                          setAreaError(null); 
                        }}
                        title={area.name}
                      />
                    ))}
                    {errorAreas && (
                      <Menu.Item title="Error al cargar áreas" disabled />
                    )}
                  </Menu>
                  {areaError && !errorAreas && (
                    <HelperText type="error" visible={true} style={styles.helperTextFix}>
                      {areaError}
                    </HelperText>
                  )}
                  {errorAreas && (
                    <HelperText type="error" visible={true} style={styles.helperTextFix}>
                      Error al cargar áreas
                    </HelperText>
                  )}
                </View>

                <View style={styles.dineInSelectorContainer}>
                  <Menu
                    visible={tableMenuVisible}
                    onDismiss={() => setTableMenuVisible(false)}
                    anchor={
                      <AnimatedLabelSelector
                        label="Mesa"
                        value={selectedTableName}
                        onPress={() => setTableMenuVisible(true)}
                        isLoading={isLoadingTables}
                        error={!!tableError || !!errorTables}
                        disabled={!selectedAreaId || isLoadingTables || isLoadingAreas} 
                      />
                    }
                  >
                    {tablesData?.map((table: Table) => (
                      <Menu.Item
                        key={table.id}
                        onPress={() => {
                          setSelectedTableId(table.id);
                          setTableMenuVisible(false);
                          setTableError(null); 
                        }}
                        title={table.name}
                      />
                    ))}
                    {selectedAreaId && tablesData?.length === 0 && !isLoadingTables && !errorTables && (
                      <Menu.Item title="No hay mesas" disabled />
                    )}
                    {errorTables && (
                      <Menu.Item title="Error al cargar mesas" disabled />
                    )}
                  </Menu>
                  {tableError && !errorTables && (
                    <HelperText type="error" visible={true} style={styles.helperTextFix}>
                      {tableError}
                    </HelperText>
                  )}
                  {errorTables && (
                    <HelperText type="error" visible={true} style={styles.helperTextFix}>
                      Error al cargar mesas
                    </HelperText>
                  )}
                </View>
              </View>
            )}

            <View style={styles.sectionCompact}>
              <AnimatedLabelSelector
                label="Programar Hora (Opcional)"
                value={formattedScheduledTime}
                onPress={showTimePicker}
                onClear={() => setScheduledTime(null)}
              />
            </View>

            {(orderType === OrderType.TAKE_AWAY || orderType === OrderType.DELIVERY) && (
              <View style={styles.sectionCompact}>
                <AnimatedLabelInput
                  label={`Teléfono${orderType === OrderType.DELIVERY ? ' *' : ''}`}
                  value={phoneNumber}
                  onChangeText={(text) => {
                      setPhoneNumber(text);
                      if (phoneError) setPhoneError(null);
                  }}
                  keyboardType="phone-pad"
                  error={!!phoneError}
                />
                {phoneError && (
                  <HelperText type="error" visible={true} style={styles.helperTextFix}>
                    {phoneError}
                  </HelperText>
                )}
                {!phoneError && orderType === OrderType.DELIVERY && (
                  <HelperText type="info" visible={true} style={styles.helperTextFix}>
                    Obligatorio para Domicilio
                  </HelperText>
                )}
              </View>
            )}

            <View style={styles.sectionCompact}>
                <AnimatedLabelInput
                  label="Notas de la Orden (Opcional)"
                  value={orderNotes}
                  onChangeText={setOrderNotes}
                />
            </View>

            <Divider style={styles.divider} />

            <List.Section>
              {items.map((item) => {
                return (
                  <List.Item
                    key={item.id}
                    title={`${item.quantity}x ${String(item.productName ?? "")}${item.variantName ? ` (${String(item.variantName ?? "")})` : ""}`}
                    description={() => {
                      const modifierString =
                        item.modifiers && item.modifiers.length > 0
                          ? item.modifiers.map((mod) => mod.name).join(", ")
                          : "";
                      const notesString = item.preparationNotes
                        ? `Notas: ${item.preparationNotes}`
                        : "";

                      if (modifierString && notesString) {
                        return (
                          <Text numberOfLines={3}>
                            {modifierString}\n{notesString}
                          </Text>
                        );
                      } else if (modifierString) {
                        return <Text numberOfLines={2}>{modifierString}</Text>;
                      } else if (notesString) {
                        return <Text numberOfLines={2}>{notesString}</Text>;
                      } else {
                        return null;
                      }
                    }}
                    right={() => {
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

            <Divider style={styles.divider} />

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

          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleConfirm}
              disabled={
                items.length === 0 ||
                (orderType === OrderType.DINE_IN &&
                  (!selectedAreaId || !selectedTableId)) ||
                (orderType === OrderType.DELIVERY && (!phoneNumber || phoneNumber.trim() === ''))
              }
              style={styles.confirmButton}
            >
              Enviar Orden
            </Button>
          </View>
        </View>

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          minimumDate={new Date()}
          onConfirm={handleTimeConfirm}
          onCancel={hideTimePicker}
          date={scheduledTime || new Date()}
          locale="es_ES"
          minuteInterval={15}
        />

        <ConfirmationModal
          visible={isTimeAlertVisible}
          title="Hora Inválida"
          message="No puedes seleccionar una hora que ya ha pasado. Por favor, elige una hora futura."
          confirmText="Entendido"
          onConfirm={() => setTimeAlertVisible(false)}
        />
      </Modal>
    </Portal>
  );
};


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
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
    },
    divider: {
      marginVertical: theme.spacing.s,
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
      paddingHorizontal: theme.spacing.xs, 
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
      marginBottom: theme.spacing.m,
      marginTop: theme.spacing.s,
    },
    sectionCompact: {
      marginBottom: 0,
      paddingBottom: theme.spacing.s,
    },
    dineInSelectorsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 0,
      gap: theme.spacing.s,
    },
    dineInSelectorContainer: {
      flex: 1,
    },
    selectorLoader: {
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: theme.spacing.xs,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: theme.spacing.xs,
    },
    sectionTitleOptional: {
      ...theme.fonts.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.xs,
    },
    radioGroupHorizontal: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      paddingVertical: theme.spacing.xs,
    },
    radioLabel: {
      marginLeft: 0,
      fontSize: 11,
      textTransform: "uppercase",
      textAlign: 'center',
    },
    radioButtonItem: {
      paddingHorizontal: 0,
      paddingVertical: 4,
      flexShrink: 1,
      flex: 1,
      marginHorizontal: 2,
    },
    dropdownAnchor: {
    },
    dropdownContent: {
    },
    dropdownLabel: {
    },
    helperTextFix: {
      marginTop: -6,
      marginBottom: theme.spacing.s,
      paddingHorizontal: 12,
    },
    errorText: {
    },
    footer: {
      padding: theme.spacing.m,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surface,
    },
    confirmButton: {
      paddingVertical: theme.spacing.xs,
    },
    input: {
    },
  });
export default OrderCartDetail;
