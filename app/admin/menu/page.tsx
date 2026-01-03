"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase, Product } from "@/lib/supabase"
import { Plus, Pencil, Trash2, X, Save, AlertTriangle } from "lucide-react"

export default function MenuManagement() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [activeTab, setActiveTab] = useState<'burger' | 'combo' | 'drink'>('burger')
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({ show: false, id: '', name: '' })

    const [formData, setFormData] = useState({
        name: '',
        type: 'burger' as 'burger' | 'combo' | 'drink',
        image_url: '',
        price_simple: 0,
        price_doble: 0,
        price_triple: 0,
        price: 0,
        description: '',
        description_simple: '',
        description_doble: '',
        description_triple: '',
        active: true
    })

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error loading products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(formData)
                    .eq('id', editingProduct.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([formData])
                if (error) throw error
            }

            loadProducts()
            resetForm()
        } catch (error) {
            console.error('Error saving product:', error)
            alert('Error al guardar el producto')
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm.id) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', deleteConfirm.id)
            if (error) throw error
            loadProducts()
        } catch (error) {
            console.error('Error deleting product:', error)
        } finally {
            setDeleteConfirm({ show: false, id: '', name: '' })
        }
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            type: product.type,
            image_url: product.image_url,
            price_simple: product.price_simple || 0,
            price_doble: product.price_doble || 0,
            price_triple: product.price_triple || 0,
            price: product.price || 0,
            description: product.description || '',
            description_simple: product.description_simple || '',
            description_doble: product.description_doble || '',
            description_triple: product.description_triple || '',
            active: product.active
        })
        setIsCreating(true)
    }

    const resetForm = () => {
        setEditingProduct(null)
        setIsCreating(false)
        setFormData({
            name: '',
            type: activeTab,
            image_url: '',
            price_simple: 0,
            price_doble: 0,
            price_triple: 0,
            price: 0,
            description: '',
            description_simple: '',
            description_doble: '',
            description_triple: '',
            active: true
        })
    }

    const startCreate = () => {
        resetForm()
        setFormData(prev => ({ ...prev, type: activeTab }))
        setIsCreating(true)
    }

    const toggleActive = async (product: Product) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ active: !product.active })
                .eq('id', product.id)
            if (error) throw error
            loadProducts()
        } catch (error) {
            console.error('Error toggling product:', error)
        }
    }

    const filteredProducts = products.filter(p => p.type === activeTab)

    if (loading) {
        return <div className="flex items-center justify-center h-64">Cargando...</div>
    }

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md border-0 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                                    <AlertTriangle className="w-8 h-8 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">¿Eliminar producto?</h3>
                                    <p className="text-muted-foreground mt-2">
                                        Estás por eliminar <span className="font-semibold text-foreground">{deleteConfirm.name}</span>.
                                        Esta acción no se puede deshacer.
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setDeleteConfirm({ show: false, id: '', name: '' })}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        className="flex-1"
                                    >
                                        Sí, eliminar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-[family-name:var(--font-bebas)] text-3xl lg:text-4xl text-foreground">Gestión de Menú</h1>
                    <p className="text-muted-foreground text-sm">Agregá, editá o eliminá productos</p>
                </div>
                <Button onClick={startCreate} className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {(['burger', 'combo', 'drink'] as const).map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? 'default' : 'outline'}
                        onClick={() => setActiveTab(tab)}
                        size="sm"
                        className="text-xs sm:text-sm"
                    >
                        {tab === 'burger' ? '🍔 Hamburguesas' : tab === 'combo' ? '🍔🍟 Combos' : '🥤 Bebidas'}
                    </Button>
                ))}
            </div>

            {/* Create/Edit Form */}
            {isCreating && (
                <Card className="border-2 border-primary">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Nombre</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nombre del producto"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">URL de Imagen</label>
                                <Input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {activeTab === 'burger' ? (
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                <div>
                                    <label className="text-xs sm:text-sm font-medium">Precio Simple</label>
                                    <Input
                                        type="number"
                                        value={formData.price_simple}
                                        onChange={(e) => setFormData({ ...formData, price_simple: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium">Precio Doble</label>
                                    <Input
                                        type="number"
                                        value={formData.price_doble}
                                        onChange={(e) => setFormData({ ...formData, price_doble: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium">Precio Triple</label>
                                    <Input
                                        type="number"
                                        value={formData.price_triple}
                                        onChange={(e) => setFormData({ ...formData, price_triple: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="text-sm font-medium">Precio</label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium">Descripción</label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descripción del producto"
                            />
                        </div>

                        <Button onClick={handleSave} className="w-full gap-2">
                            <Save className="w-4 h-4" />
                            {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                    <Card key={product.id} className={`border-0 shadow-lg ${!product.active ? 'opacity-50' : ''}`}>
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                {product.image_url && (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-bold text-base sm:text-lg truncate">{product.name}</h3>
                                        <Badge variant={product.active ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                                            {product.active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                    {product.type === 'burger' ? (
                                        <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                                            S: ${product.price_simple} | D: ${product.price_doble} | T: ${product.price_triple}
                                        </div>
                                    ) : (
                                        <div className="text-lg font-bold text-primary mt-1">
                                            ${product.price}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="flex-1 gap-1 text-xs">
                                    <Pencil className="w-3 h-3" />
                                    Editar
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => toggleActive(product)} className="flex-1 text-xs">
                                    {product.active ? 'Desactivar' : 'Activar'}
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeleteConfirm({ show: true, id: product.id, name: product.name })}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No hay productos de este tipo. ¡Agregá uno nuevo!
                    </div>
                )}
            </div>
        </div>
    )
}
