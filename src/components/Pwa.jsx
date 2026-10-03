import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import "./Pwa.css";
export default function Pwa() {
  const [prompt, setPrompt] = useState(null),
    [info, setInfo] = useState("");
  const {
    offlineReady: [offline, setOffline],
    needRefresh: [refresh, setRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError() {
      setInfo("O uso offline ainda não está disponível neste navegador.");
    },
  });
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const installed = () => {
      setPrompt(null);
      setInfo("Aplicativo instalado.");
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  async function instalar() {
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }
  return (
    <div className="pwa no-print">
      {prompt && (
        <button className="secondary" onClick={instalar}>
          Instalar no aparelho
        </button>
      )}
      {offline && (
        <p role="status">
          Pronto para uso offline.{" "}
          <button className="text" onClick={() => setOffline(false)}>
            Fechar
          </button>
        </p>
      )}
      {refresh && (
        <p role="status">
          Nova versão disponível.{" "}
          <button onClick={() => updateServiceWorker(true)}>Atualizar</button>{" "}
          <button className="text" onClick={() => setRefresh(false)}>
            Depois
          </button>
        </p>
      )}
      {info && <p role="status">{info}</p>}
    </div>
  );
}
