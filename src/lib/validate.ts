import { EVENT_TARGET } from "./event";

export const digits = (s: string) => (s || "").replace(/\D/g, "");

export const maskCPF = (v: string) =>
  digits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

export const maskPhone = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (!d) return "";
  if (d.length < 3) return "(" + d;
  if (d.length < 8) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const maskDate = (v: string) => {
  const d = digits(v).slice(0, 8);
  if (d.length < 3) return d;
  if (d.length < 5) return d.slice(0, 2) + "/" + d.slice(2);
  return d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
};

export const validCPF = (v: string) => {
  const d = digits(v);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const check = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += +d[i] * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return check(9) === +d[9] && check(10) === +d[10];
};

export const validDate = (v: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v || "");
  if (!m) return false;
  const dd = +m[1];
  const mm = +m[2];
  const yy = +m[3];
  const dt = new Date(yy, mm - 1, dd);
  if (dt.getFullYear() !== yy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return false;
  const age = (EVENT_TARGET - dt.getTime()) / (365.25 * 864e5);
  return age >= 14 && age <= 110;
};

export const validPhone = (v: string) => {
  const d = digits(v);
  return d.length === 11 && +d.slice(0, 2) >= 11 && d[2] === "9";
};

export const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").trim());

export const toIsoDate = (v: string) => {
  const [dd, mm, yyyy] = v.split("/");
  return `${yyyy}-${mm}-${dd}`;
};

export type Answers = {
  full_name: string;
  cpf: string;
  birth_date: string;
  whatsapp: string;
  email: string;
  company: string;
  city: string;
  is_member: string;
  privacy: boolean;
  marketing: boolean;
};

export const EMPTY_ANSWERS: Answers = {
  full_name: "",
  cpf: "",
  birth_date: "",
  whatsapp: "",
  email: "",
  company: "",
  city: "",
  is_member: "",
  privacy: false,
  marketing: false,
};

export function errorFor(id: string, f: Answers) {
  const v = f[id as keyof Answers];
  switch (id) {
    case "full_name":
      return !String(v).trim()
        ? "Conta pra gente seu nome."
        : String(v).trim().split(/\s+/).length < 2
          ? "Coloca nome e sobrenome, por favor."
          : "";
    case "cpf":
      return !digits(String(v)) ? "Precisamos do seu CPF." : !validCPF(String(v)) ? "Hmm, esse CPF não parece certo." : "";
    case "birth_date":
      return !v ? "Informe sua data de nascimento." : !validDate(String(v)) ? "Data inválida. Use DD/MM/AAAA." : "";
    case "whatsapp":
      return !digits(String(v))
        ? "Precisamos do seu WhatsApp."
        : !validPhone(String(v))
          ? "Use DDD + 9 dígitos, ex.: (11) 91234-5678."
          : "";
    case "email":
      return !String(v).trim() ? "Informe seu e-mail." : !validEmail(String(v)) ? "Confere o e-mail? Parece incompleto." : "";
    case "company":
      return !String(v).trim() ? "Informe a empresa." : "";
    case "city":
      return !String(v).trim() ? "Informe sua cidade." : "";
    case "is_member":
      return !v ? "Escolha uma opção." : "";
    case "privacy":
      return !v ? "Esse aceite é necessário pra gente processar sua inscrição." : "";
    default:
      return "";
  }
}
