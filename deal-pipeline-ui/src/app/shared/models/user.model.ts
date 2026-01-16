export interface User {
  username: string;
  email?: string;
  role: 'USER' | 'ADMIN';
  active: boolean;   // 🔥 REQUIRED
}
