import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { API_URL } from '@env'; // Importación adaptada

const CACHE_DIR = `${FileSystem.cacheDirectory}image-cache/`;
const MAX_CACHE_SIZE_MB = 100; // Límite de tamaño del caché en MB
const MAX_CACHE_AGE_DAYS = 7; // Límite de antigüedad de los archivos en días

// Asegura que el directorio de caché exista
async function ensureCacheDirExists() {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
        console.log(`📊 [CACHÉ] Creando directorio de caché: ${CACHE_DIR}`);
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
}

// Genera un nombre de archivo seguro basado en la URL
async function getCacheFilename(remoteUrl: string): Promise<string> {
    let urlToHash = remoteUrl;
    if (API_URL && remoteUrl.startsWith(API_URL)) { // Check if API_URL exists before using startsWith
        try {
            const parsedUrl = new URL(remoteUrl);
            urlToHash = parsedUrl.pathname;
        } catch (e) {
            console.warn(`[CACHE] No se pudo parsear la URL para el hash: ${remoteUrl}`);
        }
    }
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        urlToHash,
        { encoding: Crypto.CryptoEncoding.HEX }
    );
    const extensionMatch = remoteUrl.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
    const extension = extensionMatch ? extensionMatch[1] : 'jpg';
    return `${digest}.${extension}`;
}


// Limpia el caché eliminando archivos viejos o si se excede el tamaño
interface ExistingFileInfo {
    uri: string;
    size: number;
    modificationTime: number;
    exists: true;
}

async function cleanCache() {
    console.log('📊 [CACHÉ] Iniciando limpieza de caché...');
    await ensureCacheDirExists();

    try {
        const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
        const fileInfosPromises = files.map(async (file): Promise<ExistingFileInfo | { exists: false, uri: string }> => {
            const info = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`, { size: true });
            if (info.exists) {
                return {
                    uri: info.uri,
                    size: info.size,
                    modificationTime: info.modificationTime,
                    exists: true,
                };
            } else {
                return {
                    exists: false,
                    uri: info.uri,
                };
            }
        });

        const allFileInfos = await Promise.all(fileInfosPromises);
        const existingFileInfos: ExistingFileInfo[] = allFileInfos.filter(
            (f): f is ExistingFileInfo => f.exists
        );

        let totalSize = existingFileInfos.reduce((sum, file) => sum + file.size, 0);
        existingFileInfos.sort((a, b) => a.modificationTime - b.modificationTime);

        const now = Date.now();
        const maxAgeMillis = MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;
        const maxSizeInBytes = MAX_CACHE_SIZE_MB * 1024 * 1024;

        let filesDeletedCount = 0;
        let sizeDeleted = 0;

        // Eliminar por antigüedad
        const filesToDeleteByAge = existingFileInfos.filter(file => now - file.modificationTime * 1000 > maxAgeMillis);
        for (const file of filesToDeleteByAge) {
            await FileSystem.deleteAsync(file.uri, { idempotent: true });
            totalSize -= file.size;
            sizeDeleted += file.size;
            filesDeletedCount++;
        }

         // Filtrar los archivos restantes que no fueron eliminados por edad
        const remainingFiles = existingFileInfos
            .filter(file => !(now - file.modificationTime * 1000 > maxAgeMillis))
            .sort((a, b) => a.modificationTime - b.modificationTime); // Ordenar de nuevo por si acaso


        // Eliminar por tamaño si aún se excede
        let currentIndex = 0;
        while (totalSize > maxSizeInBytes && currentIndex < remainingFiles.length) {
            const fileToDelete = remainingFiles[currentIndex];
             try {
                await FileSystem.deleteAsync(fileToDelete.uri, { idempotent: true });
                totalSize -= fileToDelete.size;
                sizeDeleted += fileToDelete.size;
                filesDeletedCount++;
            } catch (delError) {
                 console.error(`❌ [CACHÉ] Error eliminando archivo ${fileToDelete.uri}:`, delError);
            }
            currentIndex++;
        }


        if (filesDeletedCount > 0) {
            console.log(`📊 [CACHÉ] Limpieza completada. ${filesDeletedCount} archivos eliminados (${(sizeDeleted / 1024 / 1024).toFixed(2)} MB). Tamaño actual: ${(totalSize / 1024 / 1024).toFixed(2)} MB.`);
        } else {
            console.log(`📊 [CACHÉ] Limpieza completada. No se eliminaron archivos. Tamaño actual: ${(totalSize / 1024 / 1024).toFixed(2)} MB.`);
        }

    } catch (error) {
        console.error('❌ [CACHÉ] Error durante la limpieza:', error);
    }
}

// Obtiene la URI local de una imagen cacheada, o la descarga si no existe
export async function getCachedImageUri(remoteUrl: string): Promise<string | null> {
    if (!remoteUrl || typeof remoteUrl !== 'string' || (!remoteUrl.startsWith('http://') && !remoteUrl.startsWith('https://'))) {
        return remoteUrl; // Devolver la URL original si no es http/https
    }

    await ensureCacheDirExists();
    const filename = await getCacheFilename(remoteUrl);
    const localUri = `${CACHE_DIR}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(localUri);

    if (fileInfo.exists) {
        return localUri;
    } else {
        try {
            const { uri: downloadedUri } = await FileSystem.downloadAsync(remoteUrl, localUri);
            return downloadedUri;
        } catch (error) {
            console.error(`❌ [CACHÉ] Error descargando imagen ${remoteUrl}:`, error);
            const partialFileInfo = await FileSystem.getInfoAsync(localUri);
            if (partialFileInfo.exists) {
                await FileSystem.deleteAsync(localUri, { idempotent: true });
            }
            return null; // Devolver null en caso de error de descarga
        }
    }
}

// Inicializa el caché (limpia al inicio)
export async function initImageCache() {
    console.log("🚀 [CACHÉ] Inicializando caché de imágenes...");
    await ensureCacheDirExists();
    cleanCache().catch(error => console.error("❌ [CACHÉ] Error en la limpieza inicial:", error));
    console.log("✅ [CACHÉ] Caché inicializado.");
}

// Elimina una imagen específica del caché (útil si la imagen remota cambia)
export async function removeImageFromCache(remoteUrl: string) {
    if (!remoteUrl || typeof remoteUrl !== 'string') return;
    try {
        const filename = await getCacheFilename(remoteUrl);
        const localUri = `${CACHE_DIR}${filename}`;
        await FileSystem.deleteAsync(localUri, { idempotent: true });
    } catch (error) {
    }
}

// Limpia todo el caché (acción manual o de depuración)
export async function clearImageCache() {
    console.log("⚠️ [CACHÉ] Limpiando todo el caché de imágenes...");
    try {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
        console.log("✅ [CACHÉ] Caché limpiado.");
        await ensureCacheDirExists(); // Recrear el directorio
    } catch (error) {
        console.error("❌ [CACHÉ] Error limpiando el caché:", error);
    }
}