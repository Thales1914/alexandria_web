import { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import '../styles/pages/Comunidade.css';

const Comunidade = () => {
  const [xpWidth, setXpWidth] = useState('0%');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setXpWidth('65%');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="comunidade">
      <header className="comunidade__header">
        <div>
          <h1>Hub da Comunidade</h1>
          <p>Plataforma de integração e métricas de leitura</p>
        </div>
        <div className="comunidade__stats">
          <div>
            <strong>12.4K</strong>
            <span>Leitores</span>
          </div>
          <div>
            <strong>850</strong>
            <span>Ativos agora</span>
          </div>
        </div>
      </header>

      <div className="comunidade__grid">
        <aside className="comunidade__sidebar">
          <div className="comunidade__card">
            <div className="user-profile">
              <div className="user-profile__avatar"></div>
              <h3>Davi</h3>
              <p>Nível 15 - Mestre de obras</p>
              <div className="xp-bar">
                <div className="xp-bar__labels">
                  <span>Progresso</span>
                  <span>65%</span>
                </div>
                <div className="xp-bar__track">
                  <div className="xp-bar__fill" style={{ width: xpWidth }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="comunidade__card">
            <h3>Ranking</h3>
            <ul className="ranking-list">
              <li><span>1. Davi</span> <span>2450 XP</span></li>
              <li><span>2. Roberto</span> <span>2100 XP</span></li>
              <li><span>3. Mariana</span> <span>1850 XP</span></li>
            </ul>
          </div>
        </aside>

        <main className="comunidade__feed">
          <div className="comunidade__card create-post">
            <Input id="post" placeholder="Compartilhe uma citação ou análise..." />
            <div className="create-post__actions">
              <Button variant="secondary">Anexo</Button>
              <Button variant="primary">Publicar</Button>
            </div>
          </div>

          <div className="comunidade__card activity">
            <div className="activity__header">
              <div className="activity__avatar"></div>
              <div>
                <strong>Davi</strong>
                <span>2 Horas Atrás</span>
              </div>
            </div>
            <p>Completou o livro <span className="highlight">O Hobbit</span></p>
          </div>

          <div className="comunidade__card activity">
            <div className="activity__header">
              <div className="activity__avatar"></div>
              <div>
                <strong>Ana</strong>
                <span>5 Horas Atrás</span>
              </div>
            </div>
            <p>Favoritou <span className="highlight">Dom Casmurro</span></p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Comunidade;