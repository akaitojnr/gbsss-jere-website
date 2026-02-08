import { useState, useEffect } from 'react';
import { API_BASE_URL, getImageUrl } from '../config';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/gallery`)
            .then(res => res.json())
            .then(data => {
                setImages(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch gallery", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <h1 className="section-title">School Gallery</h1>

            {loading ? (
                <p>Loading gallery...</p>
            ) : (
                <div style={styles.grid}>
                    {images.length > 0 ? (
                        images.map(img => (
                            <div key={img.id} style={styles.card}>
                                <img src={getImageUrl(img.url)} alt={img.title} style={styles.img} />
                                <div style={styles.caption}>{img.title}</div>
                            </div>
                        ))
                    ) : (
                        <p>No images found in gallery.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    img: {
        width: '100%',
        height: '250px',
        objectFit: 'cover',
        borderRadius: '5px',
        display: 'block',
    },
    caption: {
        textAlign: 'center',
        padding: '10px 0 5px',
        fontWeight: 'bold',
        color: '#555',
    }
};

export default Gallery;
