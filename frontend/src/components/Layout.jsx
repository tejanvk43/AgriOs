import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Home, CloudSun, Store, User, LogOut, Globe, Moon, Sun, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { t, i18n } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || false;
    });
    const location = useLocation();

    // Apply saved theme on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);

        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang); // Save to localStorage
    };

    const navItems = [
        { path: '/', icon: <Home size={20} />, label: t('dashboard') },
        // { path: '/agent', icon: <Bot size={20} />, label: 'AgriGenius' }, // Moved to FAB
        { path: '/market', icon: <Store size={20} />, label: t('market') },
        { path: '/weather', icon: <CloudSun size={20} />, label: t('weather') },
        { path: '/profile', icon: <User size={20} />, label: t('profile') },
    ];

    return (
        <div className={`min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 shrink-0 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-16 flex items-center justify-between px-4 border-b dark:border-gray-700">
                    <h1 className="text-xl font-bold text-green-600 dark:text-green-400">{t('app_name')}</h1>
                    <button onClick={toggleSidebar} className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700 space-y-4">
                    {/* Language Selector */}
                    <div className="flex items-center gap-2 px-2">
                        <Globe size={18} className="text-gray-500" />
                        <select
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full cursor-pointer rounded px-2 py-1 border border-gray-300 dark:border-gray-600"
                            value={i18n.language}
                        >
                            <option value="en" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">English</option>
                            <option value="hi" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">हिंदी (Hindi)</option>
                            <option value="te" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">తెలుగు (Telugu)</option>
                            <option value="bn" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">বাংলা (Bengali)</option>
                            <option value="ta" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">தமிழ் (Tamil)</option>
                            <option value="mr" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">मराठी (Marathi)</option>
                            <option value="gu" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">ગુજરાતી (Gujarati)</option>
                            <option value="kn" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">ಕನ್ನಡ (Kannada)</option>
                            <option value="pa" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">ਪੰਜਾਬੀ (Punjabi)</option>
                            <option value="or" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">ଓଡ଼ିଆ (Odia)</option>
                            <option value="ml" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">മലയാളം (Malayalam)</option>
                        </select>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 w-full px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm cursor-pointer"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center px-4 justify-between sticky top-0 z-30">
                    <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold">{t('app_name')}</span>
                    <div className="w-8" /> {/* Spacer for centering */}
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>

                {/* Floating AI Button (FAB) */}
                <Link
                    to="/agent"
                    className="fixed bottom-6 right-6 z-50 p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center animate-bounce-slow"
                    title="Ask AgriGenius"
                >
                    <Bot size={32} />
                    {/* Optional: <span className="ml-2 font-bold hidden md:inline">Ask AI</span> */}
                </Link>
            </div>
        </div>
    );
};

export default Layout;
