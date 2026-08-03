import React from 'react';
import { Link } from 'react-router-dom';
import './Hyperlink.css';

/**
 * Renders a Link (if `to` is provided) or a plain button-styled link
 * (if `onClick` is provided instead), always using the app-wide hyperlink
 * colours and hover state (Styling Part 1.4).
 */
function Hyperlink({ to, onClick, children, className = '' }) {
  const cls = `app-hyperlink ${className}`.trim();
  if (to) {
    return <Link to={to} className={cls}>{children}</Link>;
  }
  return (
    <button type="button" onClick={onClick} className={`${cls} app-hyperlink-button`}>
      {children}
    </button>
  );
}

export default Hyperlink;
