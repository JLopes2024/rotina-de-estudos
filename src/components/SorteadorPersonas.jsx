import { useState } from "react";
import { PERSONAS } from "../dados/personas";
import "./SorteadorPersonas.css";

const CHAVE = "portas-amanha:personas-sorteadas:v1";

function lerHistorico() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");

    if (!Array.isArray(salvo)) return [];

    const idsValidos = PERSONAS.map((persona) => persona.id);

    return [...new Set(salvo)].filter((id) =>
      idsValidos.includes(id),
    );
  } catch {
    return [];
  }
}

export default function SorteadorPersonas({
  onIniciar,
  onVoltar,
}) {
  const [historico, setHistorico] = useState(lerHistorico);
  const [sorteada, setSorteada] = useState(null);
  const [aviso, setAviso] = useState("");

  function sortear() {
    // Quando todas já saíram, começa uma nova rodada.
    const novaRodada = historico.length >= PERSONAS.length;
    const usados = novaRodada ? [] : historico;

    const disponiveis = PERSONAS.filter(
      (persona) => !usados.includes(persona.id),
    );

    const indice = Math.floor(
      Math.random() * disponiveis.length,
    );

    const escolhida = disponiveis[indice];
    const atualizado = [...usados, escolhida.id];

    setSorteada(escolhida);
    setHistorico(atualizado);

    let mensagem = novaRodada
      ? "Todas as personas já saíram. Uma nova rodada começou."
      : "";

    try {
      localStorage.setItem(CHAVE, JSON.stringify(atualizado));
    } catch {
      mensagem +=
        " O histórico está funcionando apenas enquanto esta tela estiver aberta, pois não foi possível salvá-lo.";
    }

    setAviso(mensagem.trim());
  }

  return (
    <section className="personas">
      <span className="personas-tag">Dinâmica em grupo</span>

      <h1>Qual caminho seu grupo vai planejar?</h1>

      <p>
        Sorteie uma pessoa fictícia. Conheça sua realidade e
        construa um plano de estudos possível.
      </p>

      <div className="personas-explicacao">
        <strong>Como funciona</strong>

        <p>
          São seis personas. Neste aparelho, cada uma aparece
          uma vez por rodada. Em aparelhos diferentes, os
          sorteios são independentes.
        </p>

        <p>
          Não existe uma única resposta correta. O desafio é
          justificar as escolhas e respeitar os compromissos,
          os recursos e o descanso da personagem.
        </p>
      </div>

      <div className="actions">
        <button onClick={sortear}>
          {sorteada ? "Sortear outra persona" : "Sortear persona"}
        </button>

        <button className="secondary" onClick={onVoltar}>
          Voltar
        </button>
      </div>

      <p className="personas-contagem">
        {historico.length} de {PERSONAS.length} personas
        sorteadas nesta rodada.
      </p>

      {aviso && (
        <p className="notice" role="status">
          {aviso}
        </p>
      )}

      <div aria-live="polite" aria-atomic="true">
        {sorteada && (
          <article className="persona-card">
            <header className="persona-card-header">
              <span
                className="persona-avatar"
                aria-hidden="true"
              >
                {sorteada.nome.charAt(0)}
              </span>

              <div>
                <h2>
                  {sorteada.nome}, {sorteada.idade} anos
                </h2>

                <p>{sorteada.perfil}</p>
              </div>
            </header>

            <p>{sorteada.historia}</p>

            <div className="persona-tags">
              {sorteada.interesses.map((interesse) => (
                <span key={interesse}>{interesse}</span>
              ))}
            </div>

            <div className="persona-info-grid">
              <section>
                <h3>Pontos fortes</h3>
                <p>{sorteada.pontosFortes.join(" • ")}</p>
              </section>

              <section>
                <h3>Recursos disponíveis</h3>
                <p>{sorteada.recursos}</p>
              </section>

              <section>
                <h3>Quem pode ajudar?</h3>
                <p>{sorteada.apoio}</p>
              </section>

              <section>
                <h3>Compromissos fixos</h3>
                <ul>
                  <li>
                    Empresa: segunda a quinta, das 8h às 12h.
                  </li>
                  <li>
                    Formação: sexta-feira, das 8h às 12h.
                  </li>
                  <li>
                    Deslocamento de trabalho/formação:{" "}
                    {sorteada.deslocamento} minutos por trecho.
                  </li>
                  <li>
                    Sono: {sorteada.sonoInicio} às{" "}
                    {sorteada.sonoFim}.
                  </li>

                  {sorteada.escola ? (
                    <li>
                      {sorteada.escola.nome}:{" "}
                      {sorteada.escola.dias.join(", ")}, das{" "}
                      {sorteada.escola.inicio} às{" "}
                      {sorteada.escola.fim}. Deslocamento:{" "}
                      {sorteada.escola.deslocamento} minutos
                      por trecho.
                    </li>
                  ) : (
                    <li>
                      Não está matriculado em um curso atualmente.
                    </li>
                  )}

                  {sorteada.outros.map((item) => (
                    <li key={item.nome}>
                      {item.nome}: {item.dias.join(", ")},
                      das {item.inicio} às {item.fim}.
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="persona-desafio">
              <h3>Missão do grupo</h3>
              <p>{sorteada.desafio}</p>
              <strong>{sorteada.reflexao}</strong>
            </section>

            <p className="persona-observacao">
              A rotina já virá preenchida. O grupo escolherá
              as metas, preencherá o SMART e reservará os
              períodos de estudo. A simulação dura enquanto
              esta página estiver aberta; exporte o JSON ou
              salve o PDF para guardar o resultado.
            </p>

            <button
              className="lime"
              onClick={() => onIniciar(sorteada)}
            >
              Planejar o caminho de {sorteada.nome}
            </button>
          </article>
        )}
      </div>
    </section>
  );
}