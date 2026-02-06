import { useConfig } from '../context/ConfigContext';

const Footer = () => {
    const { config, loading } = useConfig();
    const currentYear = new Date().getFullYear();

    if (loading || !config) return null;
    const schoolConfig = config;


    return (
        <footer style={styles.footer} className="no-print">
            <div className="container">
                <div style={styles.grid}>
                    <div>
                        <h3>{schoolConfig.name}</h3>
                        <p>{schoolConfig.motto}</p>
                    </div>
                    <div>
                        <h4>Quick Links</h4>
                        <ul style={styles.links}>
                            <li><a href="/about">History</a></li>
                            <li><a href="/admissions">Apply Now</a></li>
                            <li><a href="/portal">Check Results</a></li>
                            <li><a href="/admin">Admin Login</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Contact Us</h4>
                        <p>{schoolConfig.contact.address}</p>
                        <p>Email: {schoolConfig.contact.email}</p>
                        <p>Phone: {schoolConfig.contact.phone}</p>
                    </div>
                </div>
                <div style={styles.copyright}>
                    <p>&copy; {currentYear} {schoolConfig.fullName}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: 'var(--accent-color)',
        color: 'white',
        padding: '40px 0 20px',
        marginTop: 'auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '20px',
    },
    links: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    copyright: {
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        paddingTop: '20px',
        fontSize: '0.9rem',
    }
};

export default Footer;
