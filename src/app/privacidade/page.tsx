import type { Metadata } from "next";
import { Legal } from "@/components/legal";

export const metadata: Metadata = { title: "Privacidade — SECABC" };

export default function Privacidade() {
  return (
    <Legal title="Política de Privacidade">
      <p>
        O SECABC usa os dados deste convite para organizar a inauguração da nova sede e falar sobre a inscrição. O evento é para quem trabalha no comércio, associado ou não.
      </p>
      <p>Coletamos nome, CPF, data de nascimento, WhatsApp, e-mail, empresa, cidade, matrícula (se você informar) e a origem do acesso (UTM e página).</p>
      <p>
        A equipe responde pelo WhatsApp informado. O CPF não aparece em materiais públicos e o acesso à lista fica restrito a pessoas autenticadas no painel.
      </p>
      <p>
        Para pedir acesso, correção ou exclusão dos seus dados, fale com o SECABC pelos canais oficiais do sindicato. O texto jurídico definitivo deve ser revisado pelo departamento jurídico antes do uso institucional permanente.
      </p>
    </Legal>
  );
}
