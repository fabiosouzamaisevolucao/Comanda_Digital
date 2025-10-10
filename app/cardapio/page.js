'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function CardapioPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [customPrice, setCustomPrice] = useState('')
  const [comandaId, setComandaId] = useState(null)

  useEffect(() => {
    const storedComandaId = localStorage.getItem('comanda_id')
    if (!storedComandaId) {
      router.push('/pedido')
      return
    }
    setComandaId(storedComandaId)
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar cardápio",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const openProductDialog = (product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setCustomPrice('')
  }

  const addToCart = async () => {
    if (!selectedProduct) return

    const price = selectedProduct.is_variable_price ? parseFloat(customPrice) : selectedProduct.price

    if (selectedProduct.is_variable_price && (!customPrice || price <= 0)) {
      toast({
        title: "Atenção",
        description: "Informe o valor do item",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/comanda-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comanda_id: comandaId,
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity: quantity,
          unit_price: price
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Item Adicionado!",
          description: `${quantity}x ${selectedProduct.name}`
        })
        setSelectedProduct(null)
        loadCart()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const loadCart = async () => {
    if (!comandaId) return
    try {
      const response = await fetch(`/api/comanda-items?comanda_id=${comandaId}`)
      const data = await response.json()
      setCart(data.items || [])
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }

  useEffect(() => {
    if (comandaId) loadCart()
  }, [comandaId])

  const cartTotal = cart.reduce((sum, item) => sum + item.total_price, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const filterByCategory = (category) => products.filter(p => p.category === category)

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <header className="border-b border-yellow-600/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-yellow-500">Cardápio</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="food" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-yellow-600/20 h-12">
            <TabsTrigger value="food" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              Alimentação
            </TabsTrigger>
            <TabsTrigger value="drinks" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              Bebidas
            </TabsTrigger>
            <TabsTrigger value="other" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              Outros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="mt-6 space-y-4">
            {filterByCategory('food').map(product => (
              <Card key={product.id} className="bg-gray-900 border-yellow-600/20 hover:border-yellow-500/50 transition-all cursor-pointer" onClick={() => openProductDialog(product)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {product.image_url && (
                      <div className="w-20 h-20 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-yellow-500">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {product.is_variable_price ? (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500">Preço Variável</Badge>
                        ) : (
                          <p className="text-xl font-bold text-yellow-500">R$ {product.price.toFixed(2)}</p>
                        )}
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="drinks" className="mt-6 space-y-4">
            {filterByCategory('drinks').map(product => (
              <Card key={product.id} className="bg-gray-900 border-yellow-600/20 hover:border-yellow-500/50 transition-all cursor-pointer" onClick={() => openProductDialog(product)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {product.image_url && (
                      <div className="w-20 h-20 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-yellow-500">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {product.is_variable_price ? (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500">Preço Variável</Badge>
                        ) : (
                          <p className="text-xl font-bold text-yellow-500">R$ {product.price.toFixed(2)}</p>
                        )}
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="other" className="mt-6 space-y-4">
            {filterByCategory('other').map(product => (
              <Card key={product.id} className="bg-gray-900 border-yellow-600/20 hover:border-yellow-500/50 transition-all cursor-pointer" onClick={() => openProductDialog(product)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {product.image_url && (
                      <div className="w-20 h-20 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-yellow-500">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {product.is_variable_price ? (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500">Preço Variável</Badge>
                        ) : (
                          <p className="text-xl font-bold text-yellow-500">R$ {product.price.toFixed(2)}</p>
                        )}
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
          <Button
            onClick={() => router.push(`/comanda`)}
            className="w-full h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-lg shadow-2xl shadow-yellow-500/50"
          >
            <ShoppingCart className="w-6 h-6 mr-3" />
            Ver Comanda ({cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'}) • R$ {cartTotal.toFixed(2)}
          </Button>
        </div>
      )}

      {/* Add to Cart Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="bg-gray-900 border-yellow-600/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-yellow-500 text-xl">{selectedProduct?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedProduct?.description || 'Adicione este item à sua comanda'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedProduct?.is_variable_price ? (
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Valor (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                  className="bg-black border-yellow-600/30 text-white text-2xl text-center h-14"
                />
                <p className="text-xs text-gray-500 text-center">Informe o valor pesado ou medido</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-500">R$ {selectedProduct?.price.toFixed(2)}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 border-yellow-600/30 text-yellow-500 hover:bg-yellow-500/10"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <span className="text-3xl font-bold text-yellow-500 w-16 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 border-yellow-600/30 text-yellow-500 hover:bg-yellow-500/10"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {selectedProduct && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-yellow-500">
                  R$ {(quantity * (selectedProduct.is_variable_price ? parseFloat(customPrice || 0) : selectedProduct.price)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={addToCart}
              className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
            >
              Adicionar à Comanda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
