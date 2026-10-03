import { useState } from "react";
import { sugerir, uid, validarEstudo } from "../utils/modelo";
import "./SugestoesEstudo.css";
export default function SugestoesEstudo({ rotina, metas, onAdd }) {
  const [p, setP] = useState({
    duracao: 30,
    quantidade: 2,
    periodo: "qualquer",
    margem: 30,
    refeicoes: true,
    metaId: "",
  });
  const [r, setR] = useState({ sugestoes: [], mensagem: "", erros: [] });
  const [rodada, setRodada] = useState(0);
  const change = (k, v) => {
    setP({ ...p, [k]: v });
    setR({ sugestoes: [], mensagem: "", erros: [] });
    setRodada(0);
  };
  function gerar(n = 0) {
    if (!metas.some((m) => m.id === p.metaId)) {
      setR({
        sugestoes: [],
        mensagem: "Escolha a meta que deseja estudar.",
        erros: [],
      });
      return;
    }
    setR(sugerir(rotina, p, n));
    setRodada(n);
  }
  function aceitar(s) {
    const novo = { ...s, id: uid(), metaId: p.metaId, atividade: "" };
    const disponibilidade = sugerir(rotina, { ...p, quantidade: 1 });
    const erros = validarEstudo(novo, rotina, metas);
    if (disponibilidade.erros.length || erros.length) {
      setR({
        sugestoes: [],
        mensagem: "Sua rotina mudou. Confira os horários e gere novamente.",
        erros,
      });
      return;
    }
    onAdd(novo);
    setR({
      ...r,
      sugestoes: r.sugestoes.filter((x) => x.dia !== s.dia),
      mensagem: `${s.dia}, ${s.inicio} às ${s.fim}, adicionado. Confira nos períodos de estudo abaixo.`,
    });
  }
  return (
    <section className="suggestions">
      <span className="eyebrow">Sugestões opcionais</span>
      <h3>Onde posso encaixar meus estudos?</h3>
      <p>
        As sugestões respeitam os compromissos, deslocamentos, sono e estudos já
        cadastrados.
      </p>
      <div className="grid two">
        <label>
          Meta
          <select
            aria-label="Meta"
            value={p.metaId}
            onChange={(e) => change("metaId", e.target.value)}
          >
            <option value="">Escolha uma meta</option>
            {metas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.descricao || "Meta em construção"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Duração
          <select
            aria-label="Duração"
            value={p.duracao}
            onChange={(e) => change("duracao", Number(e.target.value))}
          >
            {[15, 30, 45, 60].map((n) => (
              <option key={n} value={n}>
                {n} minutos
              </option>
            ))}
          </select>
        </label>
        <label>
          Novos períodos nesta busca
          <select
            aria-label="Novos períodos nesta busca"
            value={p.quantidade}
            onChange={(e) => change("quantidade", Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Período
          <select
            aria-label="Período"
            value={p.periodo}
            onChange={(e) => change("periodo", e.target.value)}
          >
            <option value="qualquer">Sem preferência · 08h–22h</option>
            <option value="manha">Manhã · 08h–12h</option>
            <option value="tarde">Tarde · 13h–18h</option>
            <option value="noite">Noite · 18h–22h</option>
          </select>
        </label>
        <label>
          Intervalo ao redor dos compromissos
          <select
            aria-label="Intervalo ao redor dos compromissos"
            value={p.margem}
            onChange={(e) => change("margem", Number(e.target.value))}
          >
            {[0, 15, 30, 45, 60].map((n) => (
              <option key={n} value={n}>
                {n} minutos
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={p.refeicoes}
          onChange={(e) => change("refeicoes", e.target.checked)}
        />
        Evitar 12h–13h e 19h–20h para refeições
      </label>
      <p className="hint">
        Se suas refeições têm outros horários, desmarque a opção e cadastre-as
        como compromissos. Tempo sem compromisso registrado não garante
        disponibilidade.
      </p>
      <button type="button" onClick={() => gerar()}>
        Encontrar horários
      </button>
      {r.mensagem && (
        <p role="status" className="notice">
          {r.mensagem}
        </p>
      )}
      {!!r.erros.length && (
        <ul className="error">
          {r.erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <div className="suggestion-list">
        {r.sugestoes.map((s) => (
          <article key={s.dia}>
            <div>
              <strong>{s.dia}</strong>
              <b>
                {s.inicio} às {s.fim}
              </b>
            </div>
            <button type="button" className="lime" onClick={() => aceitar(s)}>
              Aceitar
            </button>
          </article>
        ))}
      </div>
      {!!r.sugestoes.length && (
        <button
          type="button"
          className="text"
          onClick={() => gerar(rodada + 1)}
        >
          Buscar outras opções
        </button>
      )}
    </section>
  );
}
