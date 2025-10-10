'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function PedidoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    table_number: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/comandas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Store comanda ID in session/local storage
        localStorage.setItem('comanda_id', data.comanda.id)
        localStorage.setItem('customer_name', formData.customer_name)
        localStorage.setItem('table_number', formData.table_number)
        
        toast({
          title: "Comanda Aberta!",
          description: `Bem-vindo, ${formData.customer_name}! Mesa ${formData.table_number}`
        })

        router.push('/cardapio')
      } else {
        throw new Error(data.error || 'Erro ao abrir comanda')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-yellow-600/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-gray-900 border-yellow-600/20">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500">Abrir Comanda</CardTitle>
              <CardDescription className="text-gray-400">
                Preencha seus dados para começar o pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-gray-200">
                    Nome Completo
                  </Label>
                  <Input
                    id="customer_name"
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="bg-black border-yellow-600/30 text-white focus:border-yellow-500 h-12"
                    placeholder="Digite seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_phone" className="text-gray-200">
                    WhatsApp
                  </Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="bg-black border-yellow-600/30 text-white focus:border-yellow-500 h-12"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table_number" className="text-gray-200">
                    Número da Mesa
                  </Label>
                  <Input
                    id="table_number"
                    type="number"
                    required
                    min="1"
                    value={formData.table_number}
                    onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                    className="bg-black border-yellow-600/30 text-white focus:border-yellow-500 h-12 text-2xl text-center"
                    placeholder="00"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Abrindo...
                    </>
                  ) : (
                    'Continuar para o Cardápio'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
