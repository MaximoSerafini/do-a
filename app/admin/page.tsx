"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase, Order } from "@/lib/supabase"
import { ShoppingBag, DollarSign, TrendingUp, Check, X, Clock, Volume2, VolumeX } from "lucide-react"

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
    const [ordersLimit, setOrdersLimit] = useState(10)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const prevPendingCount = useRef(0)

    useEffect(() => {
        loadStats()

        // Auto-refresh cada 30 segundos
        const interval = setInterval(() => {
            loadStats()
        }, 30000)

        return () => clearInterval(interval)
    }, [ordersLimit])

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
                .limit(ordersLimit)

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

            // Play notification sound if new pending orders
            const newPendingCount = pending?.length || 0
            if (newPendingCount > prevPendingCount.current && prevPendingCount.current > 0 && soundEnabled) {
                playNotificationSound()
            }
            prevPendingCount.current = newPendingCount
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

    const updateOrderNotes = async (orderId: string, notes: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ notes })
                .eq('id', orderId)

            if (error) throw error
            loadStats()
        } catch (error) {
            console.error('Error updating notes:', error)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)
    }

    const playNotificationSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = 800
            oscillator.type = 'sine'
            gainNode.gain.value = 0.3

            oscillator.start()

            setTimeout(() => {
                oscillator.frequency.value = 1000
            }, 150)

            setTimeout(() => {
                oscillator.stop()
            }, 300)
        } catch (e) {
            console.log('Audio not supported')
        }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-[family-name:var(--font-bebas)] text-3xl lg:text-4xl text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Estadísticas de ventas confirmadas</p>
                </div>
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${soundEnabled
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
                >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    <span className="hidden sm:inline">{soundEnabled ? 'Sonido ON' : 'Sonido OFF'}</span>
                </button>
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
                                        {order.address && order.delivery_type === 'pickup' && (
                                            <Badge className="bg-blue-500">👤 {order.address}</Badge>
                                        )}
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
                                    {order.notes && (
                                        <p className="text-sm mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                            📝 {order.notes}
                                        </p>
                                    )}
                                    <div className="mt-2 flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Añadir nota..."
                                            className="flex-1 text-sm px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const input = e.target as HTMLInputElement
                                                    if (input.value.trim()) {
                                                        updateOrderNotes(order.id, input.value)
                                                        input.value = ''
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-[family-name:var(--font-bebas)] text-xl sm:text-2xl">Pedidos Confirmados</CardTitle>
                    <div className="flex gap-1">
                        {[10, 25, 50].map((num) => (
                            <button
                                key={num}
                                onClick={() => setOrdersLimit(num)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${ordersLimit === num
                                    ? 'bg-primary text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No hay pedidos confirmados aún</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="p-4 bg-muted/30 rounded-xl space-y-2">
                                    {/* Header con nombre y fecha */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {order.address && (
                                                <span className="font-bold text-foreground">
                                                    👤 {order.delivery_type === 'pickup' ? order.address : order.address.split(' - ')[0]}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(order.created_at).toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                        <span className="font-bold text-primary text-lg">{formatPrice(order.total)}</span>
                                    </div>

                                    {/* Productos */}
                                    <div className="text-sm text-muted-foreground space-y-0.5">
                                        {order.items?.map((item, i) => (
                                            <span key={i} className="block">
                                                • {item.quantity}x {item.name} {item.size}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Footer con tipo de entrega y pago */}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-muted">
                                        <span>{order.delivery_type === 'pickup' ? '📍 Retiro' : '🚚 Envío'}</span>
                                        <span>{order.payment_method === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia'}</span>
                                        {order.delivery_type === 'delivery' && order.address && (
                                            <span className="text-foreground">📌 {order.address.includes(' - ') ? order.address.split(' - ')[1] : order.address}</span>
                                        )}
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
