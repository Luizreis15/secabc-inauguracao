import type { ReactNode } from "react";

export function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="legal">
      <a href="/">← Voltar ao convite</a>
      <h1>{title}</h1>
      {children}
    </main>
  );
}
