import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import HeroCard from '../components/dashboard/HeroCard';
import QuickActions from '../components/dashboard/QuickActions';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import AlertsWidget from '../components/dashboard/AlertsWidget';
import MyCropsWidget from '../components/dashboard/MyCropsWidget';

const Home = () => {
    const { user } = useAuth();
    const { landId } = useParams();
    const [land, setLand] = useState(null);
    const [advisories, setAdvisories] = useState([]);

    useEffect(() => {
        if (landId) {
            fetchLand();
        }
    }, [landId]);

    const fetchLand = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/land/${landId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLand(data);
            }
        } catch (error) {
            console.error('Error fetching land:', error);
        }
    };

    // Determine location to show
    // If land selected -> Land Location
    // If no land -> User Profile Location
    // Fallback -> Default
    const locationDisplay = land
        ? `${land.village}, ${land.district}`
        : (user?.location || 'Nagpur'); // Default fallback

    // Fetch Advisories when location is available
    useEffect(() => {
        if (locationDisplay) {
            fetchForecast();
        }
    }, [locationDisplay]);

    const fetchForecast = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/weather/forecast?location=${locationDisplay}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAdvisories(data.advisories || []);
            }
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Hero Section */}
            <HeroCard user={user} land={land} />

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Show MyCrops only if specific land is selected */}
                {landId && <MyCropsWidget landId={landId} />}

                <WeatherWidget location={locationDisplay} />

                <AlertsWidget advisories={advisories} />
            </div>

            {/* Quick Actions */}
            <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                <QuickActions />
            </section>

            {landId && <AlertsWidget />}
        </div>
    );
};

export default Home;
