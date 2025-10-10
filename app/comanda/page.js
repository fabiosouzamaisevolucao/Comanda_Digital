'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Trash2, Loader2, CreditCard } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ComandaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [comanda, setComanda] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [comandaId, setComandaId] = useState(null)

  useEffect(() => {
    const storedComandaId = localStorage.getItem('comanda_id')
    if (!storedComandaId) {
      router.push('/pedido')
      return
    }
    setComandaId(storedComandaId)
    loadComanda(storedComandaId)
  }, [])

  const loadComanda = async (id) => {
    try {
      const [comandaRes, itemsRes] = await Promise.all([
        fetch(`/api/comandas?id=${id}`),
        fetch(`/api/comanda-items?comanda_id=${id}`)
      ])

      const comandaData = await comandaRes.json()
      const itemsData = await itemsRes.json()

      setComanda(comandaData.comanda)
      setItems(itemsData.items || [])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar comanda",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(`/api/comanda-items?id=${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Item Removido",
          description: "Item removido da comanda"
        })
        loadComanda(comandaId)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover item",
        variant: "destructive"
      })
    }
  }

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const serviceCharge = subtotal * 0.10 // 10%
    return { subtotal, serviceCharge, total: subtotal + serviceCharge }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Comanda Vazia",
        description: "Adicione itens antes de fechar a comanda",
        variant: "destructive"
      })
      return
    }
    router.push('/pagamento')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    )
  }

  const { subtotal, serviceCharge, total } = calculateTotal()

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <header className="border-b border-yellow-600/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/cardapio')}
              className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao Cardápio
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Comanda Info */}
          {comanda && (
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400">
              <CardContent className="p-6">
                <div className="flex justify-between items-start text-black">
                  <div>
                    <p className="text-sm font-medium opacity-80">Cliente</p>
                    <p className="text-xl font-bold">{comanda.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium opacity-80">Mesa</p>
                    <p className="text-3xl font-bold">{comanda.table_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items List */}
          <Card className="bg-gray-900 border-yellow-600/20">
            <CardHeader>
              <CardTitle className="text-yellow-500">Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhum item na comanda</p>
                  <Button
                    onClick={() => router.push('/cardapio')}
                    className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Adicionar Itens
                  </Button>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator className="bg-yellow-600/20" />}
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 font-bold">{item.quantity}x</span>
                          <h3 className="font-semibold text-white">{item.product_name}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          R$ {item.unit_price.toFixed(2)} cada
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-yellow-500">
                          R$ {item.total_price.toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem(item.id)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Total Card */}
          {items.length > 0 && (
            <Card className="bg-gray-900 border-yellow-600/20">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Taxa de Serviço (10%)</span>
                  <span className="font-semibold">R$ {serviceCharge.toFixed(2)}</span>
                </div>
                <Separator className="bg-yellow-600/20" />
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">Total</span>
                  <span className="text-3xl font-bold text-yellow-500">R$ {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Floating Checkout Button */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
          <div className="container mx-auto max-w-2xl">
            <Button
              onClick={handleCheckout}
              className="w-full h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-lg shadow-2xl shadow-yellow-500/50"
            >
              <CreditCard className="w-6 h-6 mr-3" />
              Fechar Comanda e Pagar • R$ {total.toFixed(2)}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
