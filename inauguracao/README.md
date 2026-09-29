# Handoff: Landing Page — Inauguração da Nova Sede SECABC (São Caetano do Sul)

## Overview
Landing page de convite + captura de inscrições para a inauguração da sede própria do SECABC.
Evento: **02/10/2026, 19h** — Rua Amazonas, 430, Centro, São Caetano do Sul/SP, CEP 09520-060.
Exclusivo para **associados com mensalidade ativa**. Inscrição ≠ confirmação: a equipe valida e confirma via WhatsApp.

## About the Design Files
`design/Landing Inauguracao SECABC v2.dc.html` é um **protótipo de referência em HTML** (abre direto no navegador junto com `support.js`). Não é código de produção. A tarefa é **recriar este design** no stack final — sugerido: **Vite/Next + React + TypeScript + Tailwind + Supabase** — reproduzindo visual, copy e comportamento.

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamentos, copy e interações são finais. Recriar pixel-perfect.

## Estrutura da página (ordem)
1. **Hero** (`min-height: min(100svh, 900px)`, fundo `#0A1B4D`)
   - Fundo: `assets/sede-fachada.png`, `object-fit:cover; object-position:72% 45%`, animação Ken Burns 24s alternate (scale 1.02→1.12, translateX -1.5%).
   - Overlays: `linear-gradient(90deg, rgba(10,27,77,.95) 0, rgba(10,27,77,.86) max(340px,40%), rgba(10,27,77,.25) max(440px,75%), rgba(10,27,77,.1) 100%)` + `linear-gradient(0deg, rgba(10,27,77,.85) 0%, transparent 40%)`.
   - Bolhas de "chopp" subindo (14 círculos, borda `rgba(255,214,120,.55)`, 9–17s linear infinite).
   - Topo: logo (64×64, fundo branco, radius 18, rotate -3deg) à esquerda; chip "Sex · 02.10 · 19h" à direita.
   - Chip "Convite para associados SECABC" (ponto âmbar pulsando).
   - H1 "Você é / nosso / **convidado.**" — 3 linhas, `clamp(52px,8.4vw,104px)`, peso 800, line-height .92, letter-spacing -.045em; "convidado." em `#FFB320`. Entrada palavra a palavra (translateY 60% + rotate 4deg → 0; .8s, delays .1/.22/.34s).
   - Sub: "O SECABC ganhou **casa nova em São Caetano do Sul** e a gente quer comemorar com você."
   - CTA pill âmbar "Quero participar" (62px altura) + endereço. Microcopy: "Exclusivo para associados com mensalidade ativa."
2. **Faixa marquee** âmbar, rotate -2deg: MÚSICA AO VIVO ✦ CHURRASCO ✦ CHOPP GELADO ✦ CASA NOVA ✦ 02.10 · 19H (22s linear loop).
3. **A festa** — eyebrow "O que te espera", H2 "Uma noite pra celebrar do nosso jeito." 3 cards (radius 32, min-h 260–340): Música ao vivo (`#1F45D8`), Churrasco (`#0A1B4D`), Chopp gelado (`#FFB320`). Ícones em "bob" 3.2s. Hover: translateY(-8px) rotate(±1.5deg).
4. **Sua nova casa** — recorte da fachada (entrada/interior: scale 1.7, origin 62% 80%) radius 36 + chip "Rua Amazonas, 430". H2 "Sede própria, no coração de São Caetano." Chips: Saúde, Odontologia, Jurídico, Colônia de férias, Convênios (todos `#EEF2FF`/`#1F45D8`). Fecho: "Esta casa também é sua."
5. **Presidente** — fundo `#1F45D8`. Tag "Palavra do presidente", H2 "Uma conquista de todos nós.", citação curta, assinatura **Ademar Gonçalves Ferreira — Presidente do SECABC**. Foto `assets/presidente-bracos.png` (sem alterar feições; só recorte).
6. **Anota aí** — fundo `#0A1B4D`. 3 cards: Quando (02.10 · Sexta · 19h, âmbar), Onde (+ "Como chegar" → Google Maps directions), Contagem regressiva (dias/horas/min; "É hoje!" no dia; "Já começou!" após 19h BRT). Checklist: só associados ativos · conferimos cadastro · confirmação no WhatsApp.
7. **CTA final** — "Bora comemorar juntos?" + botão navy "Quero participar".
8. **Footer** `#07123A` — logo pequeno, © 2026 SECABC, Privacidade, LGPD.
9. **Botão flutuante** (fixed bottom center) "02.10 · 19h / Quero participar" — aparece após rolar > min(520px, 60vh); some com o formulário aberto.

## Formulário (overlay fullscreen, estilo Typeform)
Fundo `#0A1B4D`, barra de progresso âmbar no topo, fechar (X / Esc). Uma pergunta por tela, entrada com fade+translateY 28px (450ms). Enter avança; A/B/C seleciona opções; setas ↑↓ no canto.

Sequência:
0. **Intro/regras** — "Bora garantir seu lugar?" + 3 regras → "Estou ciente, vamos lá" (registra `rules_acknowledged=true`, `rules_acknowledged_at`).
1. Nome completo (mín. 2 palavras)
2. É associado? Sim / Ainda não → **"Ainda não" encerra** e mostra captura de lead (`membership_leads`) com WhatsApp.
3. Mensalidade em dia? Sim / Não / Não sei → Não/Não sei mostra aviso e segue com status `PENDING_MEMBERSHIP_VALIDATION`.
4. CPF (máscara + dígito verificador)
5. Nascimento DD/MM/AAAA (data válida, 14–110 anos)
6. WhatsApp (DDD + 9 dígitos, máscara `(11) 91234-5678`)
7. E-mail
8. Empresa
9. Cidade
10. Matrícula (opcional — botão "Pular")
11. Consentimento LGPD (obrigatório) + marketing (opcional, separado) → "Enviar minha inscrição" / "Enviando..." (bloqueia double-submit)

Estados finais: **Sucesso** ("Inscrição recebida! … ainda não está confirmada …"), **Já cadastrado** (CPF duplicado no mesmo `event_id`), **Não associado**, erro servidor / rede (copy amigável no próprio passo).

## Backend (a implementar)
- Supabase tabelas `event_registrations` e `membership_leads` (campos no PRD §60–61). Status: PENDING, PENDING_MEMBERSHIP_VALIDATION, APPROVED, REJECTED, CANCELLED, WAITLIST, ATTENDED.
- RLS: público só INSERT; SELECT apenas admin autenticado. Unique (event_id, cpf normalizado). Validação server-side (Edge Function) + Cloudflare Turnstile + rate limit.
- UTMs (`utm_source/medium/campaign/content/term`, `referrer`, `landing_page`) salvos junto.
- Eventos analytics (dataLayer): page_view, popup_accept, cta_click, registration_start/error/submit/success, registration_duplicate, non_member_detected, membership_interest. Meta Pixel `Lead` só após sucesso. IDs GA4/Pixel via env.
- `/admin` (Supabase Auth): cards de status, tabela, busca, filtros, aprovar/pendência/reprovar, botão WhatsApp com mensagem padrão, export CSV (PRD §34–38).

## Design Tokens
Cores: navy `#0A1B4D` · navy footer `#07123A` · azul `#1F45D8` · âmbar `#FFB320` · fundo claro `#F4F7FD` · branco `#FFFFFF` · azul claro `#EEF2FF` · textos em fundo escuro `#D8E1FF` / `#C9D6FF` / `#AFC0F2` · texto secundário claro `#4B5578` · erro `#FF5B3A` (apenas estados de erro).
Tipografia: **Bricolage Grotesque** (Google Fonts, 400–800) — única família. H1 52–104px/800; H2 34–60px/800, lh 1, ls -.04em; H3 32–42px/800; body 17–21px; micro 13–15px.
Raios: pills 999px · cards 28–36px · inputs/opções 12–14px. Botões principais 56–62px de altura.
Movimento: 200–800ms, `cubic-bezier(.2,.8,.2,1)`; respeitar `prefers-reduced-motion`.

## Assets
- `assets/logo-sindicato.png` — logo fornecido (confirmar se é o oficial SECABC; o selo diz "Santo André").
- `assets/sede-fachada.png` — fachada (imagem de referência; número na placa aparece 439 vs endereço 430 — confirmar).
- `assets/presidente-bracos.png`, `assets/presidente-retrato.png` — presidente Ademar (não alterar feições).

## Files
- `design/Landing Inauguracao SECABC v2.dc.html` — protótipo completo (abrir no navegador com `support.js` na mesma pasta).
- `design/support.js`, `design/image-slot.js` — runtime do protótipo (não usar em produção).
- `design/assets/` — imagens.
- PRD original: ver conversa / documento "PRD MASTER — Landing Page Oficial".
