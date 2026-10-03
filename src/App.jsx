import { useEffect, useRef, useState } from 'react';

import usePlano from './hooks/usePlano';

import Navegacao from './components/Navegacao';
import Inicio from './telas/Inicio';
import MinhaRotina from './telas/MinhaRotina';
import MinhaMeta from './telas/MinhaMeta';
import IntroducaoSmart from './telas/IntroducaoSmart';
import EtapaSmart from './telas/EtapaSmart';
import Resumo from './telas/Resumo';
import { resumirAgenda } from './utils/rotina';
import {
  criarPlanoVazio,
  etapasSmart,
  possuiPlano,
  telaParaContinuar,
  validarMeta,
  validarRotina,
} from './utils/plano';

import './App.css';

const nomesTelas = [
  'Início',
  'Minha rotina',
  'Minha meta',
  'Conheça o SMART',
  'Específica',
  'Mensurável',
  'Atingível',
  'Relevante',
  'Temporal',
  'Meu plano',
];

function App() {
  const [tela, setTela] = useState(0);
  const [erros, setErros] = useState([]);

  const painelRef = useRef(null);
  const errosRef = useRef(null);

  const {
    plano,
    setPlano,
    avisoSalvamento,
  } = usePlano();

  const temPlano = possuiPlano(plano);
  const indiceSmart = tela - 4;

  useEffect(() => {
    if (tela > 0) {
      painelRef.current?.focus();
    }
  }, [tela]);

  useEffect(() => {
    if (erros.length > 0) {
      errosRef.current?.focus();
    }
  }, [erros]);

  function navegar(destino) {
    setErros([]);
    setTela(destino);

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }

  function atualizarRotina(campo, valor) {
  setErros([]);

  setPlano((atual) => ({
    ...atual,
    rotina: {
      ...atual.rotina,

      ...(campo === 'agenda'
        ? {
            agenda: valor,
            ...resumirAgenda(valor),
          }
        : {
            [campo]: valor,
          }),
    },
  }));
}

  function atualizarEstudo(indice, campo, valor) {
    setErros([]);

    setPlano((atual) => ({
      ...atual,
      rotina: {
        ...atual.rotina,
        estudos: atual.rotina.estudos.map(
          (estudo, posicao) =>
            posicao === indice
              ? { ...estudo, [campo]: valor }
              : estudo,
        ),
      },
    }));
  }

  function atualizarMeta(campo, valor) {
    setErros([]);

    setPlano((atual) => ({
      ...atual,
      meta: {
        ...atual.meta,
        [campo]: valor,
      },
    }));
  }

  function atualizarSmart(letra, valor) {
    setErros([]);

    setPlano((atual) => ({
      ...atual,
      smart: {
        ...atual.smart,
        [letra]: valor,
      },
    }));
  }

  function avancar(evento) {
    evento.preventDefault();

    let novosErros = [];

    if (tela === 1) {
      novosErros = validarRotina(plano.rotina);
    }

    if (tela === 2) {
      novosErros = validarMeta(plano.meta);
    }

    if (tela >= 4 && tela <= 8) {
      const etapa = etapasSmart[indiceSmart];

      if (!plano.smart[etapa.letra].trim()) {
        novosErros = [
          `Preencha sua resposta em ${etapa.letra} — ${etapa.titulo}.`,
        ];
      }
    }

    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    navegar(Math.min(tela + 1, 9));
  }

  function criarNovoPlano() {
    const mensagem =
      'Criar um novo plano apagará as respostas atuais deste navegador. ' +
      'Se quiser guardá-las, salve o PDF antes. Deseja continuar?';

    if (temPlano && !window.confirm(mensagem)) {
      return;
    }

    setPlano(criarPlanoVazio());
    navegar(1);
  }

  const textoProximo =
    tela === 3
      ? 'Preencher SMART'
      : tela === 8
        ? 'Ver meu plano'
        : 'Próximo';

  return (
    <main className="app">
      <header className="cabecalho">
        <button
          type="button"
          className="marca"
          onClick={() => navegar(0)}
          aria-label="Meu caminho: voltar ao início"
        >
          <span className="marca-icone" aria-hidden="true">
            ↗
          </span>

          <span>
            <strong>Meu caminho</strong>
            <small>Estudos, rotina e possibilidades</small>
          </span>
        </button>

        {tela > 0 && (
          <button
            type="button"
            className="botao-inicio"
            onClick={() => navegar(0)}
          >
            Início
          </button>
        )}
      </header>

      {tela > 0 && (
        <div className="progresso">
          <div className="progresso-legenda">
            <label htmlFor="progresso">
              {nomesTelas[tela]}
            </label>

            <span>Etapa {tela} de 9</span>
          </div>

          <progress
            id="progresso"
            value={tela}
            max={9}
          />
        </div>
      )}

      {tela === 0 ? (
        <Inicio
          temPlano={temPlano}
          onComecar={criarNovoPlano}
          onContinuar={() =>
            navegar(telaParaContinuar(plano))
          }
          onVerPlano={() => navegar(9)}
        />
      ) : (
        <form onSubmit={avancar} noValidate>
          <section
            className="painel"
            ref={painelRef}
            tabIndex={-1}
            aria-labelledby="titulo-tela"
          >
            {erros.length > 0 && (
              <div
                className="mensagem-erro"
                role="alert"
                ref={errosRef}
                tabIndex={-1}
              >
                <strong>Confira antes de continuar:</strong>

                <ul>
                  {erros.map((erro) => (
                    <li key={erro}>{erro}</li>
                  ))}
                </ul>
              </div>
            )}

            {tela === 1 && (
              <MinhaRotina
                rotina={plano.rotina}
                onAlterar={atualizarRotina}
                onAlterarEstudo={atualizarEstudo}
              />
            )}

            {tela === 2 && (
              <MinhaMeta
                meta={plano.meta}
                onAlterar={atualizarMeta}
              />
            )}

            {tela === 3 && <IntroducaoSmart />}

            {tela >= 4 && tela <= 8 && (
              <EtapaSmart
                key={etapasSmart[indiceSmart].letra}
                etapa={etapasSmart[indiceSmart]}
                valor={
                  plano.smart[
                    etapasSmart[indiceSmart].letra
                  ]
                }
                plano={plano}
                onAlterar={atualizarSmart}
              />
            )}

            {tela === 9 && (
              <Resumo
                plano={plano}
                etapas={etapasSmart}
                onEditar={navegar}
              />
            )}
          </section>

          <Navegacao
            onVoltar={() =>
              navegar(Math.max(tela - 1, 0))
            }
            mostrarProximo={tela < 9}
            textoProximo={textoProximo}
          />
        </form>
      )}

      <footer className="rodape">
        <p className="aviso-salvamento" role="status">
          {avisoSalvamento}
        </p>

        <small>
          Um passo possível hoje também faz parte de uma grande meta.
        </small>
      </footer>
    </main>
  );
}

export default App;