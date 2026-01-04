"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase, Order } from "@/lib/supabase"
import { ShoppingBag, DollarSign, TrendingUp, Check, X, Clock } from "lucide-react"

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
    const [pendingOrders, setPendingOrders] = useState<Order[]>([])
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

            // Get today's CONFIRMED orders only
            const { data: todayData } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'confirmed')
                .gte('created_at', today.toISOString())

            // Get week's CONFIRMED orders only
            const { data: weekData } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'confirmed')
                .gte('created_at', weekAgo.toISOString())

            // Get pending orders
            const { data: pending } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            // Get recent confirmed orders
            const { data: recent } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'confirmed')
                .order('created_at', { ascending: false })
                .limit(10)

            // Calculate stats from CONFIRMED orders only
            let burgers = 0, combos = 0, drinks = 0

            const allOrders = weekData || []
            allOrders.forEach((order: Order) => {
                order.items?.forEach((item) => {
                    if (item.size === 'Combo') {
                        combos += item.quantity
                        burgers += item.quantity * 2 // Cada combo tiene 2 hamburguesas
                    }
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

            setPendingOrders(pending || [])
            setRecentOrders(recent || [])
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, status: 'confirmed' | 'cancelled') => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId)

            if (error) throw error
            loadStats() // Reload to update all stats
        } catch (error) {
            console.error('Error updating order:', error)
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
        <div className="space-y-6">
            <div>
                <h1 className="font-[family-name:var(--font-bebas)] text-3xl lg:text-4xl text-foreground">Dashboard</h1>
                <p className="text-muted-foreground text-sm">Estadísticas de ventas confirmadas</p>
            </div>

            {/* Pending Orders Alert */}
            {pendingOrders.length > 0 && (
                <Card className="border-2 border-orange-400 bg-orange-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                            <Clock className="w-5 h-5" />
                            Pedidos Pendientes ({pendingOrders.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingOrders.map((order) => (
                            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl shadow-sm">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <Badge variant="outline" className="bg-orange-100">Pendiente</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        {order.items?.map((item, i) => (
                                            <span key={i} className="block">
                                                • {item.quantity}x {item.name} {item.size}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                                        <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                                        <span className="text-muted-foreground">
                                            {order.delivery_type === 'pickup' ? '📍 Retiro' : '🚚 Envío'}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {order.payment_method === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia'}
                                        </span>
                                    </div>
                                    {order.address && (
                                        <p className="text-sm text-muted-foreground mt-1">📍 {order.address}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                        className="gap-1"
                                    >
                                        <Check className="w-4 h-4" />
                                        Confirmar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                        className="gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pedidos Hoy</CardTitle>
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.todayOrders}</div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Ingresos Hoy</CardTitle>
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold text-primary">{formatPrice(stats.todayRevenue)}</div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pedidos Semana</CardTitle>
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.weekOrders}</div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Ingresos Semana</CardTitle>
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold text-primary">{formatPrice(stats.weekRevenue)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Products Sold */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl sm:text-5xl mb-2">🍔</div>
                            <div className="text-2xl sm:text-4xl font-bold text-primary">{stats.burgersSold}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Hamburguesas</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl sm:text-5xl mb-2">🍔🍟</div>
                            <div className="text-2xl sm:text-4xl font-bold text-primary">{stats.combosSold}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Combos</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl sm:text-5xl mb-2">🥤</div>
                            <div className="text-2xl sm:text-4xl font-bold text-primary">{stats.drinksSold}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Bebidas</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Confirmed Orders */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="font-[family-name:var(--font-bebas)] text-xl sm:text-2xl">Últimos Pedidos Confirmados</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No hay pedidos confirmados aún</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-xl">
                                    <div>
                                        <p className="font-medium text-sm sm:text-base">{order.items?.length || 0} productos</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleString('es-AR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary text-sm sm:text-base">{formatPrice(order.total)}</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            {order.delivery_type === 'pickup' ? '📍' : '🚚'}
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
