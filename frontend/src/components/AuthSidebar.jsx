import React from 'react';
import { BioLogLogo, AuthTypesIcon } from './Icons';
import './AuthSidebar.css';

function AuthSidebar() {
  return (
    <aside className="auth-sidebar">
      <div className="auth-sidebar-content">
        <div className="auth-brand-row">
          <BioLogLogo className="auth-brand-logo" />
          <span className="auth-brand-text">BioLog</span>
        </div>

        <div className="auth-sidebar-copy">
          <p className="auth-headline-1">Secure Workforce.</p>
          <p className="auth-headline-2">Smarter Attendance.</p>
          <p className="auth-description">
            Advanced biometric authentication for a more secure and efficient workplace.
          </p>
        </div>
      </div>

      <div className="auth-sidebar-illustration">
        <AuthTypesIcon className="auth-types-img" />
      </div>
    </aside>
  );
}

export default AuthSidebar;
