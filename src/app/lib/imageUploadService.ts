import { uploadFile, FileUploadResponse } from '../../modules/menu/services/fileService'; // Ajusta ruta
import { ApiError } from './errors'; // Ajusta ruta
import { getImageUrl } from './imageUtils'; // Importar getImageUrl
import { API_URL } from '@env'; // Importar API_URL

export interface ImageUploadResult {
    success: boolean;
    photoId?: string; // ID de la foto subida
    error?: string; // Mensaje de error si falla
}

// Interfaz para el objeto archivo esperado por el servicio
export interface FileObject {
    uri: string;
    name: string;
    type: string;
}

// Interfaz para la entidad existente que podría tener una foto
export interface EntityWithOptionalPhoto {
    photo?: {
        id: string;
        path: string; // Necesitamos el path para comparar con la imageUri del formulario
    } | null;
}

export class ImageUploadService {
    /**
     * Sube una imagen usando el fileService.
     * @param imageFile El objeto FileObject con uri, name, type.
     * @returns Un objeto ImageUploadResult indicando éxito/fallo y el ID de la foto.
     */
    static async uploadImage(
        imageFile: FileObject,
    ): Promise<ImageUploadResult> {
        if (!imageFile || !imageFile.uri) {
            console.warn("[ImageUploadService] Intento de subir imagen inválida:", imageFile);
            return { success: false, error: "No se proporcionó ninguna imagen válida" };
        }

        try {
            // Usar la función importada directamente
            const uploadResult: FileUploadResponse = await uploadFile(imageFile);

            if (!uploadResult || !uploadResult.file || !uploadResult.file.id) {
                 console.error("[ImageUploadService] Respuesta inválida del fileService:", uploadResult);
                 return { success: false, error: "Respuesta inválida del servidor al subir imagen." };
            }

            return {
                success: true,
                photoId: uploadResult.file.id,
            };

        } catch (error) {
             console.error("Error en ImageUploadService.uploadImage:", error);
             let errorMessage = "Error desconocido al subir la imagen.";
             if (error instanceof ApiError) {
                errorMessage = `Error al subir: ${error.originalMessage || error.code}`;
             } else if (error instanceof Error) {
                errorMessage = error.message;
             }
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

     /**
      * Determina el valor de photoId a enviar al backend basado en el estado actual del formulario y la entidad existente.
      * @param formImageUri La URI de la imagen actual en el formulario (puede ser 'file://...', una URL remota, o null).
      * @param existingEntity La entidad actual (ej. Category) que podría tener una propiedad 'photo' con 'id' y 'path'.
      * @returns
      *   - `undefined`: No hay cambios en la foto O se va a subir una nueva. El DTO NO debe incluir `photoId`.
      *   - `null`: Se debe eliminar la foto existente en el backend. El DTO DEBE incluir `photoId: null`.
      */
     static determinePhotoId(
         formImageUri: string | null | undefined,
         existingEntity?: EntityWithOptionalPhoto,
     ): undefined | null {

         const existingPhotoPath = existingEntity?.photo?.path;
         // Construir la URL completa de la foto existente para comparar
         const existingPhotoFullUrl = existingPhotoPath ? getImageUrl(existingPhotoPath) : null;

         // Caso 1: Hay una nueva imagen seleccionada (URI local 'file://')
         // La subida se maneja por separado. Aquí indicamos que no hay acción *sobre el ID existente*.
         // El DTO no incluirá `photoId`. El backend usará el ID de la nueva imagen subida.
         if (formImageUri && formImageUri.startsWith('file://')) {
             return undefined;
         }
         // Caso 2: Se eliminó la imagen (formImageUri es null) Y había una foto antes.
         else if ((formImageUri === null || formImageUri === undefined) && existingEntity?.photo) {
             return null; // Indica que se debe eliminar la foto existente (photoId: null en el DTO)
         }
         // Caso 3: La imagen en el form es la misma URL remota que la existente.
         else if (formImageUri && !formImageUri.startsWith('file://') && formImageUri === existingPhotoFullUrl) {
             return undefined; // No hay cambios, no incluir photoId en el DTO.
         }
         // Caso 4: La imagen en el form es una URL remota, pero NO coincide con la existente (o no había).
         // Este caso usualmente significa que no se quiere cambiar la foto existente por una URL externa,
         // así que no enviamos nada referente a photoId.
         else if (formImageUri && !formImageUri.startsWith('file://') && formImageUri !== existingPhotoFullUrl) {
             return undefined; // No hay cambios en el ID.
         }
         // Caso 5: No hay imagen en el form (null/undefined) y tampoco había antes.
         else if ((formImageUri === null || formImageUri === undefined) && !existingEntity?.photo) {
             return undefined; // No hay cambios
         }

         // Caso por defecto: No hay cambios definidos.
         return undefined;
     }
}