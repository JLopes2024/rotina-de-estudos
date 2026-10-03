import SugestoesEstudo from '../components/SugestoesEstudo';

import {
  DIAS,
  conflitosEstudos,
  criarCompromisso,
  horariosSelecionados,
  normalizarAgenda,
} from '../utils/rotina';

import './MinhaRotina.css';

function MinhaRotina({
  rotina,
  onAlterar,
  onAlterarEstudo,
}) {
  const agenda =
    rotina.agenda ?? normalizarAgenda(null, rotina);

  const conflitos = conflitosEstudos({
    ...rotina,
    agenda,
  });

  function alterarAgenda(campo, valor) {
    onAlterar('agenda', {
      ...agenda,
      [campo]: valor,
    });
  }

  function alterarOutro(indice, valor) {
    alterarAgenda(
      'outros',
      agenda.outros.map((item, posicao) =>
        posicao === indice ? valor : item,
      ),
    );
  }

  function adicionarOutro() {
    alterarAgenda('outros', [
      ...agenda.outros,
      criarCompromisso(),
    ]);
  }

  function removerOutro(indice) {
    alterarAgenda(
      'outros',
      agenda.outros.filter(
        (_, posicao) => posicao !== indice,
      ),
    );
  }

  const notas = Object.entries(
    agenda.notasAnteriores ?? {},
  );

  return (
    <div className="tela-rotina">
      <span className="etiqueta">
        Primeiro, sua realidade
      </span>

      <h1 id="titulo-tela">
        Vamos organizar sua semana?
      </h1>

      <p>
        Selecione os dias e horários dos seus compromissos.
        Depois, reserve um período possível para estudar.
      </p>

      {notas.length > 0 && (
        <details className="rotina-anterior">
          <summary>
            Consultar minhas anotações anteriores
          </summary>

          <p>
            Use suas anotações como referência para
            preencher os novos campos.
          </p>

          {notas.map(([campo, valor]) => (
            <p className="resposta" key={campo}>
              <strong>{campo}: </strong>
              {valor}
            </p>
          ))}
        </details>
      )}

      <CartaoCompromisso
        id="empresa"
        titulo="Empresa"
        descricao="Selecione somente os dias em que vai à empresa."
        compromisso={agenda.empresa}
        onAlterar={(valor) =>
          alterarAgenda('empresa', valor)
        }
      />

      <CartaoCompromisso
        id="formacao"
        titulo="Formação de aprendizagem"
        descricao="Registre separadamente seus encontros de formação."
        compromisso={agenda.formacao}
        onAlterar={(valor) =>
          alterarAgenda('formacao', valor)
        }
      />

      <section className="bloco-rotina">
        <h2>Escola ou faculdade</h2>

        <fieldset className="opcoes-escola">
          <legend>Você estuda atualmente?</legend>

          {[
            ['sim', 'Sim'],
            ['nao', 'Não estudo atualmente'],
          ].map(([valor, rotulo]) => (
            <label className="checkbox" key={valor}>
              <input
                type="radio"
                name="estuda-atualmente"
                checked={
                  agenda.estudaAtualmente === valor
                }
                onChange={() =>
                  alterarAgenda(
                    'estudaAtualmente',
                    valor,
                  )
                }
              />

              {rotulo}
            </label>
          ))}
        </fieldset>

        {agenda.estudaAtualmente === 'sim' && (
          <CartaoCompromisso
            id="escola"
            titulo="Horários das aulas"
            descricao="Selecione os dias das suas aulas."
            compromisso={agenda.escola}
            onAlterar={(valor) =>
              alterarAgenda('escola', valor)
            }
          />
        )}
      </section>

      <section className="bloco-rotina">
        <h2>Deslocamento</h2>

        <p>
          Quanto tempo você costuma levar para ir e
          voltar dos compromissos? Informe em minutos.
        </p>

        <p className="nota">
          Exemplo: 1 hora e 30 minutos = 90 minutos.
          Use 0 se não houver deslocamento.
        </p>

        <div className="horarios">
          <label className="campo">
            <span>Tempo de ida</span>

            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="1"
              value={agenda.ida}
              placeholder="Ex.: 45"
              onChange={(evento) =>
                alterarAgenda(
                  'ida',
                  evento.target.value,
                )
              }
            />
          </label>

          <label className="campo">
            <span>Tempo de volta</span>

            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="1"
              value={agenda.volta}
              placeholder="Ex.: 60"
              onChange={(evento) =>
                alterarAgenda(
                  'volta',
                  evento.target.value,
                )
              }
            />
          </label>
        </div>

        <p className="nota">
          Nesta versão, esse tempo é reservado antes
          e depois de cada período de empresa,
          formação ou escola.
        </p>
      </section>

      <section className="bloco-rotina">
        <h2>Sono e descanso</h2>

        <p>
          Informe seu horário habitual de sono.
          Ele pode começar em um dia e terminar
          no seguinte.
        </p>

        <div className="horarios">
          <label className="campo">
            <span>Costumo dormir às</span>

            <input
              type="time"
              value={agenda.sonoInicio}
              onChange={(evento) =>
                alterarAgenda(
                  'sonoInicio',
                  evento.target.value,
                )
              }
            />
          </label>

          <label className="campo">
            <span>Costumo acordar às</span>

            <input
              type="time"
              value={agenda.sonoFim}
              onChange={(evento) =>
                alterarAgenda(
                  'sonoFim',
                  evento.target.value,
                )
              }
            />
          </label>
        </div>

        <p className="nota">
          Você também pode reservar lazer e descanso
          em “Outros compromissos”.
        </p>
      </section>

      <section className="bloco-rotina">
        <h2>Outros compromissos</h2>

        <p>
          Inclua esporte, tarefas de casa, família,
          refeições, lazer ou outros períodos que
          deseja reservar.
        </p>

        {agenda.outros.map((item, indice) => (
          <div
            className="outro-compromisso"
            key={indice}
          >
            <label className="campo">
              <span>
                Nome do compromisso {indice + 1}
              </span>

              <input
                type="text"
                value={item.nome}
                placeholder="Ex.: treino, almoço ou tarefas de casa."
                onChange={(evento) =>
                  alterarOutro(indice, {
                    ...item,
                    nome: evento.target.value,
                  })
                }
              />
            </label>

            <CartaoCompromisso
              id={`outro-${indice}`}
              titulo={
                item.nome ||
                `Compromisso ${indice + 1}`
              }
              compromisso={item}
              onAlterar={(valor) =>
                alterarOutro(indice, valor)
              }
            />

            <button
              type="button"
              className="botao-texto remover-compromisso"
              onClick={() => removerOutro(indice)}
            >
              Remover compromisso {indice + 1}
            </button>
          </div>
        ))}

        <button
          type="button"
          className="secundario"
          onClick={adicionarOutro}
        >
          + Adicionar compromisso
        </button>
      </section>

      <section className="bloco-rotina bloco-estudos">
        <span className="etiqueta">
          Agora, seu espaço de estudo
        </span>

        <h2>Quando você vai estudar?</h2>

        <p>
          Escolha pelo menos um dia. Os horários serão
          comparados com seus compromissos,
          deslocamento e sono.
        </p>

        <SugestoesEstudo
          rotina={{
            ...rotina,
            agenda,
          }}
          onAlterarEstudo={onAlterarEstudo}
        />

        <h3>Meus horários de estudo</h3>

        <p className="nota">
          Você pode preencher manualmente ou ajustar
          os horários que aceitou nas sugestões.
        </p>

        {rotina.estudos.map((estudo, indice) => (
          <fieldset key={estudo.dia}>
            <legend>{estudo.dia}</legend>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={estudo.ativo}
                onChange={(evento) =>
                  onAlterarEstudo(
                    indice,
                    'ativo',
                    evento.target.checked,
                  )
                }
              />

              Reservar um período de estudo
            </label>

            {estudo.ativo && (
              <>
                <div className="horarios">
                  <label className="campo">
                    <span>Início do estudo</span>

                    <input
                      type="time"
                      value={estudo.inicio}
                      onChange={(evento) =>
                        onAlterarEstudo(
                          indice,
                          'inicio',
                          evento.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="campo">
                    <span>Fim do estudo</span>

                    <input
                      type="time"
                      value={estudo.fim}
                      aria-invalid={
                        Boolean(
                          estudo.inicio &&
                            estudo.fim &&
                            estudo.fim <= estudo.inicio,
                        ) || undefined
                      }
                      onChange={(evento) =>
                        onAlterarEstudo(
                          indice,
                          'fim',
                          evento.target.value,
                        )
                      }
                    />
                  </label>
                </div>

                {estudo.inicio &&
                  estudo.fim &&
                  estudo.fim <= estudo.inicio && (
                    <p
                      className="erro-horario"
                      role="status"
                    >
                      O estudo precisa terminar depois
                      do início, no mesmo dia.
                    </p>
                  )}

                <label className="campo">
                  <span>
                    Atividade de estudo (opcional)
                  </span>

                  <input
                    type="text"
                    value={estudo.atividade}
                    placeholder="Ex.: praticar Excel."
                    onChange={(evento) =>
                      onAlterarEstudo(
                        indice,
                        'atividade',
                        evento.target.value,
                      )
                    }
                  />
                </label>
              </>
            )}
          </fieldset>
        ))}

        {conflitos.length > 0 && (
          <div
            className="conflitos-rotina"
            role="status"
          >
            <strong>
              Encontrei horários que coincidem:
            </strong>

            <ul>
              {conflitos.map((mensagem) => (
                <li key={mensagem}>
                  {mensagem}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <ResumoSemana
        agenda={agenda}
        estudos={rotina.estudos}
      />
    </div>
  );
}

function CartaoCompromisso({
  id,
  titulo,
  descricao,
  compromisso,
  onAlterar,
}) {
  const selecionados =
    horariosSelecionados(compromisso);

  function alterar(campo, valor) {
    onAlterar({
      ...compromisso,
      [campo]: valor,
    });
  }

  function alternarDia(indice) {
    alterar(
      'dias',
      compromisso.dias.map((item, posicao) =>
        posicao === indice
          ? {
              ...item,
              ativo: !item.ativo,
            }
          : item,
      ),
    );
  }

  function selecionarDiasUteis() {
    alterar(
      'dias',
      compromisso.dias.map((item, indice) => ({
        ...item,
        ativo: indice < 5,
      })),
    );
  }

  function mudarModo(uniforme) {
    onAlterar({
      ...compromisso,
      uniforme,

      dias: compromisso.dias.map((item) => ({
        ...item,
        inicio: item.inicio || compromisso.inicio,
        fim: item.fim || compromisso.fim,
      })),
    });
  }

  function alterarHorarioDia(dia, campo, valor) {
    alterar(
      'dias',
      compromisso.dias.map((item) =>
        item.dia === dia
          ? {
              ...item,
              [campo]: valor,
            }
          : item,
      ),
    );
  }

  return (
    <section className="cartao-compromisso">
      <h2>{titulo}</h2>

      {descricao && <p>{descricao}</p>}

      <fieldset className="seletor-dias">
        <legend>Dias da semana</legend>

        <div className="dias-semana">
          {compromisso.dias.map((item, indice) => (
            <label
              key={item.dia}
              className={
                `dia-opcao ${
                  item.ativo ? 'selecionado' : ''
                }`
              }
            >
              <input
                type="checkbox"
                checked={item.ativo}
                aria-label={item.dia}
                onChange={() => alternarDia(indice)}
              />

              <span>{item.dia.slice(0, 3)}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          className="botao-texto"
          onClick={selecionarDiasUteis}
        >
          Selecionar segunda a sexta
        </button>
      </fieldset>

      {selecionados.length > 0 && (
        <>
          <fieldset className="modo-horario">
            <legend>Como são os horários?</legend>

            <label className="checkbox">
              <input
                type="radio"
                name={`modo-${id}`}
                checked={compromisso.uniforme}
                onChange={() => mudarModo(true)}
              />

              Mesmo horário nos dias selecionados
            </label>

            <label className="checkbox">
              <input
                type="radio"
                name={`modo-${id}`}
                checked={!compromisso.uniforme}
                onChange={() => mudarModo(false)}
              />

              Horários diferentes por dia
            </label>
          </fieldset>

          {compromisso.uniforme ? (
            <CamposHorario
              inicio={compromisso.inicio}
              fim={compromisso.fim}
              onInicio={(valor) =>
                alterar('inicio', valor)
              }
              onFim={(valor) =>
                alterar('fim', valor)
              }
            />
          ) : (
            selecionados.map((dia) => (
              <fieldset
                className="horario-por-dia"
                key={dia.dia}
              >
                <legend>{dia.dia}</legend>

                <CamposHorario
                  inicio={dia.inicio}
                  fim={dia.fim}
                  onInicio={(valor) =>
                    alterarHorarioDia(
                      dia.dia,
                      'inicio',
                      valor,
                    )
                  }
                  onFim={(valor) =>
                    alterarHorarioDia(
                      dia.dia,
                      'fim',
                      valor,
                    )
                  }
                />
              </fieldset>
            ))
          )}

          <div className="confirmacao-horarios">
            <strong>Confira sua escolha:</strong>

            <ul>
              {selecionados.map((dia) => (
                <li key={dia.dia}>
                  {dia.dia}
                  {': '}
                  {dia.inicio || 'início a definir'}
                  {' às '}
                  {dia.fim || 'fim a definir'}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

function CamposHorario({
  inicio,
  fim,
  onInicio,
  onFim,
}) {
  const invalido = Boolean(
    inicio && fim && fim <= inicio,
  );

  return (
    <>
      <div className="horarios">
        <label className="campo">
          <span>Início / entrada</span>

          <input
            type="time"
            value={inicio}
            onChange={(evento) =>
              onInicio(evento.target.value)
            }
          />
        </label>

        <label className="campo">
          <span>Fim / saída</span>

          <input
            type="time"
            value={fim}
            aria-invalid={invalido || undefined}
            onChange={(evento) =>
              onFim(evento.target.value)
            }
          />
        </label>
      </div>

      {invalido && (
        <p className="erro-horario" role="status">
          O fim precisa ser depois do início,
          no mesmo dia.
        </p>
      )}
    </>
  );
}

function ResumoSemana({ agenda, estudos }) {
  const fontes = [
    ['Empresa', agenda.empresa],
    ['Formação', agenda.formacao],

    ...(agenda.estudaAtualmente === 'sim'
      ? [['Escola / faculdade', agenda.escola]]
      : []),

    ...agenda.outros.map((item) => [
      item.nome.trim() || 'Outro compromisso',
      item,
    ]),
  ];

  return (
    <section className="resumo-semana">
      <h2>Confira sua semana</h2>

      <p>
        Revise os dias e horários antes de avançar.
        O sono e o deslocamento também entram
        na verificação de conflitos.
      </p>

      <div className="semana-cartoes">
        {DIAS.map((dia) => {
          const itens = fontes.flatMap(
            ([nome, compromisso]) =>
              horariosSelecionados(compromisso)
                .filter((item) => item.dia === dia)
                .map((item) => ({
                  nome,
                  inicio: item.inicio,
                  fim: item.fim,
                })),
          );

          const estudo = estudos.find(
            (item) =>
              item.dia === dia && item.ativo,
          );

          if (estudo) {
            itens.push({
              nome: 'Estudo da meta',
              inicio: estudo.inicio,
              fim: estudo.fim,
              estudo: true,
            });
          }

          itens.sort((a, b) =>
            a.inicio.localeCompare(b.inicio),
          );

          return (
            <article
              className="dia-resumo"
              key={dia}
            >
              <h3>{dia}</h3>

              {itens.length > 0 ? (
                <ul>
                  {itens.map((item, indice) => (
                    <li
                      key={indice}
                      className={
                        item.estudo
                          ? 'item-estudo'
                          : ''
                      }
                    >
                      <strong>{item.nome}</strong>

                      <span>
                        {item.inicio || '—'}
                        {' às '}
                        {item.fim || '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  Nenhum compromisso diurno registrado.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default MinhaRotina;