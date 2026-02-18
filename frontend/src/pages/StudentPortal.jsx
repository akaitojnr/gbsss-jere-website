import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import { API_BASE_URL } from '../config';

const StudentPortal = () => {
    const [regNumber, setRegNumber] = useState('');
    const [password, setPassword] = useState('');
    const [student, setStudent] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Dashboard Data
    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [videoLessons, setVideoLessons] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [view, setView] = useState('dashboard'); // 'dashboard', 'assignments', 'exam', 'video-lessons'
    const [activeExam, setActiveExam] = useState(null);
    const [examAnswers, setExamAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [assignmentAnswers, setAssignmentAnswers] = useState({});
    const { config } = useConfig();

    const handleAssignmentSubmit = async (a) => {
        const answerText = assignmentAnswers[a.id];
        if (!answerText || answerText.trim() === "") return alert("Please type an answer.");

        try {
            const res = await fetch(`${API_BASE_URL}/api/submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentReg: student.regNumber,
                    type: 'assignment',
                    referenceId: a.id,
                    content: answerText
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Assignment Submitted!");
                setAssignmentAnswers(prev => ({ ...prev, [a.id]: '' }));
                fetchDashboardData();
            }
        } catch (err) {
            alert("Error submitting assignment.");
        }
    };

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
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Please ensure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (student) {
            fetchDashboardData();
        }
    }, [student]);

    const fetchDashboardData = async () => {
        try {
            const [aRes, eRes, sRes, vRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/assignments?studentClass=${encodeURIComponent(student.class)}`),
                fetch(`${API_BASE_URL}/api/cbt?studentClass=${encodeURIComponent(student.class)}`),
                fetch(`${API_BASE_URL}/api/submissions/${student.regNumber}`),
                fetch(`${API_BASE_URL}/api/video-lessons`)
            ]);

            setAssignments(await aRes.json());
            setExams(await eRes.json());
            setSubmissions(await sRes.json());
            setVideoLessons(await vRes.json());
        } catch (err) {
            console.error("Error fetching portal data:", err);
        }
    };

    const handleLogout = () => {
        setStudent(null);
        setRegNumber('');
        setPassword('');
        setView('dashboard');
    };

    const startExam = (exam) => {
        setActiveExam(exam);
        setExamAnswers({});
        setCurrentQuestionIdx(0);
        setTimeLeft(exam.timeLimit * 60);
        setView('exam');
    };

    useEffect(() => {
        if (view === 'exam' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (view === 'exam' && timeLeft === 0) {
            submitExam();
        }
    }, [view, timeLeft]);

    const submitExam = async () => {
        let score = 0;
        activeExam.questions.forEach((q, idx) => {
            if (examAnswers[idx] === q.correct) score++;
        });

        try {
            const res = await fetch(`${API_BASE_URL}/api/submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentReg: student.regNumber,
                    type: 'cbt',
                    referenceId: activeExam.id,
                    content: examAnswers,
                    score,
                    total: activeExam.questions.length
                })
            });
            if ((await res.json()).success) {
                alert(`Exam Submitted! Your Score: ${score}/${activeExam.questions.length}`);
                setView('dashboard');
                fetchDashboardData();
            }
        } catch (err) {
            alert("Error submitting exam.");
        }
    };

    const getEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const filteredVideos = selectedCategory === 'All'
        ? videoLessons
        : videoLessons.filter(video => video.category === selectedCategory);

    const videoCategories = ['All', 'Science', 'Arts', 'Commercial', 'General'];

    if (student) {
        return (
            <div className="container" style={{ padding: '60px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="no-print">
                    <div>
                        <h1 className="section-title" style={{ margin: 0 }}>Student Portal</h1>
                        <p>Welcome back, <strong>{student.name}</strong> ({student.class})</p>
                    </div>
                    <div>
                        {view !== 'dashboard' && <button onClick={() => setView('dashboard')} className="btn" style={{ marginRight: '10px' }}>Dashboard</button>}
                        <button onClick={handleLogout} className="btn" style={{ backgroundColor: '#dc3545', color: 'white' }}>Logout</button>
                    </div>
                </div>

                {view === 'dashboard' && (
                    <>
                        <div style={styles.dashboardGrid} className="no-print">
                            <div style={styles.card}>
                                <h3>Academic Profile</h3>
                                <p><strong>Reg Number:</strong> {student.regNumber}</p>
                                <p><strong>Current Class:</strong> {student.class}</p>
                                <p><strong>Status:</strong> <span style={{ color: 'green' }}>Active</span></p>
                            </div>

                            <div style={styles.card}>
                                <h3>Quick Stats</h3>
                                <div style={{ display: 'flex', gap: '20px', textAlign: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{assignments.length}</h2>
                                        <small>Assignments</small>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{exams.length}</h2>
                                        <small>CBT Exams</small>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{videoLessons.length}</h2>
                                        <small>Videos</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '40px' }} className="no-print grid-responsive">
                            <div style={styles.actionCard}>
                                <h3 style={{ color: 'var(--primary-color)' }}>Assignments</h3>
                                {assignments.length === 0 ? <p>No pending assignments.</p> : (
                                    <ul style={{ textAlign: 'left', margin: '15px 0' }}>
                                        {assignments.slice(0, 2).map(a => (
                                            <li key={a.id} style={{ marginBottom: '10px' }}>
                                                <strong>{a.subject}:</strong> {a.title}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button className="btn btn-primary" onClick={() => setView('assignments')}>View All</button>
                            </div>

                            <div style={styles.actionCard}>
                                <h3 style={{ color: 'var(--primary-color)' }}>CBT Exams</h3>
                                {exams.length === 0 ? <p>No active exams.</p> : (
                                    <div style={{ textAlign: 'left', margin: '15px 0' }}>
                                        {exams.slice(0, 2).map(e => (
                                            <div key={e.id} style={{ marginBottom: '5px' }}>
                                                <strong>{e.title}</strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button className="btn btn-primary" onClick={() => setView('dashboard') /* or another way to scroll to it */}>Manage</button>
                            </div>

                            <div style={styles.actionCard}>
                                <h3 style={{ color: 'var(--primary-color)' }}>Video Lessons</h3>
                                <p>{videoLessons.length} available lessons</p>
                                <div style={{ margin: '15px 0' }}>
                                    <small>Access recorded tutorials and study materials.</small>
                                </div>
                                <button className="btn btn-primary" onClick={() => setView('video-lessons')}>Watch Now</button>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="no-print">
                                <h3>Academic Results</h3>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => window.print()}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <span>Print Report Card</span>
                                </button>
                            </div>

                            {/* Professional Result Sheet Section */}
                            <div id="printable-result" style={styles.resultSheet}>
                                {/* Header Section */}
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

                                {/* Student Details Section */}
                                <div style={styles.studentDetailsGrid}>
                                    <div style={styles.detailItem}><strong>NAME:</strong> {student.name}</div>
                                    <div style={styles.detailItem}><strong>REG NO:</strong> {student.regNumber}</div>
                                    <div style={styles.detailItem}><strong>CLASS:</strong> {student.class}</div>
                                    <div style={styles.detailItem}><strong>TERM:</strong> {config.academics?.currentTerm || 'First Term'}</div>
                                    <div style={styles.detailItem}><strong>SESSION:</strong> {config.academics?.currentSession || '2025/2026'}</div>
                                    <div style={styles.detailItem}><strong>STATUS:</strong> PROMOTED</div>
                                </div>

                                {/* Results Table */}
                                <table style={styles.resultTable}>
                                    <thead>
                                        <tr>
                                            <th style={styles.rth}>SUBJECT</th>
                                            <th style={styles.rth}>CA (40)</th>
                                            <th style={styles.rth}>EXAM (60)</th>
                                            <th style={styles.rth}>TOTAL (100)</th>
                                            <th style={styles.rth}>GRADE</th>
                                            <th style={styles.rth}>REMARKS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.results.map((result, index) => (
                                            <tr key={index}>
                                                <td style={styles.rtd}><strong>{result.subject}</strong></td>
                                                <td style={styles.rtd}>{Math.round(result.score * 0.4)}</td>
                                                <td style={styles.rtd}>{result.score - Math.round(result.score * 0.4)}</td>
                                                <td style={styles.rtd}>{result.score}</td>
                                                <td style={styles.rtd}>{result.grade}</td>
                                                <td style={styles.rtd}>{result.grade === 'A' ? 'EXCELLENT' : result.grade === 'B' ? 'VERY GOOD' : 'GOOD'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#f8f9fa' }}>
                                            <td style={styles.rtd}><strong>TOTAL SCORE:</strong></td>
                                            <td colSpan="2" style={styles.rtd}></td>
                                            <td style={styles.rtd}><strong>{student.results.reduce((sum, r) => sum + r.score, 0)}</strong></td>
                                            <td colSpan="2" style={styles.rtd}></td>
                                        </tr>
                                        <tr style={{ background: '#f8f9fa' }}>
                                            <td style={styles.rtd}><strong>AVERAGE:</strong></td>
                                            <td colSpan="2" style={styles.rtd}></td>
                                            <td style={styles.rtd}><strong>{(student.results.reduce((sum, r) => sum + r.score, 0) / student.results.length).toFixed(2)}%</strong></td>
                                            <td colSpan="2" style={styles.rtd}></td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* Signatures Section */}
                                <div style={styles.signatureSection}>
                                    <div style={styles.sigBox}>
                                        <div style={styles.sigLine}></div>
                                        <div>Class Teacher's Signature</div>
                                    </div>
                                    <div style={styles.sigBox}>
                                        <div style={styles.sigLine}></div>
                                        <div>Principal's Signature & Stamp</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {view === 'video-lessons' && (
                    <div style={styles.card}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 className="section-title">Video Lessons</h2>
                            <p className="text-gray-600">Watch recorded lessons and tutorials</p>
                        </div>

                        {/* Category Filter */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
                            {videoCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className="btn"
                                    style={{
                                        backgroundColor: selectedCategory === category ? 'var(--primary-color)' : '#f8f9fa',
                                        color: selectedCategory === category ? 'white' : '#666',
                                        border: '1px solid #ddd',
                                        borderRadius: '25px',
                                        padding: '8px 20px'
                                    }}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                            {filteredVideos.map((video, index) => {
                                const embedUrl = getEmbedUrl(video.youtubeUrl);
                                return (
                                    <motion.div
                                        key={video._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            overflow: 'hidden',
                                            border: '1px solid #eee'
                                        }}
                                    >
                                        <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
                                            {embedUrl ? (
                                                <iframe
                                                    src={embedUrl}
                                                    title={video.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        border: 'none'
                                                    }}
                                                ></iframe>
                                            ) : (
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                    Invalid Video URL
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                backgroundColor: '#e8f5e9',
                                                color: 'var(--primary-color)',
                                                borderRadius: '15px',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                marginBottom: '10px'
                                            }}>
                                                {video.category || 'General'}
                                            </span>
                                            <h3 style={{ fontSize: '1.2rem', margin: '0 0 10px 0', color: '#333' }}>{video.title}</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px', height: '3.6em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                {video.description}
                                            </p>
                                            <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                                Uploaded on {new Date(video.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {filteredVideos.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                                No video lessons found in this category.
                            </div>
                        )}
                    </div>
                )}

                {view === 'assignments' && (
                    <div style={styles.card}>
                        <h2>My Assignments</h2>
                        {assignments.map(a => (
                            <div key={a.id} style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                                <h3>{a.title} ({a.subject})</h3>
                                <p style={{ color: '#666' }}><strong>Due Date:</strong> {a.dueDate}</p>
                                <p>{a.description}</p>
                                <hr />
                                <div style={{ marginTop: '15px' }}>
                                    <label><strong>Submit Answer:</strong></label>
                                    <textarea
                                        style={{ ...styles.input, height: '100px', margin: '10px 0' }}
                                        placeholder="Type your answer here..."
                                        value={assignmentAnswers[a.id] || ''}
                                        onChange={(e) => setAssignmentAnswers(prev => ({ ...prev, [a.id]: e.target.value }))}
                                    ></textarea>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleAssignmentSubmit(a)}
                                    >
                                        Submit Assignment
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'exam' && activeExam && (
                    <div style={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{activeExam.title}</h2>
                                <p style={{ margin: 0, color: '#666' }}>{activeExam.subject}</p>
                            </div>
                            <div style={{ padding: '10px 20px', backgroundColor: '#f8f9fa', borderRadius: '10px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#666' }}>Time Remaining</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: timeLeft < 60 ? '#dc3545' : 'var(--primary-color)' }}>
                                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#e9ecef', borderRadius: '10px', height: '8px', marginBottom: '30px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${((currentQuestionIdx + 1) / activeExam.questions.length) * 100}%`,
                                height: '100%',
                                backgroundColor: 'var(--primary-color)',
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>Question {currentQuestionIdx + 1} of {activeExam.questions.length}</h3>
                            </div>

                            <p style={{ fontSize: '1.4rem', lineHeight: '1.5', color: '#333', marginBottom: '25px', padding: '20px', backgroundColor: '#fdfdfd', borderRadius: '8px', border: '1px solid #eee' }}>
                                {activeExam.questions[currentQuestionIdx].question}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-responsive">
                                {activeExam.questions[currentQuestionIdx].options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => setExamAnswers({ ...examAnswers, [currentQuestionIdx]: oIdx })}
                                        style={{
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: '2px solid',
                                            borderColor: examAnswers[currentQuestionIdx] === oIdx ? 'var(--primary-color)' : '#e9ecef',
                                            background: examAnswers[currentQuestionIdx] === oIdx ? '#f0fff4' : '#fff',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '1.1rem',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            boxShadow: examAnswers[currentQuestionIdx] === oIdx ? '0 4px 12px rgba(0,135,81,0.1)' : 'none'
                                        }}
                                    >
                                        <div style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            border: '2px solid',
                                            borderColor: examAnswers[currentQuestionIdx] === oIdx ? 'var(--primary-color)' : '#ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            backgroundColor: examAnswers[currentQuestionIdx] === oIdx ? 'var(--primary-color)' : 'transparent',
                                            color: examAnswers[currentQuestionIdx] === oIdx ? 'white' : '#666'
                                        }}>
                                            {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #eee', paddingTop: '30px' }}>
                            <button
                                className="btn"
                                onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
                                disabled={currentQuestionIdx === 0}
                                style={{
                                    padding: '12px 25px',
                                    backgroundColor: currentQuestionIdx === 0 ? '#eee' : '#6c757d',
                                    color: 'white',
                                    cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentQuestionIdx === 0 ? 0.5 : 1
                                }}
                            >
                                ← Previous
                            </button>

                            {currentQuestionIdx < activeExam.questions.length - 1 ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                                    style={{ padding: '12px 25px' }}
                                >
                                    Next Question →
                                </button>
                            ) : (
                                <button
                                    className="btn"
                                    onClick={() => { if (window.confirm('Are you sure you want to finish and submit?')) submitExam(); }}
                                    style={{ padding: '12px 40px', backgroundColor: '#28a745', color: 'white', fontWeight: 'bold' }}
                                >
                                    Finish & Submit Exam
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '500px' }}>
            <h1 className="section-title" style={{ textAlign: 'center' }}>Student Portal Login</h1>
            <div style={styles.loginCard}>
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
                        {isLoading ? 'Logging in...' : 'Access Portal'}
                    </button>
                </form>
                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666', background: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                    <p style={{ marginTop: 0 }}><strong>Demo Credentials:</strong></p>
                    <p>Reg No: SCH/2026/001</p>
                    <p style={{ marginBottom: 0 }}>Password: password123</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    dashboardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
    },
    loginCard: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    card: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    },
    actionCard: {
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '8px',
        border: '1px solid #eee',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px',
        backgroundColor: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
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
    },
    resultSheet: {
        backgroundColor: 'white',
        padding: '20px',
        border: '1.5px solid #333',
        marginTop: '10px',
        color: '#000',
        maxWidth: '800px',
        margin: '0 auto',
    },
    resultHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        borderBottom: '1.5px solid #333',
        paddingBottom: '10px',
        marginBottom: '10px',
    },
    resultLogo: {
        width: '80px',
        height: '80px',
        objectFit: 'contain',
    },
    schoolInfo: {
        textAlign: 'center',
    },
    schoolName: {
        margin: '0 0 2px 0',
        color: '#004d40',
        fontSize: '1.5rem',
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
        margin: '10px 0',
        textTransform: 'uppercase',
    },
    studentDetailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        padding: '10px',
        backgroundColor: '#fcfcfc',
    },
    detailItem: {
        fontSize: '0.85rem',
    },
    resultTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
    },
    rth: {
        border: '1px solid #000',
        padding: '6px',
        backgroundColor: '#f0f0f0',
        textAlign: 'left',
        fontSize: '0.8rem',
    },
    rtd: {
        border: '1px solid #000',
        padding: '6px',
        fontSize: '0.8rem',
    },
    signatureSection: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '30px',
    },
    sigBox: {
        textAlign: 'center',
        width: '180px',
    },
    sigLine: {
        borderBottom: '1px solid #000',
        marginBottom: '5px',
    }
};

// Add Print Styles
const printStyles = `
@media print {
    body * {
        visibility: hidden;
    }
    #printable-result, #printable-result * {
        visibility: visible;
    }
    #printable-result {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 20px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .no-print {
        display: none !important;
    }
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);
}

export default StudentPortal;
