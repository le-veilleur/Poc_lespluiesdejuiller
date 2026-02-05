// ========================
// Types partages front/back
// ========================

// --- Enums (meme pattern que Prisma pour compatibilite structurelle) ---

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TicketType = {
  SOLIDAIRE: "SOLIDAIRE",
  NORMAL: "NORMAL",
  SOUTIEN: "SOUTIEN",
  GRATUIT: "GRATUIT",
  PASS_CULTURE: "PASS_CULTURE",
} as const;
export type TicketType = (typeof TicketType)[keyof typeof TicketType];

// --- Models ---

export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth: Date;
  role: UserRole;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  userId: string;
  type: TicketType;
  price: number;
  createdAt: Date;
}

export interface Conference {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  category: string;
  createdAt: Date;
  registeredCount?: number;
  isRegistered?: boolean;
}

export interface PlanningEntry {
  id: string;
  userId: string;
  conferenceId: string;
  conference?: Conference;
  createdAt: Date;
}

// --- Cart ---

export const CartStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
} as const;
export type CartStatus = (typeof CartStatus)[keyof typeof CartStatus];

export interface CartItem {
  id: string;
  cartId: string;
  type: TicketType;
  price: number;
  createdAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  status: CartStatus;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// --- API Response ---

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Auth ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
}

export interface AuthResponse {
  user: Omit<User, "createdAt">;
}

// --- JWT Payload ---

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}
