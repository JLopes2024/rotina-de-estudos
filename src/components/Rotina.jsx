import { useState } from "react";
import {
  compromisso,
  DIAS,
  horarios,
  listaCompromissos,
  uid,
  validarRotina,
} from "../utils/modelo";
import Compromisso from "./Compromisso";
import SugestoesEstudo from "./SugestoesEstudo";
import "./Rotina.css";
export default function Rotina({ plano, onChange, onDone, onCriarMeta }) {
  const [erros, setErros] = useState([]);
  const r = plano.rotina,
    a = r.agenda;
  const agenda = (k, v) => {
    setErros([]);
    onChange({ ...plano, rotina: { ...r, agenda: { ...a, [k]: v } } });
  };
  const estudos = (v) => {
    setErros([]);
    onChange({ ...plano, rotina: { ...r, estudos: v } });
  };
  const alterarEstudo = (id, k, v) =>
    estudos(r.estudos.map((e) => (e.id === id ? { ...e, [k]: v } : e)));
  function salvar(ev) {
    ev.preventDefault();
    const lista = validarRotina(r, plano.metas);
    setErros(lista);
    if (!lista.length) onDone();
  }
  return (
    <form onSubmit={salvar} noValidate className="routine">
      <span className="eyebrow">Uma rotina para todas as suas metas</span>
      <h1>Vamos organizar sua semana?</h1>
      <p>
        Registre empresa, formação, estudos, descanso e deslocamentos. As
        alterações são salvas mesmo enquanto você preenche.
      </p>
      {Object.keys(a.notasAnteriores).length > 0 && (
        <details>
          <summary>Anotações da versão anterior</summary>
          {Object.entries(a.notasAnteriores).map(([k, v]) => (
            <p key={k} className="answer">
              <strong>{k}: </strong>
              {v}
            </p>
          ))}
        </details>
      )}
      <Compromisso
        titulo="Empresa"
        c={a.empresa}
        onChange={(v) => agenda("empresa", v)}
      />
      <Compromisso
        titulo="Formação de aprendizagem"
        c={a.formacao}
        onChange={(v) => agenda("formacao", v)}
      />
      <section className="block">
        <h2>Escola ou faculdade</h2>
        <fieldset>
          <legend>Você estuda atualmente?</legend>
          {[
            ["sim", "Sim"],
            ["nao", "Não estudo atualmente"],
          ].map(([v, t]) => (
            <label key={v} className="check">
              <input
                type="radio"
                name="escola"
                checked={a.estudaAtualmente === v}
                onChange={() => agenda("estudaAtualmente", v)}
              />
              {t}
            </label>
          ))}
        </fieldset>
        {a.estudaAtualmente === "sim" && (
          <Compromisso
            titulo="Horários das aulas"
            c={a.escola}
            onChange={(v) => agenda("escola", v)}
          />
        )}
      </section>
      <section className="block">
        <h2>Sono e descanso</h2>
        <p>Seu sono habitual pode começar em um dia e terminar no seguinte.</p>
        <div className="grid two">
          <label>
            Costumo dormir às
            <input
              type="time"
              value={a.sonoInicio}
              onChange={(e) => agenda("sonoInicio", e.target.value)}
            />
          </label>
          <label>
            Costumo acordar às
            <input
              type="time"
              value={a.sonoFim}
              onChange={(e) => agenda("sonoFim", e.target.value)}
            />
          </label>
        </div>
      </section>
      <section className="block">
        <h2>Outros compromissos</h2>
        <p>Reserve refeições, lazer, família, tarefas de casa ou esporte.</p>
        {a.outros.map((c, i) => (
          <div key={i}>
            <label>
              Nome do compromisso
              <input
                type="text"
                value={c.nome}
                onChange={(e) =>
                  agenda(
                    "outros",
                    a.outros.map((x, j) =>
                      j === i ? { ...x, nome: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <Compromisso
              titulo={c.nome || "Outro compromisso"}
              c={c}
              onChange={(v) =>
                agenda(
                  "outros",
                  a.outros.map((x, j) => (j === i ? v : x)),
                )
              }
              remover={() =>
                agenda(
                  "outros",
                  a.outros.filter((_, j) => i !== j),
                )
              }
            />
          </div>
        ))}
        <button
          type="button"
          className="secondary"
          onClick={() => agenda("outros", [...a.outros, compromisso()])}
        >
          + Adicionar compromisso
        </button>
      </section>
      <section className="block">
        <h2>Períodos de estudo</h2>
        {plano.metas.length ? (
          <>
            <SugestoesEstudo
              rotina={r}
              metas={plano.metas}
              onAdd={(e) => estudos([...r.estudos, e])}
            />
            {r.estudos.map((e) => (
              <article className="study" key={e.id}>
                <div className="section-head">
                  <h3>Período de estudo</h3>
                  <button
                    type="button"
                    className="text danger"
                    onClick={() =>
                      estudos(r.estudos.filter((x) => x.id !== e.id))
                    }
                  >
                    Remover período
                  </button>
                </div>
                <div className="grid two">
                  <label>
                    Meta
                    <select
                      aria-label="Meta do período de estudo"
                      value={e.metaId}
                      onChange={(ev) =>
                        alterarEstudo(e.id, "metaId", ev.target.value)
                      }
                    >
                      <option value="">Escolha uma meta</option>
                      {plano.metas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.descricao || "Meta em construção"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Dia
                    <select
                      aria-label="Dia do período de estudo"
                      value={e.dia}
                      onChange={(ev) =>
                        alterarEstudo(e.id, "dia", ev.target.value)
                      }
                    >
                      {DIAS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Início
                    <input
                      type="time"
                      value={e.inicio}
                      onChange={(ev) =>
                        alterarEstudo(e.id, "inicio", ev.target.value)
                      }
                    />
                  </label>
                  <label>
                    Fim
                    <input
                      type="time"
                      value={e.fim}
                      onChange={(ev) =>
                        alterarEstudo(e.id, "fim", ev.target.value)
                      }
                    />
                  </label>
                </div>
                <label>
                  O que vai praticar? (opcional)
                  <input
                    type="text"
                    value={e.atividade}
                    onChange={(ev) =>
                      alterarEstudo(e.id, "atividade", ev.target.value)
                    }
                  />
                </label>
              </article>
            ))}
            <button
              type="button"
              className="secondary"
              onClick={() =>
                estudos([
                  ...r.estudos,
                  {
                    id: uid(),
                    dia: "Segunda",
                    inicio: "",
                    fim: "",
                    metaId: plano.metas[0].id,
                    atividade: "",
                  },
                ])
              }
            >
              + Adicionar período manual
            </button>
          </>
        ) : (
          <>
            <p>
              Crie uma meta para vincular seus estudos. Sua rotina já está sendo
              salva.
            </p>
            <button type="button" onClick={onCriarMeta}>
              Criar minha primeira meta
            </button>
          </>
        )}
        {!r.estudos.length && (
          <p className="hint">
            Nenhum período de estudo reservado ainda. Você pode completar isso
            depois de criar suas metas.
          </p>
        )}
      </section>
      <details>
        <summary>Conferir minha semana</summary>
        <div className="week">
          {DIAS.map((dia) => {
            const itens = listaCompromissos(a)
              .flatMap(({ nome, c }) =>
                horarios(c)
                  .filter((d) => d.dia === dia)
                  .map((d) => ({ ...d, nome })),
              )
              .concat(
                r.estudos
                  .filter((e) => e.dia === dia)
                  .map((e) => ({
                    ...e,
                    nome:
                      "Estudo: " +
                      (plano.metas.find((m) => m.id === e.metaId)?.descricao ||
                        "Sem meta"),
                  })),
              )
              .sort((x, y) => x.inicio.localeCompare(y.inicio));
            return (
              <article key={dia}>
                <h3>{dia}</h3>
                {itens.length ? (
                  itens.map((e, i) => (
                    <p key={i}>
                      <strong>
                        {e.inicio || "—"}–{e.fim || "—"}
                      </strong>
                      <br />
                      {e.nome}
                    </p>
                  ))
                ) : (
                  <p>Nenhum compromisso diurno registrado.</p>
                )}
              </article>
            );
          })}
        </div>
        <p className="hint">
          Sono e deslocamento também entram na verificação, mesmo sem aparecer
          nos cartões.
        </p>
      </details>
      {!!erros.length && (
        <div className="error" role="alert">
          <strong>Confira antes de continuar</strong>
          <ul>
            {erros.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="actions">
        <button type="submit">Conferir e ir para minhas metas</button>
      </div>
    </form>
  );
}
