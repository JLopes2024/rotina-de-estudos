import { horarios } from "../utils/modelo";
import "./Compromisso.css";
export default function Compromisso({ titulo, c, onChange, remover }) {
  const alterar = (k, v) => onChange({ ...c, [k]: v });
  const hs = horarios(c);
  return (
    <section className="compromisso">
      <div className="section-head">
        <h3>{titulo}</h3>
        {remover && (
          <button type="button" className="text danger" onClick={remover}>
            Remover
          </button>
        )}
      </div>
      <fieldset>
        <legend>Dias da semana</legend>
        <div className="days">
          {c.dias.map((d, i) => (
            <label key={d.dia} className={d.ativo ? "selected" : ""}>
              <input
                type="checkbox"
                checked={d.ativo}
                onChange={() =>
                  alterar(
                    "dias",
                    c.dias.map((x, j) =>
                      j === i ? { ...x, ativo: !x.ativo } : x,
                    ),
                  )
                }
              />
              <span>{d.dia.slice(0, 3)}</span>
              <span className="sr">{d.dia}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          className="text"
          onClick={() =>
            alterar(
              "dias",
              c.dias.map((d, i) => ({ ...d, ativo: i < 5 })),
            )
          }
        >
          Selecionar segunda a sexta
        </button>
      </fieldset>
      {hs.length > 0 && (
        <>
          <label className="check">
            <input
              type="checkbox"
              checked={c.uniforme}
              onChange={(e) =>
                onChange({
                  ...c,
                  uniforme: e.target.checked,
                  dias: c.dias.map((d) => ({
                    ...d,
                    inicio: d.inicio || c.inicio,
                    fim: d.fim || c.fim,
                  })),
                })
              }
            />
            Mesmo horário nos dias selecionados
          </label>
          {c.uniforme ? (
            <div className="grid two">
              <label>
                Entrada
                <input
                  type="time"
                  value={c.inicio}
                  onChange={(e) => alterar("inicio", e.target.value)}
                />
              </label>
              <label>
                Saída
                <input
                  type="time"
                  value={c.fim}
                  onChange={(e) => alterar("fim", e.target.value)}
                />
              </label>
            </div>
          ) : (
            hs.map((d) => (
              <fieldset key={d.dia}>
                <legend>{d.dia}</legend>
                <div className="grid two">
                  {["inicio", "fim"].map((k) => (
                    <label key={k}>
                      {k === "inicio" ? "Entrada" : "Saída"}
                      <input
                        type="time"
                        value={d[k]}
                        onChange={(e) =>
                          alterar(
                            "dias",
                            c.dias.map((x) =>
                              x.dia === d.dia
                                ? { ...x, [k]: e.target.value }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))
          )}
        </>
      )}
      <label className="check">
        <input
          type="checkbox"
          checked={c.remoto}
          onChange={(e) => alterar("remoto", e.target.checked)}
        />
        Não preciso me deslocar para este compromisso
      </label>
      {!c.remoto && (
        <div className="grid two">
          <label>
            Ida (minutos)
            <input
              type="number"
              min="0"
              max="1440"
              step="1"
              placeholder="0 se não houver"
              value={c.ida}
              onChange={(e) => alterar("ida", e.target.value)}
            />
          </label>
          <label>
            Volta (minutos)
            <input
              type="number"
              min="0"
              max="1440"
              step="1"
              placeholder="0 se não houver"
              value={c.volta}
              onChange={(e) => alterar("volta", e.target.value)}
            />
          </label>
        </div>
      )}
      {hs.length > 0 && (
        <p className="hint">
          {hs
            .map((d) => `${d.dia}: ${d.inicio || "—"} às ${d.fim || "—"}`)
            .join(" · ")}
        </p>
      )}
    </section>
  );
}
