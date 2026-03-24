export interface User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    phone?: string;
    createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

export type UserWithoutPassword = Omit<User, 'passwordHash'>;