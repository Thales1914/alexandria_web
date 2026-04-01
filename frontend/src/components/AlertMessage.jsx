import '../styles/components/AlertMessage.css';

function AlertMessage({ type = 'success', title, message }) {
  if (!title && !message) {
    return null;
  }

  return (
    <div className={`alert-message alert-message--${type}`} role="alert" aria-live="polite">
      {title ? <strong className="alert-message__title">{title}</strong> : null}
      {message ? <p className="alert-message__text">{message}</p> : null}
    </div>
  );
}

export default AlertMessage;
