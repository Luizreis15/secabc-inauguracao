"use client";

import { useEffect, useState } from "react";
import { RegistrationForm } from "@/components/registration-form";
import { Arrow, Check } from "@/components/icons";
import { BUBBLES, EMPTY_UTM, EVENT_TARGET, MAPS_URL, readUtm, track, type Utm } from "@/lib/event";

const MARQUEE = ["MÚSICA AO VIVO", "✦", "CHURRASCO", "✦", "CHOPP GELADO", "✦", "CASA NOVA", "✦", "02.10 · 19H", "✦"];

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function countdown(now: number) {
  const diff = EVENT_TARGET - now;
  const brtDay = new Date(now - 3 * 3600e3).toISOString().slice(0, 10);
  const mode = diff <= 0 ? "started" : brtDay === "2026-10-02" ? "today" : "counting";
  return {
    mode,
    d: pad(Math.floor(diff / 864e5)),
    h: pad(Math.floor(diff / 36e5) % 24),
    m: pad(Math.floor(diff / 6e4) % 60),
  };
}

export function Landing() {
  const [open, setOpen] = useState(false);
  const [fab, setFab] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [utm, setUtm] = useState<Utm>(EMPTY_UTM);

  useEffect(() => {
    const captured = readUtm();
    setUtm(captured);
    track("page_view", { ...captured, pixel: "PageView" });
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 15000);
    const onScroll = () => setFab(window.scrollY > Math.min(520, window.innerHeight * 0.6));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let observer: IntersectionObserver | undefined;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            el.animate(
              [
                { opacity: 0, transform: "translateY(40px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)" },
            );
            el.style.opacity = "";
            observer?.unobserve(el);
          });
        },
        { threshold: 0.15 },
      );
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.getBoundingClientRect().top > window.innerHeight) {
          el.style.opacity = "0";
          observer?.observe(el);
        }
      });
    }

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  function openForm() {
    track("cta_click");
    setOpen(true);
  }

  const cd = now === null ? null : countdown(now);

  return (
    <>
      <section className="hero">
        <img className="hero-bg" src="/sede-fachada.png" alt="" fetchPriority="high" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-floor" aria-hidden="true" />
        <div className="bubbles" aria-hidden="true">
          {BUBBLES.map((bubble) => (
            <span
              key={bubble.left + bubble.delay}
              className="bubble"
              style={{ left: bubble.left, width: bubble.size, height: bubble.size, animationDuration: bubble.dur, animationDelay: bubble.delay }}
            />
          ))}
        </div>
        <div className="wrap topbar">
          <span className="logo-badge">
            <img src="/logo-sindicato.png" alt="Logo do Sindicato" />
          </span>
          <span className="date-chip">Sex · 02.10 · 19h</span>
        </div>
        <div className="wrap hero-copy">
          <div>
            <span className="invite">
              <i />
              Convite para associados SECABC
            </span>
            <h1>
              <span className="line">
                <span className="word a">Você é</span>
              </span>
              <span className="line">
                <span className="word b">nosso</span>
              </span>
              <span className="line">
                <span className="word c">convidado.</span>
              </span>
            </h1>
            <p className="sub">
              O SECABC ganhou <strong>casa nova em São Caetano do Sul</strong> e a gente quer comemorar com você.
            </p>
            <div className="cta-row">
              <button type="button" className="cta cta-amber" onClick={openForm}>
                Quero participar
                <i>
                  <Arrow />
                </i>
              </button>
              <span className="addr">
                <strong>Rua Amazonas, 430</strong>
                Centro · São Caetano do Sul
              </span>
            </div>
            <span className="micro">Exclusivo para associados com mensalidade ativa.</span>
          </div>
        </div>
      </section>

      <div className="marquee-band" aria-hidden="true">
        <div className="marquee">
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((item, index) => (
              <span key={item + index}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <section style={{ background: "#F4F7FD" }}>
        <div className="section inner" style={{ display: "flex", flexDirection: "column", gap: "clamp(32px, 4vw, 52px)" }}>
          <div data-reveal="">
            <span className="eyebrow">O que te espera</span>
            <h2 style={{ marginTop: 14 }}>
              Uma noite pra celebrar <span style={{ color: "#1F45D8" }}>do nosso jeito.</span>
            </h2>
          </div>
          <div className="party">
            <article className="blue" data-reveal="">
              <span className="bob" style={{ background: "rgba(255,255,255,.14)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </span>
              <div>
                <h3>Música ao vivo</h3>
                <p style={{ color: "#DCE4FF" }}>Som bom pra embalar a noite inteira.</p>
              </div>
            </article>
            <article className="navy" data-reveal="">
              <span className="bob" style={{ background: "rgba(255,255,255,.12)", animationDelay: ".4s" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFB320" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </span>
              <div>
                <h3>Churrasco</h3>
                <p style={{ color: "#C9D6FF" }}>Aquele cheirinho de brasa que todo mundo ama.</p>
              </div>
            </article>
            <article className="amber" data-reveal="">
              <span className="bob" style={{ background: "rgba(10,27,77,.1)", animationDelay: ".8s" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0A1B4D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 11h1a3 3 0 0 1 0 6h-1" />
                  <path d="M9 12v6M13 12v6" />
                  <path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z" />
                  <path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
                </svg>
              </span>
              <div>
                <h3>Chopp gelado</h3>
                <p style={{ color: "#2A2008" }}>Pra brindar essa conquista do jeito certo.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section style={{ background: "#fff" }}>
        <div className="section inner home">
          <div className="photo" data-reveal="">
            <div className="photo-frame">
              <img src="/sede-fachada.png" alt="Entrada da nova sede do SECABC em São Caetano do Sul" />
            </div>
            <span className="pin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB320" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Rua Amazonas, 430
            </span>
          </div>
          <div className="copy" data-reveal="">
            <span className="eyebrow">Sua nova casa</span>
            <h2 style={{ fontSize: "clamp(34px, 4.4vw, 56px)" }}>Sede própria, no coração de São Caetano.</h2>
            <p>Um espaço feito pra ficar mais perto de quem move o comércio, com atendimento, orientação e os benefícios de ser associado.</p>
            <div className="chips">
              {["Saúde", "Odontologia", "Jurídico", "Colônia de férias", "Convênios"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className="closer">Esta casa também é sua.</p>
          </div>
        </div>
      </section>

      <section className="president">
        <div className="blob" aria-hidden="true" />
        <div className="section inner president-grid">
          <div className="quote-col" data-reveal="">
            <span className="tag">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              Palavra do presidente
            </span>
            <h2>
              Uma conquista de <span style={{ color: "#FFB320" }}>todos nós.</span>
            </h2>
            <div>
              <div className="quote-mark" aria-hidden="true">
                <b>“</b>
                <span />
              </div>
              <p className="quote">
                Essa sede é de cada comerciário. Quero te ver lá pra gente comemorar junto, <strong style={{ color: "#FFE3A6" }}>na sua casa.</strong>
              </p>
            </div>
            <div className="sign">
              <b>Ademar Gonçalves Ferreira</b>
              <span>Presidente do SECABC</span>
            </div>
          </div>
          <div className="portrait" data-reveal="">
            <div className="back" aria-hidden="true" />
            <div className="front">
              <img src="/presidente-bracos.png" alt="Ademar Gonçalves Ferreira, presidente do SECABC" />
            </div>
            <span className="sticker">
              Te espero lá! <span>02.10</span>
            </span>
          </div>
        </div>
      </section>

      <section className="facts">
        <div className="blob" aria-hidden="true" />
        <div className="section inner" style={{ position: "relative", display: "flex", flexDirection: "column", gap: "clamp(28px, 4vw, 44px)" }}>
          <h2 data-reveal="">
            Anota <span>aí.</span>
          </h2>
          <div className="grid-3">
            <article className="fact when" data-reveal="">
              <span className="label">Quando</span>
              <div>
                <div className="day">02.10</div>
                <div style={{ fontSize: 19, fontWeight: 700 }}>Sexta-feira · 19h</div>
              </div>
            </article>
            <article className="fact where" data-reveal="">
              <span className="label" style={{ color: "#C9D6FF" }}>
                Onde
              </span>
              <div>
                <strong style={{ display: "block" }}>Rua Amazonas, 430</strong>
                <span style={{ color: "#DCE4FF" }}>Centro · São Caetano do Sul/SP</span>
                <a className="maps" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  Como chegar
                  <Arrow size={16} />
                </a>
              </div>
            </article>
            <article className="fact count" data-reveal="">
              <span className="label" style={{ color: "#C9D6FF" }}>
                {cd?.mode === "counting" ? "Faltam" : "Contagem"}
              </span>
              {cd?.mode === "counting" ? (
                <div className="ticks">
                  <div>
                    <b>{cd.d}</b>
                    <span>dias</span>
                  </div>
                  <div>
                    <b>{cd.h}</b>
                    <span>horas</span>
                  </div>
                  <div>
                    <b style={{ color: "#FFB320" }}>{cd.m}</b>
                    <span>min</span>
                  </div>
                </div>
              ) : (
                <span className="special">{cd?.mode === "today" ? "É hoje!" : cd ? "Já começou!" : "—"}</span>
              )}
            </article>
          </div>
          <div className="checks" data-reveal="">
            <span>
              <Check />
              Só para associados com mensalidade ativa
            </span>
            <span>
              <Check />A gente confere seu cadastro
            </span>
            <span>
              <Check />A confirmação chega no seu WhatsApp
            </span>
          </div>
        </div>
      </section>

      <section className="final">
        <div className="section inner" data-reveal="">
          <h2>
            Bora comemorar <span>juntos?</span>
          </h2>
          <p>Te esperamos dia 02.10, às 19h, na sua nova casa.</p>
          <button type="button" className="cta cta-navy" onClick={openForm}>
            Quero participar
            <i>
              <Arrow />
            </i>
          </button>
        </div>
      </section>

      <footer>
        <div className="footer-row">
          <span className="footer-brand">
            <span className="footer-logo">
              <img src="/logo-sindicato.png" alt="" />
            </span>
            © 2026 SECABC · Sindicato dos Comerciários do ABC
          </span>
          <nav>
            <a href="/privacidade">Privacidade</a>
            <a href="/lgpd">LGPD</a>
          </nav>
        </div>
      </footer>

      <div className={fab && !open ? "fab on" : "fab"}>
        <button type="button" onClick={openForm}>
          <span>
            <small>02.10 · 19h</small>
            <b>Quero participar</b>
          </span>
          <span className="pulse">
            <Arrow />
          </span>
        </button>
      </div>

      <RegistrationForm open={open} onClose={() => setOpen(false)} utm={utm} />
    </>
  );
}
