import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import Admissions from './pages/Admissions';
import StudentPortal from './pages/StudentPortal';
import News from './pages/News';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import { ConfigProvider } from './context/ConfigContext';

function App() {
  return (
    <ConfigProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main style={{ minHeight: '80vh' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/portal" element={<StudentPortal />} />
              <Route path="/news" element={<News />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
