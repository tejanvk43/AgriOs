import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RootRedirect = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth(); // Use context instead of manual fetch if possible, or fallback
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Wait for AuthContext to load
        if (loading) return;

        if (!user) {
            navigate('/login');
            return;
        }

        const handleRouting = async () => {
            try {
                // Role Based Redirect
                switch (user.role) {
                    case 'SUPER_ADMIN':
                        navigate('/admin/dashboard');
                        return;
                    case 'GODOWN_MANAGER':
                        navigate('/godown/dashboard');
                        return;
                    case 'GOV_BODY_OFFICER':
                        navigate('/gov/dashboard');
                        return;
                    case 'DATA_ANALYST':
                        navigate('/admin/dashboard'); // Or specific analyst view
                        return;
                    default:
                        // Fallback implies Farmer or others --> Check Land Records
                        break;
                }

                // Farmer Logic
                const token = localStorage.getItem('token');
                const response = await fetch('/api/land', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const lands = await response.json();

                    if (lands.length === 0) {
                        navigate('/profile');
                    } else if (lands.length === 1) {
                        navigate(`/dashboard/${lands[0].id}`);
                    } else {
                        navigate('/select-field');
                    }
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error routing:', error);
                navigate('/login');
            } finally {
                setChecking(false);
            }
        };

        handleRouting();
    }, [navigate, user, loading]);

    return (
        <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
    );
};

export default RootRedirect;
