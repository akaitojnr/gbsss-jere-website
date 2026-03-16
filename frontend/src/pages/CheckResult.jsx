import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useConfig } from '../context/ConfigContext';
import { API_BASE_URL } from '../config';

const CheckResult = () => {
    const [regNumber, setRegNumber] = useState('');
    const [password, setPassword] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('1st Term');
    const [selectedSession, setSelectedSession] = useState('2025/2026');
    const [student, setStudent] = useState(null);
    const [activeResult, setActiveResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { config } = useConfig();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ regNumber, password }),
            });

            const data = await response.json();
            if (data.success) {
                setStudent(data.student);
                // Find results for selected term/session
                const termData = data.student.termlyResults?.find(tr => tr.term === selectedTerm && tr.session === selectedSession);
                if (termData) {
                    setActiveResult(termData);
                } else if (data.student.results && data.student.results.length > 0) {
                    // Fallback to legacy if no term data found but legacy results exist
                    setActiveResult({ results: data.student.results, position: data.student.position });
                } else {
                    setError(`No results found for ${selectedTerm} (${selectedSession})`);
                    setStudent(null);
                }
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setStudent(null);
        setRegNumber('');
        setPassword('');
    };

    const getRemark = (grade) => {
        const g = grade?.toUpperCase();
        if (g === 'A') return 'EXCELLENT';
        if (['B2', 'B3'].includes(g)) return 'VERY GOOD';
        if (['C4', 'C5', 'C6'].includes(g)) return 'GOOD';
        if (['D7', 'E8'].includes(g)) return 'PASS';
        if (g === 'F9') return 'FAIL';
        return 'GOOD';
    };

    if (student) {
        return (
            <div className="container" style={{ padding: '60px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="no-print">
                    <h1 className="section-title" style={{ margin: 0 }}>Termly Result</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => window.print()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            Print Result
                        </button>
                        <button onClick={handleLogout} className="btn" style={{ backgroundColor: '#dc3545', color: 'white' }}>Close</button>
                    </div>
                </div>

                {/* Professional Result Sheet Section */}
                <div id="printable-result" style={styles.resultSheet}>
                    <div style={styles.resultHeader}>
                        {config.images?.logo && (
                            <img src={config.images.logo} alt="Logo" style={styles.resultLogo} />
                        )}
                        <div style={styles.schoolInfo}>
                            <h2 style={styles.schoolName}>{config.fullName || config.name}</h2>
                            <p style={styles.schoolMotto}><em>"{config.motto}"</em></p>
                            <p style={styles.schoolContact}>
                                {config.contact?.address} | Tel: {config.contact?.phone}
                            </p>
                            <p style={styles.schoolContact}>{config.contact?.email}</p>
                        </div>
                    </div>

                    <div style={styles.reportTitle}>
                        STUDENT ACADEMIC PROGRESS REPORT
                    </div>

                    <div style={styles.studentDetailsGrid}>
                        <div style={styles.detailItem}><strong>NAME:</strong> {student.name}</div>
                        <div style={styles.detailItem}><strong>REG NO:</strong> {student.regNumber}</div>
                        <div style={styles.detailItem}><strong>CLASS:</strong> {student.class}</div>
                        <div style={styles.detailItem}><strong>TERM:</strong> {selectedTerm}</div>
                        <div style={styles.detailItem}><strong>SESSION:</strong> {selectedSession}</div>
                        <div style={styles.detailItem}><strong>CLASS POSITION:</strong> {activeResult?.position || 'N/A'}</div>
                    </div>

                    <table style={styles.resultTable}>
                        <thead>
                            <tr>
                                <th style={styles.rth}>SUBJECT</th>
                                <th style={styles.rth}>TOTAL (100)</th>
                                <th style={styles.rth}>GRADE</th>
                                <th style={styles.rth}>REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeResult?.results.map((result, index) => (
                                <tr key={index}>
                                    <td style={styles.rtd}><strong>{result.subject}</strong></td>
                                    <td style={styles.rtd}>{result.score}</td>
                                    <td style={styles.rtd}>{result.grade}</td>
                                    <td style={styles.rtd}>{getRemark(result.grade)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                             <tr style={{ background: '#f8f9fa' }}>
                                <td style={styles.rtd}><strong>TOTAL SCORE:</strong></td>
                                <td style={styles.rtd}><strong>{activeResult?.results.reduce((sum, r) => sum + r.score, 0)}</strong></td>
                                <td colSpan="2" style={styles.rtd}></td>
                            </tr>
                            <tr style={{ background: '#f8f9fa' }}>
                                <td style={styles.rtd}><strong>AVERAGE:</strong></td>
                                <td style={styles.rtd}><strong>{(activeResult?.results.reduce((sum, r) => sum + r.score, 0) / (activeResult?.results.length || 1)).toFixed(2)}%</strong></td>
                                <td colSpan="2" style={styles.rtd}></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#555' }}>
                            <strong>Scan to Verify Authenticity</strong>
                        </div>
                        <QRCodeSVG
                            value={`${window.location.origin}/verify?reg=${encodeURIComponent(student.regNumber)}&term=${encodeURIComponent(selectedTerm)}&session=${encodeURIComponent(selectedSession)}`}
                            size={100}
                            level="H"
                            includeMargin={false}
                        />
                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#777' }}>
                            This is a computer-generated document. No signature is required.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '500px' }}>
            <h1 className="section-title" style={{ textAlign: 'center' }}>Direct Result Access</h1>
            <div style={styles.loginCard}>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                    Enter your Registration Number and Password to view and print your result record.
                </p>
                <form onSubmit={handleLogin}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Registration Number</label>
                        <input
                            type="text"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            placeholder="e.g. SCH/2026/001"
                            required
                            style={styles.input}
                        />
                    </div>
                     <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ ...styles.formGroup, flex: 1 }}>
                            <label style={styles.label}>Term</label>
                            <select
                                value={selectedTerm}
                                onChange={(e) => setSelectedTerm(e.target.value)}
                                style={styles.input}
                            >
                                <option value="1st Term">1st Term</option>
                                <option value="2nd Term">2nd Term</option>
                                <option value="3rd Term">3rd Term</option>
                            </select>
                        </div>
                        <div style={{ ...styles.formGroup, flex: 1 }}>
                            <label style={styles.label}>Session</label>
                            <select
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                                style={styles.input}
                            >
                                <option value="2024/2025">2024/2025</option>
                                <option value="2025/2026">2025/2026</option>
                                <option value="2026/2027">2026/2027</option>
                            </select>
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={styles.input}
                        />
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isLoading}>
                        {isLoading ? 'Fetching Result...' : 'Check Result'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    loginCard: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '1rem',
    },
    error: {
        color: '#dc3545',
        marginBottom: '15px',
        textAlign: 'center'
    },
    resultSheet: {
        backgroundColor: 'white',
        padding: '20px',
        marginTop: '0px',
        color: '#000',
        maxWidth: '750px',
        margin: '0 auto',
        fontSize: '0.8rem',
    },
    resultHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        borderBottom: '1.5px solid #333',
        paddingBottom: '5px',
        marginBottom: '5px',
    },
    resultLogo: {
        width: '60px',
        height: '60px',
        objectFit: 'contain',
    },
    schoolInfo: {
        textAlign: 'center',
    },
    schoolName: {
        margin: '0 0 2px 0',
        color: '#004d40',
        fontSize: '1.3rem',
        textTransform: 'uppercase',
    },
    schoolMotto: {
        margin: '0 0 5px 0',
        fontSize: '0.9rem',
        color: '#555',
    },
    schoolContact: {
        margin: '1px 0',
        fontSize: '0.8rem',
    },
    reportTitle: {
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textDecoration: 'underline',
        margin: '5px 0',
        textTransform: 'uppercase',
    },
    studentDetailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '10px',
        borderBottom: '1px solid #333',
        paddingBottom: '5px',
    },
    detailItem: {
        fontSize: '0.9rem',
    },
    resultTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '10px',
    },
    rth: {
        border: '1px solid #333',
        padding: '8px',
        backgroundColor: '#f2f2f2',
        fontSize: '0.85rem',
        textAlign: 'center',
    },
    rtd: {
        border: '1px solid #333',
        padding: '4px',
        fontSize: '0.8rem',
        textAlign: 'center',
    },
};

export default CheckResult;
