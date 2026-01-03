"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase, Ingredient } from "@/lib/supabase"
import { Plus, Minus, X, Save, AlertTriangle, Package } from "lucide-react"

export default function StockManagement() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        quantity: 0,
        unit: 'unidades',
        min_stock: 10
    })

    useEffect(() => {
        loadIngredients()
    }, [])

    const loadIngredients = async () => {
        try {
            const { data, error } = await supabase
                .from('ingredients')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setIngredients(data || [])
        } catch (error) {
            console.error('Error loading ingredients:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('ingredients')
                    .update(formData)
                    .eq('id', editingId)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('ingredients')
                    .insert([formData])
                if (error) throw error
            }

            loadIngredients()
            resetForm()
        } catch (error) {
            console.error('Error saving ingredient:', error)
            alert('Error al guardar el ingrediente')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que querés eliminar este ingrediente?')) return

        try {
            const { error } = await supabase
                .from('ingredients')
                .delete()
                .eq('id', id)
            if (error) throw error
            loadIngredients()
        } catch (error) {
            console.error('Error deleting ingredient:', error)
        }
    }

    const adjustStock = async (id: string, change: number) => {
        const ingredient = ingredients.find(i => i.id === id)
        if (!ingredient) return

        const newQuantity = Math.max(0, ingredient.quantity + change)

        try {
            const { error } = await supabase
                .from('ingredients')
                .update({ quantity: newQuantity })
                .eq('id', id)
            if (error) throw error
            loadIngredients()
        } catch (error) {
            console.error('Error adjusting stock:', error)
        }
    }

    const resetForm = () => {
        setEditingId(null)
        setIsCreating(false)
        setFormData({
            name: '',
            quantity: 0,
            unit: 'unidades',
            min_stock: 10
        })
    }

    const startEdit = (ingredient: Ingredient) => {
        setEditingId(ingredient.id)
        setFormData({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            min_stock: ingredient.min_stock
        })
        setIsCreating(true)
    }

    const lowStockItems = ingredients.filter(i => i.quantity <= i.min_stock)

    if (loading) {
        return <div className="flex items-center justify-center h-64">Cargando...</div>
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-foreground">Gestión de Stock</h1>
                    <p className="text-muted-foreground">Controlá el inventario de ingredientes</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Ingrediente
                </Button>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <Card className="border-2 border-destructive bg-destructive/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Stock Bajo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {lowStockItems.map(item => (
                                <Badge key={item.id} variant="destructive" className="text-sm py-1 px-3">
                                    {item.name}: {item.quantity} {item.unit}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Create/Edit Form */}
            {isCreating && (
                <Card className="border-2 border-primary">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{editingId ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium">Nombre</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Pan de papa"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Cantidad</label>
                                <Input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Unidad</label>
                                <Input
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder="kg, unidades, litros..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Stock Mínimo</label>
                                <Input
                                    type="number"
                                    value={formData.min_stock}
                                    onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <Button onClick={handleSave} className="w-full gap-2">
                            <Save className="w-4 h-4" />
                            {editingId ? 'Guardar Cambios' : 'Crear Ingrediente'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Ingredients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ingredients.map((ingredient) => {
                    const isLow = ingredient.quantity <= ingredient.min_stock
                    return (
                        <Card key={ingredient.id} className={`border-0 shadow-lg ${isLow ? 'ring-2 ring-destructive' : ''}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary" />
                                        <h3 className="font-bold">{ingredient.name}</h3>
                                    </div>
                                    {isLow && (
                                        <Badge variant="destructive" className="text-xs">
                                            ⚠️ Bajo
                                        </Badge>
                                    )}
                                </div>

                                <div className="text-center py-4">
                                    <div className={`text-4xl font-bold ${isLow ? 'text-destructive' : 'text-primary'}`}>
                                        {ingredient.quantity}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{ingredient.unit}</div>
                                </div>

                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => adjustStock(ingredient.id, -1)}
                                        className="h-10 w-10"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => adjustStock(ingredient.id, -10)}
                                        className="h-10 w-10"
                                    >
                                        -10
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => adjustStock(ingredient.id, 10)}
                                        className="h-10 w-10"
                                    >
                                        +10
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="icon"
                                        onClick={() => adjustStock(ingredient.id, 1)}
                                        className="h-10 w-10"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startEdit(ingredient)}
                                        className="flex-1"
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(ingredient.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Mínimo: {ingredient.min_stock} {ingredient.unit}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}

                {ingredients.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No hay ingredientes cargados. ¡Agregá uno nuevo!
                    </div>
                )}
            </div>
        </div>
    )
}
