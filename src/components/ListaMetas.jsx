import {
  HORIZONTES,
  metaCompleta,
  formatarDuracao,
  duracao,
} from "../utils/modelo";
import "./ListaMetas.css";
export default function ListaMetas({
  plano,
  onNova,
  onEditar,
  onExcluir,
  onChange,
  onRotina,
}) {
  return (
    <>
      <div className="section-head">
        <div>
          <span className="eyebrow">Seu futuro, em diferentes tempos</span>
          <h1>Minhas metas</h1>
        </div>
        <button onClick={onNova}>+ Nova meta</button>
      </div>
      <p>
        Curto, médio e longo prazo coexistem. Cada meta tem seu SMART, etapas e
        períodos de estudo.
      </p>
      {!plano.metas.length && (
        <div className="empty">
          <h2>Qual será seu primeiro objetivo?</h2>
          <p>Comece pequeno. Você pode criar outras metas depois.</p>
          <button onClick={onNova}>Criar minha primeira meta</button>
        </div>
      )}
      {Object.entries(HORIZONTES).map(([valor, titulo]) => {
        const grupo = plano.metas.filter((m) => m.horizonte === valor);
        return grupo.length ? (
          <section key={valor}>
            <h2>{titulo}</h2>
            <div className="goals">
              {grupo.map((m) => (
                <Card
                  key={m.id}
                  m={m}
                  plano={plano}
                  onEditar={onEditar}
                  onExcluir={onExcluir}
                  onChange={onChange}
                />
              ))}
            </div>
          </section>
        ) : null;
      })}
      {plano.metas.some((m) => !m.horizonte) && (
        <section>
          <h2>Em construção</h2>
          <div className="goals">
            {plano.metas
              .filter((m) => !m.horizonte)
              .map((m) => (
                <Card
                  key={m.id}
                  m={m}
                  plano={plano}
                  onEditar={onEditar}
                  onExcluir={onExcluir}
                  onChange={onChange}
                />
              ))}
          </div>
        </section>
      )}
      <div className="actions">
        <button className="secondary" onClick={onRotina}>
          Organizar estudos na rotina
        </button>
      </div>
    </>
  );
}
function Card({ m, plano, onEditar, onExcluir, onChange }) {
  const sessoes = plano.rotina.estudos.filter((e) => e.metaId === m.id);
  return (
    <article className="goal-card">
      <span className="badge">
        {metaCompleta(m) ? "SMART preenchido" : "Rascunho"}
      </span>
      <h3 className="answer">{m.descricao || "Meta ainda sem descrição"}</h3>
      <p className="hint">
        Data-alvo:{" "}
        {m.dataAlvo
          ? new Date(m.dataAlvo + "T12:00:00").toLocaleDateString("pt-BR")
          : "a definir"}
      </p>
      <p>
        {sessoes.length} períodos ·{" "}
        {formatarDuracao(sessoes.reduce((n, e) => n + duracao(e), 0))} por
        semana
      </p>
      {!sessoes.length && (
        <p className="notice">Esta meta ainda não tem horário de estudo.</p>
      )}
      {m.etapas.length > 0 && (
        <>
          <p className="hint">
            {m.etapas.filter((e) => e.concluida).length}/{m.etapas.length}{" "}
            pequenas etapas concluídas
          </p>
          {m.etapas.map((e) => (
            <label className="check task" key={e.id}>
              <input
                type="checkbox"
                checked={e.concluida}
                onChange={(ev) =>
                  onChange({
                    ...plano,
                    metas: plano.metas.map((x) =>
                      x.id === m.id
                        ? {
                            ...x,
                            etapas: x.etapas.map((t) =>
                              t.id === e.id
                                ? { ...t, concluida: ev.target.checked }
                                : t,
                            ),
                          }
                        : x,
                    ),
                  })
                }
              />
              <span>
                {e.titulo || "Etapa sem título"}
                <small>
                  {e.prazo
                    ? new Date(e.prazo + "T12:00:00").toLocaleDateString(
                        "pt-BR",
                      )
                    : "Prazo a definir"}
                </small>
              </span>
            </label>
          ))}
        </>
      )}
      <div className="actions">
        <button className="secondary" onClick={() => onEditar(m.id)}>
          Editar SMART
        </button>
        <button className="text danger" onClick={() => onExcluir(m.id)}>
          Excluir meta
        </button>
      </div>
    </article>
  );
}
