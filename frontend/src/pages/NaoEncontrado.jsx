import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import '../styles/pages/NaoEncontrado.css';

function NaoEncontrado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const termoBuscado = searchParams.get('q') || '';

  return (
    <section className="nao-encontrado">
      <div className="nao-encontrado__glow" />

      <div className="nao-encontrado__content">
        <div className="nao-encontrado__icon-wrapper">
          <div className="nao-encontrado__icon">
            <span className="nao-encontrado__emoji">📕</span>
            <div className="nao-encontrado__ring" />
          </div>
        </div>

        <div className="nao-encontrado__badge">Busca do Alexandria</div>
        <h1 className="nao-encontrado__title">Livro não encontrado</h1>

        {termoBuscado ? (
          <p className="nao-encontrado__subtitle">
            Nenhum resultado foi encontrado para{' '}
            <span className="nao-encontrado__term">"{termoBuscado}"</span>.
          </p>
        ) : (
          <p className="nao-encontrado__subtitle">
            Nenhum resultado foi encontrado para a sua busca.
          </p>
        )}

        <div className="nao-encontrado__suggestions">
          <h2 className="nao-encontrado__suggestions-title">O que você pode fazer</h2>
          <ul className="nao-encontrado__suggestions-list">
            <li>Verifique se o título foi digitado corretamente.</li>
            <li>Tente buscar usando outro nome ou parte do título.</li>
            <li>Volte para a Home e faça uma nova pesquisa.</li>
            <li>Continue explorando a plataforma por outros caminhos.</li>
          </ul>
        </div>

        <div className="nao-encontrado__actions">
          <Button onClick={() => navigate('/')} type="button">
            Voltar para a Home
          </Button>
        </div>

        <div className="nao-encontrado__chips">
          <span className="nao-encontrado__chip">Resultado não encontrado</span>
          <span className="nao-encontrado__chip">Tente outro título</span>
          <span className="nao-encontrado__chip">Nova busca</span>
        </div>
      </div>
    </section>
  );
}

export default NaoEncontrado;
