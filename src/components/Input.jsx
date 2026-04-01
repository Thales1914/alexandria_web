import '../styles/components/Input.css';

function Input({ id, label, hint, ...props }) {
  return (
    <div className="input-field">
      {label ? (
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <input className="input-field__control" id={id} {...props} />

      {hint ? <span className="input-field__hint">{hint}</span> : null}
    </div>
  );
}

export default Input;
