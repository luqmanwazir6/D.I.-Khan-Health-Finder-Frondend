import './Card.css';

export default function Card({
  children,
  interactive = false,
  padded = true,
  className = '',
  as: Component = 'div',
  ...rest
}) {
  return (
    <Component
      className={`card ${interactive ? 'card-interactive' : ''} ${padded ? 'card-padded' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
