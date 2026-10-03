import {
  compromissos,
  duracaoEstudo,
  formatarDuracao,
  horizontes,
  validarMeta,
  validarRotina,
} from '../utils/plano';

import './Resumo.css';

function Resumo({ plano, etapas, onEditar }) {
  const estudos = plano.rotina.estudos.filter(
    (estudo) => estudo.ativo,
  );

  const totalMinutos = estudos.reduce(
    (total, estudo) => total + duracaoEstudo(estudo),
    0,
  );

  const totalSmart = etapas.filter(
    (etapa) => plano.smart[etapa.letra].trim(),
  ).length;

  const completo =
    validarRotina(plano.rotina).length === 0 &&
    validarMeta(plano.meta).length === 0 &&
    totalSmart === etapas.length;

  return (
    <div className="tela-resumo">
      <span className="etiqueta">
        {completo
          ? 'Seu caminho está organizado'
          : 'Plano em construção'}
      </span>

      <h1 id="titulo-tela">
        Meu plano de estudos
      </h1>

      <p className="introducao-resumo">
        Revise suas escolhas e ajuste o plano sempre
        que sua realidade mudar.
      </p>

      {!completo && (
        <p className="aviso-plano">
          Há etapas pendentes. Você pode editar seu plano
          ou guardar uma cópia do que já preencheu.
        </p>
      )}

      <section
        className="meta-resumo"
        aria-labelledby="meta-resumo"
      >
        <div className="titulo-secao">
          <h2 id="meta-resumo">Minha meta</h2>

          <BotaoEditar
            onClick={() => onEditar(2)}
            rotulo="Editar minha meta"
          />
        </div>

        <p className="resposta meta-descricao">
          {plano.meta.descricao.trim() ||
            'Meta ainda não definida.'}
        </p>

        <span className="selo">
          {horizontes[plano.meta.horizonte] ||
            'Prazo a definir'}
        </span>
      </section>

      <div className="numeros-resumo">
        <article>
          <strong>{estudos.length}</strong>
          <span>dias reservados na semana</span>
        </article>

        <article>
          <strong>
            {formatarDuracao(totalMinutos)}
          </strong>
          <span>de estudo por semana</span>
        </article>

        <article>
          <strong>{totalSmart}/5</strong>
          <span>etapas SMART preenchidas</span>
        </article>
      </div>

      <section aria-labelledby="agenda-resumo">
        <div className="titulo-secao">
          <h2 id="agenda-resumo">
            Minha semana de estudos
          </h2>

          <BotaoEditar
            onClick={() => onEditar(1)}
            rotulo="Editar horários de estudo"
          />
        </div>

        {estudos.length > 0 ? (
          <div
            className="tabela-container"
            tabIndex={0}
            role="region"
            aria-label="Agenda semanal de estudos"
          >
            <table>
              <caption className="somente-leitor">
                Dias, horários e atividades de estudo
              </caption>

              <thead>
                <tr>
                  <th scope="col">Dia</th>
                  <th scope="col">Horário</th>
                  <th scope="col">Atividade</th>
                </tr>
              </thead>

              <tbody>
                {estudos.map((estudo) => (
                  <tr key={estudo.dia}>
                    <th scope="row">
                      {estudo.dia}
                    </th>

                    <td>
                      {estudo.inicio || '—'}
                      {' às '}
                      {estudo.fim || '—'}
                    </td>

                    <td>
                      {estudo.atividade.trim() ||
                        'A definir'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="nota">
            Nenhum horário reservado ainda.
          </p>
        )}
      </section>

      <section aria-labelledby="compromissos-resumo">
        <div className="titulo-secao">
          <h2 id="compromissos-resumo">
            O que meu plano considera
          </h2>

          <BotaoEditar
            onClick={() => onEditar(1)}
            rotulo="Editar meus compromissos"
          />
        </div>

        <dl className="compromissos-resumo">
          {compromissos.map(([campo, titulo]) => (
            <div key={campo}>
              <dt>{titulo}</dt>

              <dd className="resposta">
                {plano.rotina[campo].trim() ||
                  'Não informado.'}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="smart-resumo">
        <h2 id="smart-resumo">Meu SMART</h2>

        <div className="smart-resumo">
          {etapas.map((etapa, indice) => (
            <article
              className="cartao-smart"
              key={etapa.letra}
            >
              <span
                className="letra-smart"
                aria-hidden="true"
              >
                {etapa.letra}
              </span>

              <div>
                <div className="titulo-secao">
                  <h3>{etapa.titulo}</h3>

                  <BotaoEditar
                    onClick={() =>
                      onEditar(indice + 4)
                    }
                    rotulo={`Editar ${etapa.titulo}`}
                  />
                </div>

                <p className="resposta">
                  {plano.smart[etapa.letra].trim() ||
                    'Resposta ainda não preenchida.'}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="lembrete-resumo">
        <strong>
          Seu plano pode mudar com você.
        </strong>

        <p>
          Revise o que funcionou, reconheça seus avanços
          e ajuste o que ficou difícil de cumprir.
        </p>
      </aside>

      <div className="acoes">
        <button
          type="button"
          className="secundario"
          onClick={() => onEditar(1)}
        >
          Revisar desde o início
        </button>

        <button
          type="button"
          onClick={() => window.print()}
        >
          Salvar PDF / imprimir
        </button>
      </div>

      <p className="nota instrucao-pdf">
        Na janela de impressão, escolha “Salvar como PDF”.
        Para usar apenas o layout do plano, desative
        os cabeçalhos e rodapés do navegador.
      </p>
    </div>
  );
}

function BotaoEditar({
  onClick,
  rotulo = 'Editar',
}) {
  return (
    <button
      type="button"
      className="botao-texto editar"
      onClick={onClick}
      aria-label={rotulo}
    >
      Editar
    </button>
  );
}

export default Resumo;