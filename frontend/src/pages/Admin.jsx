import { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { API_BASE_URL, getImageUrl } from '../config';

const Admin = () => {
    const { config, loading, updateConfig, refreshConfig } = useConfig();
    const [activeTab, setActiveTab] = useState('gallery');

    // Gallery States
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [status, setStatus] = useState('');
    const [preview, setPreview] = useState(null);
    const [gallery, setGallery] = useState([]);

    // News States
    const [news, setNews] = useState([]);
    const [newsForm, setNewsForm] = useState({ id: null, title: '', date: '', content: '' });
    const [newsStatus, setNewsStatus] = useState('');
    const [editingNews, setEditingNews] = useState(false);

    // Settings States
    const [settings, setSettings] = useState(null);
    const [saveStatus, setSaveStatus] = useState('');

    // Image Upload States
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageUploadStatus, setImageUploadStatus] = useState('');

    // Student Management States
    const [students, setStudents] = useState([]);
    const [studentForm, setStudentForm] = useState({ regNumber: '', password: '', name: '', class: '', results: [] });
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentStatus, setStudentStatus] = useState('');
    const [csvFile, setCsvFile] = useState(null);
    const [importStatus, setImportStatus] = useState('');

    // Assignments States
    const [assignments, setAssignments] = useState([]);
    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', subject: '', class: '' });
    const [assignmentStatus, setAssignmentStatus] = useState('');

    const [exams, setExams] = useState([]);
    const [examForm, setExamForm] = useState({ title: '', subject: '', class: '', timeLimit: 30, questions: [{ question: '', options: ['', '', '', ''], correct: 0 }] });
    const [examStatus, setExamStatus] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [importQStatus, setImportQStatus] = useState('');

    // Contact Messages State
    const [contacts, setContacts] = useState([]);

    // Admission PINs State
    const [pins, setPins] = useState([]);
    const [pinForm, setPinForm] = useState({ count: 1, candidateName: '' });
    const [pinStatus, setPinStatus] = useState('');

    // Authentication States
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('adminAuth') === 'true');
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === 'gbsss@jere/admin') {
            setIsAuthenticated(true);
            sessionStorage.setItem('adminAuth', 'true');
            setAuthError('');
        } else {
            setAuthError('Invalid password. Please try again.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('adminAuth');
    };

    useEffect(() => {
        if (config) {
            setSettings(JSON.parse(JSON.stringify(config))); // Deep copy
        }
    }, [config]);

    const fetchGallery = () => {
        fetch(`${API_BASE_URL}/api/gallery`)
            .then(res => res.json())
            .then(data => setGallery(data))
            .catch(err => console.error("Error fetching gallery:", err));
    };

    const fetchNews = () => {
        fetch(`${API_BASE_URL}/api/news`)
            .then(res => res.json())
            .then(data => setNews(data))
            .catch(err => console.error("Error fetching news:", err));
    };

    const fetchStudents = () => {
        fetch(`${API_BASE_URL}/api/students`)
            .then(res => res.json())
            .then(data => setStudents(data))
            .catch(err => console.error("Error fetching students:", err));
    };

    const fetchAssignments = () => {
        fetch(`${API_BASE_URL}/api/assignments`)
            .then(res => res.json())
            .then(data => setAssignments(data))
            .catch(err => console.error("Error fetching assignments:", err));
    };

    const fetchExams = () => {
        fetch(`${API_BASE_URL}/api/cbt`)
            .then(res => res.json())
            .then(data => setExams(data))
            .catch(err => console.error("Error fetching exams:", err));
        const fetchExams = () => {
            fetch(`${API_BASE_URL}/api/cbt`)
                .then(res => res.json())
                .then(data => setExams(data))
                .catch(err => console.error("Error fetching exams:", err));
        };

        const fetchPins = () => {
            fetch(`${API_BASE_URL}/api/admission-pins`)
                .then(res => res.json())
                .then(data => setPins(data))
                .catch(err => console.error("Error fetching pins:", err));
        };

        const fetchContacts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/contacts`);
                const data = await res.json();
                setContacts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching contacts:', err);
            }
        };

        const handleContactDelete = async (id) => {
            if (!window.confirm('Are you sure you want to delete this message?')) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/contacts/${id}`, { method: 'DELETE' });
                if ((await res.json()).success) fetchContacts();
            } catch (err) {
                console.error(err);
            }
        };

        useEffect(() => {
            fetchGallery();
            fetchNews();
            fetchStudents();
            fetchAssignments();
            fetchExams();
            fetchExams();
            fetchContacts();
            fetchPins();
        }, []);

        if (!isAuthenticated) {
            return (
                <div className="container" style={{ padding: '100px 20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={styles.card}>
                        <img src={config?.images?.logo} alt="Logo" style={{ width: '80px', marginBottom: '20px' }} />
                        <h2 style={{ marginBottom: '20px' }}>Admin Login</h2>
                        <form onSubmit={handleLogin}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Enter Admin Password</label>
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    style={styles.input}
                                    placeholder="Password"
                                    autoFocus
                                />
                            </div>
                            {authError && <p style={{ color: 'red', marginBottom: '15px', fontSize: '0.9rem' }}>{authError}</p>}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                                Access Dashboard
                            </button>
                        </form>
                        <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666' }}>
                            Secured Administrative Area
                        </p>
                    </div>
                </div>
            );
        }

        if (loading || !config || !settings) return <div className="container" style={{ padding: '60px' }}>Loading...</div>;

        // Gallery Handlers
        const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setImage(file);
                setPreview(URL.createObjectURL(file));
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!title || !image) {
                setStatus('Please provide both title and image.');
                return;
            }

            setStatus('Uploading...');
            const formData = new FormData();
            formData.append('title', title);
            formData.append('image', image);

            try {
                console.log(`Uploading gallery to: ${API_BASE_URL}/api/gallery`);
                const res = await fetch(`${API_BASE_URL}/api/gallery`, {
                    method: 'POST',
                    body: formData
                });

                const text = await res.text();
                console.log(`Response Status: ${res.status}`);
                console.log(`Response Body (first 200 chars): ${text.substring(0, 200)}`);

                let data;
                try {
                    data = JSON.parse(text);
                } catch (pErr) {
                    throw new Error(`Invalid server response (Status ${res.status}). Body: ${text.substring(0, 50)}...`);
                }

                if (data.success) {
                    setStatus('Image uploaded successfully!');
                    setTitle('');
                    setImage(null);
                    setPreview(null);
                    fetchGallery();
                } else {
                    setStatus('Upload failed: ' + (data.message || 'Unknown Error'));
                }
            } catch (err) {
                setStatus('Error: ' + err.message);
                console.error(err);
            }
        };

        const handleDelete = async (id) => {
            if (!window.confirm('Are you sure you want to delete this image?')) return;

            try {
                const res = await fetch(`${API_BASE_URL}/api/gallery/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    fetchGallery();
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error('Error deleting image:', err);
            }
        };

        // News Handlers
        const handleNewsSubmit = async (e) => {
            e.preventDefault();
            setNewsStatus('Saving...');

            try {
                const url = editingNews
                    ? `${API_BASE_URL}/api/news/${newsForm.id}`
                    : `${API_BASE_URL}/api/news`;

                const method = editingNews ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newsForm)
                });

                const data = await res.json();
                if (data.success) {
                    setNewsStatus(editingNews ? 'Article updated!' : 'Article added!');
                    setNewsForm({ id: null, title: '', date: '', content: '' });
                    setEditingNews(false);
                    fetchNews();
                } else {
                    setNewsStatus('Failed: ' + data.message);
                }
            } catch (err) {
                setNewsStatus('Error saving article.');
                console.error(err);
            }
        };

        const handleNewsEdit = (article) => {
            setNewsForm(article);
            setEditingNews(true);
            setNewsStatus('');
        };

        const handleNewsDelete = async (id) => {
            if (!window.confirm('Delete this news article?')) return;

            try {
                const res = await fetch(`${API_BASE_URL}/api/news/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    fetchNews();
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error('Error deleting article:', err);
            }
        };

        // Settings Handlers
        const handleSettingsChange = (field, value) => {
            setSettings(prev => ({ ...prev, [field]: value }));
        };

        const handleNestedChange = (obj, field, value) => {
            setSettings(prev => ({
                ...prev,
                [obj]: { ...prev[obj], [field]: value }
            }));
        };

        const handleArrayChange = (obj, index, field, value) => {
            setSettings(prev => {
                const newArray = [...prev[obj]];
                newArray[index] = { ...newArray[index], [field]: value };
                return { ...prev, [obj]: newArray };
            });
        };

        const handleAddToArray = (obj, newItem) => {
            setSettings(prev => ({
                ...prev,
                [obj]: [...prev[obj], newItem]
            }));
        };

        const handleRemoveFromArray = (obj, index) => {
            setSettings(prev => ({
                ...prev,
                [obj]: prev[obj].filter((_, i) => i !== index)
            }));
        };

        const handleSaveSettings = async (e) => {
            e.preventDefault();
            setSaveStatus('Saving...');
            const success = await updateConfig(settings);
            if (success) {
                setSaveStatus('Settings updated successfully!');
                await refreshConfig();
            } else {
                setSaveStatus('Failed to update settings.');
            }
        };

        const handleImageUpload = async (e, field) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploadingImage(true);
            setImageUploadStatus(`Uploading ${field}...`);
            const formData = new FormData();
            formData.append('image', file);

            try {
                console.log(`Uploading image to: ${API_BASE_URL}/api/upload`);
                const res = await fetch(`${API_BASE_URL}/api/upload`, {
                    method: 'POST',
                    body: formData
                });

                const text = await res.text();
                console.log(`Response Status: ${res.status}`);
                console.log(`Response Body (first 200 chars): ${text.substring(0, 200)}`);

                let data;
                try {
                    data = JSON.parse(text);
                } catch (pErr) {
                    throw new Error(`Invalid server response (Status ${res.status}). Body: ${text.substring(0, 50)}...`);
                }

                if (data.success) {
                    const imageUrl = data.url.startsWith('http') ? data.url : `${API_BASE_URL}${data.url}`;
                    handleNestedChange('images', field, imageUrl);
                    setImageUploadStatus('Image uploaded!');
                } else {
                    setImageUploadStatus('Upload failed: ' + (data.message || 'Unknown Error'));
                }
            } catch (err) {
                setImageUploadStatus('Error: ' + err.message);
                console.error(err);
            } finally {
                setUploadingImage(false);
            }
        };

        const handleSliderUpload = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploadingImage(true);
            setImageUploadStatus('Uploading slider image...');
            const formData = new FormData();
            formData.append('image', file);

            try {
                console.log(`Uploading slider to: ${API_BASE_URL}/api/upload`);
                const res = await fetch(`${API_BASE_URL}/api/upload`, {
                    method: 'POST',
                    body: formData
                });

                const text = await res.text();
                console.log(`Response Status: ${res.status}`);
                console.log(`Response Body (first 200 chars): ${text.substring(0, 200)}`);

                let data;
                try {
                    data = JSON.parse(text);
                } catch (pErr) {
                    throw new Error(`Invalid server response (Status ${res.status}). Body: ${text.substring(0, 50)}...`);
                }

                if (data.success) {
                    const imageUrl = data.url.startsWith('http') ? data.url : `${API_BASE_URL}${data.url}`;
                    setSettings(prev => {
                        const currentSlider = prev.images.heroSlider || [];
                        return {
                            ...prev,
                            images: {
                                ...prev.images,
                                heroSlider: [...currentSlider, { url: imageUrl, caption: '' }]
                            }
                        };
                    });
                    setImageUploadStatus('Slider image added! Remember to click "Save All Changes" at the bottom.');
                    e.target.value = ''; // Reset input
                } else {
                    setImageUploadStatus('Upload failed: ' + (data.message || 'Unknown error'));
                    alert('Upload failed: ' + (data.message || 'Unknown error'));
                }
            } catch (err) {
                setImageUploadStatus('Error: ' + err.message);
                alert('Error: ' + err.message);
                console.error(err);
            } finally {
                setUploadingImage(false);
            }
        };

        const removeSliderItem = (index) => {
            setSettings(prev => {
                const newSlider = prev.images.heroSlider.filter((_, i) => i !== index);
                return {
                    ...prev,
                    images: { ...prev.images, heroSlider: newSlider }
                };
            });
        };

        const updateSliderCaption = (index, caption) => {
            setSettings(prev => {
                const newSlider = [...prev.images.heroSlider];
                newSlider[index] = { ...newSlider[index], caption };
                return {
                    ...prev,
                    images: { ...prev.images, heroSlider: newSlider }
                };
            });
        };

        // Assignment Handlers
        const handleAssignmentSubmit = async (e) => {
            e.preventDefault();
            setAssignmentStatus('Saving...');
            try {
                const res = await fetch(`${API_BASE_URL}/api/assignments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(assignmentForm)
                });
                const data = await res.json();
                if (data.success) {
                    setAssignmentStatus('Assignment added!');
                    setAssignmentForm({ title: '', description: '', dueDate: '', subject: '', class: '' });
                    fetchAssignments();
                } else {
                    setAssignmentStatus('Failed: ' + data.message);
                }
            } catch (err) {
                setAssignmentStatus('Error saving assignment.');
            }
        };

        const handleAssignmentDelete = async (id) => {
            if (!window.confirm('Delete this assignment?')) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/assignments/${id}`, { method: 'DELETE' });
                if ((await res.json()).success) fetchAssignments();
            } catch (err) {
                console.error(err);
            }
        };

        // CBT Handlers
        const handleExamSubmit = async (e) => {
            e.preventDefault();
            setExamStatus('Saving...');
            try {
                const res = await fetch(`${API_BASE_URL}/api/cbt`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(examForm)
                });
                const data = await res.json();
                if (data.success) {
                    setExamStatus('Exam added!');
                    setExamForm({ title: '', subject: '', class: '', timeLimit: 30, questions: [{ question: '', options: ['', '', '', ''], correct: 0 }] });
                    fetchExams();
                } else {
                    setExamStatus('Failed: ' + data.message);
                }
            } catch (err) {
                setExamStatus('Error saving exam.');
            }
        };

        const handleExamDelete = async (id) => {
            if (!window.confirm('Delete this exam?')) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/cbt/${id}`, { method: 'DELETE' });
                if ((await res.json()).success) fetchExams();
            } catch (err) {
                console.error(err);
            }
        };

        const addQuestion = () => {
            setExamForm({
                ...examForm,
                questions: [...examForm.questions, { question: '', options: ['', '', '', ''], correct: 0 }]
            });
        };

        const updateQuestion = (idx, field, value) => {
            const newQuestions = [...examForm.questions];
            newQuestions[idx][field] = value;
            setExamForm({ ...examForm, questions: newQuestions });
        };

        const updateOption = (qIdx, oIdx, value) => {
            const newQuestions = [...examForm.questions];
            newQuestions[qIdx].options[oIdx] = value;
            setExamForm({ ...examForm, questions: newQuestions });
        };

        const downloadQuestionTemplate = () => {
            const headers = "Question,Option A,Option B,Option C,Option D,Correct Answer (A/B/C/D)\nWhat is the capital of Nigeria?,Lagos,Abuja,Kano,Ibadan,B\n";
            const blob = new Blob([headers], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cbt_questions_template.csv';
            a.click();
        };

        const handleQuestionImport = async () => {
            if (!importFile) {
                setImportQStatus('Please select a file');
                return;
            }

            const formData = new FormData();
            formData.append('file', importFile);
            setImportQStatus('Importing...');

            try {
                const res = await fetch(`${API_BASE_URL}/api/import-questions`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    setExamForm({ ...examForm, questions: data.questions });
                    setImportQStatus(`✅ Successfully imported ${data.questions.length} questions!`);
                    setImportFile(null);
                } else {
                    setImportQStatus('❌ ' + data.message);
                }
            } catch (err) {
                setImportQStatus('❌ Error importing questions');
            }
        }
    };

    // Admission PIN Handlers
    const handlePinGenerate = async (e) => {
        e.preventDefault();
        setPinStatus('Generating...');
        try {
            const res = await fetch(`${API_BASE_URL}/api/admission-pins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pinForm)
            });
            const data = await res.json();
            if (data.success) {
                setPinStatus(`Generated ${data.pins.length} pin(s) successfully!`);
                setPinForm({ count: 1, candidateName: '' });
                fetchPins();
            } else {
                setPinStatus('Failed: ' + data.message);
            }
        } catch (err) {
            setPinStatus('Error generating pins.');
        }
    };

    const handlePinDelete = async (id) => {
        if (!window.confirm('Delete this PIN?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admission-pins/${id}`, { method: 'DELETE' });
            if ((await res.json()).success) fetchPins();
        } catch (err) {
            console.error('Error deleting pin:', err);
        }
    };

    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 className="section-title" style={{ margin: 0 }}>Admin Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="btn"
                    style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 16px' }}
                >
                    Logout
                </button>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabs}>
                {['gallery', 'school', 'news', 'about', 'academics', 'admissions', 'pins', 'contact', 'messages', 'students', 'assignments', 'cbt'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.activeTab : {}) }}
                    >
                        {tab === 'gallery' && 'Gallery'}
                        {tab === 'school' && 'School Info'}
                        {tab === 'news' && 'News'}
                        {tab === 'about' && 'About Us'}
                        {tab === 'academics' && 'Academics'}
                        {tab === 'admissions' && 'Admissions'}
                        {tab === 'pins' && 'Admission PINs'}
                        {tab === 'contact' && 'Contact & Social'}
                        {tab === 'messages' && 'Messages'}
                        {tab === 'students' && 'Students & Results'}
                        {tab === 'assignments' && 'Assignments'}
                        {tab === 'cbt' && 'CBT Exams'}
                    </button>
                ))}
            </div>

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
                <div style={styles.grid}>
                    <div style={styles.card}>
                        <h2>Add New Photo</h2>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Title / Description</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    style={styles.input}
                                    placeholder="e.g. Science Fair 2026"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Select Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={styles.input}
                                />
                            </div>

                            {preview && (
                                <div style={{ marginBottom: '20px' }}>
                                    <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Upload to Gallery
                            </button>

                            {status && <p style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>{status}</p>}
                        </form>
                    </div>

                    <div style={styles.card}>
                        <h2>Manage Photos</h2>
                        {gallery.length === 0 ? (
                            <p>No photos in gallery.</p>
                        ) : (
                            <div style={styles.list}>
                                {gallery.map(img => (
                                    <div key={img.id} style={styles.listItem}>
                                        <img src={getImageUrl(img.url)} alt={img.title} style={styles.listThumb} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 5px' }}>{img.title}</h4>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(img.id)}
                                            className="btn"
                                            style={styles.deleteBtn}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Admission PINs Tab */}
            {activeTab === 'pins' && (
                <div style={styles.grid}>
                    <div style={styles.card}>
                        <h2>Generate Admission PINs</h2>
                        <form onSubmit={handlePinGenerate} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Number of PINs</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={pinForm.count}
                                    onChange={(e) => setPinForm({ ...pinForm, count: parseInt(e.target.value) })}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Candidate Name (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Assign to specific person (optional)"
                                    value={pinForm.candidateName}
                                    onChange={(e) => setPinForm({ ...pinForm, candidateName: e.target.value })}
                                    style={styles.input}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Generate PINs
                            </button>
                            {pinStatus && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{pinStatus}</p>}
                        </form>
                    </div>

                    <div style={styles.card}>
                        <h2>Active PINs</h2>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                        <th style={{ padding: '8px' }}>PIN Code</th>
                                        <th style={{ padding: '8px' }}>Status</th>
                                        <th style={{ padding: '8px' }}>Candidate</th>
                                        <th style={{ padding: '8px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pins.map(pin => (
                                        <tr key={pin._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 'bold' }}>{pin.code}</td>
                                            <td style={{ padding: '8px' }}>
                                                <span style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    backgroundColor: pin.isUsed ? '#ffebee' : '#e8f5e9',
                                                    color: pin.isUsed ? '#c62828' : '#2e7d32',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {pin.isUsed ? 'Used' : 'Active'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px' }}>{pin.candidateName || '-'}</td>
                                            <td style={{ padding: '8px' }}>
                                                <button
                                                    onClick={() => handlePinDelete(pin._id)}
                                                    style={{ ...styles.deleteBtn, padding: '4px 8px', fontSize: '0.8rem' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {pins.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                                No PINs generated yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* School Info Tab */}
            {activeTab === 'school' && (
                <div style={{ ...styles.card, maxWidth: '800px', margin: '0 auto' }}>
                    <h2>Basic School Information</h2>
                    <form onSubmit={handleSaveSettings}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>School Name (Short)</label>
                            <input
                                type="text"
                                value={settings.name}
                                onChange={(e) => handleSettingsChange('name', e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>School Name (Full)</label>
                            <input
                                type="text"
                                value={settings.fullName}
                                onChange={(e) => handleSettingsChange('fullName', e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Slogan / Motto</label>
                            <input
                                type="text"
                                value={settings.motto}
                                onChange={(e) => handleSettingsChange('motto', e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Images</h3>
                        {imageUploadStatus && <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '15px' }}>{imageUploadStatus}</p>}

                        <div style={styles.formGroup}>
                            <label style={styles.label}>School Logo</label>
                            {settings.images.logo && (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={getImageUrl(settings.images.logo)} alt="Logo" style={{ maxWidth: '150px', height: 'auto', borderRadius: '8px' }} />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'logo')}
                                style={styles.input}
                                disabled={uploadingImage}
                            />
                            <small style={{ color: '#666' }}>Upload a new logo image</small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Hero Banner Image</label>
                            {settings.images.hero && (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={getImageUrl(settings.images.hero)} alt="Hero" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'hero')}
                                style={styles.input}
                                disabled={uploadingImage}
                            />
                            <small style={{ color: '#666' }}>Upload a new hero banner for the home page</small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Principal's Photo</label>
                            {settings.images.principal && (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={getImageUrl(settings.images.principal)} alt="Principal" style={{ maxWidth: '200px', height: 'auto', borderRadius: '8px' }} />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'principal')}
                                style={styles.input}
                                disabled={uploadingImage}
                            />
                            <small style={{ color: '#666' }}>Upload principal's photo</small>
                        </div>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Home Page Hero Slider</h3>
                        <p style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>Add multiple images and captions for the attractive home page welcome slider.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            {settings.images.heroSlider && settings.images.heroSlider.map((slide, idx) => (
                                <div key={idx} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', position: 'relative' }}>
                                    <img src={getImageUrl(slide.url)} alt="Slide" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
                                    <input
                                        type="text"
                                        placeholder="Caption"
                                        value={slide.caption}
                                        onChange={(e) => updateSliderCaption(idx, e.target.value)}
                                        style={{ ...styles.input, fontSize: '0.8rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSliderItem(idx)}
                                        style={{ ...styles.deleteBtn, position: 'absolute', top: '5px', right: '5px', padding: '2px 8px' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Add New Slider Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleSliderUpload}
                                style={styles.input}
                                disabled={uploadingImage}
                            />
                        </div>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Principal's Welcome</h3>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Principal Name</label>
                            <input
                                type="text"
                                value={settings.principal.name}
                                onChange={(e) => handleNestedChange('principal', 'name', e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Welcome Title</label>
                            <input
                                type="text"
                                value={settings.principal.welcomeTitle}
                                onChange={(e) => handleNestedChange('principal', 'welcomeTitle', e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Welcome Message</label>
                            <textarea
                                value={settings.principal.welcomeMessage}
                                onChange={(e) => handleNestedChange('principal', 'welcomeMessage', e.target.value)}
                                style={{ ...styles.input, height: '150px' }}
                            />
                        </div>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Vision & Mission</h3>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Vision</label>
                            <textarea
                                value={settings.vision}
                                onChange={(e) => handleSettingsChange('vision', e.target.value)}
                                style={{ ...styles.input, height: '80px' }}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mission</label>
                            <textarea
                                value={settings.mission}
                                onChange={(e) => handleSettingsChange('mission', e.target.value)}
                                style={{ ...styles.input, height: '80px' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                        >
                            Save All Changes
                        </button>
                        {saveStatus && <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>{saveStatus}</p>}
                    </form>
                </div>
            )}

            {/* News Tab */}
            {activeTab === 'news' && (
                <div style={styles.grid}>
                    <div style={styles.card}>
                        <h2>{editingNews ? 'Edit Article' : 'Add News Article'}</h2>
                        <form onSubmit={handleNewsSubmit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Title</label>
                                <input
                                    type="text"
                                    value={newsForm.title}
                                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date</label>
                                <input
                                    type="date"
                                    value={newsForm.date}
                                    onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Content</label>
                                <textarea
                                    value={newsForm.content}
                                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                                    style={{ ...styles.input, height: '150px' }}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                {editingNews ? 'Update Article' : 'Add Article'}
                            </button>
                            {editingNews && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingNews(false);
                                        setNewsForm({ id: null, title: '', date: '', content: '' });
                                        setNewsStatus('');
                                    }}
                                    className="btn"
                                    style={{ width: '100%', marginTop: '10px', backgroundColor: '#6c757d', color: 'white' }}
                                >
                                    Cancel Edit
                                </button>
                            )}
                            {newsStatus && <p style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>{newsStatus}</p>}
                        </form>
                    </div>

                    <div style={styles.card}>
                        <h2>Manage News Articles</h2>
                        {news.length === 0 ? (
                            <p>No news articles.</p>
                        ) : (
                            <div style={styles.list}>
                                {news.map(article => (
                                    <div key={article.id} style={styles.listItem}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 5px' }}>{article.title}</h4>
                                            <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>{article.date}</p>
                                        </div>
                                        <button
                                            onClick={() => handleNewsEdit(article)}
                                            className="btn"
                                            style={{ ...styles.editBtn, marginRight: '5px' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleNewsDelete(article.id)}
                                            className="btn"
                                            style={styles.deleteBtn}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* About Us Tab */}
            {activeTab === 'about' && (
                <div style={{ ...styles.card, maxWidth: '800px', margin: '0 auto' }}>
                    <h2>About Us Content</h2>
                    <form onSubmit={handleSaveSettings}>
                        <h3>History</h3>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Establishment Year</label>
                            <input
                                type="number"
                                value={settings.historyDate}
                                onChange={(e) => handleSettingsChange('historyDate', parseInt(e.target.value))}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Detailed History Description</label>
                            <textarea
                                value={settings.historyDescription}
                                onChange={(e) => handleSettingsChange('historyDescription', e.target.value)}
                                style={{ ...styles.input, height: '150px' }}
                                placeholder="Describe the school's history..."
                            />
                        </div>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Core Values</h3>
                        {settings.coreValues.map((value, index) => (
                            <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Title</label>
                                    <input
                                        type="text"
                                        value={value.title}
                                        onChange={(e) => handleArrayChange('coreValues', index, 'title', e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Description</label>
                                    <input
                                        type="text"
                                        value={value.desc}
                                        onChange={(e) => handleArrayChange('coreValues', index, 'desc', e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFromArray('coreValues', index)}
                                    style={styles.deleteBtn}
                                >
                                    Remove Value
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddToArray('coreValues', { title: '', desc: '' })}
                            className="btn"
                            style={{ marginBottom: '20px', backgroundColor: '#28a745', color: 'white' }}
                        >
                            + Add Core Value
                        </button>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Management Team (Vice Principals)</h3>
                        {settings.management.vicePrincipals.map((vp, index) => (
                            <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Name</label>
                                    <input
                                        type="text"
                                        value={vp.name}
                                        onChange={(e) => {
                                            const newVPs = [...settings.management.vicePrincipals];
                                            newVPs[index] = { ...newVPs[index], name: e.target.value };
                                            setSettings(prev => ({ ...prev, management: { ...prev.management, vicePrincipals: newVPs } }));
                                        }}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Role</label>
                                    <input
                                        type="text"
                                        value={vp.role}
                                        onChange={(e) => {
                                            const newVPs = [...settings.management.vicePrincipals];
                                            newVPs[index] = { ...newVPs[index], role: e.target.value };
                                            setSettings(prev => ({ ...prev, management: { ...prev.management, vicePrincipals: newVPs } }));
                                        }}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Initials</label>
                                    <input
                                        type="text"
                                        value={vp.initials}
                                        onChange={(e) => {
                                            const newVPs = [...settings.management.vicePrincipals];
                                            newVPs[index] = { ...newVPs[index], initials: e.target.value };
                                            setSettings(prev => ({ ...prev, management: { ...prev.management, vicePrincipals: newVPs } }));
                                        }}
                                        style={styles.input}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newVPs = settings.management.vicePrincipals.filter((_, i) => i !== index);
                                        setSettings(prev => ({ ...prev, management: { ...prev.management, vicePrincipals: newVPs } }));
                                    }}
                                    style={styles.deleteBtn}
                                >
                                    Remove VP
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newVPs = [...settings.management.vicePrincipals, { name: '', role: '', initials: '' }];
                                setSettings(prev => ({ ...prev, management: { ...prev.management, vicePrincipals: newVPs } }));
                            }}
                            className="btn"
                            style={{ marginBottom: '20px', backgroundColor: '#28a745', color: 'white' }}
                        >
                            + Add Vice Principal
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                        >
                            Save All Changes
                        </button>
                        {saveStatus && <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>{saveStatus}</p>}
                    </form>
                </div>
            )}

            {/* Academics Tab */}
            {activeTab === 'academics' && (
                <div style={{ ...styles.card, maxWidth: '800px', margin: '0 auto' }}>
                    <h2>Academics Content</h2>
                    <form onSubmit={handleSaveSettings}>
                        <h3>Science Subjects</h3>
                        {settings.academics.sss.science.map((subject, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => {
                                        const newSubjects = [...settings.academics.sss.science];
                                        newSubjects[index] = e.target.value;
                                        setSettings(prev => ({
                                            ...prev,
                                            academics: {
                                                ...prev.academics,
                                                sss: { ...prev.academics.sss, science: newSubjects }
                                            }
                                        }));
                                    }}
                                    style={{ ...styles.input, flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newSubjects = settings.academics.sss.science.filter((_, i) => i !== index);
                                        setSettings(prev => ({
                                            ...prev,
                                            academics: {
                                                ...prev.academics,
                                                sss: { ...prev.academics.sss, science: newSubjects }
                                            }
                                        }));
                                    }}
                                    style={styles.deleteBtn}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newSubjects = [...settings.academics.sss.science, ''];
                                setSettings(prev => ({
                                    ...prev,
                                    academics: {
                                        ...prev.academics,
                                        sss: { ...prev.academics.sss, science: newSubjects }
                                    }
                                }));
                            }}
                            className="btn"
                            style={{ marginBottom: '20px', backgroundColor: '#28a745', color: 'white' }}
                        >
                            + Add Subject
                        </button>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Academic Calendar</h3>
                        {settings.academics.calendar.map((term, index) => (
                            <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Term</label>
                                    <input
                                        type="text"
                                        value={term.term}
                                        onChange={(e) => {
                                            const newCalendar = [...settings.academics.calendar];
                                            newCalendar[index] = { ...newCalendar[index], term: e.target.value };
                                            setSettings(prev => ({
                                                ...prev,
                                                academics: { ...prev.academics, calendar: newCalendar }
                                            }));
                                        }}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Start Date</label>
                                    <input
                                        type="text"
                                        value={term.start}
                                        onChange={(e) => {
                                            const newCalendar = [...settings.academics.calendar];
                                            newCalendar[index] = { ...newCalendar[index], start: e.target.value };
                                            setSettings(prev => ({
                                                ...prev,
                                                academics: { ...prev.academics, calendar: newCalendar }
                                            }));
                                        }}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>End Date</label>
                                    <input
                                        type="text"
                                        value={term.end}
                                        onChange={(e) => {
                                            const newCalendar = [...settings.academics.calendar];
                                            newCalendar[index] = { ...newCalendar[index], end: e.target.value };
                                            setSettings(prev => ({
                                                ...prev,
                                                academics: { ...prev.academics, calendar: newCalendar }
                                            }));
                                        }}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Activity</label>
                                    <input
                                        type="text"
                                        value={term.activity}
                                        onChange={(e) => {
                                            const newCalendar = [...settings.academics.calendar];
                                            newCalendar[index] = { ...newCalendar[index], activity: e.target.value };
                                            setSettings(prev => ({
                                                ...prev,
                                                academics: { ...prev.academics, calendar: newCalendar }
                                            }));
                                        }}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                        >
                            Save All Changes
                        </button>
                        {saveStatus && <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>{saveStatus}</p>}
                    </form>
                </div>
            )}

            {/* Admissions Tab */}
            {activeTab === 'admissions' && (
                <div style={{ ...styles.card, maxWidth: '800px', margin: '0 auto' }}>
                    <h2>Admissions Content</h2>
                    <form onSubmit={handleSaveSettings}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Admission Form Price</label>
                            <input
                                type="text"
                                value={settings.admissions.formPrice}
                                onChange={(e) => handleNestedChange('admissions', 'formPrice', e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Requirements (SSS1)</h3>
                        {settings.admissions.requirements.sss1.map((req, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    value={req}
                                    onChange={(e) => {
                                        const newReqs = [...settings.admissions.requirements.sss1];
                                        newReqs[index] = e.target.value;
                                        setSettings(prev => ({
                                            ...prev,
                                            admissions: {
                                                ...prev.admissions,
                                                requirements: { ...prev.admissions.requirements, sss1: newReqs }
                                            }
                                        }));
                                    }}
                                    style={{ ...styles.input, flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newReqs = settings.admissions.requirements.sss1.filter((_, i) => i !== index);
                                        setSettings(prev => ({
                                            ...prev,
                                            admissions: {
                                                ...prev.admissions,
                                                requirements: { ...prev.admissions.requirements, sss1: newReqs }
                                            }
                                        }));
                                    }}
                                    style={styles.deleteBtn}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newReqs = [...settings.admissions.requirements.sss1, ''];
                                setSettings(prev => ({
                                    ...prev,
                                    admissions: {
                                        ...prev.admissions,
                                        requirements: { ...prev.admissions.requirements, sss1: newReqs }
                                    }
                                }));
                            }}
                            className="btn"
                            style={{ marginBottom: '20px', backgroundColor: '#28a745', color: 'white' }}
                        >
                            + Add Requirement
                        </button>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Application Procedure</h3>
                        {settings.admissions.procedure.map((step, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <textarea
                                    value={step}
                                    onChange={(e) => {
                                        const newProcedure = [...settings.admissions.procedure];
                                        newProcedure[index] = e.target.value;
                                        setSettings(prev => ({
                                            ...prev,
                                            admissions: { ...prev.admissions, procedure: newProcedure }
                                        }));
                                    }}
                                    style={{ ...styles.input, flex: 1, height: '60px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newProcedure = settings.admissions.procedure.filter((_, i) => i !== index);
                                        setSettings(prev => ({
                                            ...prev,
                                            admissions: { ...prev.admissions, procedure: newProcedure }
                                        }));
                                    }}
                                    style={styles.deleteBtn}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newProcedure = [...settings.admissions.procedure, ''];
                                setSettings(prev => ({
                                    ...prev,
                                    admissions: { ...prev.admissions, procedure: newProcedure }
                                }));
                            }}
                            className="btn"
                            style={{ marginBottom: '20px', backgroundColor: '#28a745', color: 'white' }}
                        >
                            + Add Step
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                        >
                            Save All Changes
                        </button>
                        {saveStatus && <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>{saveStatus}</p>}
                    </form>
                </div>
            )}

            {/* Contact & Social Tab */}
            {activeTab === 'contact' && (
                <div style={{ ...styles.card, maxWidth: '800px', margin: '0 auto' }}>
                    <h2>Contact Information</h2>
                    <form onSubmit={handleSaveSettings}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Address</label>
                            <textarea
                                value={settings.contact.address}
                                onChange={(e) => handleNestedChange('contact', 'address', e.target.value)}
                                style={{ ...styles.input, height: '80px' }}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                value={settings.contact.email}
                                onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone</label>
                            <input
                                type="text"
                                value={settings.contact.phone}
                                onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Office Hours</label>
                            <input
                                type="text"
                                value={settings.contact.hours}
                                onChange={(e) => handleNestedChange('contact', 'hours', e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <hr style={{ margin: '30px 0' }} />
                        <h3>Social Media Links</h3>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Facebook</label>
                            <input
                                type="url"
                                value={settings.socials.facebook}
                                onChange={(e) => handleNestedChange('socials', 'facebook', e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Twitter</label>
                            <input
                                type="url"
                                value={settings.socials.twitter}
                                onChange={(e) => handleNestedChange('socials', 'twitter', e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Instagram</label>
                            <input
                                type="url"
                                value={settings.socials.instagram}
                                onChange={(e) => handleNestedChange('socials', 'instagram', e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                        >
                            Save All Changes
                        </button>
                        {saveStatus && <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>{saveStatus}</p>}
                    </form>
                </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
                <div style={styles.grid} className="grid-responsive">
                    <div style={styles.card}>
                        <h2>Add New Assignment</h2>
                        <form onSubmit={handleAssignmentSubmit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Title</label>
                                <input type="text" value={assignmentForm.title} onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} style={styles.input} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Subject</label>
                                <input type="text" value={assignmentForm.subject} onChange={e => setAssignmentForm({ ...assignmentForm, subject: e.target.value })} style={styles.input} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Class</label>
                                <input type="text" value={assignmentForm.class} onChange={e => setAssignmentForm({ ...assignmentForm, class: e.target.value })} style={styles.input} placeholder="e.g. SS1 A" required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Due Date</label>
                                <input type="date" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} style={styles.input} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Description/Instructions</label>
                                <textarea value={assignmentForm.description} onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })} style={{ ...styles.input, height: '100px' }} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Assignment</button>
                            {assignmentStatus && <p style={{ marginTop: '10px', textAlign: 'center' }}>{assignmentStatus}</p>}
                        </form>
                    </div>
                    <div style={styles.card}>
                        <h2>Manage Assignments</h2>
                        <div style={styles.list}>
                            {assignments.map(a => (
                                <div key={a.id} style={styles.listItem}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0' }}>{a.title} ({a.class})</h4>
                                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#666' }}>Due: {a.dueDate}</p>
                                    </div>
                                    <button onClick={() => handleAssignmentDelete(a.id)} className="btn" style={styles.deleteBtn}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CBT Tab */}
            {activeTab === 'cbt' && (
                <div style={styles.grid} className="grid-responsive">
                    <div style={styles.card}>
                        <h2>Create CBT Exam</h2>
                        <form onSubmit={handleExamSubmit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Exam Title</label>
                                <input type="text" value={examForm.title} onChange={e => setExamForm({ ...examForm, title: e.target.value })} style={styles.input} required />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>Subject</label>
                                    <input type="text" value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })} style={styles.input} required />
                                </div>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>Class</label>
                                    <input type="text" value={examForm.class} onChange={e => setExamForm({ ...examForm, class: e.target.value })} style={styles.input} required />
                                </div>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>Time (Mins)</label>
                                    <input type="number" value={examForm.timeLimit} onChange={e => setExamForm({ ...examForm, timeLimit: e.target.value })} style={styles.input} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>Questions</h3>
                                <button type="button" onClick={downloadQuestionTemplate} className="btn" style={{ fontSize: '0.8rem', backgroundColor: '#6c757d', color: 'white' }}>
                                    📥 Download Excel Template
                                </button>
                            </div>

                            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px dashed #ced4da' }}>
                                <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Bulk Import Questions</p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="file"
                                        accept=".csv, .xlsx, .xls"
                                        onChange={(e) => setImportFile(e.target.files[0])}
                                        style={{ fontSize: '0.8rem', flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleQuestionImport}
                                        className="btn btn-primary"
                                        style={{ padding: '5px 15px', fontSize: '0.8rem' }}
                                    >
                                        Upload & Parse
                                    </button>
                                </div>
                                {importQStatus && <p style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: 'bold', color: importQStatus.includes('✅') ? 'green' : (importQStatus.includes('Importing') ? '#007bff' : 'red') }}>{importQStatus}</p>}
                            </div>
                            {examForm.questions.map((q, qIdx) => (
                                <div key={qIdx} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Question {qIdx + 1}</label>
                                        <input type="text" value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} style={styles.input} required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} style={styles.formGroup}>
                                                <label style={{ fontSize: '0.8rem' }}>Option {String.fromCharCode(65 + oIdx)}</label>
                                                <input type="text" value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} style={styles.input} required />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Correct Option</label>
                                        <select value={q.correct} onChange={e => updateQuestion(qIdx, 'correct', parseInt(e.target.value))} style={styles.input}>
                                            {q.options.map((_, oIdx) => (
                                                <option key={oIdx} value={oIdx}>Option {String.fromCharCode(65 + oIdx)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addQuestion} className="btn" style={{ marginBottom: '20px', backgroundColor: '#28a745', color: 'white' }}>+ Add Question</button>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Exam</button>
                            {examStatus && <p style={{ marginTop: '10px' }}>{examStatus}</p>}
                        </form>
                    </div>
                    <div style={styles.card}>
                        <h2>Manage Exams</h2>
                        <div style={styles.list}>
                            {exams.map(e => (
                                <div key={e.id} style={styles.listItem}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0' }}>{e.title} ({e.class})</h4>
                                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#666' }}>{e.questions.length} Questions | {e.timeLimit} Mins</p>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => window.open(`${API_BASE_URL}/api/export-cbt-results/${e.id}`, '_blank')}
                                            className="btn"
                                            style={{ backgroundColor: '#17a2b8', color: 'white', marginRight: '10px', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            📥 Export Results
                                        </button>
                                        <button onClick={() => handleExamDelete(e.id)} className="btn" style={styles.deleteBtn}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Students & Results Tab */}
            {activeTab === 'students' && (
                <div>
                    <h2>Student & Result Management</h2>

                    {/* CSV Import Section */}
                    <div style={{ ...styles.card, marginBottom: '30px', backgroundColor: '#e8f5e9' }}>
                        <h3>📊 Import Results from CSV</h3>
                        <p style={{ marginBottom: '15px', color: '#666' }}>
                            Upload a CSV file to import multiple students and their results at once.
                        </p>

                        <div style={{ marginBottom: '15px' }}>
                            <button
                                onClick={() => {
                                    const csvContent = "RegNumber,Password,Name,Class,Mathematics,English,Physics,Chemistry,Biology,Economics\nSCH/2026/001,password123,Ibrahim Musa,SS3 A,85,78,90,72,88,75\nSCH/2026/002,pass,Chidinma Okeke,SS3 B,65,88,75,80,70,82\nSCH/2026/003,student123,Adebayo Johnson,SS2 A,92,85,78,88,90,86";
                                    const blob = new Blob([csvContent], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'student_results_template.csv';
                                    a.click();
                                }}
                                className="btn btn-secondary"
                                style={{ marginRight: '10px' }}
                            >
                                📥 Download CSV Template
                            </button>
                        </div>

                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files[0])}
                            style={styles.input}
                        />

                        <button
                            onClick={async () => {
                                if (!csvFile) {
                                    setImportStatus('Please select a CSV file');
                                    return;
                                }

                                setImportStatus('Importing...');
                                const formData = new FormData();
                                formData.append('csv', csvFile);

                                try {
                                    const res = await fetch(`${API_BASE_URL}/api/import-results`, {
                                        method: 'POST',
                                        body: formData
                                    });
                                    const data = await res.json();

                                    if (data.success) {
                                        setImportStatus(`✅ ${data.message}`);
                                        fetchStudents();
                                        setCsvFile(null);
                                    } else {
                                        setImportStatus('❌ ' + data.message);
                                    }
                                } catch (err) {
                                    setImportStatus('❌ Error importing CSV');
                                    console.error(err);
                                }
                            }}
                            className="btn btn-primary"
                            style={{ marginTop: '10px' }}
                        >
                            Upload & Import CSV
                        </button>

                        {importStatus && <p style={{ marginTop: '15px', fontWeight: 'bold', color: importStatus.includes('✅') ? 'green' : 'red' }}>{importStatus}</p>}
                    </div>

                    {/* Add/Edit Student Form */}
                    <div style={{ ...styles.card, marginBottom: '30px' }}>
                        <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setStudentStatus('Saving...');

                            const method = editingStudent ? 'PUT' : 'POST';
                            const url = editingStudent
                                ? `${API_BASE_URL}/api/students/${encodeURIComponent(editingStudent)}`
                                : `${API_BASE_URL}/api/students`;

                            try {
                                const res = await fetch(url, {
                                    method,
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(studentForm)
                                });
                                const data = await res.json();

                                if (data.success) {
                                    setStudentStatus('✅ Student saved successfully!');
                                    fetchStudents();
                                    setStudentForm({ regNumber: '', password: '', name: '', class: '', results: [] });
                                    setEditingStudent(null);
                                } else {
                                    setStudentStatus('❌ ' + data.message);
                                }
                            } catch (err) {
                                setStudentStatus('❌ Error saving student');
                                console.error(err);
                            }
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="grid-responsive">
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Registration Number</label>
                                    <input
                                        type="text"
                                        value={studentForm.regNumber}
                                        onChange={(e) => setStudentForm({ ...studentForm, regNumber: e.target.value })}
                                        style={styles.input}
                                        required
                                        disabled={editingStudent}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Password</label>
                                    <input
                                        type="text"
                                        value={studentForm.password}
                                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Full Name</label>
                                    <input
                                        type="text"
                                        value={studentForm.name}
                                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Class</label>
                                    <input
                                        type="text"
                                        value={studentForm.class}
                                        onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                                        style={styles.input}
                                        placeholder="e.g. SS3 A"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="submit" className="btn btn-primary">
                                    {editingStudent ? 'Update Student' : 'Add Student'}
                                </button>
                                {editingStudent && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingStudent(null);
                                            setStudentForm({ regNumber: '', password: '', name: '', class: '', results: [] });
                                            setStudentStatus('');
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                            {studentStatus && <p style={{ marginTop: '15px', fontWeight: 'bold', color: studentStatus.includes('✅') ? 'green' : 'red' }}>{studentStatus}</p>}
                        </form>
                    </div>

                    {/* Students List */}
                    <div style={styles.card}>
                        <h3>All Students ({students.length})</h3>
                        {students.length === 0 ? (
                            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No students found. Add students manually or import from CSV.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Reg Number</th>
                                            <th style={styles.th}>Name</th>
                                            <th style={styles.th}>Class</th>
                                            <th style={styles.th}>Results</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student.regNumber}>
                                                <td style={styles.td}>{student.regNumber}</td>
                                                <td style={styles.td}>{student.name}</td>
                                                <td style={styles.td}>{student.class}</td>
                                                <td style={styles.td}>{student.results?.length || 0} subjects</td>
                                                <td style={styles.td}>
                                                    <button
                                                        onClick={() => {
                                                            setEditingStudent(student.regNumber);
                                                            setStudentForm({
                                                                regNumber: student.regNumber,
                                                                password: '',
                                                                name: student.name,
                                                                class: student.class,
                                                                results: student.results || []
                                                            });
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="btn btn-secondary"
                                                        style={{ marginRight: '5px', padding: '5px 10px', fontSize: '0.9rem' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm(`Delete ${student.name}?`)) {
                                                                try {
                                                                    const res = await fetch(`${API_BASE_URL}/api/students/${encodeURIComponent(student.regNumber)}`, {
                                                                        method: 'DELETE'
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.success) {
                                                                        fetchStudents();
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                }
                                                            }
                                                        }}
                                                        className="btn"
                                                        style={{ backgroundColor: '#dc3545', color: 'white', padding: '5px 10px', fontSize: '0.9rem' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Messages Tab */}
            {activeTab === 'messages' && (
                <div style={{ ...styles.card, maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>Incoming Messages</h2>
                        <button onClick={fetchContacts} className="btn btn-secondary">Refresh</button>
                    </div>
                    {contacts.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No messages yet.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Date</th>
                                        <th style={{ padding: '12px' }}>Name</th>
                                        <th style={{ padding: '12px' }}>Email</th>
                                        <th style={{ padding: '12px' }}>Message</th>
                                        <th style={{ padding: '12px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.slice().reverse().map(c => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(c.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.name}</td>
                                            <td style={{ padding: '12px' }}><a href={`mailto:${c.email}`} style={{ color: 'var(--primary-color)' }}>{c.email}</a></td>
                                            <td style={{ padding: '12px', maxWidth: '300px' }}>
                                                <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.9rem' }}>{c.message}</div>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button onClick={() => handleContactDelete(c.id)} style={styles.deleteBtn}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    tabBtn: {
        background: '#eee',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#666',
    },
    activeTab: {
        background: 'var(--primary-color)',
        color: 'white',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
    },
    card: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        marginBottom: '8px',
        display: 'block',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '10px',
        borderBottom: '1px solid #eee',
    },
    listThumb: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '4px',
    },
    deleteBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    editBtn: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    }
};

export default Admin;
