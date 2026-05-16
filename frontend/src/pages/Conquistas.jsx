import { useNavigate } from 'react-router-dom';
import { useGamificacao } from '../context/GamificacaoContext';
import { LISTA_CONQUISTAS, NIVEIS, getProgresso } from '../services/gamificacao';
import '../styles/pages/Conquistas.css';

function Conquistas() {
  const { estado, nivel } = useGamificacao();
  const navigate = useNavigate();
  const { xp, conquistasDesbloqueadas, historico } = estado;
  const progresso = getProgresso(xp);
  const proximoNivel = NIVEIS.find((n) => n.numero === nivel.numero + 1);
  const totalConquistas = LISTA_CONQUISTAS.length;
  const conquistadas = conquistasDesbloqueadas.length;

  return (
    <div className="conquistas">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="conquistas__hero">
        <button
          className="conquistas__owl-btn"
          onClick={() => navigate('/')}
          title="Voltar para a Home"
          aria-label="Voltar para a Home"
        >
          <img src="/coruja.png" alt="Alexandria" className="conquistas__owl" />
        </button>

        <div className="conquistas__hero-copy">
          <p className="conquistas__eyebrow">Sua jornada</p>
          <h1>Conquistas &amp; Progresso</h1>
          <p className="conquistas__hero-text">
            Cada leitura conta. Cada avaliação importa. Cada livro adicionado
            é um passo na sua trajetória como leitor.
          </p>
          <div className="conquistas__hero-meta">
            <span>{conquistadas}/{totalConquistas} conquistas</span>
            <span>{xp} XP acumulados</span>
          </div>
        </div>
      </section>

      {/* ── Nível atual ──────────────────────────────────────────────────────── */}
      <section className="conquistas__level-card">
        <div className="conquistas__level-top">
          <div className="conquistas__level-badge">
            <span className="conquistas__level-num">{nivel.numero}</span>
          </div>
          <div className="conquistas__level-info">
            <span className="conquistas__level-eyebrow">Nível atual</span>
            <h2 className="conquistas__level-name">{nivel.label}</h2>
            {proximoNivel ? (
              <p className="conquistas__level-next">
                Faltam <strong>{proximoNivel.minXP - xp} XP</strong> para{' '}
                <em>{proximoNivel.label}</em>
              </p>
            ) : (
              <p className="conquistas__level-next">
                🦉 Nível máximo alcançado — você é um Mestre das Letras!
              </p>
            )}
          </div>
          <div className="conquistas__xp-chip">
            <strong>{xp}</strong>
            <span>XP</span>
          </div>
        </div>

        <div className="conquistas__bar-track" role="progressbar" aria-valuenow={progresso} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="conquistas__bar-fill"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <div className="conquistas__bar-labels">
          <span>{nivel.minXP} XP</span>
          <span>{progresso}%</span>
          <span>{proximoNivel ? `${proximoNivel.minXP} XP` : 'MAX'}</span>
        </div>
      </section>

      {/* ── Grid de conquistas ───────────────────────────────────────────────── */}
      <section className="conquistas__section">
        <h2 className="conquistas__section-title">Conquistas</h2>
        <div className="conquistas__grid">
          {LISTA_CONQUISTAS.map((conquista) => {
            const desbloqueada = conquistasDesbloqueadas.includes(conquista.id);
            return (
              <article
                key={conquista.id}
                className={`conquistas__card${desbloqueada ? ' conquistas__card--unlocked' : ''}`}
              >
                <div className="conquistas__card-icon">
                  <span aria-hidden="true">{conquista.icone}</span>
                  {!desbloqueada && (
                    <span className="conquistas__lock" aria-hidden="true">🔒</span>
                  )}
                </div>
                <div className="conquistas__card-body">
                  <h3>{conquista.titulo}</h3>
                  <p>{conquista.descricao}</p>
                  <span className="conquistas__xp-badge">+{conquista.xpBonus} XP</span>
                </div>
                {desbloqueada && (
                  <span className="conquistas__check" aria-label="Desbloqueada">✓</span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Histórico ────────────────────────────────────────────────────────── */}
      {historico.length > 0 && (
        <section className="conquistas__section">
          <h2 className="conquistas__section-title">Histórico de XP</h2>
          <div className="conquistas__history">
            {historico.slice(0, 12).map((item, idx) => (
              <div key={idx} className="conquistas__history-row">
                <span className="conquistas__history-xp">+{item.xp} XP</span>
                <span className="conquistas__history-label">{item.label}</span>
                <span className="conquistas__history-date">
                  {new Date(item.timestamp).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {historico.length === 0 && (
        <section className="conquistas__section">
          <div className="conquistas__empty">
            <img src="/coruja.png" alt="" className="conquistas__empty-owl" />
            <h3>Nenhuma atividade ainda</h3>
            <p>
              Explore o catálogo, adicione livros à biblioteca e registre suas
              avaliações para começar a acumular XP.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

export default Conquistas;
