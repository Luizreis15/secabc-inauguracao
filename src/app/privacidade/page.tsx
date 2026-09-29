import type { Metadata } from "next";
import { Legal } from "@/components/legal";

export const metadata: Metadata = { title: "Privacidade — SECABC" };

export default function Privacidade() {
  return (
    <Legal title="Política de Privacidade">
      <p>
        O SECABC usa os dados deste convite só para organizar a inauguração da nova sede, conferir se a pessoa é associada com mensalidade ativa e falar sobre a inscrição.
      </p>
      <p>Coletamos nome, CPF, data de nascimento, WhatsApp, e-mail, empresa, cidade, matrícula (se você informar) e a origem do acesso (UTM e página).</p>
      <p>
        A inscrição não confirma a presença. A equipe valida o cadastro e responde pelo WhatsApp informado. O CPF não aparece em materiais públicos e o acesso à lista fica restrito a pessoas autenticadas no painel.
      </p>
      <p>
        Para pedir acesso, correção ou exclusão dos seus dados, fale com o SECABC pelos canais oficiais do sindicato. O texto jurídico definitivo deve ser revisado pelo departamento jurídico antes do uso institucional permanente.
      </p>
    </Legal>
  );
}
