import {
  DIAS,
  HORIZONTES,
  SMART,
  horarios,
  listaCompromissos,
  duracao,
  formatarDuracao,
  metaCompleta,
  validarRotina,
} from "../utils/modelo";
import "./Resumo.css";
const data = (d) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "A definir";
export default function Resumo({ plano, onRotina, onMetas }) {
  const erros = validarRotina(plano.rotina, plano.metas);
  return (
    <div className="summary">
      <span className="eyebrow">Seu plano integrado</span>
      <h1>Meu caminho</h1>
      <p>Rotina semanal e metas de curto, médio e longo prazo.</p>
      {!!erros.length && (
        <div className="error">
          <strong>A rotina tem pendências</strong>
          <ul>
            {erros.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="stats">
        <article>
          <b>{plano.metas.length}</b>
          <span>metas</span>
        </article>
        <article>
          <b>{plano.rotina.estudos.length}</b>
          <span>períodos de estudo</span>
        </article>
        <article>
          <b>
            {formatarDuracao(
              plano.rotina.estudos.reduce((n, e) => n + duracao(e), 0),
            )}
          </b>
          <span>por semana</span>
        </article>
      </div>
      <h2>Minha semana</h2>
      <div
        className="table-scroll"
        tabIndex="0"
        role="region"
        aria-label="Rotina semanal"
      >
        <table>
          <thead>
            <tr>
              <th>Dia</th>
              <th>Horário</th>
              <th>Compromisso / meta</th>
              <th>Atividade</th>
            </tr>
          </thead>
          <tbody>
            {DIAS.flatMap((dia) => {
              const linhas = listaCompromissos(plano.rotina.agenda)
                .flatMap(({ nome, c }) =>
                  horarios(c)
                    .filter((d) => d.dia === dia)
                    .map((d) => ({ ...d, nome, atividade: "" })),
                )
                .concat(
                  plano.rotina.estudos
                    .filter((e) => e.dia === dia)
                    .map((e) => ({
                      ...e,
                      nome:
                        "Estudo: " +
                        (plano.metas.find((m) => m.id === e.metaId)
                          ?.descricao || "Sem meta vinculada"),
                    })),
                )
                .sort((a, b) => a.inicio.localeCompare(b.inicio));
              return linhas.length
                ? linhas.map((e, i) => (
                    <tr key={dia + i}>
                      <th scope="row">{dia}</th>
                      <td>
                        {e.inicio || "—"}–{e.fim || "—"}
                      </td>
                      <td>{e.nome}</td>
                      <td>{e.atividade || "—"}</td>
                    </tr>
                  ))
                : [
                    <tr key={dia}>
                      <th scope="row">{dia}</th>
                      <td>—</td>
                      <td colSpan="2">Nenhum compromisso diurno registrado</td>
                    </tr>,
                  ];
            })}
          </tbody>
        </table>
      </div>
      <p>
        Sono habitual: {plano.rotina.agenda.sonoInicio || "—"} às{" "}
        {plano.rotina.agenda.sonoFim || "—"}.
      </p>
      <section className="travel">
        <h3>Deslocamentos registrados</h3>
        {listaCompromissos(plano.rotina.agenda).map(({ nome, c }, i) => (
          <p key={i}>
            {nome}:{" "}
            {c.remoto
              ? "sem deslocamento"
              : `ida ${c.ida || "—"} min / volta ${c.volta || "—"} min`}
          </p>
        ))}
      </section>
      {Object.keys(plano.rotina.agenda.notasAnteriores).length > 0 && (
        <section>
          <h3>Anotações preservadas da versão anterior</h3>
          {Object.entries(plano.rotina.agenda.notasAnteriores).map(([k, v]) => (
            <p key={k} className="answer">
              <strong>{k}: </strong>
              {v}
            </p>
          ))}
        </section>
      )}
      {Object.entries(HORIZONTES).map(([h, t]) => (
        <section className="horizon" key={h}>
          <h2>{t}</h2>
          {plano.metas.filter((m) => m.horizonte === h).length ? (
            plano.metas
              .filter((m) => m.horizonte === h)
              .map((m) => (
                <MetaResumo
                  key={m.id}
                  m={m}
                  estudos={plano.rotina.estudos.filter(
                    (e) => e.metaId === m.id,
                  )}
                />
              ))
          ) : (
            <p>Nenhuma meta cadastrada neste horizonte.</p>
          )}
        </section>
      ))}
      {plano.metas
        .filter((m) => !m.horizonte)
        .map((m) => (
          <MetaResumo
            key={m.id}
            m={m}
            estudos={plano.rotina.estudos.filter((e) => e.metaId === m.id)}
          />
        ))}
      <div className="actions no-print">
        <button className="secondary" onClick={onRotina}>
          Editar rotina
        </button>
        <button className="secondary" onClick={onMetas}>
          Editar metas
        </button>
        <button onClick={() => window.print()}>Salvar PDF / imprimir</button>
      </div>
      <p className="hint no-print">
        Escolha “Salvar como PDF” na impressão. Desative cabeçalhos e rodapés do
        navegador. Exporte JSON no início para ter uma cópia restaurável.
      </p>
    </div>
  );
}
function MetaResumo({ m, estudos }) {
  return (
    <article className="print-goal">
      <h3 className="answer">{m.descricao || "Meta em construção"}</h3>
      <p>
        <strong>Data-alvo:</strong> {data(m.dataAlvo)} ·{" "}
        {metaCompleta(m) ? "SMART preenchido" : "Em construção"}
      </p>
      <dl>
        {SMART.map((s) => (
          <div key={s.letra}>
            <dt>
              {s.letra} — {s.titulo}
            </dt>
            <dd className="answer">
              {m.smart[s.letra].trim() || "Ainda não preenchido."}
            </dd>
          </div>
        ))}
      </dl>
      <h4>Pequenas etapas</h4>
      {m.etapas.length ? (
        <ul>
          {m.etapas.map((e) => (
            <li key={e.id}>
              {e.concluida ? "Concluída" : "Pendente"}:{" "}
              {e.titulo || "Sem título"} · {data(e.prazo)}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma pequena etapa cadastrada.</p>
      )}
      <h4>Estudos desta meta</h4>
      {estudos.length ? (
        <ul>
          {estudos.map((e) => (
            <li key={e.id}>
              {e.dia}, {e.inicio || "—"}–{e.fim || "—"}
              {e.atividade ? ` · ${e.atividade}` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p>Ainda sem horário de estudo.</p>
      )}
    </article>
  );
}
