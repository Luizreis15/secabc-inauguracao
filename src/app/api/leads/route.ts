import { EVENT_ID } from "@/lib/event";
import { createAnonClient } from "@/lib/supabase";
import { digits, validPhone } from "@/lib/validate";
import { z } from "zod";

const bodySchema = z.object({
  full_name: z.string().optional(),
  whatsapp: z.string(),
  company_website: z.string().optional(),
  utm_source: z.string().nullable().optional(),
  utm_medium: z.string().nullable().optional(),
  utm_campaign: z.string().nullable().optional(),
  utm_content: z.string().nullable().optional(),
  utm_term: z.string().nullable().optional(),
  referrer: z.string().nullable().optional(),
  landing_page: z.string().nullable().optional(),
});

function text(value: string | null | undefined, max = 300) {
  if (!value) return null;
  return value.slice(0, max);
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "validation", message: "Não conseguimos ler os dados enviados." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "validation", message: "Confere o WhatsApp e tenta de novo." }, { status: 422 });
  }

  if (parsed.data.company_website) {
    return Response.json({ ok: true });
  }

  const phone = digits(parsed.data.whatsapp);
  if (!validPhone(phone)) {
    return Response.json(
      { error: "validation", message: "Use DDD + 9 dígitos, ex.: (11) 91234-5678." },
      { status: 422 },
    );
  }

  const supabase = createAnonClient();
  if (!supabase) {
    return Response.json({ error: "server" }, { status: 503 });
  }

  const { error } = await supabase.from("membership_leads").insert({
    event_id: EVENT_ID,
    full_name: parsed.data.full_name?.trim() || null,
    whatsapp: "55" + phone,
    utm_source: text(parsed.data.utm_source),
    utm_medium: text(parsed.data.utm_medium),
    utm_campaign: text(parsed.data.utm_campaign),
    utm_content: text(parsed.data.utm_content),
    utm_term: text(parsed.data.utm_term),
    referrer: text(parsed.data.referrer, 500),
    landing_page: text(parsed.data.landing_page, 500),
  });

  if (error) {
    return Response.json({ error: "server" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
