# Inauguração da nova sede SECABC

Landing de convite e inscrição para a inauguração em **02/10/2026, 19h**, na Rua Amazonas, 430, São Caetano do Sul.

O protótipo visual de referência continua em `inauguracao/design/`. O app de produção é Next.js (App Router) + TypeScript + Tailwind + Supabase.

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra http://localhost:3000. O painel fica em http://localhost:3000/admin.

## Conectar o Supabase

1. Crie um projeto no [Supabase](https://supabase.com) (região São Paulo, se disponível).
2. Em **SQL Editor**, rode o arquivo `supabase/migrations/20260929120000_registrations.sql`.
3. Em **Project Settings → API**, copie a URL e a chave `anon` / `publishable`.
4. Preencha no `.env.local` e, na Vercel, nas variáveis de ambiente:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

5. Em **Authentication → Users**, crie o usuário da equipe. É esse login que entra em `/admin`.
6. Faça um novo deploy depois de salvar as variáveis. As chaves `NEXT_PUBLIC_` entram no build.

O visitante só consegue **inserir** inscrição ou interesse de associação. A leitura e a mudança de status exigem usuário autenticado. Não use a chave `service_role` neste app.

Inscrição duplicada (mesmo CPF no evento) volta a mensagem de cadastro já recebido.

## Publicar na Vercel

1. Importe este repositório na Vercel.
2. Framework: Next.js. Diretório raiz: a raiz do repo.
3. Configure as duas variáveis do Supabase.
4. Deploy.

Opcionais: `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`.

## O que a página faz

- Convite com a festa, a sede, a palavra do presidente e a contagem até 02/10 às 19h (horário de Brasília).
- Formulário em etapas. Quem não é associado não entra na lista do evento: o WhatsApp vai para `membership_leads`.
- Quem informa mensalidade inativa ou incerta segue com status `PENDING_MEMBERSHIP_VALIDATION`.
- `/admin` lista, filtra, muda status, abre WhatsApp e exporta CSV.
