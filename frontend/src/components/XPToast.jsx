import { useGamificacao } from '../context/GamificacaoContext';
import '../styles/components/XPToast.css';

function XPToast() {
  const { toasts } = useGamificacao();

  if (toasts.length === 0) return null;

  return (
    <div className="xp-toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className="xp-toast">
          <img src="/coruja.png" alt="" className="xp-toast__owl" />
          <div className="xp-toast__body">
            <span className="xp-toast__xp">+{toast.xp} XP</span>
            <span className="xp-toast__label">{toast.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default XPToast;
