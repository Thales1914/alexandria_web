import '../styles/components/AlertMessage.css';

function AlertMessage({ type = 'success', message }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`alert-message alert-message--${type}`} role="alert">
      {message}
    </div>
  );
}

export default AlertMessage;
