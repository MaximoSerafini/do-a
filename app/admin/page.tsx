"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, Order } from "@/lib/supabase"
import { ShoppingBag, DollarSign, TrendingUp, Package } from "lucide-react"

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayRevenue: 0,
        weekOrders: 0,
        weekRevenue: 0,
        burgersSold: 0,
        combosSold: 0,
        drinksSold: 0
    })
    const [recentOrders, setRecentOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            weekAgo.setHours(0, 0, 0, 0)

            // Get today's orders
            const { data: todayData } = await supabase
                .from('orders')
                .select('*')
                .gte('created_at', today.toISOString())

            // Get week's orders
            const { data: weekData } = await supabase
                .from('orders')
                .select('*')
                .gte('created_at', weekAgo.toISOString())

            // Get recent orders
            const { data: recent } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            // Calculate stats
            let burgers = 0, combos = 0, drinks = 0

            const allOrders = weekData || []
            allOrders.forEach((order: Order) => {
                order.items?.forEach((item) => {
                    if (item.size === 'Combo') combos += item.quantity
                    else if (item.size === 'Bebida') drinks += item.quantity
                    else burgers += item.quantity
                })
            })

            setStats({
                todayOrders: todayData?.length || 0,
                todayRevenue: todayData?.reduce((sum, o) => sum + o.total, 0) || 0,
                weekOrders: weekData?.length || 0,
                weekRevenue: weekData?.reduce((sum, o) => sum + o.total, 0) || 0,
                burgersSold: burgers,
                combosSold: combos,
                drinksSold: drinks
            })

            setRecentOrders(recent || [])
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-muted-foreground">Cargando estadísticas...</div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Estadísticas de ventas y pedidos</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Hoy</CardTitle>
                        <ShoppingBag className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats.todayOrders}</div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Hoy</CardTitle>
                        <DollarSign className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{formatPrice(stats.todayRevenue)}</div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Semana</CardTitle>
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats.weekOrders}</div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Semana</CardTitle>
                        <DollarSign className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{formatPrice(stats.weekRevenue)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Products Sold */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-5xl mb-2">🍔</div>
                            <div className="text-4xl font-bold text-primary">{stats.burgersSold}</div>
                            <p className="text-muted-foreground">Hamburguesas vendidas</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-5xl mb-2">🍔🍟</div>
                            <div className="text-4xl font-bold text-primary">{stats.combosSold}</div>
                            <p className="text-muted-foreground">Combos vendidos</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-5xl mb-2">🥤</div>
                            <div className="text-4xl font-bold text-primary">{stats.drinksSold}</div>
                            <p className="text-muted-foreground">Bebidas vendidas</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="font-[family-name:var(--font-bebas)] text-2xl">Últimos Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No hay pedidos registrados aún</p>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                    <div>
                                        <p className="font-medium">{order.items?.length || 0} productos</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleString('es-AR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.delivery_type === 'pickup' ? '📍 Retiro' : '🚚 Envío'} •
                                            {order.payment_method === 'efectivo' ? ' 💵' : ' 🏦'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
