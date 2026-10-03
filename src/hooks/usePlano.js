import { useEffect, useState } from "react";
import { estadoVazio, normalizarEstado } from "../utils/modelo";
const KEY = "meu-caminho:plano:v2",
  OLD = "meu-caminho:plano:v1";
function ler() {
  try {
    const current = localStorage.getItem(KEY),
      old = localStorage.getItem(OLD);
    if (current || old)
      return {
        plano: normalizarEstado(JSON.parse(current ?? old)),
        erro: "",
        migrado: !current && !!old,
      };
    return { plano: estadoVazio(), erro: "", migrado: false };
  } catch {
    return {
      plano: estadoVazio(),
      erro: "Não consegui ler o plano salvo. O conteúdo original foi preservado. Exporte os dados originais antes de iniciar outro plano.",
      migrado: false,
    };
  }
}
export default function usePlano() {
  const [initial] = useState(ler);
  const [plano, setPlano] = useState(initial.plano);
  const [erro, setErro] = useState(initial.erro);
  const [aviso, setAviso] = useState("");
  useEffect(() => {
    if (initial.erro) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(plano));
      setAviso("Salvo neste navegador");
      setErro("");
    } catch {
      setErro(
        "Não consegui salvar. Exporte uma cópia antes de fechar a página.",
      );
    }
  }, [plano, initial.erro]);
  function importar(raw) {
    const novo = normalizarEstado(raw);
    if (initial.erro)
      throw Error(
        "Recarregue após guardar e remover os dados inválidos; a gravação está protegida.",
      );
    setPlano(novo);
    return novo;
  }
  return {
    plano,
    setPlano,
    erro,
    aviso,
    importar,
    migrado: initial.migrado,
    leituraBloqueada: !!initial.erro,
  };
}
