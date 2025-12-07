import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Building2, Landmark, Lock, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
    const [role, setRole] = useState('SUPER_ADMIN');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const roles = [
        { id: 'SUPER_ADMIN', label: 'Super Admin', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { id: 'GODOWN_MANAGER', label: 'Godown Manager', icon: Building2, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        { id: 'GOV_BODY_OFFICER', label: 'Govt. Officer', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(mobileNumber, password);

        if (result.success) {
            // Role Verification
            const user = JSON.parse(localStorage.getItem('user'));
            if (user.role !== role) {
                // Determine if valid cross-role login or just wrong portal
                if (role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
                    setError("Access Denied: You do not have Super Admin privileges.");
                    setLoading(false);
                    return;
                }
                // Allow specific strict checks if needed, else warn but proceed if administrative
                if (['FARMER', 'FARMER_READONLY_VIEW'].includes(user.role)) {
                    setError("Access Denied: Farmers please use the main login.");
                    setLoading(false);
                    return;
                }
            }

            // Redirect based on actual user role
            switch (user.role) {
                case 'SUPER_ADMIN': navigate('/admin/dashboard'); break;
                case 'GODOWN_MANAGER': navigate('/godown/dashboard'); break;
                case 'GOV_BODY_OFFICER': navigate('/gov/dashboard'); break;
                default: navigate('/');
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const activeRole = roles.find(r => r.id === role);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gray-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 z-0"></div>
                    <div className="relative z-10">
                        <div className="mx-auto bg-white/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 backdrop-blur-sm">
                            <activeRole.icon size={40} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Governance Portal</h2>
                        <p className="text-gray-400 text-sm">Official Access Only</p>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    {roles.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setRole(r.id)}
                            className={`flex-1 py-4 text-xs font-medium transition-colors relative ${role === r.id
                                    ? 'text-gray-900 dark:text-white bg-white dark:bg-gray-800'
                                    : 'text-gray-500 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {r.label}
                            {role === r.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="p-8">
                    {/* Role Badge */}
                    <div className={`flex items-center gap-2 mb-6 p-3 rounded-lg ${activeRole.bg} border border-transparent`}>
                        <activeRole.icon size={20} className={activeRole.color} />
                        <span className={`text-sm font-medium ${activeRole.color}`}>Logging in as {activeRole.label}</span>
                    </div>

                    {error && (
                        <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                            <input
                                type="text"
                                required
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter official mobile number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter password"
                                />
                                <Lock className="absolute right-4 top-3.5 text-gray-400" size={20} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Access Dashboard <ArrowRight size={18} /></>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Not an official? <span onClick={() => navigate('/login')} className="text-green-600 hover:text-green-700 font-medium cursor-pointer">Login as Farmer</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
