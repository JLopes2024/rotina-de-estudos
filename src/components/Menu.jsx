import { useEffect, useRef, useState } from "react";
import "./Menu.css";

const ITENS = [
  ["inicio", "Início"],
  ["rotina", "Rotina"],
  ["metas", "Metas"],
  ["personas", "Personas"],
  ["resumo", "Resumo"],
];

export default function Menu({
  tela,
  onNavegar,
  simulando = false,
}) {
  const [aberto, setAberto] = useState(false);
  const botaoMenu = useRef(null);

  useEffect(() => {
    setAberto(false);
  }, [tela]);

  useEffect(() => {
    if (!aberto) return;

    function fecharComEscape(evento) {
      if (evento.key === "Escape") {
        setAberto(false);
        botaoMenu.current?.focus();
      }
    }

    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        fecharComEscape,
      );
    };
  }, [aberto]);

  function navegar(destino) {
    setAberto(false);
    onNavegar(destino);
  }

  return (
    <header className="menu-app no-print">
      <button
        type="button"
        className="menu-marca"
        onClick={() => navegar("inicio")}
        aria-label="Portas para o Amanhã — início"
      >
        <span className="menu-simbolo" aria-hidden="true">
          ↗
        </span>

        <span className="menu-marca-texto">
          <strong>Portas para o Amanhã</strong>
          <small>Um futuro. Vários caminhos.</small>
        </span>
      </button>

      <button
        type="button"
        className="menu-toggle"
        ref={botaoMenu}
        aria-expanded={aberto}
        aria-controls="menu-principal"
        onClick={() => setAberto((atual) => !atual)}
      >
        <span aria-hidden="true">
          {aberto ? "✕" : "☰"}
        </span>

        {aberto ? "Fechar" : "Menu"}
      </button>

      <nav
        id="menu-principal"
        className={`menu-links ${aberto ? "aberto" : ""}`}
        aria-label="Navegação principal"
      >
        {ITENS.map(([destino, titulo]) => (
          <button
            type="button"
            key={destino}
            className={
              tela === destino ? "selecionado" : ""
            }
            aria-current={
              tela === destino ? "page" : undefined
            }
            onClick={() => navegar(destino)}
          >
            {titulo}
          </button>
        ))}

        <button
          type="button"
          className="menu-cta"
          onClick={() => navegar("rotina")}
        >
          {simulando
            ? "Planejar persona"
            : "Meu planejamento"}

          <span aria-hidden="true">↗</span>
        </button>
      </nav>
    </header>
  );
}