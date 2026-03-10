import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { API_BASE_URL } from '../config';

const VerifyResult = () => {
    const { config } = useConfig();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const regNumberParam = queryParams.get('reg') || '';

    const [regNumber, setRegNumber] = useState(regNumberParam);
    const [student, setStudent] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (regNumberParam) {
            handleVerify(regNumberParam);
        }
    }, [regNumberParam]);

    const handleVerify = async (regToSearch) => {
        if (!regToSearch) return;
        setStatus('loading');
        try {
            const response = await fetch(`${API_BASE_URL}/api/students/verify/${encodeURIComponent(regToSearch)}`);
            const data = await response.json();

            if (data.success && data.student) {
                setStudent(data.student);
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMsg(data.message || 'Student not found.');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('Connection error verifying the result.');
        }
    };

    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="section-title" style={{ textAlign: 'center' }}>Verify Result Authenticity</h1>

            {!student && (
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '30px' }}>
                    <p style={{ marginBottom: '20px' }}>Enter a Student Registration Number below to verify their academic results against the school's official database.</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <input
                            type="text"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            placeholder="e.g. SCH/2026/001"
                            style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem', width: '60%', maxWidth: '300px' }}
                        />
                        <button
                            onClick={() => handleVerify(regNumber)}
                            className="btn btn-primary"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Verifying...' : 'Verify Now'}
                        </button>
                    </div>
                    {status === 'error' && <p style={{ color: 'red', marginTop: '15px' }}>❌ {errorMsg}</p>}
                </div>
            )}

            {status === 'success' && student && (
                <div style={{ backgroundColor: 'white', border: '2px solid #28a745', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                    <div style={{ backgroundColor: '#28a745', color: 'white', padding: '15px', textAlign: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.8rem' }}>✓</span> VERIFIED AUTHENTIC RECORD
                        </h2>
                    </div>

                    <div style={{ padding: '30px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <div>
                                <p style={{ margin: '5px 0', color: '#666' }}>Student Name</p>
                                <strong style={{ fontSize: '1.2rem' }}>{student.name}</strong>
                            </div>
                            <div>
                                <p style={{ margin: '5px 0', color: '#666' }}>Registration Num</p>
                                <strong style={{ fontSize: '1.2rem' }}>{student.regNumber}</strong>
                            </div>
                            <div>
                                <p style={{ margin: '5px 0', color: '#666' }}>Class</p>
                                <strong style={{ fontSize: '1.2rem' }}>{student.class}</strong>
                            </div>
                            <div>
                                <p style={{ margin: '5px 0', color: '#666' }}>Verification Date</p>
                                <strong style={{ fontSize: '1.2rem' }}>{new Date().toLocaleDateString()}</strong>
                            </div>
                        </div>

                        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Academic Results</h3>

                        {(!student.results || student.results.length === 0) ? (
                            <p>No subject results recorded yet.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Subject</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Score</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {student.results.map((r, i) => (
                                        <tr key={i}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}><strong>{r.subject}</strong></td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{r.score}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: r.grade === 'F9' ? 'red' : 'inherit', fontWeight: 'bold' }}>{r.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => { setStudent(null); setRegNumber(''); setStatus('idle'); }}>
                                Verify Another Result
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyResult;
