import { useLayoutEffect, useState } from "react";

const CHAVE = "portas-amanha:tema";

function carregarTema() {
  try {
    const valor = localStorage.getItem(CHAVE);

    return ["claro", "escuro"].includes(valor)
      ? valor
      : "sistema";
  } catch {
    return "sistema";
  }
}

export default function Tema() {
  const [tema, setTema] = useState(carregarTema);

  useLayoutEffect(() => {
    const aparelho = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    function aplicarTema() {
      const escuro =
        tema === "escuro" ||
        (tema === "sistema" && aparelho.matches);

      document.documentElement.dataset.tema =
        escuro ? "escuro" : "claro";

      const meta = document.querySelector(
        'meta[name="theme-color"]'
      );

      if (meta) {
        meta.content = escuro ? "#17141f" : "#faf9fc";
      }
    }

    aplicarTema();

    try {
      localStorage.setItem(CHAVE, tema);
    } catch {
      // O tema funciona mesmo quando o armazenamento está indisponível.
    }

    aparelho.addEventListener("change", aplicarTema);

    return () => {
      aparelho.removeEventListener("change", aplicarTema);
    };
  }, [tema]);

  return (
    <label className="tema-controle">
      <span>Tema</span>

      <select
        value={tema}
        onChange={(evento) => setTema(evento.target.value)}
      >
        <option value="sistema">Do aparelho</option>
        <option value="claro">Claro</option>
        <option value="escuro">Escuro</option>
      </select>
    </label>
  );
}