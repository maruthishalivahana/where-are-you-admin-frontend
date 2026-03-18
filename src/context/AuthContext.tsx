"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { adminLogin, adminSignup, LoginPayload, SignupPayload } from "@/services/api";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    organizationName?: string;
}

interface AuthContextValue {
    user: AdminUser | null;
    token: string | null;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    signup: (payload: SignupPayload) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const normalizeToken = (value: string | null | undefined): string | null => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
    return trimmed;
};

const extractAuthToken = (payload: { token?: string; accessToken?: string }): string | null => {
    return normalizeToken(payload.accessToken) ?? normalizeToken(payload.token);
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate from localStorage on client boot
    useEffect(() => {
        const stored = normalizeToken(localStorage.getItem("token"));
        const storedUser = localStorage.getItem("admin_user");
        if (stored) {
            localStorage.setItem("token", stored);
            setToken(stored);
        } else {
            localStorage.removeItem("token");
        }
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                // ignore corrupt data
            }
        }
        setIsLoading(false);
    }, []);

    const persist = (tok: string, admin?: AdminUser | null) => {
        const normalized = normalizeToken(tok);
        if (!normalized) {
            throw new Error("Authentication token missing in server response.");
        }

        localStorage.setItem("token", normalized);
        setToken(normalized);
        if (admin) {
            localStorage.setItem("admin_user", JSON.stringify(admin));
            setUser(admin);
        }
    };

    const login = useCallback(async (payload: LoginPayload) => {
        const { data } = await adminLogin(payload);
        const token = extractAuthToken(data);
        if (!token) {
            throw new Error("Login succeeded but no access token was returned.");
        }
        persist(token, data.admin ?? null);
    }, []);

    const signup = useCallback(async (payload: SignupPayload) => {
        const { data } = await adminSignup(payload);
        const token = extractAuthToken(data);
        if (!token) {
            throw new Error("Signup succeeded but no access token was returned.");
        }
        persist(token, data.admin ?? null);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin_user");
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext value={{ user, token, isLoading, login, signup, logout }}>
            {children}
        </AuthContext>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
