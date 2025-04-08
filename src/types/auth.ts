import { z } from "zod";

// Esquema y tipo para el formulario de login (ya definido en LoginForm, pero puede ser centralizado)
export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "El correo o nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
export type LoginFormInputs = z.infer<typeof loginSchema>;

// DTO para la petición de login al backend
// Basado en AuthEmailLoginDto del backend, permitiendo email o username
export const authEmailLoginDtoSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
  password: z.string(),
});
export type AuthEmailLoginDto = z.infer<typeof authEmailLoginDtoSchema>;

// Simplificación del tipo User basado en el backend para la respuesta
// Ajustar según los campos realmente necesarios en el frontend
const userSchema = z.object({
  id: z.string().uuid(), // Asumiendo UUID como string
  email: z.string().email().nullable(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  // Añadir otros campos relevantes si son necesarios (role, status, etc.)
  role: z.object({ id: z.number() }).optional(), // Asumiendo ID numérico para rol
});
export type User = z.infer<typeof userSchema>;

// DTO para la respuesta del login del backend
export const loginResponseDtoSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  tokenExpires: z.number(), // O z.string() si la API devuelve una fecha/string
  user: userSchema,
});
export type LoginResponseDto = z.infer<typeof loginResponseDtoSchema>;

// Podrías añadir aquí otros DTOs y tipos relacionados con auth (register, forgot password, etc.)
