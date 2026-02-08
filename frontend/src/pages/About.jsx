import { useConfig } from '../context/ConfigContext';

const About = () => {
    const { config, loading } = useConfig();
    if (loading || !config) return <div className="container" style={{ padding: '60px' }}>Loading...</div>;
    const schoolConfig = config;

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <h1 className="section-title">About Us</h1>

            <section style={{ marginBottom: '40px' }}>
                <h2>History</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>
                    {schoolConfig.historyDescription}
                </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
                <h2>Core Values</h2>
                <ul style={styles.list}>
                    {schoolConfig.coreValues.map((value, index) => (
                        <li key={index}><strong>{value.title}:</strong> {value.desc}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Management Team</h2>
                <div style={styles.teamGrid} className="grid-responsive">
                    <div style={styles.teamMember}>
                        <img
                            src={schoolConfig.images.principal}
                            alt={schoolConfig.principal.name}
                            style={{ ...styles.avatar, width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', backgroundColor: 'transparent' }}
                        />
                        <h3>{schoolConfig.principal.name}</h3>
                        <p>Principal</p>
                    </div>
                    {schoolConfig.management.vicePrincipals.map((vp, index) => (
                        <div key={index} style={styles.teamMember}>
                            <div style={styles.avatar}>{vp.initials}</div>
                            <h3>{vp.name}</h3>
                            <p>{vp.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

const styles = {
    list: {
        listStyleType: 'disc',
        paddingLeft: '20px',
        marginTop: '10px',
    },
    teamGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '30px',
        marginTop: '20px',
    },
    teamMember: {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    avatar: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#008751',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 15px',
        fontSize: '24px',
        fontWeight: 'bold',
    }
};

export default About;
