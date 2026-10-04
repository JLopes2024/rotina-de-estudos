import { useEffect, useRef, useState } from "react";
import Tema from "./components/Tema";
import usePlano from "./hooks/usePlano";
import useExperiencia from "./hooks/useExperiencia";
import { novaMeta, normalizarEstado, estadoVazio } from "./utils/modelo";
import { criarPlanoPersona } from "./dados/personas";
import Menu from "./components/Menu";
import Modal from "./components/Modal";
import Rotina from "./components/Rotina";
import ListaMetas from "./components/ListaMetas";
import EditorMeta from "./components/EditorMeta";
import Resumo from "./components/Resumo";
import Pwa from "./components/Pwa";
import SorteadorPersonas from "./components/SorteadorPersonas";
import {
  TituloJornada,
  Portas,
  Mapa,
  Guia,
  CenaFinal,
  medidorPlano,
} from "./components/Jornada";
import "./App.css";
import "./estilos/jornada.css";
function baixar(texto, nome) {
  const url = URL.createObjectURL(
    new Blob([texto], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function preferencia() {
  try {
    return localStorage.getItem("portas-amanha:efeitos") !== "nao";
  } catch {
    return true;
  }
}
export default function App() {
  const pessoal = usePlano();
  const [tela, setTela] = useState("inicio"),
    [metaId, setMetaId] = useState(""),
    [mensagem, setMensagem] = useState(""),
    [simulacao, setSimulacao] = useState(null),
    [modo, setModo] = useState("pessoal"),
    [efeitos, setEfeitos] = useState(preferencia),
    [som, setSom] = useState(false),
    [modal, setModal] = useState(null),
    [entrando, setEntrando] = useState(false);
  const app = useRef(null),
    painel = useRef(null),
    arquivo = useRef(null),
    transicao = useRef(null),
    destino = useRef("inicio");
  const simulando = modo === "simulacao" && !!simulacao,
    plano = simulando ? simulacao.plano : pessoal.plano,
    meta = plano.metas.find((m) => m.id === metaId),
    pronto = medidorPlano(plano).every(Boolean);
  const celebrar = useExperiencia(app, `${tela}:${modo}:${metaId}`, efeitos);
  useEffect(() => {
    painel.current?.focus();
    window.scrollTo(0, 0);
  }, [tela, modo, metaId]);
  useEffect(() => () => clearTimeout(transicao.current), []);
  useEffect(() => {
    try {
      localStorage.setItem("portas-amanha:efeitos", efeitos ? "sim" : "nao");
    } catch {}
  }, [efeitos]);
  function ir(v) {
    clearTimeout(transicao.current);
    destino.current = v;
    setMensagem("");
    if (
      v === tela ||
      !efeitos ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTela(v);
      setEntrando(false);
      return;
    }
    setEntrando(true);
    transicao.current = setTimeout(() => {
      setTela(destino.current);
      setEntrando(false);
    }, 140);
  }
  function setPlano(valor) {
    if (simulando)
      setSimulacao((s) =>
        s
          ? {
              ...s,
              plano: typeof valor === "function" ? valor(s.plano) : valor,
            }
          : s,
      );
    else pessoal.setPlano(valor);
  }
  function nova() {
    const m = novaMeta();
    setPlano((p) => ({ ...p, metas: [...p.metas, m] }));
    setMetaId(m.id);
    ir("editor");
  }
  function excluir(id) {
    if (
      !confirm(
        "Excluir a meta e suas etapas? Os horários de estudo serão mantidos e precisarão de outra meta.",
      )
    )
      return;
    setPlano((p) => ({
      ...p,
      metas: p.metas.filter((m) => m.id !== id),
      rotina: {
        ...p.rotina,
        estudos: p.rotina.estudos.map((e) =>
          e.metaId === id ? { ...e, metaId: "" } : e,
        ),
      },
    }));
  }
  function iniciar(persona) {
    if (
      simulacao &&
      !confirm(
        "Substituir a simulação anterior? Seu plano pessoal será preservado.",
      )
    )
      return;
    clearTimeout(transicao.current);
    setEntrando(false);
    setSimulacao({ persona, plano: criarPlanoPersona(persona) });
    setModo("simulacao");
    setMetaId("");
    setTela("rotina");
    setMensagem("");
  }
  function pessoalNovamente() {
    clearTimeout(transicao.current);
    setEntrando(false);
    setModo("pessoal");
    setMetaId("");
    setTela("inicio");
    setMensagem("");
  }
  function retomar() {
    clearTimeout(transicao.current);
    setEntrando(false);
    setModo("simulacao");
    setMetaId("");
    setTela("rotina");
  }
  function exportar() {
    baixar(
      JSON.stringify(
        simulando
          ? {
              ...plano,
              contextoSimulacao: {
                personaId: simulacao.persona.id,
                nome: simulacao.persona.nome,
                desafio: simulacao.persona.desafio,
              },
            }
          : plano,
        null,
        2,
      ),
      simulando
        ? `simulacao-${simulacao.persona.id}.json`
        : "meu-caminho-backup.json",
    );
    setMensagem("Arquivo exportado. Guarde sua cópia.");
  }
  async function importar(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || simulando) return;
    try {
      if (f.size > 2 * 1024 * 1024) throw Error("Use um JSON de até 2 MB.");
      const raw = JSON.parse(await f.text());
      normalizarEstado(raw);
      if (
        !confirm(
          "Substituir o plano pessoal pelo arquivo? Exporte uma cópia antes.",
        )
      )
        return;
      pessoal.importar(raw);
      setMensagem("Plano importado. Confira os dados.");
    } catch (err) {
      setMensagem("Não foi possível importar: " + err.message);
    }
  }
  function reset() {
    if (
      !confirm(
        simulando
          ? "Reiniciar esta simulação e restaurar os compromissos originais?"
          : "Apagar seu plano pessoal? Exporte uma cópia antes.",
      )
    )
      return;
    if (simulando) setPlano(criarPlanoPersona(simulacao.persona));
    else pessoal.setPlano(estadoVazio());
    setMetaId("");
    ir(simulando ? "rotina" : "inicio");
  }
  function concluir() {
    if (!pronto) return;
    celebrar(som);
    setModal("final");
  }
  return (
    <main
      ref={app}
      className={`app jornada-app ${efeitos ? "" : "sem-efeitos"}`}
    >
      <div className="ambiente no-print" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <svg
        className="scroll-caminho no-print"
        viewBox="0 0 30 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          pathLength="1"
          d="M15 0 C-8 160 38 250 15 390 S-8 630 15 760 S38 900 15 1000"
        />
      </svg>
      <Menu tela={tela} onNavegar={ir} simulando={simulando} />
      <div className="preferencias no-print">
  <Tema />

  <button
    className="text"
    aria-pressed={efeitos}
    onClick={() => setEfeitos(!efeitos)}
  >
    Efeitos: {efeitos ? "ativados" : "pausados"}
  </button>

  <button
    className="text"
    aria-pressed={som}
    onClick={() => {
      setSom(!som);

      if (!som) {
        celebrar(true);
      }
    }}
  >
    Som e vibração: {som ? "ativados" : "desativados"}
  </button>
</div>
      {simulando && (
        <aside className="simulacao-bar no-print">
          <div>
            <strong>Modo simulação · {simulacao.persona.nome}</strong>
            <p>
              Plano fictício separado do pessoal. Exporte antes de fechar ou
              recarregar.
            </p>
          </div>
          <div className="actions">
            <button className="secondary" onClick={() => setModal("persona")}>
              Ver persona
            </button>
            <button className="secondary" onClick={pessoalNovamente}>
              Voltar ao meu plano
            </button>
          </div>
        </aside>
      )}
      <section
        ref={painel}
        tabIndex={-1}
        className={`panel ${entrando ? "tela-saindo" : "tela-entrando"}`}
        aria-label="Conteúdo do aplicativo"
      >
        {!simulando && pessoal.erro && (
          <div className="error" role="alert">
            {pessoal.erro}
          </div>
        )}
        {!simulando && pessoal.leituraBloqueada ? (
          <>
            <h1>Vamos preservar seus dados</h1>
            <p>Guarde uma cópia dos registros antes de reiniciar.</p>
            <button
              onClick={() =>
                baixar(
                  JSON.stringify(
                    {
                      v2: localStorage.getItem("meu-caminho:plano:v2"),
                      v1: localStorage.getItem("meu-caminho:plano:v1"),
                    },
                    null,
                    2,
                  ),
                  "dados-originais.json",
                )
              }
            >
              Baixar dados originais
            </button>
            <button
              className="secondary"
              onClick={() => {
                if (
                  confirm(
                    "Você guardou a cópia? Apagar os registros inválidos e reiniciar?",
                  )
                ) {
                  localStorage.removeItem("meu-caminho:plano:v2");
                  localStorage.removeItem("meu-caminho:plano:v1");
                  location.reload();
                }
              }}
            >
              Reiniciar com segurança
            </button>
          </>
        ) : (
          <>
            {tela === "inicio" && (
              <>
                <section className="logo-banner">
                  <img
                    className="logo-inicial"
                    src={`${import.meta.env.BASE_URL}logo.png`}
                    alt="Portas para o Amanhã"
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
                  <TituloJornada efeitos={efeitos} />
                  <div className="actions">
                    <button onClick={() => ir("rotina")}>
                      {simulando ? "Ver rotina da persona" : "Montar meu plano"}{" "}
                      <span className="seta" aria-hidden="true">
                        ↗
                      </span>
                    </button>
                    <button
                      className="secondary"
                      onClick={() => ir("personas")}
                    >
                      Sortear persona
                    </button>
                    <button className="secondary" onClick={nova}>
                      + Criar uma meta
                    </button>
                  </div>
                </section>
                {!simulando && simulacao && (
                  <section className="retomar-persona">
                    <strong>Simulação de {simulacao.persona.nome}</strong>
                    <button className="secondary" onClick={retomar}>
                      Retomar simulação
                    </button>
                  </section>
                )}
                <Portas onNavegar={ir} />
                <Mapa plano={plano} onNavegar={ir} tela={tela} />
                <div className="home-cards">
                  <article>
                    <b>{plano.metas.length}</b>
                    <h2>{simulando ? "Metas da persona" : "Metas pessoais"}</h2>
                    <p>Um SMART e pequenos passos para cada objetivo.</p>
                    <button className="text" onClick={() => ir("metas")}>
                      Ver metas <span className="seta">→</span>
                    </button>
                  </article>
                  <article>
                    <b>{plano.rotina.estudos.length}</b>
                    <h2>Períodos de estudo</h2>
                    <p>Horários que consideram compromissos e descanso.</p>
                    <button className="text" onClick={() => ir("rotina")}>
                      Ver rotina <span className="seta">→</span>
                    </button>
                  </article>
                </div>
                {!simulando && pessoal.migrado && (
                  <p className="notice">
                    Seu plano anterior foi convertido. Confira rotina, prazos e
                    estudos; o registro original foi preservado.
                  </p>
                )}
                <details>
                  <summary>Como funciona?</summary>
                  <ol>
                    <li>Cadastre a rotina e os deslocamentos.</li>
                    <li>Escolha metas de curto, médio ou longo prazo.</li>
                    <li>Preencha o SMART e defina pequenas etapas.</li>
                    <li>Reserve estudos vinculados às metas.</li>
                    <li>Revise o resumo e salve um PDF.</li>
                  </ol>
                  <p>
                    {simulando
                      ? "A simulação fica apenas nesta página enquanto estiver aberta."
                      : "O plano pessoal é salvo neste navegador e endereço. Não há sincronização entre aparelhos."}
                  </p>
                </details>
                <section className="backup">
                  <h2>
                    {simulando
                      ? "Guarde o resultado do grupo"
                      : "Guarde uma cópia do seu caminho"}
                  </h2>
                  <p>
                    JSON para guardar os dados. PDF para ler e compartilhar.
                  </p>
                  <div className="actions">
                    <button className="secondary" onClick={exportar}>
                      Exportar {simulando ? "simulação" : "plano"} JSON
                    </button>
                    {!simulando && (
                      <button
                        className="secondary"
                        onClick={() => arquivo.current?.click()}
                      >
                        Importar plano JSON
                      </button>
                    )}
                    <button className="secondary" onClick={() => ir("resumo")}>
                      Ver resumo e PDF
                    </button>
                    <button className="text danger" onClick={reset}>
                      {simulando ? "Reiniciar simulação" : "Apagar meu plano"}
                    </button>
                  </div>
                  {!simulando && (
                    <input
                      ref={arquivo}
                      className="sr"
                      type="file"
                      accept=".json,application/json"
                      onChange={importar}
                    />
                  )}
                </section>
                <Pwa />
                <details>
                  <summary>Como instalar?</summary>
                  <p>
                    Após publicar em HTTPS, use Instalar aplicativo no Android
                    ou Compartilhar → Adicionar à Tela de Início no Safari do
                    iPhone. Abra conectado uma vez e aguarde a confirmação de
                    uso offline.
                  </p>
                </details>
              </>
            )}
            {tela === "personas" && (
              <SorteadorPersonas
                efeitos={efeitos}
                onCelebrar={() => celebrar(som)}
                onIniciar={iniciar}
                onVoltar={() => ir("inicio")}
              />
            )}
            {tela === "rotina" && (
              <Rotina
                key={simulando ? simulacao.persona.id : "pessoal"}
                plano={plano}
                onChange={setPlano}
                onDone={() => ir("metas")}
                onCriarMeta={nova}
              />
            )}
            {tela === "metas" && (
              <ListaMetas
                plano={plano}
                onNova={nova}
                onEditar={(id) => {
                  setMetaId(id);
                  ir("editor");
                }}
                onExcluir={excluir}
                onChange={setPlano}
                onRotina={() => ir("rotina")}
              />
            )}
            {tela === "editor" && meta && (
              <EditorMeta
                key={meta.id}
                meta={meta}
                onChange={(m) =>
                  setPlano((p) => ({
                    ...p,
                    metas: p.metas.map((x) => (x.id === m.id ? m : x)),
                  }))
                }
                onDone={() => ir("metas")}
              />
            )}
            {tela === "resumo" && (
              <>
                {simulando && (
                  <section className="simulacao-resumo">
                    <h2>Simulação · {simulacao.persona.nome}</h2>
                    <p>{simulacao.persona.desafio}</p>
                  </section>
                )}
                <Resumo
                  plano={plano}
                  onRotina={() => ir("rotina")}
                  onMetas={() => ir("metas")}
                />
                <section className="conclusao no-print">
                  <h2>A porta que você escolheu abrir</h2>
                  <p>
                    {pronto
                      ? "Rotina, metas SMART e estudos estão preenchidos. Revise e celebre seu primeiro passo."
                      : "Para concluir: preencha a rotina, termine o SMART de cada meta e vincule um horário de estudo válido a cada objetivo."}
                  </p>
                  <button disabled={!pronto} onClick={concluir}>
                    Concluir meu planejamento <span className="seta">↗</span>
                  </button>
                </section>
              </>
            )}
          </>
        )}
      </section>
      <Guia tela={tela} onAbrir={() => setModal("guia")} />
      {mensagem && (
        <div className="j-toast no-print" role="status">
          <span>{mensagem}</span>
          <button
            className="text"
            aria-label="Fechar mensagem"
            onClick={() => setMensagem("")}
          >
            ✕
          </button>
        </div>
      )}
      <footer className="no-print">
        <p role="status">
          {simulando
            ? "Simulação temporária: exporte antes de fechar a página."
            : pessoal.aviso}
        </p>
        <small>
          Um passo possível hoje também faz parte de uma grande meta.
        </small>
      </footer>
      {modal && (
        <Modal
          titulo={
            modal === "final"
              ? "Seu caminho começa aqui"
              : modal === "persona"
                ? simulacao?.persona.nome
                : "Um passo de cada vez"
          }
          onFechar={() => setModal(null)}
        >
          {modal === "final" ? (
            <>
              <CenaFinal />
              <div className="actions">
                <button
                  onClick={() => {
                    setModal(null);
                    exportar();
                  }}
                >
                  Guardar meu plano JSON
                </button>
                <button className="secondary" onClick={() => setModal(null)}>
                  Revisar e salvar PDF
                </button>
              </div>
            </>
          ) : modal === "persona" ? (
            <>
              <p>{simulacao.persona.historia}</p>
              <h3>Recursos</h3>
              <p>{simulacao.persona.recursos}</p>
              <h3>Apoio</h3>
              <p>{simulacao.persona.apoio}</p>
              <h3>Missão</h3>
              <p>{simulacao.persona.desafio}</p>
              <strong>{simulacao.persona.reflexao}</strong>
            </>
          ) : (
            <>
              <p>
                Comece pela realidade: trabalho, formação, escola, deslocamentos
                e descanso. Escolha um objetivo possível, preencha o SMART e
                encaixe os estudos.
              </p>
              <p>
                O mapa indica o que você preencheu. Você pode revisar qualquer
                fase e adaptar o plano.
              </p>
              <p>
                Use “Efeitos: pausados” para parar os movimentos. Som e vibração
                só funcionam quando você ativa e o navegador permite.
              </p>
            </>
          )}
        </Modal>
      )}
    </main>
  );
}
