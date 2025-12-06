import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RootRedirect = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkFields = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:5000/api/land', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const lands = await response.json();

                    if (lands.length === 0) {
                        // No fields -> Go to Profile to add one
                        navigate('/profile');
                    } else if (lands.length === 1) {
                        // One field -> Direct Dashboard
                        navigate(`/dashboard/${lands[0].id}`);
                    } else {
                        // Multiple fields -> Selection Screen
                        navigate('/select-field');
                    }
                } else {
                    // Error fetching? Maybe token expired
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error routing:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkFields();
    }, [navigate]);

    return (
        <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
    );
};

export default RootRedirect;
