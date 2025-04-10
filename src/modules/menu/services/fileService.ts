// src/modules/menu/services/fileService.ts (Adaptado)
import apiClient from '../../../app/services/apiClient';
import { ApiError } from '../../../app/lib/errors';
import { Platform } from 'react-native';

const UPLOAD_URL = '/api/v1/files/upload'; // Ajusta si es necesario

// Define esta interfaz (quizás en types/file.types.ts o category.types.ts)
export interface FileUploadResponse {
  file: {
    id: string;
    path: string; // Path relativo o URL completa dependiendo de tu backend
  };
  presignedUrl?: string; // Si usas S3 pre-firmado
}

interface FileObject {
    uri: string;
    name: string;
    type: string;
    // Puedes añadir size si tu backend lo necesita o lo usas
    // size?: number;
}

/**
 * Sube un archivo (generalmente imagen) al servidor.
 * Maneja FormData y potencialmente URLs pre-firmadas.
 * @param fileToUpload - Objeto con uri, name, type del archivo.
 * @returns Una promesa que resuelve a la información del archivo subido.
 * @throws {ApiError} Si la subida falla.
 */
export const uploadFile = async (fileToUpload: FileObject): Promise<FileUploadResponse> => {
    // Lógica para S3 pre-firmado (si aplica, adaptada del código fuente)
    // const isPresignedFlow = /* tu lógica para determinar si usar pre-firmado */;
    // if (isPresignedFlow) {
    //     try {
    //         // 1. Obtener URL pre-firmada del backend
    //         const presignResponse = await apiClient.post<FileUploadResponse>(
    //             UPLOAD_URL,
    //             { fileName: fileToUpload.name }, // Enviar solo el nombre
    //             { headers: { 'Content-Type': 'application/json' } }
    //         );

    //         if (!presignResponse.ok || !presignResponse.data || !presignResponse.data.presignedUrl) {
    //             throw ApiError.fromApiResponse(presignResponse.data, presignResponse.status);
    //         }

    //         const presignedUrl = presignResponse.data.presignedUrl;
    //         const fileId = presignResponse.data.file.id;
    //         const filePath = presignResponse.data.file.path;

    //         // 2. Subir el archivo directamente a S3 usando la URL pre-firmada
    //         const blob = await fetch(fileToUpload.uri).then(res => res.blob());
    //         const s3Response = await fetch(presignedUrl, {
    //             method: 'PUT',
    //             body: blob,
    //             headers: {
    //                 'Content-Type': fileToUpload.type || 'application/octet-stream',
    //                 // Añade otros headers si S3 los requiere
    //             },
    //         });

    //         if (!s3Response.ok) {
    //             throw new Error(`Error al subir a S3: ${s3Response.status} ${s3Response.statusText}`);
    //         }

    //         // Devolver la info del archivo obtenida en el paso 1
    //         return { file: { id: fileId, path: filePath } };

    //     } catch (error) {
    //          console.error('Error en flujo pre-firmado:', error);
    //          if (error instanceof ApiError) throw error;
    //          throw new ApiError('UPLOAD_FAILED', error instanceof Error ? error.message : 'Error subiendo archivo pre-firmado', 500);
    //     }
    // } else {
        // Flujo normal con FormData
        const formData = new FormData();
        formData.append('file', {
            uri: Platform.OS === 'android' ? fileToUpload.uri : fileToUpload.uri.replace('file://', ''),
            name: fileToUpload.name,
            type: fileToUpload.type,
        } as any);

        try {
            const response = await apiClient.post<FileUploadResponse>(UPLOAD_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (!response.ok || !response.data || !response.data.file) {
                 console.error('Respuesta inválida del servidor al subir archivo:', response);
                throw ApiError.fromApiResponse(response.data, response.status);
            }

            return response.data;

        } catch (error) {
            console.error('Error subiendo archivo con FormData:', error);
            if (error instanceof ApiError) throw error;
             throw new ApiError('UPLOAD_FAILED', error instanceof Error ? error.message : 'Error subiendo archivo', 500);
        }
    // } // Fin del else para flujo normal
};

const fileService = {
    uploadFile,
    // puedes renombrar uploadImage si prefieres
    uploadImage: uploadFile,
};

export default fileService;