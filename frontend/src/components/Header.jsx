import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

const Header = () => {
    const { config, loading } = useConfig();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (loading || !config) return null;
    const schoolConfig = config;


    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Helper for navigation link styles
    const getNavLinkStyle = ({ isActive }) => ({
        ...styles.navLink,
        color: isActive ? 'var(--primary-color)' : 'var(--text-color)',
        fontWeight: isActive ? 'bold' : '500',
    });

    // Helper specifically for the portal link to maintain its button appearance but color only when active
    const getPortalLinkStyle = ({ isActive }) => ({
        ...styles.portalLink,
        backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
        color: isActive ? 'white' : 'var(--primary-color)',
        border: `2px solid var(--primary-color)`,
    });

    return (
        <header style={styles.header} className="no-print">
            <div className="container" style={styles.container}>
                <div style={styles.logo}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {schoolConfig.images.logo && <img src={schoolConfig.images.logo} alt="Logo" style={{ height: '80px' }} />}
                        <h1>{schoolConfig.name}</h1>
                    </Link>
                </div>

                <button style={styles.mobileMenuBtn} onClick={toggleMenu}>
                    ☰
                </button>

                <nav style={styles.nav} className={isMenuOpen ? 'open' : ''}>
                    <ul style={styles.navList}>
                        <li><NavLink to="/" style={getNavLinkStyle} onClick={toggleMenu} end>Home</NavLink></li>
                        <li><NavLink to="/about" style={getNavLinkStyle} onClick={toggleMenu}>About Us</NavLink></li>
                        <li><NavLink to="/academics" style={getNavLinkStyle} onClick={toggleMenu}>Academics</NavLink></li>
                        <li><NavLink to="/admissions" style={getNavLinkStyle} onClick={toggleMenu}>Admissions</NavLink></li>
                        <li><NavLink to="/gallery" style={getNavLinkStyle} onClick={toggleMenu}>Gallery</NavLink></li>
                        <li><NavLink to="/news" style={getNavLinkStyle} onClick={toggleMenu}>News</NavLink></li>
                        <li><NavLink to="/contact" style={getNavLinkStyle} onClick={toggleMenu}>Contact</NavLink></li>
                        <li><NavLink to="/portal" style={getPortalLinkStyle} onClick={toggleMenu}>Student Portal</NavLink></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

const styles = {
    header: {
        backgroundColor: 'var(--secondary-color)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '10px 0',
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        color: 'var(--primary-color)',
    },
    nav: {
        display: 'flex',
    },
    navList: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
    },
    navLink: {
        fontWeight: '500',
        color: 'var(--text-color)',
    },
    portalLink: {
        padding: '8px 16px',
        borderRadius: '5px',
        fontWeight: 'bold',
    },
    mobileMenuBtn: {
        display: 'none',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: 'var(--primary-color)',
    },
    // Media Queries added via inline check or CSS file
};

// Add responsive styles to Header
const headerStyles = `
@media (max-width: 768px) {
    header .container {
        padding: 5px 15px;
    }
    header h1 {
        font-size: 1.2rem;
    }
    header nav {
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        flex-direction: column;
        padding: 20px;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        z-index: 999;
        display: block !important;
    }
    header nav.open {
        transform: translateX(0);
    }
    header ul {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start !important;
    }
    header button {
        display: block !important;
    }
    header li {
        width: 100%;
    }
    header li a {
        display: block;
        padding: 10px 0;
        font-size: 1.1rem;
        border-bottom: 1px solid #eee;
    }
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerText = headerStyles;
    document.head.appendChild(style);
}

export default Header;
