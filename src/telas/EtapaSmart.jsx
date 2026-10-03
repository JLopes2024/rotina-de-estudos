import {
  etapasSmart,
  formatarDuracao,
  duracaoEstudo,
} from '../utils/plano';

import { buscarMeta } from '../dados/metas';

import './EtapaSmart.css';

function EtapaSmart({
  etapa,
  valor,
  plano,
  onAlterar,
}) {
  const horarios = plano.rotina.estudos.filter(
    (estudo) => estudo.ativo,
  );

  const totalMinutos = horarios.reduce(
    (total, estudo) => total + duracaoEstudo(estudo),
    0,
  );

  const atual = etapasSmart.findIndex(
    (item) => item.letra === etapa.letra,
  );

  const referencia = buscarMeta(plano.meta.sugestaoId);

  const exemplo =
    referencia?.exemplosSmart[etapa.letra] ??
    etapa.exemplo;

  return (
    <div className="tela-smart">
      <ol
        className="smart-indicador"
        aria-label="Etapas SMART"
      >
        {etapasSmart.map((item, indice) => (
          <li
            key={item.letra}
            className={
              indice === atual
                ? 'atual'
                : indice < atual
                  ? 'anterior'
                  : ''
            }
            aria-current={
              indice === atual ? 'step' : undefined
            }
            aria-label={`${item.letra} — ${item.titulo}`}
          >
            {item.letra}
          </li>
        ))}
      </ol>

      <span className="etiqueta">Construindo sua meta</span>

      <h1 id="titulo-tela">
        {etapa.letra} — {etapa.titulo}
      </h1>

      <p className="pergunta">{etapa.pergunta}</p>

      <aside className="contexto">
        <strong>Sua meta</strong>

        <p className="resposta">
          {plano.meta.descricao}
        </p>

        <details>
          <summary>
            Minha rotina · {formatarDuracao(totalMinutos)}
            {' por semana'}
          </summary>

          {horarios.length > 0 ? (
            <ul>
              {horarios.map((estudo) => (
                <li key={estudo.dia}>
                  <strong>{estudo.dia}</strong>
                  {': '}
                  {estudo.inicio}
                  {' às '}
                  {estudo.fim}

                  {estudo.atividade &&
                    ` — ${estudo.atividade}`}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Volte à rotina para reservar seus horários.
            </p>
          )}
        </details>
      </aside>

      <label
        className="campo"
        htmlFor={`resposta-${etapa.letra}`}
      >
        <span>Sua resposta</span>

        <textarea
          id={`resposta-${etapa.letra}`}
          required
          rows={6}
          value={valor}
          aria-describedby={`ajuda-${etapa.letra}`}
          onChange={(evento) =>
            onAlterar(etapa.letra, evento.target.value)
          }
          placeholder="Escreva com suas próprias palavras..."
        />
      </label>

      <p
        id={`ajuda-${etapa.letra}`}
        className="nota"
      >
        {etapa.ajuda}
      </p>

      <details className="exemplo">
        <summary>
          {referencia
            ? `Ver exemplo: ${referencia.titulo}`
            : 'Ver um exemplo'}
        </summary>

        <p>{exemplo}</p>

        <small>
          Use como inspiração. Adapte o conteúdo,
          as quantidades e os prazos à sua realidade.
        </small>
      </details>
    </div>
  );
}

export default EtapaSmart;