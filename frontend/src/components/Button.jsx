import React from 'react';
import './Button.css';

/**
 * variant="primary"   -> gradient button (Styling Part 1.2)
 * variant="secondary" -> input-field styling (used for Cancel per spec 6.i)
 */
function Button({ children, variant = 'primary', type = 'button', onClick, disabled, className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`app-button app-button-${variant} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export default Button;
