import { useEffect } from "react";
import "../estilos/entradas.css";

export default function useEntradasAnimadas(
  referencia,
  chave,
) {
  useEffect(() => {
    const raiz = referencia.current;

    if (!raiz) return;

    const preferencia = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (
      preferencia.matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const registrados = new Set();
    let contador = 0;

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;

          entrada.target.dataset.visivel = "true";
          observador.unobserve(entrada.target);
        });
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -24px 0px",
      },
    );

    function registrarElementos() {
      const elementos = raiz.querySelectorAll(
        [
          ":scope > *:not(.hero):not(.home-cards)",
          ".hero > *",
          ".home-cards > article",
          ".persona-card",
        ].join(","),
      );

      elementos.forEach((elemento) => {
        if (registrados.has(elemento)) return;

        if (elemento.matches("input, .sr")) return;

        registrados.add(elemento);

        const direcao =
          contador % 3 === 0
            ? "esquerda"
            : contador % 3 === 1
              ? "baixo"
              : "direita";

        elemento.dataset.entrada = direcao;

        elemento.style.setProperty(
          "--entrada-atraso",
          `${(contador % 4) * 65}ms`,
        );

        observador.observe(elemento);
        contador += 1;
      });
    }

    registrarElementos();

    const mutacoes = new MutationObserver(
      registrarElementos,
    );

    mutacoes.observe(raiz, {
      childList: true,
      subtree: true,
    });

    function revelarAoFocar(evento) {
      const elemento = evento.target.closest(
        "[data-entrada]",
      );

      if (elemento && raiz.contains(elemento)) {
        elemento.dataset.visivel = "true";
        observador.unobserve(elemento);
      }
    }

    function removerMovimento() {
      if (!preferencia.matches) return;

      registrados.forEach((elemento) => {
        elemento.dataset.visivel = "true";
      });

      observador.disconnect();
    }

    raiz.addEventListener(
      "focusin",
      revelarAoFocar,
    );

    preferencia.addEventListener(
      "change",
      removerMovimento,
    );

    return () => {
      observador.disconnect();
      mutacoes.disconnect();

      raiz.removeEventListener(
        "focusin",
        revelarAoFocar,
      );

      preferencia.removeEventListener(
        "change",
        removerMovimento,
      );

      registrados.forEach((elemento) => {
        delete elemento.dataset.entrada;
        delete elemento.dataset.visivel;

        elemento.style.removeProperty(
          "--entrada-atraso",
        );
      });
    };
  }, [referencia, chave]);
}