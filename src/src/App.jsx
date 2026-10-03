import { useEffect, useRef, useState } from "react";
import usePlano from "./hooks/usePlano";
import { novaMeta, normalizarEstado, estadoVazio } from "./utils/modelo";
import Rotina from "./components/Rotina";
import ListaMetas from "./components/ListaMetas";
import EditorMeta from "./components/EditorMeta";
import Resumo from "./components/Resumo";
import Pwa from "./components/Pwa";
import "./App.css";
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
export default function App() {
  const { plano, setPlano, erro, aviso, importar, migrado, leituraBloqueada } =
    usePlano();
  const [tela, setTela] = useState("inicio"),
    [metaId, setMetaId] = useState(""),
    [mensagem, setMensagem] = useState("");
  const painel = useRef(null),
    arquivo = useRef(null);
  useEffect(() => {
    painel.current?.focus();
    window.scrollTo(0, 0);
  }, [tela, metaId]);
  const meta = plano.metas.find((m) => m.id === metaId);
  function nova() {
    const m = novaMeta();
    setPlano((p) => ({ ...p, metas: [...p.metas, m] }));
    setMetaId(m.id);
    setTela("editor");
  }
  function excluir(id) {
    if (
      !confirm(
        "Excluir esta meta e suas pequenas etapas? Os períodos de estudo serão mantidos, mas precisarão ser vinculados a outra meta.",
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
  async function lerArquivo(ev) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024)
        throw Error("Use um arquivo JSON de até 2 MB.");
      const raw = JSON.parse(await file.text());
      normalizarEstado(raw);
      if (
        !confirm(
          "Importar substituirá o plano atual. Exporte uma cópia antes se quiser preservá-lo. Continuar?",
        )
      )
        return;
      importar(raw);
      setMensagem("Plano importado. Confira sua rotina e as metas.");
    } catch (e) {
      setMensagem("Não foi possível importar: " + e.message);
    }
  }
  function exportar() {
    baixar(JSON.stringify(plano, null, 2), "meu-caminho-backup.json");
  }
  function reset() {
    if (
      !confirm(
        "Apagar toda a rotina, metas e estudos deste navegador? Exporte uma cópia antes.",
      )
    )
      return;
    setPlano(estadoVazio());
    setTela("inicio");
    setMensagem("Plano reiniciado.");
  }
  return (
    <main className="app">
      <header className="header no-print">
        <button className="brand" onClick={() => setTela("inicio")}>
          <span aria-hidden="true">↗</span>
          <div>
            <strong>Portas para o Amanhã</strong>
            <small>Estudos, rotina e possibilidades</small>
          </div>
        </button>
        <nav aria-label="Navegação principal">
          {[
            ["inicio", "Início"],
            ["rotina", "Rotina"],
            ["metas", "Metas"],
            ["resumo", "Resumo"],
          ].map(([v, t]) => (
            <button
              key={v}
              className={tela === v ? "active" : ""}
              aria-current={tela === v ? "page" : undefined}
              onClick={() => setTela(v)}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>
      <section
        className="panel"
        ref={painel}
        tabIndex="-1"
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
              Não farei gravações sobre o conteúdo que não foi possível ler.
            </p>
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
                  "meu-caminho-dados-originais.json",
                )
              }
            >
              Baixar dados originais
            </button>
            <p>Depois de guardar essa cópia, você pode reiniciar.</p>
            <button
              className="secondary"
              onClick={() => {
                if (
                  confirm(
                    "Você já guardou a cópia? Reiniciar apagará os dados locais das duas versões.",
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
                <section className="logo-banner" aria-label="Portas para o Amanhã">
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
                  <span className="eyebrow">Um futuro. Vários caminhos.</span>
                  <h1>
                    Suas metas cabem
                    <br />
                    na sua vida.
                  </h1>
                  <p>
                    Uma rotina compartilhada para metas de curto, médio e longo
                    prazo. Construa seu SMART e reserve seus estudos.
                  </p>
                  <div className="actions">
                    <button className="lime" onClick={() => setTela("rotina")}>
                      Organizar minha rotina
                    </button>
                    <button className="white" onClick={nova}>
                      + Criar uma meta
                    </button>
                  </div>
                </section>
                <div className="home-cards">
                  <article>
                    <b>{plano.metas.length}</b>
                    <h2>Metas pessoais</h2>
                    <p>Um SMART e pequenas etapas para cada objetivo.</p>
                    <button className="text" onClick={() => setTela("metas")}>
                      Ver minhas metas →
                    </button>
                  </article>
                  <article>
                    <b>{plano.rotina.estudos.length}</b>
                    <h2>Períodos de estudo</h2>
                    <p>
                      Horários vinculados às metas, sem duplicar sua rotina.
                    </p>
                    <button className="text" onClick={() => setTela("rotina")}>
                      Ver minha rotina →
                    </button>
                  </article>
                </div>
                {migrado && (
                  <p className="notice">
                    Seu plano anterior foi convertido em uma primeira meta.
                    Confira a rotina, a data-alvo e os estudos. O registro
                    antigo foi preservado.
                  </p>
                )}
                <details>
                  <summary>Como funciona?</summary>
                  <ol>
                    <li>Cadastre sua rotina e seus deslocamentos.</li>
                    <li>
                      Crie metas em diferentes horizontes e preencha o SMART.
                    </li>
                    <li>Divida cada objetivo em pequenas etapas com prazo.</li>
                    <li>Reserve estudos e vincule cada período a uma meta.</li>
                    <li>Consulte o resumo ou salve um PDF.</li>
                  </ol>
                  <p>
                    Sem cadastro. Os dados ficam neste navegador e endereço. A
                    instalação não cria sincronização entre aparelhos. O sono é
                    habitual para a semana; os compromissos e estudos terminam
                    no mesmo dia.
                  </p>
                </details>
                <section className="backup">
                  <h2>Guarde uma cópia do seu caminho</h2>
                  <p>
                    O JSON restaura o plano em outro aparelho. O PDF é uma cópia
                    para leitura.
                  </p>
                  <div className="actions">
                    <button className="secondary" onClick={exportar}>
                      Exportar plano JSON
                    </button>
                    <button
                      className="secondary"
                      onClick={() => arquivo.current.click()}
                    >
                      Importar plano JSON
                    </button>
                    <button className="text danger" onClick={reset}>
                      Apagar tudo
                    </button>
                  </div>
                  <input
                    className="sr"
                    type="file"
                    accept=".json,application/json"
                    ref={arquivo}
                    onChange={lerArquivo}
                  />
                  {mensagem && <p role="status">{mensagem}</p>}
                </section>
                <Pwa />
                <details>
                  <summary>Como instalar?</summary>
                  <p>
                    Após publicar em HTTPS: no Android, use “Instalar
                    aplicativo” no menu do navegador, se disponível. No iPhone,
                    abra no Safari e use Compartilhar → Adicionar à Tela de
                    Início. Abra conectado uma vez e aguarde “Pronto para uso
                    offline”.
                  </p>
                </details>
              </>
            )}
            {tela === "rotina" && (
              <Rotina
                plano={plano}
                onChange={setPlano}
                onDone={() => setTela("metas")}
                onCriarMeta={nova}
              />
            )}{" "}
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
            )}{" "}
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
                onDone={() => setTela("metas")}
              />
            )}{" "}
            {tela === "resumo" && (
              <Resumo
                plano={plano}
                onRotina={() => setTela("rotina")}
                onMetas={() => setTela("metas")}
              />
            )}
          </>
        )}
      </section>
      <footer className="no-print">
        <p role="status">{aviso}</p>
        <small>
          Um passo possível hoje também faz parte de uma grande meta.
        </small>
      </footer>
    </main>
  );
}
