import { useEffect, useRef, useState } from "react";
import { PERSONAS } from "../dados/personas";
const KEY = "portas-amanha:personas-sorteadas:v1";
function ler() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw)
      ? [...new Set(raw)].filter((id) => PERSONAS.some((p) => p.id === id))
      : [];
  } catch {
    return [];
  }
}
export default function SorteadorPersonas({
  onIniciar,
  onVoltar,
  onCelebrar,
  efeitos,
}) {
  const [historico, setHistorico] = useState(ler),
    [persona, setPersona] = useState(null),
    [sorteando, setSorteando] = useState(false),
    [aviso, setAviso] = useState("");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  function sortear() {
    if (sorteando) return;
    const nova = historico.length >= PERSONAS.length,
      usados = nova ? [] : historico,
      lista = PERSONAS.filter((p) => !usados.includes(p.id)),
      escolhida = lista[Math.floor(Math.random() * lista.length)];
    setPersona(null);
    setSorteando(true);
    setAviso("");
    const revelar = () => {
      const ids = [...usados, escolhida.id];
      setHistorico(ids);
      setPersona(escolhida);
      setSorteando(false);
      let msg = nova ? "Nova rodada iniciada." : "";
      try {
        localStorage.setItem(KEY, JSON.stringify(ids));
      } catch {
        msg +=
          " Não foi possível salvar o histórico; ele vale enquanto esta tela estiver aberta.";
      }
      setAviso(msg);
      onCelebrar?.();
    };
    if (!efeitos || matchMedia("(prefers-reduced-motion: reduce)").matches)
      revelar();
    else timer.current = setTimeout(revelar, 950);
  }
  return (
    <section className="personas">
      <span className="eyebrow">Outra realidade. Novas escolhas.</span>
      <h1>Qual caminho seu grupo vai planejar?</h1>
      <div className="personas-explicacao">
        <p>
          Seis pessoas fictícias, todas aprendizes. O sorteio não repete até
          passar pelas seis neste navegador. Aparelhos diferentes têm rodadas
          independentes.
        </p>
        <p>
          Não há uma única resposta correta. Construa um plano que respeite
          recursos, compromissos e descanso.
        </p>
      </div>
      <div className="actions">
        <button onClick={sortear} disabled={sorteando}>
          {sorteando
            ? "Revelando…"
            : persona
              ? "Sortear outra persona"
              : "Sortear persona"}
        </button>
        <button className="secondary" onClick={onVoltar}>
          Voltar
        </button>
      </div>
      <p className="hint">
        {historico.length} de 6 personas sorteadas nesta rodada.
      </p>
      {aviso && (
        <p className="notice" role="status">
          {aviso}
        </p>
      )}
      <div role="status" className="sr">
        {sorteando
          ? "Sorteando persona"
          : persona
            ? `Persona sorteada: ${persona.nome}`
            : ""}
      </div>
      {sorteando && (
        <div className="carta-suspense" aria-hidden="true">
          <span className="glitch">Uma nova história</span>
          <strong>?</strong>
          <p>Qual porta vamos abrir?</p>
        </div>
      )}
      {persona && (
        <article key={persona.id} className="persona-card carta-revelada">
          <div className="particulas" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <i
                key={i}
                style={{
                  "--i": i,
                  "--x": `${i % 2 ? 1 : -1}`,
                  left: `${10 + i * 8}%`,
                }}
              />
            ))}
          </div>
          <header className="persona-card-header">
            <span className="persona-avatar" aria-hidden="true">
              {persona.nome[0]}
            </span>
            <div>
              <h2>
                {persona.nome}, {persona.idade} anos
              </h2>
              <p>{persona.perfil}</p>
            </div>
          </header>
          <p>{persona.historia}</p>
          <div className="persona-tags">
            {persona.interesses.map((x) => (
              <span className="badge" key={x}>
                {x}
              </span>
            ))}
          </div>
          <div className="persona-info-grid">
            <section>
              <h3>Pontos fortes</h3>
              <p>{persona.pontosFortes.join(" • ")}</p>
            </section>
            <section>
              <h3>Recursos</h3>
              <p>{persona.recursos}</p>
            </section>
            <section>
              <h3>Apoio</h3>
              <p>{persona.apoio}</p>
            </section>
            <section>
              <h3>Compromissos</h3>
              <ul>
                <li>Empresa: segunda a quinta, 08:00–12:00.</li>
                <li>Formação: sexta-feira, 08:00–12:00.</li>
                <li>
                  Deslocamento de empresa/formação: {persona.deslocamento}{" "}
                  minutos por trecho.
                </li>
                <li>
                  Sono: {persona.sonoInicio}–{persona.sonoFim}.
                </li>
                {persona.escola ? (
                  <li>
                    {persona.escola.nome}: {persona.escola.dias.join(", ")},{" "}
                    {persona.escola.inicio}–{persona.escola.fim}. Deslocamento:{" "}
                    {persona.escola.deslocamento} minutos por trecho.
                  </li>
                ) : (
                  <li>Sem matrícula em um curso atualmente.</li>
                )}
                {persona.outros.map((o) => (
                  <li key={o.nome}>
                    {o.nome}: {o.dias.join(", ")}, {o.inicio}–{o.fim}.
                    {!o.remoto &&
                      ` Deslocamento: ${o.deslocamento} minutos por trecho.`}
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <section className="persona-desafio">
            <h3>Missão do grupo</h3>
            <p>{persona.desafio}</p>
            <strong>{persona.reflexao}</strong>
          </section>
          <p className="hint">
            A rotina virá preenchida. O grupo construirá as metas e os estudos.
            A simulação é temporária: exporte antes de fechar a página.
          </p>
          <button onClick={() => onIniciar(persona)}>
            Planejar o caminho de {persona.nome}{" "}
            <span className="seta" aria-hidden="true">
              ↗
            </span>
          </button>
        </article>
      )}
    </section>
  );
}
