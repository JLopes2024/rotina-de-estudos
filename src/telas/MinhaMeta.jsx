import { useState } from 'react';

import {
  buscarMeta,
  categoriasMetas,
  metas,
} from '../dados/metas';

import './MinhaMeta.css';

const opcoesHorizonte = [
  ['curto', 'Curto prazo'],
  ['medio', 'Médio prazo'],
  ['longo', 'Longo prazo'],
];

function MinhaMeta({ meta, onAlterar }) {
  const [categoria, setCategoria] = useState('Todas');

  const sugestoes = metas.filter(
    (item) =>
      categoria === 'Todas' ||
      item.categoria === categoria,
  );

  const referencia = buscarMeta(meta.sugestaoId);

  function usarSugestao(sugestao) {
    const temTexto = Boolean(meta.descricao.trim());

    if (
      temTexto &&
      meta.descricao !== sugestao.descricao &&
      !window.confirm(
        'Usar esta sugestão substituirá o texto da sua meta. Deseja continuar?',
      )
    ) {
      return;
    }

    onAlterar('descricao', sugestao.descricao);
    onAlterar('sugestaoId', sugestao.id);
  }

  return (
    <div className="tela-meta">
      <span className="etiqueta">Escolha seu destino</span>

      <h1 id="titulo-tela">Qual é sua meta?</h1>

      <p>
        Você pode escrever sua própria meta ou usar
        uma sugestão como ponto de partida.
      </p>

      <details className="banco-metas">
        <summary>Explorar sugestões de metas</summary>

        <label className="campo">
          <span>Escolha um interesse</span>

          <select
            value={categoria}
            onChange={(evento) =>
              setCategoria(evento.target.value)
            }
          >
            <option value="Todas">Todos os interesses</option>

            {categoriasMetas.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="lista-metas">
          {sugestoes.map((sugestao) => (
            <article
              key={sugestao.id}
              className={
                `cartao-meta ${
                  meta.sugestaoId === sugestao.id
                    ? 'meta-selecionada'
                    : ''
                }`
              }
            >
              <span className="categoria-meta">
                {sugestao.categoria}
              </span>

              <h3>{sugestao.titulo}</h3>
              <p>{sugestao.descricao}</p>

              <p className="primeiro-passo">
                <strong>Um primeiro passo:</strong>
                {' '}
                {sugestao.primeiroPasso}
              </p>

              <button
                type="button"
                className="secundario"
                onClick={() => usarSugestao(sugestao)}
              >
                Usar esta sugestão
              </button>
            </article>
          ))}
        </div>
      </details>

      <label className="campo">
        <span>O que você deseja alcançar?</span>

        <textarea
          required
          rows={4}
          value={meta.descricao}
          placeholder="Escreva uma meta que faça sentido para você."
          onChange={(evento) =>
            onAlterar('descricao', evento.target.value)
          }
        />
      </label>

      {referencia && (
        <aside className="referencia-meta">
          <strong>
            Inspiração: {referencia.titulo}
          </strong>

          <p>
            Edite a meta para sua realidade. Nas etapas SMART,
            você poderá consultar exemplos relacionados
            a essa sugestão.
          </p>

          <button
            type="button"
            className="botao-texto"
            onClick={() => onAlterar('sugestaoId', '')}
          >
            Deixar de usar esta referência
          </button>
        </aside>
      )}

      <fieldset>
        <legend>Qual é o horizonte dessa meta?</legend>

        {opcoesHorizonte.map(([valor, texto]) => (
          <label className="checkbox" key={valor}>
            <input
              required
              type="radio"
              name="horizonte"
              value={valor}
              checked={meta.horizonte === valor}
              onChange={() =>
                onAlterar('horizonte', valor)
              }
            />

            {texto}
          </label>
        ))}
      </fieldset>

      <p>
        Você definirá o prazo concreto na etapa T do SMART.
      </p>
    </div>
  );
}

export default MinhaMeta;