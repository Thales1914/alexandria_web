import NotFound from './NotFound';

function Explorar() {
  return (
    <NotFound
      eyebrow="Explorar"
      title="Explorar em breve"
      message="Esta área já aparece na navegação, mas ainda não faz parte da entrega atual. Por enquanto, a Home segue como a tela funcional do Alexandria."
      actionLabel="Voltar para a Home"
      actionTo="/"
    />
  );
}

export default Explorar;
