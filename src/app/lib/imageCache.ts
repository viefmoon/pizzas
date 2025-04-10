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
    // Usar solo la parte de la ruta de la URL para el hash si es una URL completa de nuestra API
    // Esto evita problemas si cambian parámetros de consulta que no afectan la imagen en sí
    let urlToHash = remoteUrl;
    if (remoteUrl.startsWith(API_URL)) {
        try {
            const parsedUrl = new URL(remoteUrl);
            urlToHash = parsedUrl.pathname; // Usar solo el path para el hash
        } catch (e) {
            // Si no se puede parsear, usar la URL completa (puede pasar con URLs malformadas)
            console.warn(`[CACHE] No se pudo parsear la URL para el hash: ${remoteUrl}`);
        }
    }
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        urlToHash, // Usar la URL (o su path) como base para el hash
        { encoding: Crypto.CryptoEncoding.HEX }
    );
    // Extraer extensión del nombre original si es posible, si no, default a .jpg
    const extension = remoteUrl.split('.').pop()?.split('?')[0] || 'jpg';
    return `${digest}.${extension}`;
}


// Limpia el caché eliminando archivos viejos o si se excede el tamaño
// Interfaz para archivos que existen y tienen la info necesaria
interface ExistingFileInfo {
    uri: string;
    size: number;
    modificationTime: number;
    exists: true; // Aseguramos que existe
}

async function cleanCache() {
    console.log('📊 [CACHÉ] Iniciando limpieza de caché...');
    await ensureCacheDirExists();

    try {
        const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
        // Mapear promesas para obtener la información de cada archivo
        const fileInfosPromises = files.map(async (file): Promise<ExistingFileInfo | { exists: false, uri: string }> => {
            const info = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`, { size: true });
            if (info.exists) {
                // Si existe, devolvemos el tipo ExistingFileInfo
                return {
                    uri: info.uri,
                    size: info.size, // TypeScript ahora sabe que existe
                    modificationTime: info.modificationTime, // TypeScript ahora sabe que existe
                    exists: true,
                };
            } else {
                // Si no existe, devolvemos un objeto más simple
                return {
                    exists: false,
                    uri: info.uri, // uri siempre está presente
                };
            }
        });

        // Esperar a que todas las promesas se resuelvan
        const allFileInfos = await Promise.all(fileInfosPromises);

        // Filtrar archivos que no existen usando una guarda de tipo implícita
        const existingFileInfos: ExistingFileInfo[] = allFileInfos.filter(
            (f): f is ExistingFileInfo => f.exists
        );

        // Calcular tamaño total y ordenar por antigüedad (más viejo primero)
        // TypeScript ahora sabe que todos los elementos en existingFileInfos tienen size y modificationTime
        let totalSize = existingFileInfos.reduce((sum, file) => sum + file.size, 0);
        existingFileInfos.sort((a, b) => a.modificationTime - b.modificationTime);

        const now = Date.now();
        const maxAgeMillis = MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;
        const maxSizeInBytes = MAX_CACHE_SIZE_MB * 1024 * 1024;

        let filesDeletedCount = 0;
        let sizeDeleted = 0;

        // Eliminar archivos por antigüedad
        for (const file of existingFileInfos) {
            if (now - file.modificationTime * 1000 > maxAgeMillis) {
                console.log(`📊 [CACHÉ] Eliminando archivo viejo: ${file.uri.split('/').pop()}`);
                await FileSystem.deleteAsync(file.uri, { idempotent: true });
                totalSize -= file.size;
                sizeDeleted += file.size;
                filesDeletedCount++;
            } else {
                // Como están ordenados, si uno no es viejo, los siguientes tampoco
                break;
            }
        }

        // Si aún se excede el tamaño, eliminar los más viejos restantes
        let index = filesDeletedCount; // Empezar desde donde nos quedamos
        while (totalSize > maxSizeInBytes && index < existingFileInfos.length) {
            const fileToDelete = existingFileInfos[index];
             // Asegurarse de no intentar borrar un archivo ya borrado por antigüedad
             const stillExists = await FileSystem.getInfoAsync(fileToDelete.uri);
             if (stillExists.exists) {
                 console.log(`📊 [CACHÉ] Eliminando archivo por tamaño: ${fileToDelete.uri.split('/').pop()}`);
                 await FileSystem.deleteAsync(fileToDelete.uri, { idempotent: true });
                 totalSize -= fileToDelete.size;
                 sizeDeleted += fileToDelete.size;
                 filesDeletedCount++;
             }
            index++;
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
    if (!remoteUrl || typeof remoteUrl !== 'string') {
        console.warn('[CACHE] Se intentó cachear una URL inválida:', remoteUrl);
        return null; // Devolver null si la URL no es válida
    }

    await ensureCacheDirExists();
    const filename = await getCacheFilename(remoteUrl);
    const localUri = `${CACHE_DIR}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(localUri);

    if (fileInfo.exists) {
        // console.log(`📊 [CACHÉ] Imagen encontrada en caché: ${filename}`);
        // Opcional: Actualizar tiempo de modificación para LRU (Least Recently Used)
        // await FileSystem.moveAsync({ from: localUri, to: localUri }); // Mover a sí mismo actualiza mtime
        return localUri;
    } else {
        // console.log(`📊 [CACHÉ] Imagen no encontrada, descargando: ${remoteUrl}`);
        try {
            const { uri: downloadedUri } = await FileSystem.downloadAsync(remoteUrl, localUri);
            // console.log(`📊 [CACHÉ] Imagen descargada y guardada en: ${downloadedUri}`);
            return downloadedUri;
        } catch (error) {
            console.error(`❌ [CACHÉ] Error descargando imagen ${remoteUrl}:`, error);
            // Intentar eliminar archivo parcial si existe
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
    // Ejecutar limpieza en segundo plano para no bloquear el inicio
    cleanCache().catch(error => console.error("❌ [CACHÉ] Error en la limpieza inicial:", error));
    console.log("✅ [CACHÉ] Caché inicializado.");
}

// Elimina una imagen específica del caché (útil si la imagen remota cambia)
export async function removeImageFromCache(remoteUrl: string) {
    if (!remoteUrl) return;
    try {
        const filename = await getCacheFilename(remoteUrl);
        const localUri = `${CACHE_DIR}${filename}`;
        await FileSystem.deleteAsync(localUri, { idempotent: true });
        console.log(`📊 [CACHÉ] Imagen eliminada del caché: ${filename}`);
    } catch (error) {
        console.error(`❌ [CACHÉ] Error eliminando imagen ${remoteUrl} del caché:`, error);
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