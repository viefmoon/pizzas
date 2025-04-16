import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
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
} from 'react-native-paper';
import { useAppTheme } from '@/app/styles/theme';
import { OrderType, OrderItem } from '../types/orders.types';
import { useGetAreas } from '@/modules/areasTables/services/areaService'; // Importar desde areaService
import { useGetTablesByArea } from '@/modules/areasTables/services/tableService'; // Importar desde tableService
import type { Area, Table } from '@/modules/areasTables/types/areasTables.types';

// Simulación de items en la orden para visualización
const mockOrderItems: OrderItem[] = [
  {
    id: 'item1',
    productId: 'prod1',
    productName: 'Pizza Margarita',
    quantity: 1,
    unitPrice: 12.5,
    totalPrice: 12.5,
    modifiers: [],
  },
  {
    id: 'item2',
    productId: 'prod2',
    productName: 'Refresco Cola',
    quantity: 2,
    unitPrice: 1.5,
    totalPrice: 3.0,
    modifiers: [],
  },
];

interface OrderCartDetailProps {
  // items: OrderItem[]; // Descomentar cuando se pasen los items reales
  onConfirmOrder: (details: { orderType: OrderType; tableId?: string }) => void;
  onClose?: () => void;
}

const OrderCartDetail: React.FC<OrderCartDetailProps> = ({ onConfirmOrder, onClose }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  // Estado para selección de área y mesa
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [areaMenuVisible, setAreaMenuVisible] = useState(false);
  const [tableMenuVisible, setTableMenuVisible] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null); // Error para selección

  // Obtener datos de áreas y mesas
  const { data: areasData, isLoading: isLoadingAreas, error: errorAreas } = useGetAreas();
  const { data: tablesData, isLoading: isLoadingTables, error: errorTables } = useGetTablesByArea(selectedAreaId);

  // Simulación de items (reemplazar con props.items cuando estén disponibles)
  const items = mockOrderItems;
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal * 1.16; // Simulación IVA

  // Validar selección de área y mesa cuando es DINE_IN
  useEffect(() => {
    if (orderType === OrderType.DINE_IN && (!selectedAreaId || !selectedTableId)) {
      setSelectionError('Debe seleccionar un área y una mesa.');
    } else {
      setSelectionError(null);
    }
    // Resetear selección si se cambia a otro tipo de orden
    if (orderType !== OrderType.DINE_IN) {
        setSelectedAreaId(null);
        setSelectedTableId(null);
    }
  }, [orderType, selectedAreaId, selectedTableId]);

  const handleConfirm = () => {
    if (orderType === OrderType.DINE_IN && (!selectedAreaId || !selectedTableId)) {
      setSelectionError('Debe seleccionar un área y una mesa.');
      return; // No confirmar si hay error
    }
    // Pasar el ID de la mesa seleccionada solo si el tipo es DINE_IN
    onConfirmOrder({ orderType, tableId: orderType === OrderType.DINE_IN ? selectedTableId ?? undefined : undefined });
  };

  // Nombres seleccionados para mostrar en los botones
  const selectedAreaName = useMemo(() => areasData?.find(a => a.id === selectedAreaId)?.name, [areasData, selectedAreaId]);
  const selectedTableName = useMemo(() => tablesData?.find(t => t.id === selectedTableId)?.name, [tablesData, selectedTableId]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Title style={styles.title}>Resumen de Orden</Title>

        {/* Lista de Items */}
        <List.Section>
          {items.map((item) => (
            <List.Item
              key={item.id}
              title={`${item.quantity}x ${item.productName}`}
              description={`$${item.totalPrice.toFixed(2)}`}
              right={() => <Text style={styles.itemPrice}>${item.unitPrice.toFixed(2)} c/u</Text>}
            />
          ))}
        </List.Section>

        <Divider style={styles.divider} />

        {/* Totales */}
        <View style={styles.totalsContainer}>
          <Text style={styles.totalsText}>Subtotal:</Text>
          <Text style={styles.totalsValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsContainer}>
          <Text style={[styles.totalsText, styles.totalLabel]}>Total:</Text>
          <Text style={[styles.totalsValue, styles.totalValue]}>${total.toFixed(2)}</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Selección de Tipo de Orden */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TIPO DE ORDEN</Text>
          <RadioButton.Group onValueChange={newValue => setOrderType(newValue as OrderType)} value={orderType}>
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
            <View style={styles.section}>
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
                      {selectedAreaName ?? 'Seleccionar Área'}
                    </Button>
                  }>
                  {areasData?.map((area: Area) => (
                    <Menu.Item
                      key={area.id}
                      onPress={() => {
                        setSelectedAreaId(area.id);
                        setSelectedTableId(null); // Resetear mesa al cambiar área
                        setAreaMenuVisible(false);
                      }}
                      title={area.name}
                    />
                  ))}
                </Menu>
              )}
            </View>

            {/* --- Selector de Mesa --- */}
            <View style={styles.section}>
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
                      disabled={!selectedAreaId || isLoadingTables || tablesData?.length === 0} // Deshabilitar si no hay área, cargando, o no hay mesas
                    >
                      {selectedTableName ?? 'Seleccionar Mesa'}
                    </Button>
                  }>
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
                   {/* Mostrar mensaje si no hay mesas */}
                   {selectedAreaId && tablesData?.length === 0 && !isLoadingTables && (
                     <Menu.Item title="No hay mesas en esta área" disabled />
                   )}
                </Menu>
              )}
            </View>

            {/* Mostrar error de selección general */}
            {selectionError && <HelperText type="error" visible={!!selectionError}>{selectionError}</HelperText>}
          </>
        )}

        {/* TODO: Añadir campos para Domicilio si orderType es DELIVERY */}

      </ScrollView>

      {/* Botón de Confirmar */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleConfirm}
          disabled={!!selectionError && orderType === OrderType.DINE_IN} // Deshabilitar si hay error de selección
          style={styles.confirmButton}
        >
          Confirmar Orden
        </Button>
        {onClose && (
          <Button mode="outlined" onPress={onClose} style={styles.closeButton}>
            Cerrar
          </Button>
        )}
      </View>
    </View>
  );
};

// --- Estilos ---
const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
    },
    title: {
      marginTop: theme.spacing.m,
      marginBottom: theme.spacing.s,
      textAlign: 'center',
    },
    divider: {
      marginVertical: theme.spacing.m,
    },
    itemPrice: {
      alignSelf: 'center',
      marginRight: theme.spacing.s,
      color: theme.colors.onSurfaceVariant,
    },
    totalsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    totalsText: {
      fontSize: 16,
    },
    totalsValue: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    totalLabel: {
      fontWeight: 'bold',
      fontSize: 18,
    },
    totalValue: {
      fontSize: 18,
      color: theme.colors.primary,
    },
    section: {
      marginBottom: theme.spacing.m,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: theme.spacing.s,
      textTransform: 'uppercase',
    },
    radioGroupHorizontal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    radioOptionHorizontal: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    radioLabel: {
      marginLeft: 2,
      fontSize: 11,
      textTransform: 'uppercase',
      flexShrink: 1,
    },
    dropdownAnchor: { // Estilo para el botón que abre el menú
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
      borderWidth: 1, // Necesario para que el borde sea visible en outlined
      justifyContent: 'center',
    },
    dropdownContent: { // Estilo para el contenido interno del botón
      height: 50, // Altura similar a TextInput
      justifyContent: 'center', // Centrar texto verticalmente
    },
    dropdownLabel: { // Estilo para el texto dentro del botón
      textAlign: 'left',
      flexGrow: 1,
      color: theme.colors.onSurface, // Color de texto normal
    },
    errorText: { // Estilo para mensajes de error de carga
      color: theme.colors.error,
      marginTop: theme.spacing.s,
      textAlign: 'center',
    },
    // input: { // Ya no se usa directamente aquí, pero se deja por si acaso
    //   backgroundColor: theme.colors.surface,
    // },
    footer: {
      padding: theme.spacing.m,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surface,
    },
    confirmButton: {
      marginBottom: theme.spacing.s,
    },
    closeButton: {
      // Estilos adicionales si son necesarios
    },
  });

export default OrderCartDetail;