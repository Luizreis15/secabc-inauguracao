# Inauguração da nova sede SECABC

Landing de convite e inscrição para **02/10/2026, 19h**, na Rua Amazonas, 430, São Caetano do Sul.

As inscrições entram no banco do projeto [comerciariosabc](https://github.com/Luizreis15/comerciariosabc), na tabela `evento_inscricoes`, no evento de slug `inauguracao`. O painel é o que já existe: https://secabc.online/admin/inauguracao

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

No `.env.local`, use a URL e a chave anon do projeto Supabase **Base_CRM_SECABC** (as mesmas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` do comerciariosabc).

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Quem se inscreve fica com status `inscrito`, associado ou não. O convite é para quem trabalha no comércio. A confirmação continua no painel. A resposta sobre associação fica em `dados_extras.associado` e na observação, sem barrar a inscrição.

CPF repetido neste evento devolve “já recebemos sua inscrição”.
