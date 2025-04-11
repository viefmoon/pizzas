import React from 'react';
import GenericFormModal, {
  FormFieldConfig,
} from '../../../app/components/crud/GenericFormModal';
import {
  Table,
  CreateTableDto,
  UpdateTableDto,
  CreateTableSchema,
  UpdateTableSchema,
} from '../types/table.types';
import { Area } from '../types/area.types'; // Import Area type if needed for dropdown
import { z } from 'zod';
// TODO: Import useGetAreas hook to populate area selector
// import { useGetAreas } from '../hooks/useAreasQueries';

// Definir los campos del formulario para Table
const tableFormFields: FormFieldConfig<CreateTableDto | UpdateTableDto>[] = [
  {
    name: 'name',
    label: 'Nombre de la Mesa',
    type: 'text',
    placeholder: 'Ej: Mesa 1, Barra 2',
    required: true,
  },
  {
    name: 'areaId',
    label: 'Área',
    type: 'text', // TODO: Cambiar a un tipo 'select' o 'picker'
    placeholder: 'Seleccione el área',
    required: true,
    // inputProps: { editable: false } // Podría ser útil si se usa un selector modal
  },
  {
    name: 'capacity',
    label: 'Capacidad (Opcional)',
    type: 'number',
    placeholder: 'Ej: 4',
    inputProps: { keyboardType: 'numeric' }, // Asegurar teclado numérico
  },
  {
    name: 'isActive',
    label: '¿Está activa?',
    type: 'switch',
    switchLabel: 'Activa',
    defaultValue: true,
  },
  {
    name: 'isAvailable',
    label: '¿Está disponible?',
    type: 'switch',
    switchLabel: 'Disponible',
    defaultValue: true,
  },
  {
    name: 'isTemporary',
    label: '¿Es temporal?',
    type: 'switch',
    switchLabel: 'Temporal',
    defaultValue: false,
  },
  {
    name: 'temporaryIdentifier',
    label: 'Identificador Temporal (Opcional)',
    type: 'text',
    placeholder: 'Ej: T-123',
    // Podríamos añadir lógica para mostrar este campo solo si isTemporary es true
  },
];

interface TableFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (
    data: CreateTableDto | UpdateTableDto,
    photoId: string | null | undefined // photoId no se usa aquí
  ) => Promise<void>;
  editingItem: Table | null;
  isSubmitting: boolean;
  // Podríamos pasar el areaId por defecto si estamos creando desde la pantalla de un área específica
  defaultAreaId?: string;
}

const TableFormModal: React.FC<TableFormModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  editingItem,
  isSubmitting,
  defaultAreaId, // Recibir areaId por defecto
}) => {
  const isEditing = !!editingItem;

  // TODO: Fetch areas for the selector
  // const { data: areas, isLoading: isLoadingAreas } = useGetAreas({}, { limit: 1000 }); // Fetch all areas

  // TODO: Adaptar el campo 'areaId' para usar un Picker/Dropdown con los 'areas' obtenidos

  const formSchema = isEditing ? UpdateTableSchema : CreateTableSchema;
  const initialValues = isEditing
    ? {
        name: editingItem?.name,
        areaId: editingItem?.areaId,
        capacity: editingItem?.capacity ?? undefined,
        isActive: editingItem?.isActive,
        isAvailable: editingItem?.isAvailable,
        isTemporary: editingItem?.isTemporary,
        temporaryIdentifier: editingItem?.temporaryIdentifier ?? undefined,
      }
    : {
        name: '',
        areaId: defaultAreaId ?? '', // Usar el areaId por defecto si se proporciona
        capacity: undefined,
        isActive: true,
        isAvailable: true,
        isTemporary: false,
        temporaryIdentifier: undefined,
      };

  return (
    <GenericFormModal<CreateTableDto | UpdateTableDto, Table>
      visible={visible}
      onDismiss={onDismiss}
      onSubmit={onSubmit}
      formSchema={formSchema as z.ZodSchema<CreateTableDto | UpdateTableDto>}
      formFields={tableFormFields} // TODO: Modificar para incluir el selector de área
      initialValues={initialValues}
      editingItem={editingItem}
      isSubmitting={isSubmitting}
      modalTitle={(isEditing) =>
        isEditing ? 'Editar Mesa' : 'Crear Nueva Mesa'
      }
      // No necesitamos imagePickerConfig para Tables
    />
  );
};

export default TableFormModal;