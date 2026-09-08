import React, { useState, useEffect } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { BackgroundMotion } from './components/common/BackgroundMotion';
import { AnnouncementBanner } from './components/layout/AnnouncementBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileMenu } from './components/layout/MobileMenu';
import { PopupModal } from './components/common/PopupModal';

// Public Pages
import { Home } from './pages/Home';
import { ContentDetail } from './pages/ContentDetail';
import { Categories } from './pages/Categories';
import { CategoryDetail } from './pages/CategoryDetail';
import { Genres } from './pages/Genres';
import { GenreDetail } from './pages/GenreDetail';
import { Search } from './pages/Search';
import { About } from './pages/About';
import { Support } from './pages/Support';
import { Dmca } from './pages/Dmca';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const MainLayout: React.FC = () => {
  const { settings } = useSettings();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (to: string) => {
    if (typeof to === 'number') {
      window.history.go(to);
      return;
    }
    window.history.pushState({}, '', to);
    setCurrentPath(to);
    window.scrollTo(0, 0);
  };

  // Route Resolver
  const renderRoute = () => {
    const path = currentPath.split('?')[0];

    // Detail pages
    if (path.startsWith('/content/')) {
      const slug = path.replace('/content/', '');
      return <ContentDetail slug={slug} navigate={navigate} />;
    }

    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '');
      return <CategoryDetail slug={slug} navigate={navigate} />;
    }

    if (path.startsWith('/genre/')) {
      const slug = path.replace('/genre/', '');
      return <GenreDetail slug={slug} navigate={navigate} />;
    }

    if (path === '/categories') {
      return <Categories navigate={navigate} />;
    }

    if (path === '/genres') {
      return <Genres navigate={navigate} />;
    }

    if (path === '/search') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      return <Search initialQuery={q} navigate={navigate} />;
    }

    if (path === '/about') {
      return <About navigate={navigate} />;
    }

    if (path === '/support') {
      return <Support navigate={navigate} />;
    }

    if (path === '/dmca') {
      return <Dmca />;
    }

    if (path === '/privacy') {
      return <Privacy />;
    }

    if (path === '/terms') {
      return <Terms />;
    }

    // Admin
    if (path === '/admin/login') {
      return <AdminLogin navigate={navigate} />;
    }

    if (path === '/admin') {
      return <AdminDashboard navigate={navigate} />;
    }

    // Default Home
    return <Home navigate={navigate} />;
  };

  const isAdminView = currentPath.startsWith('/admin');

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
      {/* 1. Realistic Cinematic Motion Canvas Background (Configurable site-wide) */}
      <BackgroundMotion style={settings.backgroundStyle || 'cinematic-particles'} />

      {/* 2. Pinned Top Announcement Bar */}
      {!isAdminView && <AnnouncementBanner />}

      {/* 3. Global Navbar */}
      {!isAdminView && (
        <Navbar
          currentPath={currentPath}
          navigate={navigate}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      )}

      {/* 4. Mobile Navigation Drawer */}
      {!isAdminView && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navigate={navigate}
          currentPath={currentPath}
        />
      )}

      {/* 5. Main Route View */}
      <main className="flex-1 w-full">
        {renderRoute()}
      </main>

      {/* 6. Footer (Pure Telegram Integration) */}
      {!isAdminView && <Footer navigate={navigate} />}

      {/* 7. Active Announcements / Community Popups */}
      {!isAdminView && <PopupModal />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainLayout />
      </SettingsProvider>
    </AuthProvider>
  );
}
