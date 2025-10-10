'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, CreditCard, QrCode as QrCodeIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function PagamentoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [comanda, setComanda] = useState(null)
  const [items, setItems] = useState([])
  const [comandaId, setComandaId] = useState(null)
  const [paymentData, setPaymentData] = useState(null)

  useEffect(() => {
    const storedComandaId = localStorage.getItem('comanda_id')
    if (!storedComandaId) {
      router.push('/pedido')
      return
    }
    setComandaId(storedComandaId)
    loadComandaData(storedComandaId)
  }, [])

  const loadComandaData = async (id) => {
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
        description: "Erro ao carregar dados da comanda",
        variant: "destructive"
      })
    }
  }

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const serviceCharge = subtotal * 0.10
    return subtotal + serviceCharge
  }

  const handlePayment = async () => {
    if (!comandaId) return

    setLoading(true)
    try {
      const total = calculateTotal()
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comanda_id: comandaId,
          payment_method: paymentMethod,
          amount: total,
          customer_name: comanda?.customer_name,
          customer_email: comanda?.customer_phone ? `${comanda.customer_phone}@placeholder.com` : undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentData(data)
        
        if (paymentMethod === 'pix' && data.qr_code_base64) {
          // Show QR code
          toast({
            title: "Pix Gerado!",
            description: "Escaneie o QR Code para pagar"
          })
        } else if (data.payment_url) {
          // Redirect to Mercado Pago
          window.location.href = data.payment_url
        }
      } else {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }
    } catch (error) {
      toast({
        title: "Erro no Pagamento",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <header className="border-b border-yellow-600/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/comanda')}
            className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-yellow-500 text-center">Pagamento</h1>

          {/* Payment Result */}
          {paymentData && paymentMethod === 'pix' && paymentData.qr_code_base64 && (
            <Card className="bg-gray-900 border-yellow-600/20">
              <CardHeader>
                <CardTitle className="text-yellow-500 text-center">Pague com Pix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <img 
                    src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                    alt="QR Code Pix"
                    className="w-full max-w-xs mx-auto"
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-gray-400 text-sm">Ou copie o código Pix:</p>
                  <div className="bg-black p-3 rounded border border-yellow-600/30">
                    <code className="text-xs text-yellow-500 break-all">{paymentData.qr_code}</code>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentData.qr_code)
                      toast({ title: "Copiado!", description: "Código Pix copiado" })
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Copiar Código Pix
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method Selection */}
          {!paymentData && (
            <>
              <Card className="bg-gray-900 border-yellow-600/20">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Total a Pagar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-yellow-500 text-center">R$ {total.toFixed(2)}</p>
                  <p className="text-center text-gray-400 text-sm mt-2">(inclui 10% de taxa de serviço)</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-600/20">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-3 border border-yellow-600/30 rounded-lg p-4 hover:bg-yellow-500/5 cursor-pointer">
                      <RadioGroupItem value="pix" id="pix" className="border-yellow-500 text-yellow-500" />
                      <Label htmlFor="pix" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <QrCodeIcon className="w-6 h-6 text-yellow-500" />
                          <div>
                            <p className="font-semibold text-white">Pix</p>
                            <p className="text-sm text-gray-400">Aprovação instantânea</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border border-yellow-600/30 rounded-lg p-4 hover:bg-yellow-500/5 cursor-pointer">
                      <RadioGroupItem value="credit_card" id="credit_card" className="border-yellow-500 text-yellow-500" />
                      <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-6 h-6 text-yellow-500" />
                          <div>
                            <p className="font-semibold text-white">Cartão de Crédito</p>
                            <p className="text-sm text-gray-400">Parcelamento disponível</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border border-yellow-600/30 rounded-lg p-4 hover:bg-yellow-500/5 cursor-pointer">
                      <RadioGroupItem value="debit_card" id="debit_card" className="border-yellow-500 text-yellow-500" />
                      <Label htmlFor="debit_card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-6 h-6 text-yellow-500" />
                          <div>
                            <p className="font-semibold text-white">Cartão de Débito</p>
                            <p className="text-sm text-gray-400">Pagamento à vista</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Floating Payment Button */}
      {!paymentData && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
          <div className="container mx-auto max-w-2xl">
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-lg shadow-2xl shadow-yellow-500/50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {paymentMethod === 'pix' ? 'Gerar Pix' : 'Pagar com Cartão'} • R$ {total.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
