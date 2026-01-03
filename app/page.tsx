"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Instagram, Clock, ShoppingCart, Plus, Minus, X, MapPin, Star, Check, Home, Truck } from "lucide-react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"

type CartItem = {
  id: string
  name: string
  size: "Simple" | "Doble" | "Triple" | "Bebida" | "Combo"
  price: number
  quantity: number
  image?: string
}

export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; item: string; size: string } | null>(null)
  const [cartBounce, setCartBounce] = useState(false)
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "delivery">("pickup")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia">("efectivo")

  // Products from Supabase
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [combos, setCombos] = useState<any[]>([])
  const [drinks, setDrinks] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('name', { ascending: true })

        if (error) throw error

        // Transform data to match expected format
        const burgers = (data || [])
          .filter(p => p.type === 'burger')
          .map(p => ({
            name: p.name,
            image: p.image_url,
            simple: { price: `$${p.price_simple}`, description: p.description_simple || p.description || '' },
            doble: { price: `$${p.price_doble}`, description: p.description_doble || p.description || '' },
            triple: { price: `$${p.price_triple}`, description: p.description_triple || p.description || '' }
          }))

        const comboItems = (data || [])
          .filter(p => p.type === 'combo')
          .map(p => ({
            name: p.name,
            description: p.description || '',
            price: `$${p.price}`,
            image: p.image_url
          }))

        const drinkItems = (data || [])
          .filter(p => p.type === 'drink')
          .map(p => ({
            name: p.name,
            price: `$${p.price}`,
            image: p.image_url
          }))

        setMenuItems(burgers)
        setCombos(comboItems)
        setDrinks(drinkItems)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()
  }, [])

  const addToCart = useCallback((name: string, size: "Simple" | "Doble" | "Triple" | "Bebida" | "Combo", priceStr: string, image?: string) => {
    const price = Number.parseInt(priceStr.replace("$", ""))
    const id = `${name}-${size}`

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevCart, { id, name, size, price, quantity: 1, image }]
    })

    // Show notification
    const displaySize = size === "Bebida" || size === "Combo" ? "" : size
    setNotification({ show: true, item: name, size: displaySize })
    setCartBounce(true)

    // Auto-hide notification after 2.5 seconds
    setTimeout(() => {
      setNotification(null)
    }, 2500)

    // Reset cart bounce
    setTimeout(() => {
      setCartBounce(false)
    }, 600)
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, change: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }, [])

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])

  const sendWhatsAppOrder = async () => {
    if (cart.length === 0) return
    if (deliveryOption === "delivery" && !deliveryAddress.trim()) {
      alert("Por favor ingresá tu dirección para el envío")
      return
    }

    // Register order in Supabase
    try {
      const orderItems = cart.map(item => ({
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      }))

      await supabase.from('orders').insert([{
        items: orderItems,
        total: total,
        delivery_type: deliveryOption,
        payment_method: paymentMethod,
        address: deliveryOption === 'delivery' ? deliveryAddress : null,
        status: 'pending'
      }])
    } catch (error) {
      console.error('Error registering order:', error)
    }

    let message = "🍔 *Nuevo Pedido - Doña Rib Burger*\n\n"
    cart.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} ${item.size} - $${item.price * item.quantity}\n`
    })
    message += `\n💰 *Total: $${total}*\n\n`

    if (deliveryOption === "pickup") {
      message += "📍 *Retiro en local*\n"
    } else {
      message += `🚚 *Envío a domicilio*\n📍 Dirección: ${deliveryAddress}\n`
    }

    message += `\n💳 *Pago: ${paymentMethod === "efectivo" ? "Efectivo 💵" : "Transferencia 🏦"}*`

    const whatsappUrl = `https://wa.me/5493795312150?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    setCart([])
    setIsCartOpen(false)
    setDeliveryAddress("")
    setDeliveryOption("pickup")
    setPaymentMethod("efectivo")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toast Notification */}
      {notification?.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up">
          <div className="bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-secondary">
            <div className="bg-secondary text-secondary-foreground rounded-full p-1.5">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">¡Agregado al carrito!</p>
              <p className="text-xs opacity-90">{notification.item} {notification.size}</p>
            </div>
            <div className="text-2xl ml-2">🍔</div>
          </div>
        </div>
      )}
      {/* Carrito flotante fijo */}
      <div className="fixed bottom-6 right-6 z-50">
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button
              variant="default"
              size="lg"
              className={`relative shadow-2xl hover:scale-110 transition-all h-14 w-14 rounded-full bg-primary hover:bg-primary/90 ${cartBounce ? 'animate-bounce' : ''}`}
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center p-0 bg-accent text-accent-foreground text-sm font-bold animate-pulse">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="border-l-0 flex flex-col h-full bg-white p-0 w-full sm:max-w-md" side="right">
            {/* Header del carrito */}
            <div className="p-6 pb-4 flex-shrink-0">
              <SheetHeader>
                <SheetTitle className="font-[family-name:var(--font-bebas)] text-4xl flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  Carrito
                </SheetTitle>
              </SheetHeader>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="text-7xl mb-4">🍔</div>
                  <p className="text-muted-foreground font-medium">Tu carrito está vacío</p>
                  <p className="text-sm text-muted-foreground mt-1">¡Agregá una hamburguesa deliciosa!</p>
                </motion.div>
              </div>
            ) : (
              <>
                {/* Área scrolleable para los productos */}
                <div className="flex-1 overflow-y-auto px-4 space-y-3">
                  <AnimatePresence>
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl border-l-4 border-primary shadow-md p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          {/* Imagen del producto */}
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className={`w-full h-full ${item.size === "Bebida" ? "object-contain p-1" : "object-cover"}`}
                              />
                            ) : (
                              <span className="text-3xl">🍔</span>
                            )}
                          </div>

                          {/* Info del producto */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.size === "Bebida" && "Bebida"}
                              {item.size === "Combo" && "Combo"}
                              {(item.size === "Simple" || item.size === "Doble" || item.size === "Triple") && item.size}
                            </p>
                            {/* Controles de cantidad */}
                            <div className="flex items-center gap-2 mt-2">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </motion.button>
                              <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Precio y eliminar */}
                          <div className="text-right flex-shrink-0">
                            <p className="font-[family-name:var(--font-bebas)] text-2xl text-primary">
                              ${item.price * item.quantity}
                            </p>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors mt-1"
                            >
                              Eliminar
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Sugerencia de bebida si no hay bebidas en el carrito */}
                  {!cart.some(item => item.size === "Bebida") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3"
                    >
                      <div className="text-3xl">🥤</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">¿Agregamos una bebida?</p>
                        <p className="text-xs text-muted-foreground">Completá tu pedido</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCartOpen(false)}
                        className="rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                        asChild
                      >
                        <a href="#bebidas">Ver</a>
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* Sección FIJA al fondo */}
                <div className="flex-shrink-0 border-t bg-gradient-to-t from-muted/30 to-white px-4 py-4 space-y-4">
                  {/* Opciones de entrega */}
                  <div className="space-y-3">
                    <p className="font-semibold text-sm text-foreground">¿Cómo lo querés?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all ${deliveryOption === "pickup"
                          ? "bg-primary text-white shadow-lg"
                          : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        onClick={() => setDeliveryOption("pickup")}
                      >
                        <Home className="w-4 h-4" />
                        Retiro
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all ${deliveryOption === "delivery"
                          ? "bg-primary text-white shadow-lg"
                          : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        onClick={() => setDeliveryOption("delivery")}
                      >
                        <Truck className="w-4 h-4" />
                        Envío
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {deliveryOption === "delivery" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <Input
                            placeholder="Dirección de envío..."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="h-12 rounded-xl border-primary/30 focus:border-primary"
                          />
                          <p className="text-xs text-muted-foreground">* Costo de envío a coordinar</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Método de pago */}
                  <div className="space-y-3">
                    <p className="font-semibold text-sm text-foreground">¿Cómo pagás?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all ${paymentMethod === "efectivo"
                          ? "bg-primary text-white shadow-lg"
                          : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        onClick={() => setPaymentMethod("efectivo")}
                      >
                        💵 Efectivo
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all ${paymentMethod === "transferencia"
                          ? "bg-primary text-white shadow-lg"
                          : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        onClick={() => setPaymentMethod("transferencia")}
                      >
                        🏦 Transferencia
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-primary/5 rounded-2xl p-4 border border-primary/20">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                      <p className="font-[family-name:var(--font-bebas)] text-4xl text-primary">${total}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Tiempo estimado</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        30-45 min
                      </p>
                    </div>
                  </div>

                  {/* Botón de pedido */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={sendWhatsAppOrder}
                      className="w-full h-14 rounded-2xl font-[family-name:var(--font-bebas)] text-xl tracking-wide shadow-lg"
                      size="lg"
                    >
                      <Phone className="mr-2 w-5 h-5" />
                      Hacer pedido
                    </Button>
                  </motion.div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Header con logo real - ANIMADO */}
      <header className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 checkerboard-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="container mx-auto px-4 py-10 relative z-10">
          {/* Logo y nombre */}
          <div className="flex flex-col items-center gap-6">
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-full blur-2xl scale-150"
                animate={{ scale: [1.5, 1.8, 1.5], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/50">
                <Image
                  src="/logo.jpeg"
                  alt="Doña Rib Burger Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="font-[family-name:var(--font-bebas)] text-5xl md:text-7xl tracking-wider text-balance drop-shadow-lg">
                Doña Rib Burger
              </h1>
              <motion.p
                className="text-lg md:text-xl mt-2 opacity-90 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                Hamburguesas Gourmet
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              </motion.p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Info de contacto - ANIMADO */}
      <motion.div
        className="bg-white text-foreground py-4 shadow-lg border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            <motion.a
              href="tel:+5493795312150"
              className="flex items-center gap-2 hover:text-primary transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">+54 9 3795 31-2150</span>
            </motion.a>
            <motion.a
              href="https://www.instagram.com/donaribburger/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Instagram className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">@donaribburguer</span>
            </motion.a>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">Mié a Dom • 19:45 - 23:59</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section - ANIMADO */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="font-[family-name:var(--font-bebas)] text-4xl md:text-6xl text-foreground mb-6 text-balance"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Las mejores hamburguesas de la ciudad
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-10 text-pretty leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Carne de primera calidad, ingredientes frescos y el sabor que te hace volver.
              Cada hamburguesa es una experiencia única.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="font-[family-name:var(--font-bebas)] text-xl tracking-wide shadow-xl hover:shadow-2xl transition-shadow w-full sm:w-auto"
                  asChild
                >
                  <a href="https://wa.me/5493795312150" className="gap-2">
                    <Phone className="w-5 h-5" />
                    Pedí ahora
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-[family-name:var(--font-bebas)] text-xl tracking-wide border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
                  asChild
                >
                  <a href="#menu" className="gap-2">
                    Ver Menú
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menú */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30" id="menu">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-bebas)] text-5xl md:text-7xl text-primary decorative-line pb-4 inline-block">
              Nuestro Menú
            </h2>
            <p className="text-muted-foreground mt-6 text-lg">Todas nuestras hamburguesas incluyen papas caseras 🍟</p>
          </motion.div>

          {/* Grid de hamburguesas - estilo flotante */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pt-12">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="menu-card overflow-visible border-0 bg-white shadow-xl rounded-3xl group relative h-full">
                  {/* Imagen flotante sobre la card */}
                  <div className="relative -mt-10 mx-4">
                    <motion.div
                      className="relative h-64 w-full overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-primary/10 to-primary/5"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={item.image}
                        alt={`Hamburguesa ${item.name}`}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      />
                    </motion.div>
                    {/* Badge flotante */}
                    <Badge className="absolute -bottom-3 left-4 bg-primary text-white text-sm px-4 py-1.5 font-[family-name:var(--font-bebas)] tracking-wider shadow-lg">
                      {item.name}
                    </Badge>
                  </div>

                  <CardContent className="pt-8 pb-6 px-6">
                    {/* Título */}
                    <h3 className="font-[family-name:var(--font-bebas)] text-3xl text-foreground tracking-wide mb-4">
                      {item.name}
                    </h3>

                    {/* Opciones de tamaño */}
                    <div className="space-y-3">
                      {/* Simple */}
                      <motion.div
                        className="flex items-center justify-between bg-muted/50 rounded-xl p-3 hover:bg-muted transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <div>
                          <span className="text-foreground font-medium">Simple</span>
                          <span className="font-[family-name:var(--font-bebas)] text-2xl text-primary ml-3">
                            {item.simple.price}
                          </span>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item.name, "Simple", item.simple.price, item.image)}
                            className="bg-primary hover:bg-primary/90 text-white rounded-full h-10 w-10 p-0 shadow-lg"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </motion.div>
                      </motion.div>

                      {/* Doble */}
                      <motion.div
                        className="flex items-center justify-between bg-muted/50 rounded-xl p-3 hover:bg-muted transition-colors border-l-4 border-primary"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-foreground font-medium">Doble</span>
                          <Badge className="bg-primary/10 text-primary text-xs border border-primary/20">+CARNE</Badge>
                          <span className="font-[family-name:var(--font-bebas)] text-2xl text-primary">
                            {item.doble.price}
                          </span>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item.name, "Doble", item.doble.price, item.image)}
                            className="bg-primary hover:bg-primary/90 text-white rounded-full h-10 w-10 p-0 shadow-lg"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </motion.div>
                      </motion.div>

                      {/* Triple */}
                      <motion.div
                        className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-3 hover:from-primary/20 hover:to-primary/10 transition-colors border-l-4 border-primary"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-foreground font-medium">Triple</span>
                          <Badge className="bg-primary text-white text-xs">⭐ PREMIUM</Badge>
                          <span className="font-[family-name:var(--font-bebas)] text-2xl text-primary">
                            {item.triple.price}
                          </span>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item.name, "Triple", item.triple.price, item.image)}
                            className="bg-primary hover:bg-primary/90 text-white rounded-full h-10 w-10 p-0 shadow-lg"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Combos */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-bebas)] text-5xl md:text-7xl text-primary decorative-line pb-4 inline-block">
              Combos 🔥
            </h2>
            <p className="text-muted-foreground mt-6 text-lg">Para compartir o para vos solo 😋</p>
          </motion.div>

          {/* Layout: Imagen izquierda, combos derecha */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
            {/* Imagen del combo */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="relative overflow-hidden rounded-3xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="https://i.imgur.com/QIOjTAx.jpeg"
                  alt="Combos Doña Rib Burger"
                  loading="lazy"
                  className="w-full h-80 lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <motion.div
                  className="absolute bottom-6 left-6 right-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge className="bg-primary text-white text-lg px-4 py-2 font-[family-name:var(--font-bebas)] tracking-wider">
                    ¡OFERTA ESPECIAL!
                  </Badge>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Lista de combos */}
            <div className="space-y-4">
              {combos.map((combo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                >
                  <motion.div whileHover={{ scale: 1.02, x: 10 }} transition={{ duration: 0.2 }}>
                    <Card className="overflow-hidden border-0 bg-white shadow-lg rounded-2xl hover:shadow-xl transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-[family-name:var(--font-bebas)] text-2xl text-primary">{combo.name}</h3>
                            <p className="text-muted-foreground text-sm">{combo.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-[family-name:var(--font-bebas)] text-3xl text-foreground">{combo.price}</p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => addToCart(combo.name, "Combo", combo.price, "https://i.imgur.com/QIOjTAx.jpeg")}
                                className="mt-2 gap-2 bg-primary hover:bg-primary/90"
                                size="sm"
                              >
                                <Plus className="w-4 h-4" />
                                Agregar
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bebidas */}
      <section className="py-20 bg-muted/30" id="bebidas">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-bebas)] text-5xl md:text-6xl text-primary decorative-line pb-4 inline-block">
              Bebidas
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto pt-8">
            {drinks.map((drink, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
              >
                <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.2 }}>
                  <Card className="overflow-visible border-0 bg-white shadow-xl rounded-2xl group relative text-center h-full">
                    {/* Imagen flotante */}
                    <div className="relative -mt-8 mx-2">
                      <motion.div
                        className="h-28 w-28 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-full shadow-lg overflow-hidden p-3"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={drink.image}
                          alt={drink.name}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      </motion.div>
                    </div>

                    <CardContent className="pt-4 pb-4 px-3">
                      <p className="font-medium text-foreground text-sm leading-tight mb-1">{drink.name}</p>
                      <p className="font-[family-name:var(--font-bebas)] text-2xl text-primary">{drink.price}</p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          onClick={() => addToCart(drink.name, "Bebida", drink.price, drink.image)}
                          className="w-full mt-3 gap-1 bg-primary hover:bg-primary/90 rounded-full"
                        >
                          <Plus className="w-3 h-3" />
                          Agregar
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 checkerboard-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            className="text-7xl mb-6 cursor-default"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <motion.span
              className="inline-block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              🍔
            </motion.span>
          </motion.div>
          <motion.h2
            className="font-[family-name:var(--font-bebas)] text-4xl md:text-6xl mb-6 text-balance drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            ¿Tenés hambre?
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl mb-10 opacity-90 text-pretty max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Hacé tu pedido por WhatsApp y lo preparamos al instante.
            ¡Te esperamos!
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="secondary"
                className="font-[family-name:var(--font-bebas)] text-xl tracking-wide shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
                asChild
              >
                <a href="https://wa.me/5493795312150" className="gap-2">
                  <Phone className="w-5 h-5" />
                  Pedir por WhatsApp
                </a>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="font-[family-name:var(--font-bebas)] text-xl tracking-wide bg-white/10 text-primary-foreground hover:bg-white/20 border-2 border-white/30 backdrop-blur-sm w-full sm:w-auto"
                asChild
              >
                <a href="https://www.instagram.com/donaribburger/" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Instagram className="w-5 h-5" />
                  Seguinos
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white">
        {/* Map Section */}
        <div className="container mx-auto px-4 pt-8">
          <div className="w-full h-40 sm:h-48 relative rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.5!2d-58.8347!3d-27.4679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450cf0c0000001%3A0x0!2sLavalle%2038%2C%20Corrientes!5e0!3m2!1ses!2sar!4v1704000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Lavalle 38 - Corrientes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Main footer content */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left side - Logo and name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/30 flex-shrink-0">
                <Image
                  src="/logo.jpeg"
                  alt="Doña Rib Burger"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-[family-name:var(--font-bebas)] text-2xl">Doña Rib Burger</div>
                <p className="text-sm opacity-70">Hamburguesas Gourmet</p>
              </div>
            </div>

            {/* Right side - Contact info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 opacity-70" />
                <span>Lavalle 38, Corrientes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 opacity-70" />
                <span>Mié a Dom • 19:45 - 23:59</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 opacity-70" />
                <span>+54 9 3795 31-2150</span>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/donaribburger/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://wa.me/5493795312150"
                  className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center md:text-left">
            <p className="text-xs opacity-50">© 2025 Doña Rib Burger. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
