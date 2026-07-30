import { ArrowLeft, Clock3, FileQuestion } from "lucide-react";
import "./UnavailablePage.css";

interface UnavailablePageProps {
  title: string;
  notFound?: boolean;
}

export default function UnavailablePage({
  title,
  notFound = false,
}: UnavailablePageProps) {
  return (
    <section className="unavailable-page">
      <div className="unavailable-page__icon">
        {notFound ? <FileQuestion size={30} /> : <Clock3 size={30} />}
      </div>
      <span>{notFound ? "Página não encontrada" : "Funcionalidade em preparação"}</span>
      <h1>{title}</h1>
      <p>
        {notFound
          ? "O endereço informado não corresponde a uma página disponível."
          : "Esta página ainda não foi implementada. Ela ficará disponível em uma próxima etapa do projeto."}
      </p>
      <a href="/">
        <ArrowLeft size={16} />
        Voltar ao início
      </a>
    </section>
  );
}
