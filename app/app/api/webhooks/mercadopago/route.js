export async function POST(req) {
  try {
    const body = await req.json();

    console.log("🔔 Webhook Mercado Pago recebido:", body);

    // Retorna sucesso para o Mercado Pago
    return new Response("Webhook recebido com sucesso", { status: 200 });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return new Response("Erro ao processar webhook", { status: 500 });
  }
}
