import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import SEO, { SEO_PAGES } from './components/SEO';
import GoogleAnalytics from './components/Analytics';
import { usePerformance } from './hooks/usePerformance';

import './theme.css';
import './animations.css';
import './responsive.css';
import './App.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar         = lazy(() => import('./components/Navbar'));
const Hero           = lazy(() => import('./components/Hero'));
const Skills         = lazy(() => import('./components/Skills'));
const Projects       = lazy(() => import('./components/Projects'));
const Contact        = lazy(() => import('./components/Contact'));
const Footer         = lazy(() => import('./components/Footer'));
const Login          = lazy(() => import('./components/Login'));
const AdminLogin     = lazy(() => import('./components/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-primary)',
      color: 'var(--text-muted)', fontFamily: 'Sora, sans-serif',
      gap: '12px', fontSize: '0.95rem',
    }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.3rem', color: 'var(--accent)' }} />
      Loading...
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div style={{ padding: '60px 40px', maxWidth: 900, margin: '0 auto' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 80, borderRadius: 12, background: 'var(--bg-tertiary)',
          marginBottom: 16, animation: 'pulse 1.5s ease infinite', opacity: 0.6,
        }} />
      ))}
    </div>
  );
}

function App() {
  const [profile, setProfile]       = useState(null);
  const [skills, setSkills]         = useState([]);
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activePage, setActivePage] = useState('home');

  const { user, login, logout } = useAuth();
  const isAdminRoute = window.location.pathname === '/admin';

  // Performance monitoring (Web Vitals → GA)
  usePerformance();

  // Scroll spy
  useEffect(() => {
    if (loading) return;
    const SECTIONS = ['home', 'skills', 'projects', 'contact'];
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let current = 'home';
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= mid) current = id;
      }
      setActivePage(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [loading]);

  // Scroll reveal
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, skillsRes, projectsRes] = await Promise.all([
          fetch(`${API}/api/profile`).then(r => r.json()),
          fetch(`${API}/api/skills`).then(r => r.json()),
          fetch(`${API}/api/projects`).then(r => r.json()),
        ]);
        setProfile(profileRes);
        setSkills(Array.isArray(skillsRes)     ? skillsRes    : []);
        setProjects(Array.isArray(projectsRes) ? projectsRes  : []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isAdminRoute) {
    return (
      <>
        <GoogleAnalytics />
        <SEO {...SEO_PAGES.admin} />
        <Suspense fallback={<PageLoader />}>
          {user?.role === 'admin'
            ? <AdminDashboard user={user} onLogout={logout} />
            : <AdminLogin onLogin={(u, t) => login(u, t)} />
          }
        </Suspense>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <GoogleAnalytics />
        <SEO {...SEO_PAGES.home} />
        <Suspense fallback={<PageLoader />}>
          <Login onLogin={u => login(u, localStorage.getItem('token'))} />
        </Suspense>
      </>
    );
  }

  if (loading) return <PageLoader />;

  const seo = SEO_PAGES[activePage] || SEO_PAGES.home;

  return (
    <div className="App">
      <GoogleAnalytics />
      <SEO title={seo.title} description={seo.description} url={seo.url} />

      <Suspense fallback={null}>
        <Navbar profile={profile} onLogout={logout} />
      </Suspense>

      <section id="home">
        {profile && (
          <Suspense fallback={<SectionSkeleton />}>
            <Hero profile={profile} />
          </Suspense>
        )}
      </section>

      <section id="skills" className="reveal">
        <Suspense fallback={<SectionSkeleton />}>
          <Skills skills={skills} />
        </Suspense>
      </section>

      <section id="projects" className="reveal">
        <Suspense fallback={<SectionSkeleton />}>
          <Projects projects={projects} />
        </Suspense>
      </section>

      <section id="contact" className="reveal">
        <Suspense fallback={<SectionSkeleton />}>
          <Contact />
        </Suspense>
      </section>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}

export default App;