import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('${API_BASE_URL}/api/news')
            .then(res => res.json())
            .then(data => {
                setNews(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch news", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <h1 className="section-title">Latest & Events</h1>

            {loading ? (
                <p>Loading news...</p>
            ) : (
                <div style={styles.grid}>
                    {news.length > 0 ? (
                        news.map(item => (
                            <div key={item.id} style={styles.card}>
                                <div style={styles.dateBadge}>{item.date}</div>
                                <h3>{item.title}</h3>
                                <p>{item.content}</p>
                            </div>
                        ))
                    ) : (
                        <p>No news available at the moment.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
    },
    card: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        position: 'relative',
    },
    dateBadge: {
        position: 'absolute',
        top: '-10px',
        right: '20px',
        backgroundColor: 'var(--accent-color)',
        color: 'white',
        padding: '5px 10px',
        fontSize: '0.8rem',
        borderRadius: '20px',
    }
};

export default News;
