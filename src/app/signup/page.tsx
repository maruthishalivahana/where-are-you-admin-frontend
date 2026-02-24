"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bus, Eye, EyeOff, Loader2, AlertCircle, Building2, User, Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
    const { signup } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        organizationName: "",
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await signup(form);
            router.replace("/Dashboard");
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? "Registration failed. Please try again.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 px-8 py-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Bus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-white/70 text-xs font-medium uppercase tracking-widest">CityTrack Admin</p>
                        <h1 className="text-white text-xl font-bold">Create your account</h1>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
                    {error && (
                        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="name">
                            Full name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="name"
                                type="text"
                                required
                                value={form.name}
                                onChange={set("name")}
                                placeholder="John Doe"
                                className="w-full px-4 py-2.5 pl-9 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Organization Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="orgName">
                            Organization name
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="orgName"
                                type="text"
                                required
                                value={form.organizationName}
                                onChange={set("organizationName")}
                                placeholder="Metropolitan Transit Authority"
                                className="w-full px-4 py-2.5 pl-9 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={form.email}
                                onChange={set("email")}
                                placeholder="admin@organization.com"
                                className="w-full px-4 py-2.5 pl-9 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                value={form.password}
                                onChange={set("password")}
                                placeholder="Min. 6 characters"
                                className="w-full px-4 py-2.5 pl-9 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors mt-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "Creating account..." : "Create account"}
                    </button>

                    <p className="text-center text-sm text-gray-500 pt-1">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
