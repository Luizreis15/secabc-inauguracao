import { insertInscricao } from "@/lib/crm";
import { createAnonClient } from "@/lib/supabase";
import { digits, toIsoDate, validCPF, validDate, validEmail, validPhone } from "@/lib/validate";
import { z } from "zod";

const bodySchema = z.object({
  full_name: z.string(),
  cpf: z.string(),
  birth_date: z.string(),
  whatsapp: z.string(),
  email: z.string(),
  company: z.string(),
  city: z.string(),
  member_number: z.string().optional().nullable(),
  membership: z.enum(["sim", "nao", "nao_sei"]),
  rules_acknowledged_at: z.string(),
  marketing_consent: z.boolean(),
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
    return Response.json({ error: "validation", message: "Confere os dados e tenta de novo." }, { status: 422 });
  }

  const data = parsed.data;
  if (data.company_website) {
    return Response.json({ ok: true, registration_status: "PENDING" });
  }

  const fullName = data.full_name.trim();
  const cpf = digits(data.cpf);
  const phone = digits(data.whatsapp);
  const email = data.email.trim().toLowerCase();

  if (fullName.split(/\s+/).length < 2) {
    return Response.json({ error: "validation", message: "Coloca nome e sobrenome, por favor." }, { status: 422 });
  }
  if (!validCPF(cpf)) {
    return Response.json({ error: "validation", message: "Hmm, esse CPF não parece certo." }, { status: 422 });
  }
  if (!validDate(data.birth_date)) {
    return Response.json({ error: "validation", message: "Data inválida. Use DD/MM/AAAA." }, { status: 422 });
  }
  if (!validPhone(phone)) {
    return Response.json({ error: "validation", message: "Use DDD + 9 dígitos no WhatsApp." }, { status: 422 });
  }
  if (!validEmail(email)) {
    return Response.json({ error: "validation", message: "Confere o e-mail? Parece incompleto." }, { status: 422 });
  }
  if (!data.company.trim() || !data.city.trim()) {
    return Response.json({ error: "validation", message: "Informe empresa e cidade." }, { status: 422 });
  }
  if (!data.rules_acknowledged_at) {
    return Response.json({ error: "validation", message: "Confirme as regras do convite antes de enviar." }, { status: 422 });
  }

  const supabase = createAnonClient();
  if (!supabase) {
    return Response.json({ error: "server" }, { status: 503 });
  }

  const registrationStatus = data.membership === "sim" ? "PENDING" : "PENDING_MEMBERSHIP_VALIDATION";
  const { error } = await insertInscricao(supabase, {
    nome: fullName,
    email,
    celular: phone,
    cpf,
    carteirinha: data.member_number?.trim() || null,
    empresa: data.company.trim(),
    status: "inscrito",
    observacoes:
      data.membership === "sim"
        ? "Inscrição recebida. Presença ainda não confirmada."
        : "Mensalidade a conferir antes de confirmar a presença.",
    dados_extras: {
      origem: "landing-inauguracao",
      associado: true,
      mensalidade: data.membership,
      nascimento: toIsoDate(data.birth_date),
      cidade: data.city.trim(),
      marketing: data.marketing_consent,
      regras_em: data.rules_acknowledged_at,
      utm_source: text(data.utm_source),
      utm_medium: text(data.utm_medium),
      utm_campaign: text(data.utm_campaign),
      utm_content: text(data.utm_content),
      utm_term: text(data.utm_term),
      referrer: text(data.referrer, 500),
      landing_page: text(data.landing_page, 500),
    },
  });

  if (error?.code === "23505") {
    return Response.json({ error: "already" }, { status: 409 });
  }
  if (error) {
    return Response.json({ error: "server" }, { status: 500 });
  }

  return Response.json({ ok: true, registration_status: registrationStatus });
}
