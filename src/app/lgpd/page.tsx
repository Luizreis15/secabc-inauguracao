import type { Metadata } from "next";
import { Legal } from "@/components/legal";

export const metadata: Metadata = { title: "LGPD — SECABC" };

export default function Lgpd() {
  return (
    <Legal title="LGPD">
      <p>O tratamento dos dados da inscrição segue a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
      <ul>
        <li>A base é o consentimento dado no formulário e a execução do convite do evento.</li>
        <li>O aceite de novidades é separado e opcional. Sem ele, a inscrição segue normalmente.</li>
        <li>Quem não é associado pode deixar só o WhatsApp para saber como se filiar. Isso não inscreve no evento.</li>
        <li>A lista de inscritos só pode ser lida por usuários autenticados no Supabase.</li>
      </ul>
      <p>O público consegue apenas enviar uma inscrição. Não há consulta pública de CPF nem de outras pessoas inscritas.</p>
    </Legal>
  );
}
