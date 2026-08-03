import React, { useState } from 'react';
import { EyeOpenIcon, EyeClosedIcon } from './Icons';
import './FormField.css';

/**
 * Shared input field: label above, icon on the far left inside the field,
 * centred text/placeholder, rounded corners. Pass `type="password"` to get
 * a built-in show/hide toggle automatically (spec Part 4.2).
 */
function FormField({
  label,
  icon: Icon,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  as = 'input',
  children,
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (visible ? 'text' : 'password') : type;

  return (
    <div className="form-field">
      {label && <label htmlFor={name} className="form-field-label">{label}</label>}
      <div className="form-field-input-wrapper">
        {Icon && (
          <span className="form-field-icon">
            <Icon className="form-field-icon-img" />
          </span>
        )}
        {as === 'select' ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`form-field-control form-field-select${Icon ? ' has-icon' : ''}`}
          >
            {children}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={resolvedType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`form-field-control${Icon ? ' has-icon' : ''}${isPassword ? ' has-toggle' : ''}`}
          />
        )}
        {isPassword && (
          <button
            type="button"
            className="form-field-toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        )}
      </div>
    </div>
  );
}

export default FormField;
