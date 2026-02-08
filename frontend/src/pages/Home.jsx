import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

const HeroSlider = ({ slides }) => {
    const [current, setCurrent] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!slides || slides.length === 0) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides]);

    if (!slides || slides.length === 0) return null;

    return (
        <section style={{ position: 'relative', height: isMobile ? '400px' : '600px', overflow: 'hidden', backgroundColor: '#000' }}>
            {slides.map((slide, idx) => (
                <div
                    key={idx}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("${slide.url}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: current === idx ? 1 : 0,
                        transition: 'opacity 1.5s ease-in-out',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        textAlign: 'center',
                        color: 'white',
                        paddingBottom: isMobile ? '40px' : '80px'
                    }}
                    onError={(e) => {
                        e.target.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1523050853063-915994269f8c?q=80&w=1200&auto=format&fit=crop")`;
                    }}
                >
                    <div className="container" style={{
                        transform: current === idx ? 'translateY(0)' : 'translateY(40px)',
                        transition: 'transform 1s ease-out 0.5s, opacity 1s ease-out 0.5s',
                        opacity: current === idx ? 1 : 0,
                        width: '100%'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '25px 40px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                            maxWidth: '96%'
                        }}>
                            <h1 style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', marginBottom: '10px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', color: 'white' }}>
                                {slide.caption || "Welcome to our School"}
                            </h1>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: isMobile ? '15px' : '30px' }}>
                                <Link to="/admissions" className="btn btn-primary" style={{ padding: isMobile ? '8px 20px' : '12px 30px', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>Apply Now</Link>
                                <Link to="/about" className="btn btn-secondary" style={{ padding: isMobile ? '8px 20px' : '12px 30px', fontSize: isMobile ? '0.9rem' : '1.1rem', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid white' }}>Learn More</Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slider Navigation Dots */}
            <div style={{ position: 'absolute', bottom: '30px', width: '100%', display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 10 }}>
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        style={{
                            width: '40px',
                            height: '5px',
                            borderRadius: '2px',
                            border: 'none',
                            backgroundColor: current === idx ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                    />
                ))}
            </div>

            {!isMobile && (
                <>
                    <button onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none', padding: '15px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem', zIndex: 10 }}>&#10094;</button>
                    <button onClick={() => setCurrent(prev => (prev + 1) % slides.length)} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none', padding: '15px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem', zIndex: 10 }}>&#10095;</button>
                </>
            )}
        </section>
    );
};

const Home = () => {
    const { config, loading } = useConfig();

    if (loading || !config) return <div className="container" style={{ padding: '60px' }}>Loading...</div>;

    const schoolConfig = config;

    const styles = {
        section: {
            padding: '60px 0',
        },
        welcomeGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center',
        },
        visionGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
        },
        card: {
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            textAlign: 'center',
        },
        imagePlaceholder: {
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }
    };

    return (
        <div>
            {/* Hero Slider */}
            <HeroSlider slides={schoolConfig.images.heroSlider || [{ url: schoolConfig.images.hero, caption: "Welcome to " + schoolConfig.name }]} />

            {/* Principal's Welcome */}
            <section style={styles.section}>
                <div className="container">
                    <div style={styles.welcomeGrid} className="grid-responsive">
                        <div style={styles.imagePlaceholder}>
                            <img
                                src={schoolConfig.images.principal}
                                alt="Principal"
                                style={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '8px', display: 'block', margin: '0 auto' }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                            />
                            <div style={{ width: '100%', height: '300px', backgroundColor: '#ddd', display: 'none', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                Principal's Photo (Missing)
                            </div>
                        </div>
                        <div>
                            <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)', textAlign: 'left' }}>{schoolConfig.principal.welcomeTitle}</h2>
                            <p>
                                {schoolConfig.principal.welcomeMessage}
                            </p>
                            <br />
                            <p><strong>- {schoolConfig.principal.name}</strong><br />Principal</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section style={{ ...styles.section, backgroundColor: '#e9f5e9' }}>
                <div className="container">
                    <div style={styles.visionGrid} className="grid-responsive">
                        <div style={styles.card}>
                            <h3>Our Vision</h3>
                            <p>{schoolConfig.vision}</p>
                        </div>
                        <div style={styles.card}>
                            <h3>Our Mission</h3>
                            <p>{schoolConfig.mission}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
