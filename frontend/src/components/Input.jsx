import '../styles/components/Input.css';

function Input({
  id,
  label,
  hint,
  state = 'default',
  stateMessage,
  ...props
}) {
  const inputClassName = [
    'input-field__control',
    state !== 'default' ? `input-field__control--${state}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const messageClassName = [
    'input-field__message',
    state !== 'default' ? `input-field__message--${state}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="input-field">
      {label ? (
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <input
        aria-invalid={state === 'error' ? 'true' : 'false'}
        className={inputClassName}
        id={id}
        {...props}
      />

      {stateMessage ? (
        <span className={messageClassName}>{stateMessage}</span>
      ) : hint ? (
        <span className="input-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

export default Input;
