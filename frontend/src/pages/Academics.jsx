import { useConfig } from '../context/ConfigContext';

const Academics = () => {
    const { config, loading } = useConfig();

    if (loading || !config) return <div className="container" style={{ padding: '60px' }}>Loading...</div>;

    const schoolConfig = config;
    const { sss, calendar } = schoolConfig.academics;


    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <h1 className="section-title">Academics</h1>

            <div style={styles.grid}>
                <section>
                    <h2>Senior Secondary School (SSS)</h2>
                    <p>Our Senior school is a dedicated Science academy, preparing students for WAEC, NECO, and JAMB with a specialized focus on STEM subjects.</p>
                    <ul style={styles.list}>
                        <li><strong>Science Subjects:</strong> {sss.science.join(", ")}</li>
                    </ul>
                </section>
            </div>

            <section style={{ marginTop: '40px' }}>
                <h2>Academic Calendar</h2>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Term</th>
                            <th style={styles.th}>Start Date</th>
                            <th style={styles.th}>End Date</th>
                            <th style={styles.th}>Activities</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calendar.map((item, index) => (
                            <tr key={index}>
                                <td style={styles.td}>{item.term}</td>
                                <td style={styles.td}>{item.start}</td>
                                <td style={styles.td}>{item.end}</td>
                                <td style={styles.td}>{item.activity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
    },
    list: {
        listStyleType: 'disc',
        paddingLeft: '20px',
        marginTop: '10px',
        lineHeight: '1.8',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        backgroundColor: 'white',
    },
    th: {
        border: '1px solid #ddd',
        padding: '12px',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        textAlign: 'left',
    },
    td: {
        border: '1px solid #ddd',
        padding: '12px',
    }
};

export default Academics;
