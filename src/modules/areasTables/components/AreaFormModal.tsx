import React from 'react';
import GenericFormModal, {
  FormFieldConfig,
} from '../../../app/components/crud/GenericFormModal';
import {
  Area,
  CreateAreaDto,
  UpdateAreaDto,
  CreateAreaSchema,
  UpdateAreaSchema,
} from '../types/area.types';
import { z } from 'zod';

// Definir los campos del formulario para Area
const areaFormFields: FormFieldConfig<CreateAreaDto | UpdateAreaDto>[] = [
  {
    name: 'name',
    label: 'Nombre del Área',
    type: 'text',
    placeholder: 'Ej: Terraza, Salón Principal',
    required: true,
  },
  {
    name: 'description',
    label: 'Descripción (Opcional)',
    type: 'textarea',
    placeholder: 'Ej: Área al aire libre con vista',
    numberOfLines: 3,
  },
  {
    name: 'isActive',
    label: '¿Está activa?',
    type: 'switch',
    switchLabel: 'Activa', // Etiqueta junto al switch
    defaultValue: true, // Valor por defecto al crear
  },
];

interface AreaFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (
    data: CreateAreaDto | UpdateAreaDto,
    photoId: string | null | undefined // photoId no se usa aquí, pero lo mantenemos por la firma genérica
  ) => Promise<void>;
  editingItem: Area | null;
  isSubmitting: boolean;
}

const AreaFormModal: React.FC<AreaFormModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  editingItem,
  isSubmitting,
}) => {
  const isEditing = !!editingItem;

  // Determinar el esquema y valores iniciales según si es edición o creación
  const formSchema = isEditing ? UpdateAreaSchema : CreateAreaSchema;
  const initialValues = isEditing
    ? {
        name: editingItem?.name,
        description: editingItem?.description ?? undefined, // Asegurar undefined si es null
        isActive: editingItem?.isActive,
      }
    : {
        // Valores por defecto para creación (ya definidos en los fields, pero podemos ser explícitos)
        name: '',
        description: undefined,
        isActive: true,
      };

  return (
    <GenericFormModal<CreateAreaDto | UpdateAreaDto, Area>
      visible={visible}
      onDismiss={onDismiss}
      onSubmit={onSubmit}
      formSchema={formSchema as z.ZodSchema<CreateAreaDto | UpdateAreaDto>} // Cast necesario por la unión
      formFields={areaFormFields}
      initialValues={initialValues}
      editingItem={editingItem}
      isSubmitting={isSubmitting}
      modalTitle={(isEditing) =>
        isEditing ? 'Editar Área' : 'Crear Nueva Área'
      }
      // No necesitamos imagePickerConfig para Areas
    />
  );
};

export default AreaFormModal;