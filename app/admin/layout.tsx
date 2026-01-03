"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Utensils, Package, BarChart3, ArrowLeft } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/menu", label: "Menú", icon: Utensils },
        { href: "/admin/stock", label: "Stock", icon: Package },
    ]

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm z-50">
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

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Volver al sitio</span>
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
