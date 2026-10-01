"use client";

import { useEffect, useRef, useState } from "react";
import type { Utm } from "@/lib/event";
import { track } from "@/lib/event";
import { EMPTY_ANSWERS, errorFor, maskCPF, maskDate, maskPhone, type Answers } from "@/lib/validate";

type Question = {
  id: string;
  type: "intro" | "text" | "choice" | "consent";
  optional?: boolean;
  label?: (first: string) => string;
  help?: string;
  ph?: string;
  ac?: string;
  im?: string;
  opts?: [string, string][];
};

const QUESTIONS: Question[] = [
  { id: "intro", type: "intro" },
  { id: "full_name", type: "text", label: () => "Pra começar: qual é o seu nome completo?", ph: "Digite seu nome", ac: "name", im: "text" },
  {
    id: "is_member",
    type: "choice",
    label: (n) => `${n ? n + ", você" : "Você"} já é associado ao SECABC?`,
    help: "Os dois podem participar. É só pra gente te conhecer melhor.",
    opts: [
      ["sim", "Sim, sou associado"],
      ["nao", "Ainda não"],
    ],
  },
  { id: "cpf", type: "text", label: () => "Qual é o seu CPF?", help: "Usamos só pra organizar a lista de presença.", ph: "000.000.000-00", im: "numeric" },
  { id: "birth_date", type: "text", label: () => "Qual a sua data de nascimento?", ph: "DD/MM/AAAA", im: "numeric", ac: "bday" },
  { id: "whatsapp", type: "text", label: () => "Qual o seu WhatsApp?", help: "É por lá que a confirmação vai chegar.", ph: "(11) 91234-5678", im: "tel", ac: "tel-national" },
  { id: "email", type: "text", label: () => "E o seu e-mail?", ph: "seunome@email.com", im: "email", ac: "email" },
  { id: "company", type: "text", label: () => "Em qual empresa você trabalha?", help: "O convite é para quem trabalha no comércio.", ph: "Nome da empresa", ac: "organization", im: "text" },
  { id: "city", type: "text", label: () => "Qual é a sua cidade?", ph: "Ex.: São Caetano do Sul", ac: "address-level2", im: "text" },
  { id: "consent", type: "consent", label: () => "Última coisa, prometo." },
];

const MASKS: Record<string, (v: string) => string> = {
  cpf: maskCPF,
  whatsapp: maskPhone,
  birth_date: maskDate,
};

const SERVER_COPY =
  "Não conseguimos concluir seu cadastro agora. Seus dados não foram confirmados. Tente novamente em alguns instantes.";
const NETWORK_COPY = "Parece que sua conexão caiu. Seus dados não foram enviados. Tenta de novo?";

type End = null | "success" | "already";

export function RegistrationForm({ open, onClose, utm }: { open: boolean; onClose: () => void; utm: Utm }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [err, setErr] = useState("");
  const [errKey, setErrKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [end, setEnd] = useState<End>(null);
  const [outcome, setOutcome] = useState<"server" | "network" | null>(null);
  const [outcomeCopy, setOutcomeCopy] = useState(SERVER_COPY);
  const [ackAt, setAckAt] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const stateRef = useRef({ step, answers, end, submitting, ackAt, honeypot });
  stateRef.current = { step, answers, end, submitting, ackAt, honeypot };
  const started = useRef(false);

  const question = QUESTIONS[step];
  const first = answers.full_name.trim().split(/\s+/)[0] || "";
  const total = QUESTIONS.length - 1;

  function reset() {
    setStep(0);
    setAnswers(EMPTY_ANSWERS);
    setErr("");
    setEnd(null);
    setOutcome(null);
    setSubmitting(false);
    setAckAt(null);
    setHoneypot("");
  }

  function close() {
    onClose();
    if (end === "success") reset();
  }

  function fail(message: string) {
    setErr(message);
    setErrKey((k) => k + 1);
    track("registration_error", { step: question.id });
  }

  function setField(id: string, value: string | boolean) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setErr("");
  }

  async function submit() {
    const current = stateRef.current;
    if (current.submitting) return;
    const privacyError = errorFor("privacy", current.answers);
    if (privacyError) return fail(privacyError);

    setSubmitting(true);
    setOutcome(null);
    setErr("");
    track("registration_submit");

    const payload = {
      ...current.answers,
      rules_acknowledged_at: current.ackAt,
      marketing_consent: current.answers.marketing,
      company_website: current.honeypot,
      ...utm,
    };

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        registration_status?: string;
      };
      if (response.ok) {
        const status = data.registration_status || "PENDING";
        track("registration_success", { registration_status: status, pixel: "Lead" });
        setEnd("success");
      } else if (data.error === "already") {
        track("registration_duplicate");
        setEnd("already");
      } else if (data.error === "validation") {
        fail(data.message || SERVER_COPY);
      } else {
        setOutcome("server");
        setOutcomeCopy(SERVER_COPY);
      }
    } catch {
      setOutcome("network");
      setOutcomeCopy(NETWORK_COPY);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    const current = stateRef.current;
    const q = QUESTIONS[current.step];
    if (current.end) return;
    if (q.type === "intro") {
      const at = new Date().toISOString();
      track("popup_accept", { rules_acknowledged: true, rules_acknowledged_at: at });
      setAckAt(at);
      setStep(1);
      return;
    }
    if (q.type === "consent") return void submit();
    const message = q.optional ? "" : errorFor(q.id, current.answers);
    if (message) return fail(message);
    setStep(current.step + 1);
    setErr("");
    setOutcome(null);
  }

  function prev() {
    if (step > 0 && !end) {
      setStep(step - 1);
      setErr("");
      setOutcome(null);
    }
  }

  function pick(id: string, value: string) {
    const answers = { ...stateRef.current.answers, [id]: value };
    stateRef.current = { ...stateRef.current, answers };
    setAnswers(answers);
    setErr("");
    window.setTimeout(() => next(), 380);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "BUTTON") return;
      const current = stateRef.current;
      if (event.key === "Enter" && !current.end && !current.submitting) {
        event.preventDefault();
        next();
        return;
      }
      const q = QUESTIONS[current.step];
      if (!current.end && q.type === "choice" && target?.tagName !== "INPUT") {
        const index = "abc".indexOf(event.key.toLowerCase());
        if (index >= 0 && q.opts?.[index]) pick(q.id, q.opts[index][0]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("tf-input")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, step, end]);

  useEffect(() => {
    if (open && !started.current) {
      started.current = true;
      track("registration_start");
    }
  }, [open]);

  if (!open) return null;

  const isQuestion = !end && question.type !== "intro";
  const value = question.type === "text" ? String(answers[question.id as keyof Answers] ?? "") : "";
  const showOk = isQuestion && question.type !== "consent" && (question.type === "text" || Boolean(answers[question.id as keyof Answers]));
  const canBack = step > 0 && !end;
  const progress = end === "success" || end === "already" ? 100 : Math.round((step / (QUESTIONS.length - 1)) * 100);

  return (
    <div className="dialog" role="dialog" aria-modal="true" aria-label="Inscrição na inauguração">
      <div className="glow glow-amber" aria-hidden="true" />
      <div className="glow glow-blue" aria-hidden="true" />
      <div className="progress" aria-hidden="true">
        <div style={{ width: `${progress}%` }} />
      </div>
      <div className="dialog-bar">
        <span>Inauguração · 02.10 · 19h</span>
        <button type="button" className="icon-btn" onClick={close} aria-label="Fechar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form
        className="dialog-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          next();
        }}
      >
        <div className="q" key={`${step}-${end ?? "q"}`}>
          {!end && question.type === "intro" && (
            <>
              <h2 className="q-title">
                Bora garantir <span>seu lugar?</span>
              </h2>
              <p className="q-lead">Leva menos de 2 minutos. Antes, um combinado rápido:</p>
              <div className="rules">
                <p>
                  <i>1</i>
                  <span>
                    O convite é para <strong>quem trabalha no comércio</strong>, associado ou não ao SECABC.
                  </span>
                </p>
                <p>
                  <i>2</i>
                  <span>A confirmação chega no seu WhatsApp.</span>
                </p>
              </div>
              <div className="row">
                <button className="ok" type="submit">
                  Estou ciente, vamos lá
                </button>
                <span className="hint">
                  ou pressione <strong>Enter ↵</strong>
                </span>
              </div>
            </>
          )}

          {isQuestion && (
            <>
              <div className="q-head">
                <span className="q-num">
                  {step}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                  <span>de {total}</span>
                </span>
                <h2>{question.label?.(first)}</h2>
                {question.help && <p>{question.help}</p>}
              </div>

              {question.type === "text" && (
                <input
                  id="tf-input"
                  type="text"
                  inputMode={(question.im as "text") || "text"}
                  autoComplete={question.ac || "off"}
                  placeholder={question.ph}
                  value={value}
                  aria-invalid={Boolean(err)}
                  onChange={(event) => {
                    const nextValue = MASKS[question.id] ? MASKS[question.id](event.target.value) : event.target.value;
                    setField(question.id, nextValue);
                  }}
                />
              )}

              {question.type === "choice" && (
                <div className="choices" role="radiogroup">
                  {question.opts?.map(([choice, label], index) => {
                    const selected = answers[question.id as keyof Answers] === choice;
                    return (
                      <button key={choice} type="button" role="radio" aria-checked={selected} className={selected ? "on" : ""} onClick={() => pick(question.id, choice)}>
                        <i>{["A", "B", "C"][index]}</i>
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {question.type === "consent" && (
                <>
                  <label className="check">
                    <input type="checkbox" checked={answers.privacy} onChange={(event) => setField("privacy", event.target.checked)} />
                    <span>
                      Declaro que as informações são verdadeiras e autorizo seu uso para organizar o evento e falar sobre minha inscrição.{" "}
                      <a href="/privacidade">Política de Privacidade</a>
                    </span>
                  </label>
                  <label className="check optional">
                    <input type="checkbox" checked={answers.marketing} onChange={(event) => setField("marketing", event.target.checked)} />
                    <span>Quero receber novidades e benefícios do SECABC. (opcional)</span>
                  </label>
                  {outcome && (
                    <p className="banner" role="alert">
                      {outcomeCopy}
                    </p>
                  )}
                  <button className="ok" type="submit" disabled={submitting}>
                    {submitting ? "Enviando..." : "Enviar minha inscrição"}
                  </button>
                </>
              )}

              {err && (
                <span className="err" role="alert" key={errKey}>
                  {err}
                </span>
              )}

              {showOk && (
                <div className="row">
                  <button className="ok" type="submit">
                    {question.optional && !value ? "Pular" : "OK"}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </button>
                  <span className="hint">
                    pressione <strong>Enter ↵</strong>
                  </span>
                </div>
              )}
            </>
          )}

          {end === "success" && (
            <>
              <span className="success-mark" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h2 className="q-title">
                Inscrição <span>recebida!</span>
              </h2>
              <p className="q-lead">
                Valeu, {first || "Oba"}! Sua inscrição foi recebida. A confirmação chega no WhatsApp <strong>{answers.whatsapp}</strong>.
              </p>
              <button type="button" className="ok" onClick={close}>
                Entendi
              </button>
            </>
          )}

          {end === "already" && (
            <>
              <h2 className="q-title">
                Já recebemos <span>sua inscrição.</span>
              </h2>
              <p className="q-lead">Encontramos um cadastro com este CPF. Não precisa enviar de novo: a confirmação vai chegar pelo WhatsApp informado.</p>
              <button type="button" className="ok" onClick={close}>
                Fechar
              </button>
            </>
          )}

          <label className="hp">
            Site
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
          </label>
        </div>
      </form>
      {!end && (
        <div className="arrows">
          <button type="button" aria-label="Pergunta anterior" onClick={prev} disabled={!canBack} style={{ opacity: canBack ? 1 : 0.4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
          <button type="button" aria-label="Próxima pergunta" onClick={next}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
