"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase, Product } from "@/lib/supabase"
import { Plus, Minus, ShoppingBag, Check, Trash2, Sparkles } from "lucide-react"

interface CartItem {
    id: string
    name: string
    size: string
    price: number
    quantity: number
    image?: string
}

export default function PedidosMostrador() {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'burger' | 'combo' | 'drink'>('burger')
    const [successMessage, setSuccessMessage] = useState(false)

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('active', true)
                .order('name', { ascending: true })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error loading products:', error)
        } finally {
            setLoading(false)
        }
    }

    const addToCart = (product: Product, size: string, price: number) => {
        const id = `${product.name}-${size}`
        setCart(prev => {
            const existing = prev.find(item => item.id === id)
            if (existing) {
                return prev.map(item =>
                    item.id === id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, {
                id,
                name: product.name,
                size,
                price,
                quantity: 1,
                image: product.image_url
            }]
        })
    }

    const updateQuantity = (id: string, change: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id === id) {
                    const newQty = item.quantity + change
                    return newQty > 0 ? { ...item, quantity: newQty } : item
                }
                return item
            }).filter(item => item.quantity > 0)
        )
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    const saveOrder = async () => {
        if (cart.length === 0) return

        setSaving(true)
        try {
            const orderItems = cart.map(item => ({
                name: item.name,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            }))

            const { error } = await supabase.from('orders').insert([{
                items: orderItems,
                total: total,
                delivery_type: 'pickup',
                payment_method: 'efectivo',
                address: null,
                status: 'confirmed'
            }])

            if (error) throw error

            setSuccessMessage(true)
            setCart([])
            setTimeout(() => setSuccessMessage(false), 3000)
        } catch (error) {
            console.error('Error saving order:', error)
            alert('Error al guardar el pedido')
        } finally {
            setSaving(false)
        }
    }

    const filteredProducts = products.filter(p => p.type === activeTab)

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-4xl mb-2 animate-bounce">🍔</div>
                    <p className="text-muted-foreground">Cargando productos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Success Toast */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top fade-in duration-300">
                    <Card className="bg-green-500 text-white border-0 shadow-2xl">
                        <CardContent className="flex items-center gap-3 py-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Check className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold">¡Pedido registrado!</p>
                                <p className="text-sm opacity-90">El pedido se guardó correctamente</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-[family-name:var(--font-bebas)] text-3xl lg:text-4xl text-foreground flex items-center gap-3">
                        <span className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">🛒</span>
                        Pedidos Mostrador
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Cargá pedidos que te hagan en el local</p>
                </div>
                {itemCount > 0 && (
                    <Badge className="text-lg py-2 px-4 bg-primary">
                        {itemCount} {itemCount === 1 ? 'producto' : 'productos'} • {formatPrice(total)}
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Products */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-muted/50 rounded-2xl w-fit">
                        {(['burger', 'combo', 'drink'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${activeTab === tab
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'hover:bg-white/50 text-muted-foreground'
                                    }`}
                            >
                                {tab === 'burger' ? '🍔 Hamburguesas' : tab === 'combo' ? '🍔🍟 Combos' : '🥤 Bebidas'}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
                            >
                                <CardContent className="p-3">
                                    {/* Header with image and name */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden flex-shrink-0">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                                    {product.type === 'burger' ? '🍔' : product.type === 'combo' ? '🍔🍟' : '🥤'}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg">{product.name}</h3>
                                    </div>

                                    {/* Price buttons */}
                                    {product.type === 'burger' ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Simple', price: product.price_simple },
                                                { label: 'Doble', price: product.price_doble },
                                                { label: 'Triple', price: product.price_triple }
                                            ].map((size) => (
                                                <button
                                                    key={size.label}
                                                    onClick={() => addToCart(product, size.label, size.price || 0)}
                                                    className="flex flex-col items-center py-2 px-1 rounded-lg border border-muted hover:border-primary hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <span className="text-xs uppercase tracking-wide">{size.label}</span>
                                                    <span className="text-sm font-bold">{formatPrice(size.price || 0)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(product, product.type === 'combo' ? 'Combo' : 'Bebida', product.price || 0)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-muted hover:border-primary hover:bg-primary hover:text-white transition-all font-bold"
                                        >
                                            <Plus className="w-4 h-4" />
                                            {formatPrice(product.price || 0)}
                                        </button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="text-5xl mb-4">📦</div>
                            <p>No hay productos de este tipo</p>
                        </div>
                    )}
                </div>

                {/* Cart */}
                <div className="xl:col-span-1">
                    <Card className="border-0 shadow-xl bg-gradient-to-b from-white to-muted/20 sticky top-4">
                        <CardHeader className="pb-2 border-b">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <ShoppingBag className="w-5 h-5 text-primary" />
                                    </div>
                                    <span>Pedido</span>
                                </div>
                                {cart.length > 0 && (
                                    <Badge variant="secondary">{itemCount}</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">Pedido vacío</p>
                                    <p className="text-sm text-muted-foreground/70 mt-1">Seleccioná productos para agregar</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border"
                                            >
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl">🍔</div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.size}</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                                                    <button
                                                        className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center transition-colors"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                                    <button
                                                        className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center transition-colors"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                                                    <button
                                                        className="text-destructive/60 hover:text-destructive text-xs transition-colors"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4 space-y-4">
                                        {/* Total */}
                                        <div className="bg-primary/5 rounded-2xl p-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Total a cobrar</span>
                                                <span className="font-[family-name:var(--font-bebas)] text-4xl text-primary">{formatPrice(total)}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCart([])}
                                                className="h-12"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Vaciar
                                            </Button>
                                            <Button
                                                onClick={saveOrder}
                                                disabled={saving}
                                                className="h-12 gap-2 text-base"
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-5 h-5" />
                                                        Cobrar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
