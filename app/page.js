'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Instagram, MapPin, QrCode } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const restaurantName = process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'Comanda Digital'
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM || '@comandadigital'
  const googleMaps = process.env.NEXT_PUBLIC_GOOGLE_MAPS || 'https://maps.google.com'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-yellow-600/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-yellow-500">{restaurantName}</h1>
            <QrCode className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50">
              <QrCode className="w-16 h-16 text-black" />
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent">
              {restaurantName}
            </h2>
            <p className="text-gray-400 text-lg">
              Cardápio Digital • Pedidos Rápidos • Pagamento Online
            </p>
          </div>

          {/* Main CTA */}
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400 shadow-2xl shadow-yellow-500/30">
            <CardContent className="p-8">
              <Button
                onClick={() => router.push('/pedido')}
                className="w-full h-16 text-2xl font-bold bg-black hover:bg-gray-900 text-yellow-500 shadow-lg"
                size="lg"
              >
                Fazer Pedido
              </Button>
              <p className="text-black/80 text-sm mt-4">
                Escaneie o QR Code da sua mesa ou clique aqui
              </p>
            </CardContent>
          </Card>

          {/* Social Links */}
          <div className="flex justify-center gap-6 pt-8">
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              <Instagram className="w-6 h-6" />
              <span>{instagram}</span>
            </a>
            <a
              href={googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              <MapPin className="w-6 h-6" />
              <span>Como Chegar</span>
            </a>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12">
            <Card className="bg-gray-900 border-yellow-600/20 hover:border-yellow-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="font-bold text-yellow-500 mb-2">Sem Filas</h3>
                <p className="text-sm text-gray-400">Peça direto da sua mesa</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-600/20 hover:border-yellow-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="font-bold text-yellow-500 mb-2">Pague Online</h3>
                <p className="text-sm text-gray-400">Pix ou Cartão</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-yellow-600/20 hover:border-yellow-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-bold text-yellow-500 mb-2">Super Rápido</h3>
                <p className="text-sm text-gray-400">Pedido em segundos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-600/20 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Powered by Comanda Digital • Sistema de Gestão para Restaurantes</p>
        </div>
      </footer>
    </div>
  )
}
