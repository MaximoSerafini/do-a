"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, Order } from "@/lib/supabase"
import { TrendingUp, Calendar, Clock } from "lucide-react"

interface ProductStats {
    name: string
    quantity: number
    revenue: number
}

export default function EstadisticasPage() {
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')

    // Stats
    const [burgerStats, setBurgerStats] = useState<ProductStats[]>([])
    const [comboStats, setComboStats] = useState<ProductStats[]>([])
    const [drinkStats, setDrinkStats] = useState<ProductStats[]>([])
    const [totals, setTotals] = useState({
        orders: 0,
        revenue: 0,
        burgers: 0,
        combos: 0,
        drinks: 0
    })

    useEffect(() => {
        loadStats()
    }, [period])

    const loadStats = async () => {
        setLoading(true)
        try {
            const now = new Date()
            let startDate: Date

            if (period === 'today') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            } else if (period === 'week') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            } else {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            }

            const { data: orders } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'confirmed')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false })

            // Process stats
            const burgerMap = new Map<string, ProductStats>()
            const comboMap = new Map<string, ProductStats>()
            const drinkMap = new Map<string, ProductStats>()

            let totalBurgers = 0, totalCombos = 0, totalDrinks = 0, totalRevenue = 0

            orders?.forEach((order: Order) => {
                totalRevenue += order.total
                order.items?.forEach((item) => {
                    const key = `${item.name} ${item.size}`
                    const revenue = item.price * item.quantity

                    if (item.size === 'Combo') {
                        totalCombos += item.quantity
                        totalBurgers += item.quantity * 2 // Cada combo = 2 hamburguesas
                        const existing = comboMap.get(key) || { name: key, quantity: 0, revenue: 0 }
                        comboMap.set(key, {
                            name: key,
                            quantity: existing.quantity + item.quantity,
                            revenue: existing.revenue + revenue
                        })
                    } else if (item.size === 'Bebida') {
                        totalDrinks += item.quantity
                        const existing = drinkMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 }
                        drinkMap.set(item.name, {
                            name: item.name,
                            quantity: existing.quantity + item.quantity,
                            revenue: existing.revenue + revenue
                        })
                    } else {
                        totalBurgers += item.quantity
                        const existing = burgerMap.get(key) || { name: key, quantity: 0, revenue: 0 }
                        burgerMap.set(key, {
                            name: key,
                            quantity: existing.quantity + item.quantity,
                            revenue: existing.revenue + revenue
                        })
                    }
                })
            })

            // Sort by quantity
            const sortByQty = (a: ProductStats, b: ProductStats) => b.quantity - a.quantity

            setBurgerStats(Array.from(burgerMap.values()).sort(sortByQty))
            setComboStats(Array.from(comboMap.values()).sort(sortByQty))
            setDrinkStats(Array.from(drinkMap.values()).sort(sortByQty))
            setTotals({
                orders: orders?.length || 0,
                revenue: totalRevenue,
                burgers: totalBurgers,
                combos: totalCombos,
                drinks: totalDrinks
            })
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)
    }

    const maxQty = Math.max(
        ...burgerStats.map(s => s.quantity),
        ...comboStats.map(s => s.quantity),
        ...drinkStats.map(s => s.quantity),
        1
    )

    const StatBar = ({ stat, color }: { stat: ProductStats; color: string }) => (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="font-medium">{stat.name}</span>
                <span className="text-muted-foreground">{stat.quantity} vendidos • {formatPrice(stat.revenue)}</span>
            </div>
            <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max((stat.quantity / maxQty) * 100, 5)}%` }}
                >
                    <span className="text-xs font-bold text-white">{stat.quantity}</span>
                </div>
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-4xl mb-2 animate-pulse">📊</div>
                    <p className="text-muted-foreground">Cargando estadísticas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-[family-name:var(--font-bebas)] text-3xl lg:text-4xl text-foreground flex items-center gap-3">
                        <span className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">📊</span>
                        Estadísticas
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Ventas por producto</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
                    {[
                        { key: 'today', label: 'Hoy', icon: Clock },
                        { key: 'week', label: 'Semana', icon: Calendar },
                        { key: 'month', label: 'Mes', icon: TrendingUp }
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setPeriod(key as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${period === key
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'hover:bg-white/50 text-muted-foreground'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold text-primary">{totals.orders}</p>
                        <p className="text-sm text-muted-foreground">Pedidos</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold text-green-600">{formatPrice(totals.revenue)}</p>
                        <p className="text-sm text-muted-foreground">Ingresos</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold">🍔 {totals.burgers}</p>
                        <p className="text-sm text-muted-foreground">Hamburguesas</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold">🍔🍟 {totals.combos}</p>
                        <p className="text-sm text-muted-foreground">Combos</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold">🥤 {totals.drinks}</p>
                        <p className="text-sm text-muted-foreground">Bebidas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Burgers */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            🍔 Hamburguesas
                            <Badge variant="secondary">{totals.burgers}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {burgerStats.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">Sin ventas en este período</p>
                        ) : (
                            burgerStats.map((stat) => (
                                <StatBar key={stat.name} stat={stat} color="bg-red-500" />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Combos */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            🍔🍟 Combos
                            <Badge variant="secondary">{totals.combos}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {comboStats.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">Sin ventas en este período</p>
                        ) : (
                            comboStats.map((stat) => (
                                <StatBar key={stat.name} stat={stat} color="bg-orange-500" />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Drinks */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            🥤 Bebidas
                            <Badge variant="secondary">{totals.drinks}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {drinkStats.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">Sin ventas en este período</p>
                        ) : (
                            drinkStats.map((stat) => (
                                <StatBar key={stat.name} stat={stat} color="bg-blue-500" />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
