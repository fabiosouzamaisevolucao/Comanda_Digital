import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { preference, payment } from '@/lib/mercadopago'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method
  const { searchParams } = new URL(request.url)

  try {
    // GET HANDLERS
    if (method === 'GET') {
      // Get all products
      if (route === '/products') {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('available', true)
          .order('category', { ascending: true })
          .order('name', { ascending: true })

        if (error) throw error

        return NextResponse.json({ products: data || [] }, { headers: corsHeaders })
      }

      // Get comanda by ID
      if (route === '/comandas') {
        const id = searchParams.get('id')
        
        if (id) {
          const { data, error } = await supabase
            .from('comandas')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error

          return NextResponse.json({ comanda: data }, { headers: corsHeaders })
        }

        // Get all comandas
        const { data, error } = await supabase
          .from('comandas')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ comandas: data || [] }, { headers: corsHeaders })
      }

      // Get comanda items
      if (route === '/comanda-items') {
        const comandaId = searchParams.get('comanda_id')
        const itemId = searchParams.get('id')

        if (itemId) {
          const { data, error } = await supabase
            .from('comanda_items')
            .select('*')
            .eq('id', itemId)
            .single()

          if (error) throw error

          return NextResponse.json({ item: data }, { headers: corsHeaders })
        }

        if (comandaId) {
          const { data, error } = await supabase
            .from('comanda_items')
            .select('*')
            .eq('comanda_id', comandaId)
            .order('created_at', { ascending: true })

          if (error) throw error

          return NextResponse.json({ items: data || [] }, { headers: corsHeaders })
        }

        return NextResponse.json({ error: 'comanda_id required' }, { status: 400, headers: corsHeaders })
      }

      // Get tables
      if (route === '/tables') {
        const { data, error } = await supabase
          .from('tables')
          .select('*')
          .order('table_number', { ascending: true })

        if (error) throw error

        return NextResponse.json({ tables: data || [] }, { headers: corsHeaders })
      }

      // Get payments
      if (route === '/payments') {
        const comandaId = searchParams.get('comanda_id')

        if (comandaId) {
          const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('comanda_id', comandaId)
            .order('created_at', { ascending: false })

          if (error) throw error

          return NextResponse.json({ payments: data || [] }, { headers: corsHeaders })
        }

        return NextResponse.json({ error: 'comanda_id required' }, { status: 400, headers: corsHeaders })
      }
    }

    // POST HANDLERS
    if (method === 'POST') {
      const body = await request.json()

     // Create comanda
if (route === '/comandas') {
  const comandaId = uuidv4();

  // 🔁 mapeia os campos do front (em inglês) para as colunas existentes no BD (português)
  const insertPayload = {
    id: comandaId,
    nome_do_cliente: body.customer_name,
    cliente_whatsapp: body.customer_phone,
    numero_da_tabela: parseInt(body.table_number, 10),
    status: 'aberta', // sua tabela usa 'aberta' por padrão
  };

  const { data, error } = await supabase
    .from('comandos')               // 👈 tabela existente no seu BD
    .insert([insertPayload])
    .select()
    .single();

  if (error) throw error;

  // (opcional) Atualizar status da mesa. 
  // Se sua tabela de mesas for 'tables' com coluna 'table_number', mantenha como está.
  // Se for 'tabelas' e 'numero_da_tabela', ajuste as duas strings abaixo:
  await supabase
    .from('tables')
    .update({ status: 'occupied' })
    .eq('table_number', parseInt(body.table_number, 10));

  return NextResponse.json({ comanda: data }, { headers: corsHeaders });
}

      // Add item to comanda
      if (route === '/comanda-items') {
        const itemId = uuidv4()
        const totalPrice = body.quantity * body.unit_price

        const { data, error } = await supabase
          .from('comanda_items')
          .insert([{
            id: itemId,
            comanda_id: body.comanda_id,
            product_id: body.product_id,
            product_name: body.product_name,
            quantity: body.quantity,
            unit_price: body.unit_price,
            total_price: totalPrice
          }])
          .select()
          .single()

        if (error) throw error

        // Update comanda total
        const { data: items } = await supabase
          .from('comanda_items')
          .select('total_price')
          .eq('comanda_id', body.comanda_id)

        const total = items.reduce((sum, item) => sum + item.total_price, 0)

        await supabase
          .from('comandas')
          .update({ total_amount: total })
          .eq('id', body.comanda_id)

        return NextResponse.json({ item: data }, { headers: corsHeaders })
      }

      // Create payment
      if (route === '/payments') {
        const { comanda_id, payment_method, amount, customer_name, customer_email } = body

        // Create preference for Mercado Pago
        const preferenceData = {
          items: [
            {
              title: `Comanda - ${customer_name}`,
              quantity: 1,
              unit_price: amount,
              currency_id: 'BRL'
            }
          ],
          payer: {
            name: customer_name,
            email: customer_email || 'customer@example.com'
          },
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/sucesso`,
            failure: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/falha`,
            pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/pendente`
          },
          auto_return: 'approved',
          payment_methods: {
            excluded_payment_types: [],
            installments: 12
          },
          statement_descriptor: 'COMANDA DIGITAL',
          external_reference: comanda_id
        }

        // Set payment method restrictions
        if (payment_method === 'pix') {
          preferenceData.payment_methods.excluded_payment_types = [
            { id: 'credit_card' },
            { id: 'debit_card' },
            { id: 'ticket' }
          ]
        } else if (payment_method === 'credit_card') {
          preferenceData.payment_methods.excluded_payment_types = [
            { id: 'pix' },
            { id: 'debit_card' },
            { id: 'ticket' }
          ]
        } else if (payment_method === 'debit_card') {
          preferenceData.payment_methods.excluded_payment_types = [
            { id: 'pix' },
            { id: 'credit_card' },
            { id: 'ticket' }
          ]
        }

        const mpPreference = await preference.create({ body: preferenceData })

        // Save payment record
        const paymentId = uuidv4()
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert([{
            id: paymentId,
            comanda_id: comanda_id,
            amount: amount,
            payment_method: payment_method,
            status: 'pending',
            mercado_pago_payment_id: mpPreference.id
          }])
          .select()
          .single()

        if (paymentError) throw paymentError

        // Update comanda status
        await supabase
          .from('comandas')
          .update({ status: 'payment_pending' })
          .eq('id', comanda_id)

        // For PIX, generate QR code
        if (payment_method === 'pix' && mpPreference.point_of_interaction?.transaction_data) {
          const qrCodeData = mpPreference.point_of_interaction.transaction_data.qr_code
          const qrCodeBase64 = mpPreference.point_of_interaction.transaction_data.qr_code_base64

          return NextResponse.json({
            payment_id: paymentId,
            mercado_pago_id: mpPreference.id,
            payment_url: mpPreference.init_point,
            qr_code: qrCodeData,
            qr_code_base64: qrCodeBase64,
            status: 'pending'
          }, { headers: corsHeaders })
        }

        return NextResponse.json({
          payment_id: paymentId,
          mercado_pago_id: mpPreference.id,
          payment_url: mpPreference.init_point,
          status: 'pending'
        }, { headers: corsHeaders })
      }

      // Create product
      if (route === '/products') {
        const productId = uuidv4()

        const { data, error } = await supabase
          .from('products')
          .insert([{
            id: productId,
            name: body.name,
            category: body.category,
            price: body.price || null,
            is_variable_price: body.is_variable_price || false,
            description: body.description || null,
            image_url: body.image_url || null,
            available: body.available !== false
          }])
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ product: data }, { headers: corsHeaders })
      }

      // Create table
      if (route === '/tables') {
        const tableId = uuidv4()
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const qrData = `${baseUrl}/pedido?mesa=${body.table_number}`

        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        const { data, error } = await supabase
          .from('tables')
          .insert([{
            id: tableId,
            table_number: body.table_number,
            status: body.status || 'available',
            qr_code_data: qrData,
            qr_code_image: qrCodeDataUrl
          }])
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ table: data }, { headers: corsHeaders })
      }
    }

    // DELETE HANDLERS
    if (method === 'DELETE') {
      // Delete comanda item
      if (route === '/comanda-items') {
        const id = searchParams.get('id')

        if (!id) {
          return NextResponse.json({ error: 'id required' }, { status: 400, headers: corsHeaders })
        }

        // Get item to update comanda total
        const { data: item } = await supabase
          .from('comanda_items')
          .select('comanda_id, total_price')
          .eq('id', id)
          .single()

        const { error } = await supabase
          .from('comanda_items')
          .delete()
          .eq('id', id)

        if (error) throw error

        // Update comanda total
        if (item) {
          const { data: items } = await supabase
            .from('comanda_items')
            .select('total_price')
            .eq('comanda_id', item.comanda_id)

          const total = items.reduce((sum, i) => sum + i.total_price, 0)

          await supabase
            .from('comandas')
            .update({ total_amount: total })
            .eq('id', item.comanda_id)
        }

        return NextResponse.json({ success: true }, { headers: corsHeaders })
      }
    }

    // PUT HANDLERS
    if (method === 'PUT') {
      const body = await request.json()

      // Update comanda
      if (route === '/comandas') {
        const { id, ...updates } = body

        const { data, error } = await supabase
          .from('comandas')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ comanda: data }, { headers: corsHeaders })
      }

      // Update table
      if (route === '/tables') {
        const { id, ...updates } = body

        const { data, error } = await supabase
          .from('tables')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ table: data }, { headers: corsHeaders })
      }

      // Update product
      if (route === '/products') {
        const { id, ...updates } = body

        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ product: data }, { headers: corsHeaders })
      }
    }

    // Route not found
    return NextResponse.json({ error: `Route ${route} not found` }, { status: 404, headers: corsHeaders })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
