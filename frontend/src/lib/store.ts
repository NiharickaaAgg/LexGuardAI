import { create } from 'zustand';

interface User {
    _id: string;
    name: string;
    email: string;
    plan: string;
    auditCount: number;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    setAuth: (user, token) => {
        localStorage.setItem('lexguard_token', token);
        localStorage.setItem('lexguard_user', JSON.stringify(user));
        set({ user, token, isLoading: false });
    },
    clearAuth: () => {
        localStorage.removeItem('lexguard_token');
        localStorage.removeItem('lexguard_user');
        set({ user: null, token: null, isLoading: false });
    },
    setLoading: (loading) => set({ isLoading: loading }),
}));