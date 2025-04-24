import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native'; // FlatList eliminado
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list"; // Importar FlashList y tipo
import {
  Modal,
  Portal,
  Text,
  Button,
  List,
  Divider,
  ActivityIndicator,
  Appbar,
} from 'react-native-paper';
import { useAppTheme, AppTheme } from '../../../app/styles/theme'; // Corregida ruta
import { usePrintersQuery } from '../../printers/hooks/usePrintersQueries'; // Corregida ruta
import type { ThermalPrinter } from '../../printers/types/printer.types'; // Corregida ruta
import { getApiErrorMessage } from '../../../app/lib/errorMapping'; // Corregida ruta

interface PrinterSelectionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onPrinterSelect: (printer: ThermalPrinter) => void;
  title?: string;
}

const PrinterSelectionModal: React.FC<PrinterSelectionModalProps> = ({
  visible,
  onDismiss,
  onPrinterSelect,
  title = "Seleccionar Impresora",
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Obtener impresoras registradas y activas
  const {
    data: printersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePrintersQuery({ isActive: true, limit: 100, page: 1 }); // Añadir page: 1

  const printers = printersResponse?.data ?? [];

  const renderPrinterItem = ({ item }: ListRenderItemInfo<ThermalPrinter>) => ( // Añadir tipo
    <List.Item
      title={item.name}
      description={`Tipo: ${item.connectionType}${item.ipAddress ? ` - IP: ${item.ipAddress}` : ''}`}
      left={(props) => <List.Icon {...props} icon="printer" />}
      onPress={() => onPrinterSelect(item)}
      style={styles.listItem}
      titleStyle={styles.itemTitle}
      descriptionStyle={styles.itemDescription}
    />
  );

  const ListEmptyComponent = useMemo(() => (
      <View style={styles.centeredView}>
        {isLoading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : isError ? (
          <>
            <Text style={styles.errorText}>Error: {getApiErrorMessage(error)}</Text>
            <Button onPress={() => refetch()}>Reintentar</Button> // Envolver refetch
          </>
        ) : (
          <Text style={styles.statusText}>No hay impresoras activas configuradas.</Text>
        )}
      </View>
    ), [isLoading, isError, error, refetch, styles, theme]);


  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
      >
        <Appbar.Header style={styles.appBar} elevated>
          <Appbar.BackAction onPress={onDismiss} color={theme.colors.onSurface} />
          <Appbar.Content title={title} titleStyle={styles.appBarTitle} />
        </Appbar.Header>

        <View style={styles.contentContainer}>
          <FlashList
            data={printers}
            renderItem={renderPrinterItem}
            keyExtractor={(item: ThermalPrinter) => item.id} // Añadir tipo
            estimatedItemSize={70} // Añadir tamaño estimado
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            ListEmptyComponent={() => <View style={styles.centeredView}>{ListEmptyComponent}</View>} // Usar el nombre correcto de la variable
            // contentContainerStyle eliminado
          />
        </View>
      </Modal>
    </Portal>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalContent: {
      backgroundColor: theme.colors.background,
      width: '90%', // Ancho del modal
      maxHeight: '70%', // Altura máxima
      alignSelf: 'center', // Centrar modal
      borderRadius: theme.roundness * 2,
      elevation: 5,
      overflow: 'hidden', // Para que el border radius funcione con Appbar
    },
    appBar: {
      backgroundColor: theme.colors.elevation.level2,
    },
    appBarTitle: {
      ...theme.fonts.titleMedium,
      color: theme.colors.onSurface,
      fontWeight: 'bold',
    },
    contentContainer: {
      flexGrow: 1, // Permitir que FlatList crezca
      paddingBottom: theme.spacing.m, // Espacio inferior
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.l,
    },
    statusText: {
      marginTop: theme.spacing.m,
      fontSize: 16,
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    errorText: {
      marginTop: theme.spacing.m,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: theme.spacing.m,
    },
    list: {
      flex: 1,
    },
    listItem: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.m,
    },
    itemTitle: {
      fontWeight: '500',
    },
    itemDescription: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.outlineVariant,
    },
    emptyListContainer: { // Estilo para centrar el ListEmptyComponent
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
  });

export default PrinterSelectionModal;