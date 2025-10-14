import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("✅ Webhook Mercado Pago recebido:", body);

    // Exemplo de evento recebido
    const paymentId = body?.data?.id;
    const action = body?.action;

    // Verifica se é uma atualização de pagamento aprovado
    if (action === "payment.updated" && paymentId) {
      console.log("🔍 Verificando pagamento no Supabase...");

      // Atualiza o status do pedido no Supabase
      const { error } = await supabaseAdmin
        .from("pedidos")
        .update({ status: "pago" })
        .eq("payment_id", paymentId);

      if (error) {
        console.error("❌ Erro ao atualizar o pedido:", error);
        return new Response("Erro ao atualizar o pedido", { status: 500 });
      }

      console.log("✅ Pedido atualizado com sucesso:", paymentId);
    }

    return new Response("Webhook processado com sucesso", { status: 200 });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    return new Response("Erro ao processar webhook", { status: 500 });
  }
}
