"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Instagram, Clock, ShoppingCart, Plus, Minus, X, MapPin, Star, Check, Home, Truck } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import Image from "next/image"

type CartItem = {
  id: string
  name: string
  size: "Simple" | "Doble" | "Triple" | "Bebida" | "Combo"
  price: number
  quantity: number
}

export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; item: string; size: string } | null>(null)
  const [cartBounce, setCartBounce] = useState(false)
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "delivery">("pickup")
  const [deliveryAddress, setDeliveryAddress] = useState("")

  const menuItems = [
    {
      name: "Cheese",
      image: "/images/cheese.png",
      simple: { price: "$7500", description: "Pan de papa, medallón de carne, queso cheddar + papas caseras" },
      doble: {
        price: "$9000",
        description: "Pan de papa, doble medallón de carne, doble queso cheddar + papas caseras",
      },
      triple: {
        price: "$13000",
        description: "Pan brioche, triple medallón de carne, triple queso cheddar + papas fritas",
      },
    },
    {
      name: "Bacon",
      image: "/images/bacon.png",
      simple: {
        price: "$8000",
        description: "Pan de papa, medallón de carne, queso cheddar, panceta crocante + papas caseras",
      },
      doble: {
        price: "$9500",
        description: "Pan de papa, doble medallón de carne, doble queso cheddar, panceta crocante + papas caseras",
      },
      triple: {
        price: "$13500",
        description: "Pan brioche, triple medallón de carne, triple queso cheddar, triple panceta crocante + papas fritas",
      },
    },
    {
      name: "Original",
      image: "/images/original.png",
      simple: {
        price: "$7700",
        description:
          "Pan de papa, medallón de carne, queso tybo, queso cheddar, panceta, lechuga, tomate + papas caseras",
      },
      doble: {
        price: "$9700",
        description:
          "Pan de papa, doble medallón de carne, queso tybo, queso cheddar, panceta, lechuga, tomate + papas caseras",
      },
      triple: {
        price: "$13700",
        description:
          "Pan brioche, triple medallón de carne, queso cheddar, queso tybo, lechuga, tomate, panceta crocante + papas fritas",
      },
    },
    {
      name: "Cherry",
      image: "/images/cherry.png",
      simple: {
        price: "$7700",
        description:
          "Pan de papa, medallón de carne, queso cheddar, cebolla salteada, tomatitos cherrys, panceta crocante + papas caseras",
      },
      doble: {
        price: "$9700",
        description:
          "Pan de papa, doble medallón de carne, doble queso cheddar, cebolla salteada, tomatitos cherrys, panceta crocante + papas caseras",
      },
      triple: {
        price: "$13700",
        description:
          "Pan brioche, triple medallón de carne, triple cheddar, panceta crocante, cebolla salteada, tomatitos cherry + papas fritas",
      },
    },
    {
      name: "Blue",
      image: "/images/blue.png",
      simple: {
        price: "$7700",
        description:
          "Pan de papa, medallón de carne, queso roquefort, queso tybo, rúcula, cebolla salteada + papas caseras",
      },
      doble: {
        price: "$9700",
        description:
          "Pan de papa, doble medallón de carne, queso roquefort, queso tybo, rúcula, cebolla salteada + papas caseras",
      },
      triple: {
        price: "$13700",
        description:
          "Pan brioche, triple medallón de carne, queso roquefort, queso tybo, rúcula, cebolla salteada + papas fritas",
      },
    },
  ]

  const combos = [
    {
      name: "Combo Original",
      description: "2 Original doble + papas caseras",
      price: "$17400",
    },
    {
      name: "Combo Cheese",
      description: "2 Cheese doble + papas caseras",
      price: "$16200",
    },
    {
      name: "Combo Bacon",
      description: "2 Bacon doble + papas caseras",
      price: "$17100",
    },
  ]

  const drinks = [
    { name: "Pepsi Clásica", price: "$3000", emoji: "🥤" },
    { name: "Pepsi Black", price: "$3000", emoji: "🖤" },
    { name: "Mirinda", price: "$3000", emoji: "🍊" },
    { name: "7up", price: "$3000", emoji: "🍋" },
    { name: "h2oh!", price: "$3000", emoji: "💧" },
    { name: "Stella Artois", price: "$4500", emoji: "🍺" },
  ]

  const addToCart = (name: string, size: "Simple" | "Doble" | "Triple" | "Bebida" | "Combo", priceStr: string) => {
    const price = Number.parseInt(priceStr.replace("$", ""))
    const id = `${name}-${size}`

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevCart, { id, name, size, price, quantity: 1 }]
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
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, change: number) => {
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
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const sendWhatsAppOrder = () => {
    if (cart.length === 0) return
    if (deliveryOption === "delivery" && !deliveryAddress.trim()) {
      alert("Por favor ingresá tu dirección para el envío")
      return
    }

    let message = "🍔 *Nuevo Pedido - Doña Rib Burger*\n\n"
    cart.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} ${item.size} - $${item.price * item.quantity}\n`
    })
    message += `\n💰 *Total: $${total}*\n\n`

    if (deliveryOption === "pickup") {
      message += "📍 *Retiro en local*"
    } else {
      message += `🚚 *Envío a domicilio*\n📍 Dirección: ${deliveryAddress}`
    }

    const whatsappUrl = `https://wa.me/5493795312150?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    setCart([])
    setIsCartOpen(false)
    setDeliveryAddress("")
    setDeliveryOption("pickup")
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
          <SheetContent className="border-l-4 border-primary">
            <SheetHeader>
              <SheetTitle className="font-[family-name:var(--font-bebas)] text-3xl flex items-center gap-2">
                <ShoppingCart className="w-7 h-7 text-primary" />
                Tu Pedido
              </SheetTitle>
              <SheetDescription>Revisá tu pedido antes de enviarlo</SheetDescription>
            </SheetHeader>
            <div className="mt-8 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍔</div>
                  <p className="text-muted-foreground">Tu carrito está vacío</p>
                  <p className="text-sm text-muted-foreground mt-1">¡Agregá una hamburguesa deliciosa!</p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 border-b border-border/50 pb-4 hover:bg-muted/30 rounded-lg p-2 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.size === "Bebida" && "🥤 Bebida"}
                          {item.size === "Combo" && "🍔🍔 Combo"}
                          {(item.size === "Simple" || item.size === "Doble" || item.size === "Triple") && `🍔 ${item.size}`}
                        </p>
                        <p className="text-sm font-bold text-primary">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8">
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8">
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 border-t-2 border-primary/20 space-y-4">
                    {/* Sugerencia de bebida si no hay bebidas en el carrito */}
                    {!cart.some(item => item.size === "Bebida") && (
                      <div className="bg-secondary/30 border border-secondary rounded-xl p-4 flex items-center gap-3">
                        <div className="text-3xl">🥤</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">¿No querés agregar una bebida?</p>
                          <p className="text-xs text-muted-foreground">Completá tu pedido con una bebida fría</p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIsCartOpen(false)}
                          asChild
                        >
                          <a href="#bebidas">Ver bebidas</a>
                        </Button>
                      </div>
                    )}

                    {/* Opciones de entrega */}
                    <div className="space-y-3">
                      <p className="font-semibold text-sm text-foreground">¿Cómo lo querés?</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={deliveryOption === "pickup" ? "default" : "outline"}
                          className="flex items-center gap-2 h-12"
                          onClick={() => setDeliveryOption("pickup")}
                        >
                          <Home className="w-4 h-4" />
                          <span className="text-sm">Retiro</span>
                        </Button>
                        <Button
                          type="button"
                          variant={deliveryOption === "delivery" ? "default" : "outline"}
                          className="flex items-center gap-2 h-12"
                          onClick={() => setDeliveryOption("delivery")}
                        >
                          <Truck className="w-4 h-4" />
                          <span className="text-sm">Envío</span>
                        </Button>
                      </div>

                      {deliveryOption === "delivery" && (
                        <div className="space-y-2 animate-fade-in-up">
                          <label className="text-sm text-muted-foreground">Dirección de envío</label>
                          <Input
                            placeholder="Ej: Av. Corrientes 1234, Piso 2"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="h-12"
                          />
                          <p className="text-xs text-muted-foreground">* El costo del envío se coordina por WhatsApp</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center bg-muted/50 rounded-xl p-4">
                      <span className="font-[family-name:var(--font-bebas)] text-2xl">Total</span>
                      <span className="font-[family-name:var(--font-bebas)] text-4xl text-primary">${total}</span>
                    </div>
                    <Button onClick={sendWhatsAppOrder} className="w-full btn-premium" size="lg">
                      <Phone className="mr-2 w-5 h-5" />
                      Enviar pedido por WhatsApp
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Header con logo real */}
      <header className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 checkerboard-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="container mx-auto px-4 py-10 relative z-10">
          {/* Logo y nombre */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-secondary/30 rounded-full blur-2xl scale-150" />
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden shadow-2xl ring-4 ring-secondary/50 animate-pulse-glow">
                <Image
                  src="/logo.jpeg"
                  alt="Doña Rib Burger Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="text-center">
              <h1 className="font-[family-name:var(--font-bebas)] text-5xl md:text-7xl tracking-wider text-balance drop-shadow-lg">
                Doña Rib Burger
              </h1>
              <p className="text-lg md:text-xl mt-2 opacity-90 flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-secondary fill-secondary" />
                Hamburguesas Gourmet
                <Star className="w-5 h-5 text-secondary fill-secondary" />
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Info de contacto */}
      <div className="bg-secondary text-secondary-foreground py-5 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            <a href="tel:+5493795312150" className="flex items-center gap-2 hover:scale-105 transition-transform group">
              <div className="p-2 bg-secondary-foreground/10 rounded-full group-hover:bg-secondary-foreground/20 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <span className="font-medium">+54 9 3795 31-2150</span>
            </a>
            <a
              href="https://www.instagram.com/donaribburger/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:scale-105 transition-transform group"
            >
              <div className="p-2 bg-secondary-foreground/10 rounded-full group-hover:bg-secondary-foreground/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="font-medium">@donaribburguer</span>
            </a>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary-foreground/10 rounded-full">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-medium">19:45 - 23:59</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/80 via-muted/40 to-background" />
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-[family-name:var(--font-bebas)] text-4xl md:text-6xl text-foreground mb-6 text-balance animate-fade-in-up decorative-line pb-4">
              Las mejores hamburguesas de la ciudad
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 text-pretty leading-relaxed max-w-2xl mx-auto">
              Carne de primera calidad, ingredientes frescos y el sabor que te hace volver.
              Cada hamburguesa es una experiencia única.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="font-[family-name:var(--font-bebas)] text-xl tracking-wide btn-premium shadow-xl hover:shadow-2xl transition-shadow"
                asChild
              >
                <a href="https://wa.me/5493795312150" className="gap-2">
                  <Phone className="w-5 h-5" />
                  Pedí ahora
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-[family-name:var(--font-bebas)] text-xl tracking-wide border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                asChild
              >
                <a href="#menu" className="gap-2">
                  Ver Menú
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Menú */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30" id="menu">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-bebas)] text-5xl md:text-7xl text-primary decorative-line pb-4 inline-block">
              Nuestro Menú
            </h2>
            <p className="text-muted-foreground mt-6 text-lg">Todas nuestras hamburguesas incluyen papas caseras 🍟</p>
          </div>

          <div className="grid gap-8 max-w-6xl mx-auto">
            {menuItems.map((item, index) => (
              <Card
                key={index}
                className="menu-card overflow-hidden border-2 border-border/50 hover:border-primary/50 bg-card shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[320px_1fr] gap-0">
                    {/* Imagen de hamburguesa */}
                    <div className="relative h-72 md:h-full min-h-[280px] bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={`Hamburguesa ${item.name}`}
                        fill
                        className="object-cover menu-card-image"
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-primary/90 text-primary-foreground text-lg px-4 py-1 font-[family-name:var(--font-bebas)] tracking-wider">
                          {item.name}
                        </Badge>
                      </div>
                    </div>

                    {/* Info del producto */}
                    <div className="p-6 md:p-8 space-y-5 flex flex-col justify-center">
                      <h3 className="font-[family-name:var(--font-bebas)] text-4xl md:text-5xl text-primary tracking-wider hidden md:block">
                        {item.name}
                      </h3>

                      <div className="space-y-4">
                        {/* Simple */}
                        <div className="bg-muted/40 rounded-xl p-4 hover:bg-muted/60 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-baseline gap-3">
                              <span className="font-bold text-xl text-primary">Simple</span>
                              <span className="font-[family-name:var(--font-bebas)] text-3xl text-foreground">
                                {item.simple.price}
                              </span>
                            </div>
                            <Button
                              onClick={() => addToCart(item.name, "Simple", item.simple.price)}
                              className="gap-2 btn-premium"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.simple.description}</p>
                        </div>

                        {/* Doble */}
                        <div className="bg-secondary/20 rounded-xl p-4 hover:bg-secondary/30 transition-colors border border-secondary/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-baseline gap-3">
                              <span className="font-bold text-xl text-secondary-foreground flex items-center gap-2">
                                Doble
                                <Badge variant="secondary" className="text-xs">+CARNE</Badge>
                              </span>
                              <span className="font-[family-name:var(--font-bebas)] text-3xl text-foreground">
                                {item.doble.price}
                              </span>
                            </div>
                            <Button
                              onClick={() => addToCart(item.name, "Doble", item.doble.price)}
                              className="gap-2 btn-premium bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.doble.description}</p>
                        </div>

                        {/* Triple */}
                        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl p-4 hover:from-primary/30 hover:to-accent/30 transition-colors border border-primary/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-baseline gap-3">
                              <span className="font-bold text-xl text-primary flex items-center gap-2">
                                Triple
                                <Badge className="text-xs bg-accent text-accent-foreground">PREMIUM</Badge>
                              </span>
                              <span className="font-[family-name:var(--font-bebas)] text-3xl text-foreground">
                                {item.triple.price}
                              </span>
                            </div>
                            <Button
                              onClick={() => addToCart(item.name, "Triple", item.triple.price)}
                              className="gap-2 btn-premium bg-accent text-accent-foreground hover:bg-accent/90"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.triple.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Combos */}
      <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-bebas)] text-5xl md:text-7xl text-primary decorative-line pb-4 inline-block">
              Combos 🔥
            </h2>
            <p className="text-muted-foreground mt-6 text-lg">Para compartir o para vos solo 😋</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {combos.map((combo, index) => (
              <Card
                key={index}
                className="combo-card shine-effect overflow-hidden border-2 border-secondary hover:border-primary bg-card shadow-lg rounded-2xl"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-5xl emoji-beat cursor-default">🍔🍔</div>
                  <h3 className="font-[family-name:var(--font-bebas)] text-3xl text-primary">{combo.name}</h3>
                  <p className="text-muted-foreground text-sm">{combo.description}</p>
                  <p className="font-[family-name:var(--font-bebas)] text-4xl text-foreground">{combo.price}</p>
                  <Button
                    onClick={() => addToCart(combo.name, "Combo", combo.price)}
                    className="w-full gap-2 btn-premium btn-shake"
                    size="lg"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar combo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bebidas */}
      <section className="py-20 bg-muted/30" id="bebidas">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-bebas)] text-5xl md:text-6xl text-primary decorative-line pb-4 inline-block">
              Bebidas
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {drinks.map((drink, index) => (
              <Card
                key={index}
                className="drink-card shine-effect text-center border-2 border-border/50 hover:border-primary/50 bg-card group rounded-xl"
              >
                <CardContent className="p-4 space-y-2">
                  <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300 cursor-default emoji-beat">{drink.emoji}</div>
                  <p className="font-medium text-foreground text-sm leading-tight">{drink.name}</p>
                  <p className="font-[family-name:var(--font-bebas)] text-2xl text-primary">{drink.price}</p>
                  <Button
                    size="sm"
                    onClick={() => addToCart(drink.name, "Bebida", drink.price)}
                    className="w-full mt-2 gap-1 btn-shake"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 checkerboard-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="text-7xl mb-6 animate-bounce-subtle cursor-default">🍔</div>
          <h2 className="font-[family-name:var(--font-bebas)] text-4xl md:text-6xl mb-6 text-balance drop-shadow-lg">
            ¿Tenés hambre?
          </h2>
          <p className="text-lg md:text-xl mb-10 opacity-90 text-pretty max-w-xl mx-auto">
            Hacé tu pedido por WhatsApp y lo preparamos al instante.
            ¡Te esperamos!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="font-[family-name:var(--font-bebas)] text-xl tracking-wide shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              asChild
            >
              <a href="https://wa.me/5493795312150" className="gap-2">
                <Phone className="w-5 h-5" />
                Pedir por WhatsApp
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-[family-name:var(--font-bebas)] text-xl tracking-wide bg-white/10 text-primary-foreground hover:bg-white/20 border-2 border-white/30 backdrop-blur-sm"
              asChild
            >
              <a href="https://www.instagram.com/donaribburger/" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Instagram className="w-5 h-5" />
                Seguinos
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-secondary">
              <Image
                src="/logo.jpeg"
                alt="Doña Rib Burger"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <div className="font-[family-name:var(--font-bebas)] text-3xl mb-1">Doña Rib Burger</div>
              <p className="text-sm opacity-70">Hamburguesas Gourmet</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>19:45 - 23:59</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+54 9 3795 31-2150</span>
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <a
                href="https://www.instagram.com/donaribburger/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/5493795312150"
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs opacity-50 mt-4">© 2025 Doña Rib Burger. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
