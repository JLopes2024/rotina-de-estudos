import { useState } from 'react';

import {
  gerarSugestoes,
  sugestaoDisponivel,
} from '../utils/sugestoes';

import './SugestoesEstudo.css';

function SugestoesEstudo({ rotina, onAlterarEstudo }) {
  const [preferencias, setPreferencias] = useState({
    duracao: '30',
    frequencia: '2',
    periodo: 'qualquer',
    margem: '30',
    refeicoes: true,
  });

  const [sugestoes, setSugestoes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erros, setErros] = useState([]);
  const [rodada, setRodada] = useState(0);

  function alterarPreferencia(campo, valor) {
    setPreferencias((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setSugestoes([]);
    setMensagem('');
    setErros([]);
    setRodada(0);
  }

  function gerar(proximaRodada = 0) {
    const resultado = gerarSugestoes(
      rotina,
      preferencias,
      proximaRodada,
    );

    setSugestoes(resultado.sugestoes);
    setMensagem(resultado.mensagem);
    setErros(resultado.erros);
    setRodada(proximaRodada);
  }

  function aceitar(sugestao) {
    // Confere novamente caso a rotina tenha sido editada.
    if (
      !sugestaoDisponivel(
        rotina,
        preferencias,
        sugestao,
      )
    ) {
      setSugestoes([]);
      setMensagem(
        'Sua rotina mudou ou esse dia já foi reservado. Gere novas sugestões.',
      );
      return;
    }

    const indice = rotina.estudos.findIndex(
      (item) => item.dia === sugestao.dia,
    );

    if (indice === -1) return;

    onAlterarEstudo(indice, 'inicio', sugestao.inicio);
    onAlterarEstudo(indice, 'fim', sugestao.fim);
    onAlterarEstudo(indice, 'ativo', true);

    setSugestoes((atuais) =>
      atuais.filter((item) => item.dia !== sugestao.dia),
    );

    setMensagem(
      `${sugestao.dia}, das ${sugestao.inicio} às ${sugestao.fim}, adicionado ao seu plano. Você pode ajustar nos campos abaixo.`,
    );
  }

  return (
    <section
      className="assistente-estudos"
      aria-labelledby="titulo-assistente"
    >
      <span className="etiqueta">Uma ajuda para encontrar espaço</span>

      <h3 id="titulo-assistente">
        Quer sugestões de horários?
      </h3>

      <p>
        Escolha suas preferências. Você decide quais sugestões
        aceitar, e seus horários atuais serão mantidos.
      </p>

      <div className="preferencias-estudo">
        <label className="campo">
          <span>Tempo por sessão</span>

          <select
            value={preferencias.duracao}
            onChange={(evento) =>
              alterarPreferencia(
                'duracao',
                evento.target.value,
              )
            }
          >
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">1 hora</option>
          </select>
        </label>

        <label className="campo">
          <span>Quantos dias por semana, no total?</span>

          <select
            value={preferencias.frequencia}
            onChange={(evento) =>
              alterarPreferencia(
                'frequencia',
                evento.target.value,
              )
            }
          >
            {[1, 2, 3, 4, 5, 6, 7].map((quantidade) => (
              <option key={quantidade} value={quantidade}>
                {quantidade} {quantidade === 1 ? 'dia' : 'dias'}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Período preferido</span>

          <select
            value={preferencias.periodo}
            onChange={(evento) =>
              alterarPreferencia(
                'periodo',
                evento.target.value,
              )
            }
          >
            <option value="qualquer">
              Sem preferência · 08h às 22h
            </option>

            <option value="manha">
              Manhã · 08h às 12h
            </option>

            <option value="tarde">
              Tarde · 13h às 18h
            </option>

            <option value="noite">
              Noite · 18h às 22h
            </option>
          </select>
        </label>

        <label className="campo">
          <span>Intervalo ao redor dos compromissos</span>

          <select
            value={preferencias.margem}
            onChange={(evento) =>
              alterarPreferencia(
                'margem',
                evento.target.value,
              )
            }
          >
            <option value="0">Sem intervalo adicional</option>
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">1 hora</option>
          </select>
        </label>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={preferencias.refeicoes}
          onChange={(evento) =>
            alterarPreferencia(
              'refeicoes',
              evento.target.checked,
            )
          }
        />

        Evitar 12h às 13h e 19h às 20h para refeições
      </label>

      <p className="nota">
        Se você faz refeições em outros horários, desmarque
        essa opção e registre os períodos em “Outros compromissos”.
        Inclua também pausas e lazer que deseja preservar.
      </p>

      <button type="button" onClick={() => gerar(0)}>
        Encontrar horários livres
      </button>

      {mensagem && (
        <p className="resultado-assistente" role="status">
          {mensagem}
        </p>
      )}

      {erros.length > 0 && (
        <ul className="pendencias-assistente">
          {erros.map((erro) => (
            <li key={erro}>{erro}</li>
          ))}
        </ul>
      )}

      {sugestoes.length > 0 && (
        <>
          <div className="lista-sugestoes">
            {sugestoes.map((sugestao) => (
              <article
                className="sugestao-estudo"
                key={sugestao.dia}
              >
                <div>
                  <strong>{sugestao.dia}</strong>

                  <span className="horario-sugerido">
                    {sugestao.inicio} às {sugestao.fim}
                  </span>

                  <small>
                    Sem conflito com os períodos registrados
                    e respeitando suas preferências.
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => aceitar(sugestao)}
                  aria-label={
                    `Aceitar estudo na ${sugestao.dia}, ` +
                    `das ${sugestao.inicio} às ${sugestao.fim}`
                  }
                >
                  Aceitar
                </button>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="botao-texto"
            onClick={() => gerar(rodada + 1)}
          >
            Buscar outras opções
          </button>
        </>
      )}
    </section>
  );
}

export default SugestoesEstudo;