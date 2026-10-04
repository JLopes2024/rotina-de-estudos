import { useEffect, useId, useRef } from "react";
export default function Modal({ titulo, onFechar, children }) {
  const ref = useRef(null),
    id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d.open) d.showModal();
    return () => {
      if (d.open) d.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="j-modal"
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onFechar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="j-modal-conteudo">
        <div className="section-head">
          <h2 id={id}>{titulo}</h2>
          <button
            className="secondary"
            aria-label="Fechar janela"
            onClick={onFechar}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
