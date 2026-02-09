import { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { API_BASE_URL as API_URL } from '../config';

const Admissions = () => {
    const { config, loading } = useConfig();
    const [pin, setPin] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        const auth = sessionStorage.getItem('admission_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidating(true);
        try {
            console.log("Submitting PIN:", pin.trim());
            const res = await fetch(`${API_URL}/api/admission-pins/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: pin.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
                sessionStorage.setItem('admission_auth', 'true');
            } else {
                setError(data.message || 'Invalid PIN');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setValidating(false);
        }
    };

    if (loading || !config) return <div className="container" style={{ padding: '60px' }}>Loading...</div>;

    const schoolConfig = config;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            {!isAuthenticated ? (
                <div style={styles.pinGate}>
                    <div style={styles.pinCard}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Admission Access</h2>
                        <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px' }}>
                            Please enter your assigned 6-digit PIN to access and download the admission form.
                        </p>
                        <form onSubmit={handlePinSubmit}>
                            <input
                                type="text"
                                placeholder="Enter 6-digit PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                style={styles.pinInput}
                                maxLength="6"
                                required
                            />
                            {error && <p style={styles.error}>{error}</p>}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '15px' }}
                                disabled={validating}
                            >
                                {validating ? 'Validating...' : 'Access Form'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <>
                    <div className="no-print">
                        <h1 className="section-title">Admissions</h1>

                        <div style={styles.content}>
                            <section style={styles.card}>
                                <h2>Why Choose Us?</h2>
                                <p>We provide a nurturing environment that fosters academic excellence and moral uprightness.</p>
                            </section>

                            <section style={{ marginTop: '30px' }}>
                                <h2>Admission Requirements</h2>
                                <h3>SSS 1</h3>
                                <ul style={styles.list}>
                                    {schoolConfig.admissions.requirements.sss1.map((req, index) => (
                                        <li key={index}>{req}</li>
                                    ))}
                                </ul>
                            </section>

                            <section style={{ marginTop: '30px' }}>
                                <h2>Application Procedure</h2>
                                <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
                                    {schoolConfig.admissions.procedure.map((step, index) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ol>
                            </section>

                            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                                <button onClick={handlePrint} className="btn btn-primary">
                                    🖨️ Print / Download Admission Form
                                </button>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
                                    Click to open the professional form for printing or saving as PDF.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hidden Printable Form */}
                    <div id="printable-form" style={styles.printOnly}>
                        <div style={styles.formBorder}>
                            {/* Header */}
                            <div style={styles.formHeader}>
                                {schoolConfig.images.logo && <img src={schoolConfig.images.logo} alt="Logo" style={styles.formLogo} />}
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <h1 style={styles.schoolName}>{schoolConfig.fullName}</h1>
                                    <p style={styles.motto}>{schoolConfig.motto}</p>
                                    <p style={styles.contact}>{schoolConfig.contact.address}</p>
                                    <p style={styles.contact}>{schoolConfig.contact.phone} | {schoolConfig.contact.email}</p>
                                </div>
                                <div style={styles.passportBox}>AFFIX PASSPORT PHOTOGRAPH HERE</div>
                            </div>

                            <h2 style={styles.formTitle}>ADMISSION APPLICATION FORM</h2>

                            <div style={styles.formSection}>
                                <h3 style={styles.sectionHeading}>STUDENT BIO-DATA</h3>
                                <div style={styles.grid}>
                                    <div style={styles.field}>SURNAME: <span style={styles.line}></span></div>
                                    <div style={styles.field}>OTHER NAMES: <span style={styles.line}></span></div>
                                    <div style={styles.field}>DATE OF BIRTH: <span style={styles.line}></span></div>
                                    <div style={styles.field}>GENDER: <span style={styles.line}></span></div>
                                    <div style={styles.field}>STATE OF ORIGIN: <span style={styles.line}></span></div>
                                    <div style={styles.field}>L.G.A: <span style={styles.line}></span></div>
                                    <div style={styles.field}>RELIGION: <span style={styles.line}></span></div>
                                    <div style={styles.field}>BLOOD GROUP: <span style={styles.line}></span></div>
                                </div>
                            </div>

                            <div style={styles.formSection}>
                                <h3 style={styles.sectionHeading}>ACADEMIC HISTORY</h3>
                                <div style={styles.field}>PREVIOUS SCHOOL ATTENDED: <span style={styles.line}></span></div>
                                <div style={{ ...styles.field, marginTop: '10px' }}>CLASS APPLIED FOR: <span style={styles.line}></span></div>
                            </div>

                            <div style={styles.formSection}>
                                <h3 style={styles.sectionHeading}>PARENT / GUARDIAN INFORMATION</h3>
                                <div style={styles.grid}>
                                    <div style={styles.field}>NAME: <span style={styles.line}></span></div>
                                    <div style={styles.field}>RELATIONSHIP: <span style={styles.line}></span></div>
                                    <div style={styles.field}>OCCUPATION: <span style={styles.line}></span></div>
                                    <div style={styles.field}>PHONE NUMBER: <span style={styles.line}></span></div>
                                </div>
                                <div style={{ ...styles.field, marginTop: '10px' }}>RESIDENTIAL ADDRESS: <span style={styles.line}></span></div>
                            </div>

                            <div style={styles.formSection}>
                                <h3 style={styles.sectionHeading}>DECLARATION</h3>
                                <p style={{ fontSize: '0.9rem' }}>
                                    I hereby certify that the information provided above is true and correct to the best of my knowledge.
                                    I agree to abide by the rules and regulations of {schoolConfig.name}.
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                                    <div style={{ width: '200px' }}>
                                        <div style={{ borderBottom: '1px solid black', height: '30px' }}></div>
                                        <p style={{ textAlign: 'center', fontSize: '0.8rem' }}>Parent's Signature & Date</p>
                                    </div>
                                    <div style={{ width: '200px' }}>
                                        <div style={{ borderBottom: '1px solid black', height: '30px' }}></div>
                                        <p style={{ textAlign: 'center', fontSize: '0.8rem' }}>Principal's Signature & Date</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', fontSize: '0.7rem', color: '#555', textAlign: 'center', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                                FOR OFFICE USE ONLY: Form No: ___________ | Date Received: ___________ | Processed By: ___________
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style>
                {`
                @media screen {
                    #printable-form { display: none; }
                }
                @media print {
                    body * { visibility: hidden; }
                    #printable-form, #printable-form * { visibility: visible; }
                    #printable-form {
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print { display: none !important; }
                    @page { size: A4; margin: 10mm; }
                }
                `}
            </style>
        </div>
    );
};

const styles = {
    content: {
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    list: {
        listStyleType: 'square',
        paddingLeft: '20px',
        marginTop: '10px',
    },
    card: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderLeft: '4px solid var(--primary-color)',
    },
    // Print Styles
    printOnly: {
        fontFamily: 'serif',
        color: 'black',
        backgroundColor: 'white',
    },
    formBorder: {
        border: '2px solid black',
        padding: '20px',
        minHeight: '270mm', // Approximate A4 height minus margins
    },
    formHeader: {
        display: 'flex',
        alignItems: 'center',
        borderBottom: '2px solid black',
        paddingBottom: '15px',
        marginBottom: '15px',
    },
    formLogo: {
        width: '100px',
        height: '100px',
        objectFit: 'contain',
    },
    schoolName: {
        fontSize: '1.6rem',
        margin: '0',
        color: '#004d40',
        textTransform: 'uppercase',
    },
    motto: {
        fontSize: '1rem',
        fontStyle: 'italic',
        margin: '5px 0',
    },
    contact: {
        fontSize: '0.85rem',
        margin: '2px 0',
    },
    passportBox: {
        width: '120px',
        height: '130px',
        border: '1px solid black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: '0.7rem',
        padding: '5px',
        marginLeft: '10px',
    },
    formTitle: {
        textAlign: 'center',
        textDecoration: 'underline',
        fontSize: '1.4rem',
        margin: '15px 0',
    },
    formSection: {
        marginBottom: '20px',
    },
    sectionHeading: {
        backgroundColor: '#f0f0f0',
        padding: '5px 10px',
        fontSize: '1rem',
        border: '1px solid black',
        marginBottom: '10px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
    },
    field: {
        fontSize: '0.95rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'flex-end',
    },
    line: {
        flex: 1,
        borderBottom: '1px dotted black',
        marginLeft: '10px',
        height: '1.2rem',
    }
};

export default Admissions;
