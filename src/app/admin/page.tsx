"use client";

import { createBrowserSupabase } from "@/lib/supabase";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

const STATUSES = [
  "PENDING",
  "PENDING_MEMBERSHIP_VALIDATION",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "WAITLIST",
  "ATTENDED",
] as const;

const LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PENDING_MEMBERSHIP_VALIDATION: "Mensalidade a conferir",
  APPROVED: "Aprovada",
  REJECTED: "Reprovada",
  CANCELLED: "Cancelada",
  WAITLIST: "Lista de espera",
  ATTENDED: "Compareceu",
};

type Row = {
  id: string;
  full_name: string;
  cpf: string;
  whatsapp: string;
  email: string;
  company: string;
  city: string;
  member_number: string | null;
  membership_status: string;
  registration_status: string;
  created_at: string;
};

function messageFor(row: Row) {
  const first = row.full_name.split(/\s+/)[0];
  const confirmed = row.registration_status === "APPROVED";
  const statusLine = confirmed
    ? "sua participação está confirmada. Te esperamos!"
    : "recebemos sua inscrição e ela ainda está em análise. Assim que confirmarmos, avisamos por aqui.";
  return `Olá, ${first}! Aqui é a equipe do SECABC. Sobre a inauguração da nova sede (02/10, às 19h, Rua Amazonas, 430): ${statusLine}`;
}

export default function AdminPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) return;
    void load(supabase);
  }, [supabase, session]);

  async function load(client: SupabaseClient) {
    const { data, error } = await client.from("event_registrations").select("*").order("created_at", { ascending: false });
    if (error) {
      setLoadError(error.message);
      return;
    }
    setLoadError("");
    setRows((data || []) as Row[]);
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError("E-mail ou senha não conferem.");
  }

  async function updateStatus(id: string, registration_status: string) {
    if (!supabase) return;
    const { error } = await supabase.from("event_registrations").update({ registration_status }).eq("id", id);
    if (error) {
      setLoadError(error.message);
      return;
    }
    setRows((current) => current.map((row) => (row.id === id ? { ...row, registration_status } : row)));
  }

  function exportCsv() {
    const header = ["nome", "cpf", "whatsapp", "email", "empresa", "cidade", "matricula", "mensalidade", "status", "criado_em"];
    const lines = filtered.map((row) =>
      [row.full_name, row.cpf, row.whatsapp, row.email, row.company, row.city, row.member_number || "", row.membership_status, row.registration_status, row.created_at]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inscricoes-inauguracao.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const filtered = rows.filter((row) => {
    const haystack = `${row.full_name} ${row.cpf} ${row.email} ${row.whatsapp}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesStatus = status === "all" || row.registration_status === status;
    return matchesQuery && matchesStatus;
  });

  const counts = STATUSES.map((item) => ({ item, total: rows.filter((row) => row.registration_status === item).length }));

  if (!ready) return <main className="legal">Carregando…</main>;

  if (!supabase) {
    return (
      <main className="legal">
        <h1>Painel</h1>
        <p>Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para entrar.</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="legal">
        <h1>Painel da inauguração</h1>
        <p>Entre com um usuário criado em Authentication no Supabase.</p>
        <form onSubmit={signIn} className="grid max-w-sm gap-3">
          <input className="rounded-xl border px-3 py-3" type="email" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="rounded-xl border px-3 py-3" type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {authError && <p className="text-[#FF5B3A]">{authError}</p>}
          <button className="rounded-xl bg-[#0A1B4D] px-4 py-3 font-bold text-white" type="submit">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#1F45D8]">SECABC</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0A1B4D]">Inscrições</h1>
        </div>
        <button className="text-sm font-semibold text-[#4B5578]" type="button" onClick={() => supabase.auth.signOut()}>
          Sair
        </button>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {counts.map((item) => (
          <button key={item.item} type="button" onClick={() => setStatus(item.item)} className="rounded-2xl bg-white p-4 text-left shadow-sm">
            <b className="block text-3xl text-[#0A1B4D]">{item.total}</b>
            <span className="text-sm text-[#4B5578]">{LABELS[item.item]}</span>
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input className="min-w-64 flex-1 rounded-xl border px-3 py-3" placeholder="Buscar nome, CPF ou e-mail" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="rounded-xl border px-3 py-3" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Todos os status</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {LABELS[item]}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-[#FFB320] px-4 py-3 font-bold text-[#0A1B4D]" type="button" onClick={exportCsv}>
          Exportar CSV
        </button>
      </div>
      {loadError && <p className="mb-4 text-[#FF5B3A]">{loadError}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-[#4B5578]">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Empresa</th>
              <th className="p-3">Status</th>
              <th className="p-3">WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-[#EEF2FF]">
                <td className="p-3">
                  <b>{row.full_name}</b>
                  <div className="text-[#4B5578]">{row.cpf}</div>
                </td>
                <td className="p-3">
                  {row.email}
                  <div className="text-[#4B5578]">{row.city}</div>
                </td>
                <td className="p-3">{row.company}</td>
                <td className="p-3">
                  <select className="rounded-lg border px-2 py-2" value={row.registration_status} onChange={(event) => updateStatus(row.id, event.target.value)}>
                    {STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {LABELS[item]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <a className="font-bold" href={`https://wa.me/${row.whatsapp}?text=${encodeURIComponent(messageFor(row))}`} target="_blank" rel="noopener noreferrer">
                    Abrir conversa
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
