import type { SupabaseClient } from "@supabase/supabase-js";

export const EVENT_SLUG = "inauguracao";
export const EVENT_ROW_ID = "a1a0c0a0-2026-4000-8000-000000000430";

type Extras = Record<string, string | boolean | null>;

export async function insertInscricao(
  supabase: SupabaseClient,
  row: {
    nome: string;
    email?: string | null;
    celular: string;
    cpf?: string | null;
    carteirinha?: string | null;
    empresa?: string | null;
    status: "inscrito" | "cancelado";
    observacoes?: string | null;
    dados_extras: Extras;
  },
) {
  const { data: evento, error: eventError } = await supabase
    .from("eventos")
    .select("id")
    .eq("slug", EVENT_SLUG)
    .maybeSingle();

  if (eventError || !evento?.id) {
    return { error: eventError ?? { code: "no_event", message: "Evento inauguração não encontrado" } };
  }

  const { error } = await supabase.from("evento_inscricoes").insert({
    evento_id: evento.id,
    ...row,
  });

  return { error };
}
