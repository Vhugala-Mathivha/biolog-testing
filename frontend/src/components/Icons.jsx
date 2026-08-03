// Central icon registry. Every icon used anywhere in the app is imported
// from here, per the "icons imported from Icons.jsx" convention.
//
// PROVIDED BY DESIGNER (real PNG assets, in src/assets/icons/):
//   BioLogLogo, AuthTypesIcon, HouseIcon, GearIcon, MultipleUsersIcon,
//   UserIcon, LockIcon, ProfileIcon, EditIcon, BinIcon, MailIcon
//
// NOT YET PROVIDED - built as inline SVG placeholders below, swap out for
// real assets the same way as the others the moment they exist:
//   LogoutIcon, CardIcon, CameraIcon, LateIcon, PresentIcon, AbsentIcon,
//   EyeOpenIcon, EyeClosedIcon

import biologLogoSrc from "../assets/icons/biolog-logo.png";
import authTypesSrc from "../assets/icons/auth-types-icon.png";
import houseSrc from "../assets/icons/house-icon.png";
import gearSrc from "../assets/icons/gear-icon.png";
import multipleUsersSrc from "../assets/icons/multiple-users-icon.png";
import userSrc from "../assets/icons/user-icon.png";
import lockSrc from "../assets/icons/lock-icon.png";
import profileSrc from "../assets/icons/profile-icon.png";
import editSrc from "../assets/icons/edit-icon.png";
import binSrc from "../assets/icons/bin-icon.png";
import mailSrc from "../assets/icons/mail-icon.png";

// --- Image-backed icons -----------------------------------------------

export function BioLogLogo({ className, alt = "BioLog" }) {
  return <img src={biologLogoSrc} alt={alt} className={className} />;
}

export function AuthTypesIcon({ className, alt = "" }) {
  return <img src={authTypesSrc} alt={alt} className={className} />;
}

export function HouseIcon({ className, alt = "" }) {
  return <img src={houseSrc} alt={alt} className={className} />;
}

export function GearIcon({ className, alt = "" }) {
  return <img src={gearSrc} alt={alt} className={className} />;
}

export function MultipleUsersIcon({ className, alt = "" }) {
  return <img src={multipleUsersSrc} alt={alt} className={className} />;
}

export function UserIcon({ className, alt = "" }) {
  return <img src={userSrc} alt={alt} className={className} />;
}

export function LockIcon({ className, alt = "" }) {
  return <img src={lockSrc} alt={alt} className={className} />;
}

export function ProfileIcon({ className, alt = "" }) {
  return <img src={profileSrc} alt={alt} className={className} />;
}

export function EditIcon({ className, alt = "" }) {
  return <img src={editSrc} alt={alt} className={className} />;
}

export function BinIcon({ className, alt = "" }) {
  return <img src={binSrc} alt={alt} className={className} />;
}

export function MailIcon({ className, alt = "" }) {
  return <img src={mailSrc} alt={alt} className={className} />;
}

// --- Generated placeholder icons (inline SVG, currentColor-based) ------
// currentColor lets these inherit color via CSS (e.g. turning white when
// a sidebar button is "active", per the spec).

export function LogoutIcon({ className, size = 20 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function CardIcon({ className, size = 20 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

export function CameraIcon({ className, size = 20 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function LateIcon({ className, size = 28 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8a6d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 15.5 14.5" />
    </svg>
  );
}

export function PresentIcon({ className, size = 28 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1f8a2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}

export function AbsentIcon({ className, size = 28 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#a11e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function EyeOpenIcon({ className, size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeClosedIcon({ className, size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a18.6 18.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
