import { useState } from "react";
import { SMART, HORIZONTES, uid, validarMetaEtapa } from "../utils/modelo";
import { metas, categoriasMetas, buscarMeta } from "../dados/metas";
import "./EditorMeta.css";
import { Barra } from "./Jornada";
export default function EditorMeta({ meta, onChange, onDone }) {
  const [etapa, setEtapa] = useState(0),
    [categoria, setCategoria] = useState("Todas"),
    [erros, setErros] = useState([]);
  const alterar = (k, v) => {
    setErros([]);
    onChange({ ...meta, [k]: v });
  };
  const ref = buscarMeta(meta.sugestaoId),
    s = SMART[etapa - 1];
  function avancar(ev) {
    ev.preventDefault();
    const lista = validarMetaEtapa(meta, etapa);
    setErros(lista);
    if (lista.length) return;
    if (etapa === 5) onDone();
    else {
      setEtapa(etapa + 1);
      window.scrollTo(0, 0);
    }
  }
  function exemplo(m) {
    if (
      meta.descricao.trim() &&
      meta.descricao !== m.descricao &&
      !confirm(
        "Substituir o texto da meta por esta sugestão? O SMART já preenchido será mantido.",
      )
    )
      return;
    onChange({ ...meta, descricao: m.descricao, sugestaoId: m.id });
  }
  return (
    <form onSubmit={avancar} noValidate>
      <span className="eyebrow">Uma meta, um caminho possível</span>
      <div className="step-label">Etapa {etapa + 1} de 6</div>
      <Barra valor={etapa + 1} max={6} label="Etapas do SMART" />
      {etapa === 0 ? (
        <>
          <h1>Qual é sua meta?</h1>
          <p>
            Escolha um objetivo e depois desenvolva seu SMART. A rotina é
            compartilhada com suas outras metas.
          </p>
          <details>
            <summary>Explorar o banco de metas</summary>
            <label>
              Interesse
              <select
                aria-label="Interesse"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option>Todas</option>
                {categoriasMetas.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="catalog">
              {metas
                .filter(
                  (m) => categoria === "Todas" || m.categoria === categoria,
                )
                .map((m) => (
                  <article key={m.id}>
                    <span className="badge">{m.categoria}</span>
                    <h3>{m.titulo}</h3>
                    <p>{m.descricao}</p>
                    <p className="hint">
                      <strong>Primeiro passo: </strong>
                      {m.primeiroPasso}
                    </p>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => exemplo(m)}
                    >
                      Usar sugestão
                    </button>
                  </article>
                ))}
            </div>
          </details>
          <label>
            O que deseja alcançar?
            <textarea
              rows="4"
              value={meta.descricao}
              onChange={(e) => alterar("descricao", e.target.value)}
              required
            />
          </label>
          <fieldset>
            <legend>Horizonte da meta</legend>
            {Object.entries(HORIZONTES).map(([v, t]) => (
              <label className="check" key={v}>
                <input
                  type="radio"
                  name="horizonte"
                  checked={meta.horizonte === v}
                  onChange={() => alterar("horizonte", v)}
                />
                {t}
              </label>
            ))}
          </fieldset>
          {ref && (
            <p className="notice">
              Referência: {ref.titulo}. Você pode adaptar o texto.{" "}
              <button
                type="button"
                className="text"
                onClick={() => alterar("sugestaoId", "")}
              >
                Remover referência
              </button>
            </p>
          )}
          <details>
            <summary>Como funciona o SMART?</summary>
            <dl>
              {SMART.map((item) => (
                <div key={item.letra}>
                  <dt>
                    {item.letra} — {item.titulo}
                  </dt>
                  <dd>{item.pergunta}</dd>
                </div>
              ))}
            </dl>
          </details>
        </>
      ) : (
        <>
          <ol className="smart-progress" aria-label="Etapas SMART">
            {SMART.map((x, i) => (
              <li
                key={x.letra}
                className={[
                  i === etapa - 1 ? "current" : "",
                  !validarMetaEtapa(meta, i + 1).length ? "done" : "",
                ].join(" ")}
                aria-current={i === etapa - 1 ? "step" : undefined}
              >
                {x.letra}
              </li>
            ))}
          </ol>
          <h1>
            {s.letra} — {s.titulo}
          </h1>
          <p className="question">{s.pergunta}</p>
          <aside className="notice">
            <strong>Sua meta</strong>
            <p className="answer">{meta.descricao}</p>
          </aside>
          <label>
            Sua resposta
            <textarea
              rows="6"
              value={meta.smart[s.letra]}
              onChange={(e) =>
                alterar("smart", { ...meta.smart, [s.letra]: e.target.value })
              }
              required
              aria-describedby="smart-help"
            />
          </label>
          <p className="hint" id="smart-help">
            {s.ajuda}
          </p>
          <details>
            <summary>Ver um exemplo {ref ? `de ${ref.titulo}` : ""}</summary>
            <p>{(ref ?? metas[4]).exemplosSmart[s.letra]}</p>
            <p className="hint">
              Exemplo para inspiração. Ajuste a quantidade e o prazo à sua
              realidade.
            </p>
          </details>
          {etapa === 5 && (
            <section className="milestones">
              <label>
                Data-alvo da meta
                <input
                  type="date"
                  value={meta.dataAlvo}
                  onChange={(e) => alterar("dataAlvo", e.target.value)}
                />
              </label>
              <h2>Pequenas etapas</h2>
              <p>
                Divida seu objetivo em entregas menores. Cada etapa adicionada
                precisa de nome e prazo.
              </p>
              {meta.etapas.map((e, i) => (
                <article key={e.id}>
                  <label>
                    Etapa {i + 1}
                    <input
                      type="text"
                      value={e.titulo}
                      onChange={(ev) =>
                        alterar(
                          "etapas",
                          meta.etapas.map((x) =>
                            x.id === e.id
                              ? { ...x, titulo: ev.target.value }
                              : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Prazo
                    <input
                      type="date"
                      max={meta.dataAlvo || undefined}
                      value={e.prazo}
                      onChange={(ev) =>
                        alterar(
                          "etapas",
                          meta.etapas.map((x) =>
                            x.id === e.id
                              ? { ...x, prazo: ev.target.value }
                              : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={e.concluida}
                      onChange={(ev) =>
                        alterar(
                          "etapas",
                          meta.etapas.map((x) =>
                            x.id === e.id
                              ? { ...x, concluida: ev.target.checked }
                              : x,
                          ),
                        )
                      }
                    />
                    Concluída
                  </label>
                  <button
                    type="button"
                    className="text danger"
                    onClick={() =>
                      alterar(
                        "etapas",
                        meta.etapas.filter((x) => x.id !== e.id),
                      )
                    }
                  >
                    Remover etapa {i + 1}
                  </button>
                </article>
              ))}
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  alterar("etapas", [
                    ...meta.etapas,
                    { id: uid(), titulo: "", prazo: "", concluida: false },
                  ])
                }
              >
                + Adicionar pequena etapa
              </button>
            </section>
          )}
        </>
      )}
      {!!erros.length && (
        <div className="error" role="alert">
          <ul>
            {erros.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="actions">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            if (etapa) setEtapa(etapa - 1);
            else onDone();
            setErros([]);
          }}
        >
          Voltar
        </button>
        <button type="submit">
          {etapa === 5 ? "Concluir planejamento" : "Próximo"}
        </button>
      </div>
      <p className="hint">
        Você pode sair a qualquer momento; as respostas ficam salvas como
        rascunho.
      </p>
    </form>
  );
}
