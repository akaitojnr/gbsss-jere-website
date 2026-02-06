import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { API_BASE_URL } from '../config';

const Contact = () => {
    const { config, loading } = useConfig();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');

    if (loading || !config) return <div className="container" style={{ padding: '60px' }}>Loading...</div>;
    const schoolConfig = config;


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');

        try {
            const response = await fetch('${API_BASE_URL}/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('Message sent successfully!');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('Failed to send message.');
            }
        } catch (err) {
            setStatus('Error sending message. Check connection.');
        }
    };

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <h1 className="section-title">Contact Us</h1>

            <div style={styles.grid}>
                <div>
                    <h2>Get in Touch</h2>
                    <p>We are always available to answer your questions.</p>
                    <div style={styles.info}>
                        <p><strong>Address:</strong> {schoolConfig.contact.address}</p>
                        <p><strong>Email:</strong> {schoolConfig.contact.email}</p>
                        <p><strong>Phone:</strong> {schoolConfig.contact.phone}</p>
                        <p><strong>Office Hours:</strong> {schoolConfig.contact.hours}</p>
                    </div>
                </div>

                <div style={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} required />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Message</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} style={{ ...styles.input, height: '100px' }} required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">Send Message</button>
                        {status && <p style={{ marginTop: '10px' }}>{status}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
    },
    info: {
        marginTop: '20px',
        lineHeight: '2',
    },
    formCard: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '1rem',
    }
};

export default Contact;
