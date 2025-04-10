// src/app/lib/imageUtils.ts
import { API_URL } from "@env";
// No necesitamos importar getCachedImageUri aquí, ya que se usa dentro de AutoImage.
// Solo necesitamos la lógica para construir la URL completa.

/**
 * Construye la URL completa de una imagen a partir de su ruta relativa o absoluta.
 * Si la ruta ya es una URL completa (http/https), la devuelve tal cual.
 * Si es una URI local (file://), la devuelve tal cual.
 * Si es una ruta relativa, la prefija con la API_URL del entorno.
 * @param imagePath - La ruta relativa (ej. 'uploads/imagen.jpg') o URL completa de la imagen.
 * @returns La URL completa y lista para usar, o null si la entrada es inválida.
 */
export const getImageUrl = (
  imagePath: string | null | undefined
): string | null => {
  if (!imagePath) {
    return null; // Si no hay path, no hay URL
  }

  const apiUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const normalizedPath = imagePath.replace(/\\/g, "/");

  // Si la ruta ya es una URL completa
  if (normalizedPath.startsWith("http")) {
    // Extraer solo la parte de la ruta después del dominio
    const urlObj = new URL(normalizedPath);
    const pathPart = urlObj.pathname;

    // Construir la URL con la API configurada
    return `${apiUrl}${pathPart}`;
  }

  // Para rutas relativas, asegurarse de que empiecen con /
  const formattedPath = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;

  return `${apiUrl}${formattedPath}`;
};
