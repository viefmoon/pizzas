import { z } from "zod";

// Esquema de validación para el formulario de login
export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "El correo o nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Tipo inferido del esquema de login
export type LoginFormInputs = z.infer<typeof loginSchema>;

// Esquema para la respuesta de autenticación
export const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    role: z.enum(["admin", "staff"]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
});

// Tipo inferido del esquema de respuesta de autenticación
export type AuthResponse = z.infer<typeof authResponseSchema>;

// Tipo para el estado de autenticación en el store
export interface AuthState {
  token: string | null;
  user: AuthResponse["user"] | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginFormInputs) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

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

// Esquema de validación para el formulario de registro
export const registerSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Solo se permiten letras, números y guiones bajos"
    ),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
});

export type RegisterFormInputs = z.infer<typeof registerSchema>;

export interface RegisterResponseDto {
  message: string;
}

// Podrías añadir aquí otros DTOs y tipos relacionados con auth (register, forgot password, etc.)
