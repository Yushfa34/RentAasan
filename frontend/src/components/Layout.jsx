import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LANGUAGES, useLanguage } from '../i18n';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function onLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <div>
      <header className="topbar">
        <Link to="/" className="brand">RentAasan</Link>
        {user && (
          <button
            type="button"
            className="menu-btn"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            &#9776;
          </button>
        )}
        <nav className={`nav${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}>
          {user?.role === 'landlord' && (
            <>
              <Link to="/landlord">{t('dashboard')}</Link>
              <Link to="/commissions">{t('commissions')}</Link>
            </>
          )}
          {user?.role === 'tenant' && <Link to="/tenant">{t('dashboard')}</Link>}
          {user?.role === 'dealer' && (
            <>
              <Link to="/dealer">{t('dashboard')}</Link>
              <Link to="/dealer/landlords">{t('myLandlords')}</Link>
              <Link to="/dealer/properties">{t('properties')}</Link>
              <Link to="/dealer/inquiries">{t('inquiries')}</Link>
              <Link to="/dealer/agreements">{t('agreements')}</Link>
              <Link to="/dealer/commissions">{t('commissions')}</Link>
            </>
          )}
        </nav>
        <div className="topbar-right">
          <div className="lang-switch" role="group" aria-label="Language">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={lang === l.code ? 'active' : ''}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          {user && <span className="muted topbar-user">{user.name} ({user.role})</span>}
          {user && <button className="btn btn-ghost" onClick={onLogout}>{t('logout')}</button>}
        </div>
      </header>
      <main className="container">
        {children}
      </main>
    </div>
  );
}
