import { useEffect, useRef, useState } from "react";

import usePlano from "./hooks/usePlano";
import useEntradasAnimadas from "./hooks/useEntradasAnimadas";

import {
  novaMeta,
  normalizarEstado,
  estadoVazio,
} from "./utils/modelo";

import Menu from "./components/Menu";
import Rotina from "./components/Rotina";
import ListaMetas from "./components/ListaMetas";
import EditorMeta from "./components/EditorMeta";
import Resumo from "./components/Resumo";
import Pwa from "./components/Pwa";
import SorteadorPersonas from "./components/SorteadorPersonas";

import { criarPlanoPersona } from "./dados/personas";

import "./App.css";

function baixar(texto, nome) {
  const url = URL.createObjectURL(
    new Blob([texto], { type: "application/json" }),
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const pessoal = usePlano();

  const [tela, setTela] = useState("inicio");
  const [metaId, setMetaId] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [simulacao, setSimulacao] = useState(null);
  const [modo, setModo] = useState("pessoal");

  const painel = useRef(null);
  const arquivo = useRef(null);

  useEntradasAnimadas(
    painel,
    `${tela}:${metaId}:${modo}`,
  );

  const simulando =
    modo === "simulacao" && !!simulacao;

  const plano = simulando
    ? simulacao.plano
    : pessoal.plano;

  const erro = simulando ? "" : pessoal.erro;
  const migrado = !simulando && pessoal.migrado;

  const leituraBloqueada =
    !simulando && pessoal.leituraBloqueada;

  const aviso = simulando
    ? "Simulação temporária. Exporte o JSON ou salve o PDF antes de fechar a página."
    : pessoal.aviso;

  const meta = plano.metas.find(
    (item) => item.id === metaId,
  );

  useEffect(() => {
    painel.current?.focus();
    window.scrollTo(0, 0);
  }, [tela, metaId, modo]);

  function setPlano(atualizacao) {
    if (simulando) {
      setSimulacao((atual) => {
        if (!atual) return atual;

        return {
          ...atual,
          plano:
            typeof atualizacao === "function"
              ? atualizacao(atual.plano)
              : atualizacao,
        };
      });
    } else {
      pessoal.setPlano(atualizacao);
    }
  }

  function iniciarSimulacao(persona) {
    if (
      simulacao &&
      !window.confirm(
        "Iniciar outra persona substituirá a simulação anterior. O plano pessoal será preservado. Continuar?",
      )
    ) {
      return;
    }

    setSimulacao({
      persona,
      plano: criarPlanoPersona(persona),
    });

    setModo("simulacao");
    setMetaId("");
    setMensagem("");
    setTela("rotina");
  }

  function voltarAoPessoal() {
    setModo("pessoal");
    setTela("inicio");
    setMetaId("");
    setMensagem("");
  }

  function retomarSimulacao() {
    if (!simulacao) return;

    setModo("simulacao");
    setTela("rotina");
    setMetaId("");
    setMensagem("");
  }

  function nova() {
    const nova = novaMeta();

    setPlano((atual) => ({
      ...atual,
      metas: [...atual.metas, nova],
    }));

    setMetaId(nova.id);
    setTela("editor");
  }

  function excluir(id) {
    if (
      !window.confirm(
        "Excluir esta meta e suas pequenas etapas? Os períodos de estudo serão mantidos, mas precisarão ser vinculados a outra meta.",
      )
    ) {
      return;
    }

    setPlano((atual) => ({
      ...atual,
      metas: atual.metas.filter(
        (item) => item.id !== id,
      ),
      rotina: {
        ...atual.rotina,
        estudos: atual.rotina.estudos.map((estudo) =>
          estudo.metaId === id
            ? { ...estudo, metaId: "" }
            : estudo,
        ),
      },
    }));
  }

  async function lerArquivo(evento) {
    const selecionado = evento.target.files?.[0];
    evento.target.value = "";

    if (!selecionado || simulando) return;

    try {
      if (selecionado.size > 2 * 1024 * 1024) {
        throw new Error(
          "Use um arquivo JSON de até 2 MB.",
        );
      }

      const dados = JSON.parse(
        await selecionado.text(),
      );

      normalizarEstado(dados);

      if (
        !window.confirm(
          "Importar substituirá o plano pessoal atual. Exporte uma cópia antes se quiser preservá-lo. Continuar?",
        )
      ) {
        return;
      }

      pessoal.importar(dados);

      setMensagem(
        "Plano importado. Confira sua rotina e as metas.",
      );
    } catch (erroImportacao) {
      setMensagem(
        "Não foi possível importar: " +
          erroImportacao.message,
      );
    }
  }

  function exportar() {
    if (simulando) {
      baixar(
        JSON.stringify(
          {
            ...plano,
            contextoSimulacao: {
              personaId: simulacao.persona.id,
              nome: simulacao.persona.nome,
              desafio: simulacao.persona.desafio,
            },
          },
          null,
          2,
        ),
        `simulacao-${simulacao.persona.id}.json`,
      );

      return;
    }

    baixar(
      JSON.stringify(plano, null, 2),
      "meu-caminho-backup.json",
    );
  }

  function reset() {
    if (simulando) {
      if (
        !window.confirm(
          "Reiniciar esta simulação? As metas e os estudos da personagem serão apagados e a rotina original será restaurada.",
        )
      ) {
        return;
      }

      setSimulacao((atual) => ({
        ...atual,
        plano: criarPlanoPersona(atual.persona),
      }));

      setTela("rotina");
      setMetaId("");
      setMensagem("");
      return;
    }

    if (
      !window.confirm(
        "Apagar toda a rotina, metas e estudos pessoais deste navegador? Exporte uma cópia antes.",
      )
    ) {
      return;
    }

    pessoal.setPlano(estadoVazio());
    setTela("inicio");
    setMetaId("");
    setMensagem("Plano pessoal reiniciado.");
  }

  return (
    <main className="app">
      <Menu
        tela={tela}
        onNavegar={setTela}
        simulando={simulando}
      />

      {simulando && (
        <aside
          className="simulacao-bar no-print"
          aria-label="Modo simulação"
        >
          <div>
            <strong>
              Modo simulação ·{" "}
              {simulacao.persona.nome}
            </strong>

            <p>
              Você está planejando para uma persona.
              Seu plano pessoal está separado.
            </p>
          </div>

          <button
            className="secondary"
            onClick={voltarAoPessoal}
          >
            Voltar ao meu plano
          </button>
        </aside>
      )}

      <section
        className="panel"
        ref={painel}
        tabIndex={-1}
        aria-label="Conteúdo do aplicativo"
      >
        {erro && (
          <div className="error" role="alert">
            {erro}
          </div>
        )}

        {leituraBloqueada ? (
          <>
            <h1>Vamos preservar seus dados</h1>

            <p>
              Não farei gravações sobre o conteúdo
              que não foi possível ler.
            </p>

            <button
              onClick={() =>
                baixar(
                  JSON.stringify(
                    {
                      v2: localStorage.getItem(
                        "meu-caminho:plano:v2",
                      ),
                      v1: localStorage.getItem(
                        "meu-caminho:plano:v1",
                      ),
                    },
                    null,
                    2,
                  ),
                  "meu-caminho-dados-originais.json",
                )
              }
            >
              Baixar dados originais
            </button>

            <p>
              Depois de guardar essa cópia, você
              pode reiniciar.
            </p>

            <button
              className="secondary"
              onClick={() => {
                if (
                  !window.confirm(
                    "Você já guardou a cópia? Reiniciar apagará os dados locais das duas versões.",
                  )
                ) {
                  return;
                }

                localStorage.removeItem(
                  "meu-caminho:plano:v2",
                );

                localStorage.removeItem(
                  "meu-caminho:plano:v1",
                );

                window.location.reload();
              }}
            >
              Reiniciar com segurança
            </button>
          </>
        ) : (
          <>
            {tela === "inicio" && (
              <>
                <section
                  className="logo-banner"
                  aria-label="Portas para o Amanhã"
                >
                  <img
                    src={`${import.meta.env.BASE_URL}logo.png`}
                    alt="Portas para o Amanhã"
                    className="logo-inicial"
                    width="1024"
                    height="1024"
                    fetchPriority="high"
                  />
                </section>

                <section className="hero">
                  <span className="eyebrow">
                    {simulando
                      ? `O caminho de ${simulacao.persona.nome}`
                      : "Um futuro. Vários caminhos."}
                  </span>

                  <h1>
                    {simulando ? (
                      "Um plano possível para uma vida real."
                    ) : (
                      <>
                        Suas metas cabem
                        <br />
                        na sua vida.
                      </>
                    )}
                  </h1>

                  <p>
                    {simulando
                      ? simulacao.persona.desafio
                      : "Construa metas de curto, médio e longo prazo e organize estudos que caibam na sua rotina."}
                  </p>

                  <div className="actions">
                    <button
                      className="lime"
                      onClick={() => setTela("rotina")}
                    >
                      {simulando
                        ? "Ver rotina da persona"
                        : "Montar meu plano"}
                    </button>

                    <button
                      className="white"
                      onClick={() =>
                        setTela("personas")
                      }
                    >
                      Sortear persona
                    </button>

                    <button
                      className="white"
                      onClick={nova}
                    >
                      + Criar uma meta
                    </button>
                  </div>
                </section>

                {!simulando && simulacao && (
                  <section className="retomar-persona">
                    <div>
                      <strong>
                        Simulação de{" "}
                        {simulacao.persona.nome}
                      </strong>

                      <p>
                        O planejamento ainda está
                        disponível nesta página.
                      </p>
                    </div>

                    <button
                      className="secondary"
                      onClick={retomarSimulacao}
                    >
                      Retomar simulação
                    </button>
                  </section>
                )}

                {simulando && (
                  <details className="persona-lembrete">
                    <summary>
                      Relembrar a história e a missão
                    </summary>

                    <p>
                      {simulacao.persona.historia}
                    </p>

                    <p>
                      <strong>Recursos: </strong>
                      {simulacao.persona.recursos}
                    </p>

                    <p>
                      <strong>Apoio: </strong>
                      {simulacao.persona.apoio}
                    </p>

                    <p>
                      <strong>Para discutir: </strong>
                      {simulacao.persona.reflexao}
                    </p>
                  </details>
                )}

                <div className="home-cards">
                  <article>
                    <b>{plano.metas.length}</b>

                    <h2>
                      {simulando
                        ? "Metas da persona"
                        : "Metas pessoais"}
                    </h2>

                    <p>
                      Um SMART e pequenas etapas
                      para cada objetivo.
                    </p>

                    <button
                      className="text"
                      onClick={() => setTela("metas")}
                    >
                      Ver metas →
                    </button>
                  </article>

                  <article>
                    <b>
                      {plano.rotina.estudos.length}
                    </b>

                    <h2>Períodos de estudo</h2>

                    <p>
                      Horários vinculados às metas,
                      considerando os compromissos.
                    </p>

                    <button
                      className="text"
                      onClick={() =>
                        setTela("rotina")
                      }
                    >
                      Ver rotina →
                    </button>
                  </article>
                </div>

                {migrado && (
                  <p className="notice">
                    Seu plano anterior foi convertido
                    em uma primeira meta. Confira a
                    rotina, a data-alvo e os estudos.
                    O registro antigo foi preservado.
                  </p>
                )}

                <details>
                  <summary>Como funciona?</summary>

                  <ol>
                    <li>
                      Confira ou cadastre a rotina
                      e os deslocamentos.
                    </li>
                    <li>
                      Crie metas em diferentes
                      horizontes e preencha o SMART.
                    </li>
                    <li>
                      Divida cada objetivo em
                      pequenas etapas com prazo.
                    </li>
                    <li>
                      Reserve estudos e vincule
                      cada período a uma meta.
                    </li>
                    <li>
                      Consulte o resumo ou salve
                      um PDF.
                    </li>
                  </ol>

                  <p>
                    {simulando
                      ? "A simulação é temporária e não altera o plano pessoal. Exporte o resultado antes de fechar ou recarregar a página."
                      : "Sem cadastro. Seu plano pessoal fica salvo neste navegador e endereço, sem sincronização entre aparelhos."}
                  </p>
                </details>

                <section className="backup">
                  <h2>
                    {simulando
                      ? "Guarde o resultado do grupo"
                      : "Guarde uma cópia do seu caminho"}
                  </h2>

                  <p>
                    {simulando
                      ? "Exporte a simulação em JSON ou abra o resumo para salvar um PDF."
                      : "O JSON permite restaurar o plano. O PDF é uma cópia para leitura."}
                  </p>

                  <div className="actions">
                    <button
                      className="secondary"
                      onClick={exportar}
                    >
                      {simulando
                        ? "Exportar simulação JSON"
                        : "Exportar plano JSON"}
                    </button>

                    {simulando ? (
                      <button
                        className="secondary"
                        onClick={() =>
                          setTela("resumo")
                        }
                      >
                        Ver resumo e salvar PDF
                      </button>
                    ) : (
                      <button
                        className="secondary"
                        onClick={() =>
                          arquivo.current?.click()
                        }
                      >
                        Importar plano JSON
                      </button>
                    )}

                    <button
                      className="text danger"
                      onClick={reset}
                    >
                      {simulando
                        ? "Reiniciar simulação"
                        : "Apagar meu plano"}
                    </button>
                  </div>

                  {!simulando && (
                    <input
                      className="sr"
                      type="file"
                      accept=".json,application/json"
                      ref={arquivo}
                      onChange={lerArquivo}
                    />
                  )}

                  {mensagem && (
                    <p role="status">{mensagem}</p>
                  )}
                </section>

                <Pwa />

                <details>
                  <summary>Como instalar?</summary>

                  <p>
                    Após publicar em HTTPS: no
                    Android, use “Instalar aplicativo”
                    no menu do navegador, se
                    disponível. No iPhone, abra no
                    Safari e use Compartilhar →
                    Adicionar à Tela de Início.
                    Abra conectado uma vez e aguarde
                    “Pronto para uso offline”.
                  </p>
                </details>
              </>
            )}

            {tela === "personas" && (
              <SorteadorPersonas
                onIniciar={iniciarSimulacao}
                onVoltar={() => setTela("inicio")}
              />
            )}

            {tela === "rotina" && (
              <Rotina
                key={
                  simulando
                    ? simulacao.persona.id
                    : "pessoal"
                }
                plano={plano}
                onChange={setPlano}
                onDone={() => setTela("metas")}
                onCriarMeta={nova}
              />
            )}

            {tela === "metas" && (
              <ListaMetas
                plano={plano}
                onNova={nova}
                onEditar={(id) => {
                  setMetaId(id);
                  setTela("editor");
                }}
                onExcluir={excluir}
                onChange={setPlano}
                onRotina={() => setTela("rotina")}
              />
            )}

            {tela === "editor" && meta && (
              <EditorMeta
                key={meta.id}
                meta={meta}
                onChange={(atualizada) =>
                  setPlano((atual) => ({
                    ...atual,
                    metas: atual.metas.map((item) =>
                      item.id === atualizada.id
                        ? atualizada
                        : item,
                    ),
                  }))
                }
                onDone={() => setTela("metas")}
              />
            )}

            {tela === "resumo" && (
              <>
                {simulando && (
                  <section className="simulacao-resumo">
                    <h2>
                      Simulação ·{" "}
                      {simulacao.persona.nome},{" "}
                      {simulacao.persona.idade} anos
                    </h2>

                    <p>
                      {simulacao.persona.desafio}
                    </p>
                  </section>
                )}

                <Resumo
                  plano={plano}
                  onRotina={() => setTela("rotina")}
                  onMetas={() => setTela("metas")}
                />
              </>
            )}
          </>
        )}
      </section>

      <footer className="no-print">
        <p role="status">{aviso}</p>

        <small>
          Um passo possível hoje também faz parte
          de uma grande meta.
        </small>
      </footer>
    </main>
  );
}