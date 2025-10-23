import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase"; // já existe e exporta supabaseAdmin

export async function POST(req) {
  try {
    const body = await req.json();

    // validação básica
    if (!body?.items?.length) {
      return NextResponse.json({ error: "Itens obrigatórios" }, { status: 400 });
    }

    // 1) resolver tenant_id (opcional via slug)
    let tenantId = body.tenant_id ?? null;
    if (!tenantId && body.tenant_slug) {
      const { data: tenant, error: tErr } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("slug", body.tenant_slug)
        .maybeSingle();
      if (tErr) throw tErr;
      tenantId = tenant?.id ?? null;
    }

    // 2) buscar itens do menu para garantir preço/nome
    const menuIds = body.items.map((i) => i.menu_item_id);
    const { data: menuData, error: menuErr } = await supabaseAdmin
      .from("menu_items")
      .select("id,name,price,tenant_id")
      .in("id", menuIds);

    if (menuErr) throw menuErr;
    if (!menuData || menuData.length !== body.items.length) {
      return NextResponse.json({ error: "Itens de menu inválidos" }, { status: 400 });
    }

    const byId = new Map(menuData.map((m) => [m.id, m]));

    // 3) normalizar itens (preço x qty)
    const normalized = body.items.map((i) => {
      const m = byId.get(i.menu_item_id);
      const unit = Number(i.unit_price ?? m?.price ?? 0);
      const qty = Number(i.qty ?? 1);
      const name = i.name ?? m?.name ?? "Item";
      const line_total = Number((unit * qty).toFixed(2));
      return {
        menu_item_id: i.menu_item_id,
        name,
        qty,
        unit_price: unit,
        line_total,
        notes: i.notes ?? null,
      };
    });

    const subtotal = normalized.reduce((acc, it) => acc + it.line_total, 0);
    const total = subtotal; // acrescente taxas/serviço aqui no futuro

    // 4) idempotência opcional por external_ref
    if (body.external_ref) {
      const { data: exists } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("external_ref", body.external_ref)
        .maybeSingle();
      if (exists?.id) {
        return NextResponse.json({ ok: true, order_id: exists.id, idempotent: true });
      }
    }

    // 5) cria o pedido
    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        tenant_id: tenantId,
        table_code: body.table_code ?? null,
        customer_name: body.customer_name ?? null,
        status: "received",
        subtotal,
        total,
        external_ref: body.external_ref ?? null,
      })
      .select("id")
      .single();

    if (oErr) throw oErr;

    // 6) cria as linhas (order_items)
    const toInsert = normalized.map((n) => ({
      order_id: order.id,
      menu_item_id: n.menu_item_id,
      name: n.name,
      qty: n.qty,
      unit_price: n.unit_price,
      line_total: n.line_total,
      notes: n.notes,
      tenant_id: tenantId,
    }));

    const { error: iErr } = await supabaseAdmin.from("order_items").insert(toInsert);
    if (iErr) {
      // fallback simples: marca pedido como cancelado
      await supabaseAdmin.from("orders").update({ status: "canceled" }).eq("id", order.id);
      throw iErr;
    }

    return NextResponse.json({ ok: true, order_id: order.id, subtotal, total });
  } catch (err) {
    console.error("api/orders/create error:", err);
    return NextResponse.json({ error: err?.message ?? "Erro inesperado" }, { status: 500 });
  }
}
