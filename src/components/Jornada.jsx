import { useEffect, useState } from "react";
import { metaCompleta, validarAgenda, validarRotina } from "../utils/modelo";
export function medidorPlano(plano) {
  const rotina = !validarAgenda(plano.rotina.agenda).length;
  const metas = plano.metas.length > 0;
  const smart = metas && plano.metas.every(metaCompleta);
  const estudos =
    smart &&
    plano.metas.every((m) =>
      plano.rotina.estudos.some((e) => e.metaId === m.id),
    ) &&
    !validarRotina(plano.rotina, plano.metas).length;
  return [rotina, metas, smart, estudos];
}
export function Barra({ valor, max = 100, label = "Progresso" }) {
  const pct = max ? Math.max(0, Math.min(100, (valor / max) * 100)) : 0;
  return (
    <div
      className="j-barra"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={valor}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
export function TituloJornada({ efeitos }) {
  const [indice, setIndice] = useState(0);
  useEffect(() => {
    const preferencia = matchMedia("(prefers-reduced-motion: reduce)");
    let timer;
    function atualizar() {
      clearInterval(timer);
      if (efeitos && !preferencia.matches) {
        timer = setInterval(() => setIndice(i => (i + 1) % 3), 3200);
      }
    }
    atualizar();
    preferencia.addEventListener("change", atualizar);
    return () => {
      clearInterval(timer);
      preferencia.removeEventListener("change", atualizar);
    };
  }, [efeitos]);
  const palavras = ["estudar", "planejar", "conquistar"];
  return (
    <>
      <h1 className="titulo-montagem" aria-label="Seu amanhã começa hoje.">
        {["Seu", "amanhã", "começa", "hoje."].map((palavra, grupo) => (
          <span className="titulo-palavra" aria-hidden="true" key={palavra}>
            {Array.from(palavra).map((letra, i) => (
              <span className="titulo-letra" key={i}
                style={{ "--i": grupo * 6 + i, "--origem": `${i % 2 ? -12 : 12}px` }}>
                {letra}
              </span>
            ))}
          </span>
        ))}
      </h1>
      <p className="frase-jornada">
        Um espaço para{" "}
        <strong className="palavra-alternada" aria-hidden="true" key={indice}>
          {palavras[indice]}
        </strong>
        <span className="sr">estudar, planejar e conquistar</span>, no seu
        tempo.
      </p>
      <p>
        Transforme uma <span className="marca-texto">meta possível</span> em
        pequenos passos. Seu caminho começa com a realidade que você tem hoje.
      </p>
    </>
  );
}
export function Portas({ onNavegar }) {
  return (
    <section className="sala-portas">
      <div className="section-head">
        <h2 className="sublinhado">Qual porta você quer abrir?</h2>
        <span className="hint">Escolha seu próximo passo</span>
      </div>
      <div className="portas-grid">
        {[
          ["rotina", "01", "Minha rotina", "Encontre tempo possível"],
          ["metas", "02", "Minhas metas", "Dê direção ao seu futuro"],
          ["personas", "03", "Outra realidade", "Planeje com uma persona"],
          ["resumo", "04", "Meu caminho", "Veja o plano que construiu"],
        ].map(([v, n, t, p]) => (
          <button className="porta" key={v} onClick={() => onNavegar(v)}>
            <span className="porta-cenario" aria-hidden="true">
              <span className="porta-folha">
                <span className="porta-macaneta" />
              </span>
              <span className="porta-numero">{n}</span>
            </span>
            <strong>{t}</strong>
            <small>{p}</small>
            <span className="seta" aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
export function Mapa({ plano, onNavegar, tela }) {
  const estados = medidorPlano(plano);
  const fases = [
    ["rotina", "Rotina"],
    ["metas", "Meta"],
    ["metas", "SMART"],
    ["rotina", "Estudos"],
    ["resumo", "Resumo"],
  ];
  return (
    <section className="mapa-jornada">
      <div className="section-head">
        <h2>Seu mapa de passos</h2>
        <span className="hint">
          {estados.filter(Boolean).length} de 4 preparações prontas
        </span>
      </div>
      <Barra
        valor={estados.filter(Boolean).length}
        max={4}
        label="Preparação do plano"
      />
      <ol>
        {fases.map(([v, t], i) => (
          <li key={t} className={estados[i] ? "feito" : ""}>
            <button
              className="secondary"
              onClick={() => onNavegar(v)}
              aria-current={tela === v ? "page" : undefined}
            >
              <span>{estados[i] ? "✓" : i + 1}</span>
              {t}
            </button>
          </li>
        ))}
      </ol>
      <p className="hint">
        Você pode visitar e revisar qualquer etapa. “Pronto” indica
        preenchimento, não conquista da meta.
      </p>
    </section>
  );
}
export function Guia({ tela, onAbrir }) {
  const textos = {
    inicio: "Vamos transformar suas ideias em passos possíveis?",
    rotina: "Reserve espaço para descanso e deslocamentos.",
    metas: "Uma meta pequena também abre caminhos.",
    editor: "Cada resposta do SMART dá mais clareza à sua meta.",
    personas: "Conheça a realidade antes de escolher uma solução.",
    resumo: "Revise o plano e guarde uma cópia.",
  };
  return (
    <button
      className="guia no-print secondary"
      onClick={onAbrir}
      aria-label="Abrir orientação do guia"
    >
      <span className="guia-rosto" aria-hidden="true">
        <i />
        <i />
        <b />
      </span>
      <span>
        <strong>Seu guia</strong>
        <small>{textos[tela] ?? textos.inicio}</small>
      </span>
    </button>
  );
}
export function CenaFinal() {
  return (
    <div className="cena-final">
      <div className="cena-sol" aria-hidden="true" />
      <div className="cena-caminho" aria-hidden="true" />
      <div className="cena-porta" aria-hidden="true">
        <span />
      </div>
      <div className="pecas-fisica" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} style={{ "--i": i, "--x": `${(i - 4) * 25}px` }} />
        ))}
      </div>
      <strong>Uma porta aberta. Um primeiro passo possível.</strong>
      <p>
        Seu plano está construído. Agora você pode revisá-lo, salvá-lo e
        começar.
      </p>
    </div>
  );
}
