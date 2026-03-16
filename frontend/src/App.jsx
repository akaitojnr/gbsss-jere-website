import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import VerifyResult from './pages/VerifyResult';
import CheckResult from './pages/CheckResult';
import { ConfigProvider } from './context/ConfigContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const cleanRoutes = ['/check-result', '/verify'];
  const isCleanPage = cleanRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {!isCleanPage && <Header />}
      <main style={{ minHeight: '80vh' }}>
        {children}
      </main>
      {!isCleanPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/portal" element={<StudentPortal />} />
            <Route path="/check-result" element={<CheckResult />} />
            <Route path="/verify" element={<VerifyResult />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
