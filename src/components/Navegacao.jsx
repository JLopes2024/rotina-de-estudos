import './Navegacao.css';

function Navegacao({
  onVoltar,
  mostrarProximo,
  textoProximo,
}) {
  return (
    <nav className="navegacao" aria-label="Etapas do plano">
      <button
        type="button"
        className="secundario"
        onClick={onVoltar}
      >
        Voltar
      </button>

      {mostrarProximo && (
        <button type="submit">
          {textoProximo}
        </button>
      )}
    </nav>
  );
}

export default Navegacao;