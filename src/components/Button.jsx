import '../styles/components/Button.css';

function Button({
  children,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  ...props
}) {
  const className = [
    'button',
    `button--${variant}`,
    fullWidth ? 'button--full-width' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={className} type={type} {...props}>
      {children}
    </button>
  );
}

export default Button;
