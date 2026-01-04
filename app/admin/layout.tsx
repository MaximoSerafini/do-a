"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { LayoutDashboard, Utensils, Package, ArrowLeft, Menu, X, Lock, ShoppingBag, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ADMIN_PASSWORD = "doña2025!"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if already authenticated
        const auth = sessionStorage.getItem("admin_auth")
        if (auth === "true") {
            setIsAuthenticated(true)
        }
        setIsLoading(false)
    }, [])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem("admin_auth", "true")
            setIsAuthenticated(true)
            setError("")
        } else {
            setError("Contraseña incorrecta")
        }
    }

    const handleLogout = () => {
        sessionStorage.removeItem("admin_auth")
        setIsAuthenticated(false)
    }

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/pedidos", label: "Mostrador", icon: ShoppingBag },
        { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 },
        { href: "/admin/menu", label: "Menú", icon: Utensils },
        { href: "/admin/stock", label: "Stock", icon: Package },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center">
                <div className="text-lg text-muted-foreground">Cargando...</div>
            </div>
        )
    }

    // Login screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-0 shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="text-6xl mb-4">🍔</div>
                        <CardTitle className="font-[family-name:var(--font-bebas)] text-3xl text-primary">
                            Admin Panel
                        </CardTitle>
                        <p className="text-muted-foreground">Doña Rib Burger</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-12"
                                />
                            </div>
                            {error && (
                                <p className="text-destructive text-sm text-center">{error}</p>
                            )}
                            <Button type="submit" className="w-full h-12 text-lg">
                                Ingresar
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b shadow-sm z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🍔</span>
                    <span className="font-[family-name:var(--font-bebas)] text-xl text-primary">Admin</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 h-full w-64 bg-white border-r shadow-sm z-50 transition-transform duration-300
        lg:left-0 lg:translate-x-0
        ${isSidebarOpen ? 'left-0 translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 border-b">
                    <h1 className="font-[family-name:var(--font-bebas)] text-2xl text-primary">
                        🍔 Admin Panel
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">Doña Rib Burger</p>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-primary text-white shadow-lg"
                                    : "hover:bg-muted text-foreground"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t space-y-2">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Volver al sitio</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-all w-full"
                    >
                        <Lock className="w-5 h-5" />
                        <span className="font-medium">Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
                {children}
            </main>
        </div>
    )
}
