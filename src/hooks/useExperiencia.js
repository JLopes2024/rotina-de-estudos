import { useEffect, useRef } from "react";
export default function useExperiencia(ref, chave, efeitos) {
  const audio = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let io;
    let mo;
    let raf = 0;
    const vistos = new Set(),
      timers = new Set();
    const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
    function reset() {
      io?.disconnect();
      mo?.disconnect();
      vistos.forEach((el) => {
        el.removeAttribute("data-revelar");
        el.removeAttribute("data-visivel");
        el.style.removeProperty("--entrada-x");
        el.style.removeProperty("--entrada-delay");
      });
      vistos.clear();
    }
    function configurar() {
      reset();
      if (!efeitos || reduzido.matches) return;
      io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.dataset.visivel = "true";
              io.unobserve(e.target);
            }
          }),
        { threshold: 0, rootMargin: "0px 0px -12px 0px" },
      );
      const registrar = () => {
        root
          .querySelectorAll(
            ".logo-banner,.hero > *, .home-cards > article,.sala-portas,.mapa-jornada,.backup,.goal-card,.study,.catalog article,.milestones article,.personas-explicacao",
          )
          .forEach((el, i) => {
            if (vistos.has(el)) return;
            vistos.add(el);
            el.dataset.revelar = "true";
            el.style.setProperty("--entrada-x", `${i % 2 ? 14 : -14}px`);
            el.style.setProperty("--entrada-delay", `${(i % 3) * 65}ms`);
            io.observe(el);
          });
      };
      registrar();
      mo = new MutationObserver(registrar);
      mo.observe(root, { subtree: true, childList: true });
    }
    configurar();
    reduzido.addEventListener("change", configurar);
    function foco(e) {
      const el = e.target.closest("[data-revelar]");
      if (el) {
        el.dataset.visivel = "true";
        io?.unobserve(el);
      }
    }
    const depois = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };
    function ripple(e) {
      if (!efeitos || reduzido.matches) return;
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      const r = b.getBoundingClientRect(),
        s = document.createElement("span");
      s.className = "j-ripple";
      s.setAttribute("aria-hidden", "true");
      const keyboard = e.detail === 0;
      s.style.left = `${keyboard ? r.width / 2 : e.clientX - r.left}px`;
      s.style.top = `${keyboard ? r.height / 2 : e.clientY - r.top}px`;
      b.appendChild(s);
      depois(() => s.remove(), 650);
    }
    function mudou(e) {
      if (!efeitos || reduzido.matches) return;
      const card = e.target.closest(".goal-card,.study,.milestones article");
      if (!card) return;
      card.classList.remove("j-alterado");
      void card.offsetWidth;
      card.classList.add("j-alterado");
      depois(() => card.classList.remove("j-alterado"), 1200);
    }
    const rolar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = root.getBoundingClientRect(),
          total = Math.max(1, r.height - innerHeight),
          valor = Math.max(0, Math.min(1, -r.top / total));
        root.style.setProperty("--rolagem", String(valor));
      });
    };
    root.addEventListener("focusin", foco);
    root.addEventListener("click", ripple);
    root.addEventListener("change", mudou);
    window.addEventListener("scroll", rolar, { passive: true });
    window.addEventListener("resize", rolar);
    rolar();
    return () => {
      reset();
      reduzido.removeEventListener("change", configurar);
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      root.querySelectorAll(".j-ripple").forEach((el) => el.remove());
      root.removeEventListener("focusin", foco);
      root.removeEventListener("click", ripple);
      root.removeEventListener("change", mudou);
      window.removeEventListener("scroll", rolar);
      window.removeEventListener("resize", rolar);
    };
  }, [ref, chave, efeitos]);
  useEffect(
    () => () => {
      audio.current?.close().catch(() => {});
    },
    [],
  );
  return async function celebrar(ativo) {
    if (!ativo) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (Audio) {
        audio.current ??= new Audio();
        const ctx = audio.current;
        await ctx.resume();
        [523.25, 659.25, 783.99].forEach((f, i) => {
          const o = ctx.createOscillator(),
            g = ctx.createGain(),
            t = ctx.currentTime + i * 0.1;
          o.type = "sine";
          o.frequency.value = f;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.035, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.24);
        });
      }
      navigator.vibrate?.([25, 50, 25]);
    } catch {
      /* Recursos opcionais podem ser bloqueados pelo navegador. */
    }
  };
}
