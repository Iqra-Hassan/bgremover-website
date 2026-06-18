import { User } from '@/lib/auth';

declare module 'hono' {
  interface ContextVariableMap {
    user: User;
  }
}
