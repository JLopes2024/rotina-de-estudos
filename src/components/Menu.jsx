import { useEffect, useRef, useState } from "react";
export default function Menu({ tela, onNavegar, simulando }) {
  const [aberto, setAberto] = useState(false),
    botao = useRef(null);
  useEffect(() => setAberto(false), [tela]);
  useEffect(() => {
    if (!aberto) return;
    const esc = (e) => {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [aberto]);
  const ir = (v) => {
    setAberto(false);
    onNavegar(v);
  };
  return (
    <header className="menu-app no-print">
      <button className="menu-marca" onClick={() => ir("inicio")}>
        <span aria-hidden="true">↗</span>
        <span>
          <strong>Portas para o Amanhã</strong>
          <small>Um futuro. Vários caminhos.</small>
        </span>
      </button>
      <button
        className="menu-toggle secondary"
        ref={botao}
        aria-expanded={aberto}
        aria-controls="menu-principal"
        onClick={() => setAberto(!aberto)}
      >
        {aberto ? "Fechar ✕" : "Menu ☰"}
      </button>
      <nav
        id="menu-principal"
        className={aberto ? "aberto" : ""}
        aria-label="Navegação principal"
      >
        {[
          ["inicio", "Início"],
          ["rotina", "Rotina"],
          ["metas", "Metas"],
          ["personas", "Personas"],
          ["resumo", "Resumo"],
        ].map(([v, t]) => (
          <button
            key={v}
            aria-current={tela === v ? "page" : undefined}
            className={tela === v ? "active" : ""}
            onClick={() => ir(v)}
          >
            {t}
          </button>
        ))}
        <button className="menu-cta" onClick={() => ir("rotina")}>
          {simulando ? "Planejar persona" : "Meu planejamento"}{" "}
          <span className="seta" aria-hidden="true">
            ↗
          </span>
        </button>
      </nav>
    </header>
  );
}
