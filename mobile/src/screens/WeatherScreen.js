import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { CloudRain, Wind, Droplets, Sun, Thermometer, MapPin } from 'lucide-react-native';
import axios from 'axios';
import { COLORS, SHADOWS } from '../constants/theme';
import { API_BASE_URL } from '../config';

const WeatherScreen = ({ route, navigation }) => {
    const { token } = route.params || {};
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        try {
            // Hardcoded for demo - in prod use Expo Location
            const lat = 20.5937;
            const lon = 78.9629;
            const res = await axios.get(`${API_BASE_URL}/weather/current?lat=${lat}&lon=${lon}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWeather(res.data);
            setLoading(false);
        } catch (error) {
            console.log('Weather Error', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.textLight }}>Loading Forecast...</Text>
            </View>
        );
    }

    const current = weather?.current;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Weather Forecast</Text>
                <MapPin size={20} color={COLORS.white} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Main Card */}
                <View style={styles.mainCard}>
                    <View style={styles.rowBetween}>
                        <View>
                            <Text style={styles.tempText}>{Math.round(current?.temp)}°</Text>
                            <Text style={styles.condText}>{current?.weather_desc}</Text>
                        </View>
                        <Sun size={80} color="#fcd34d" fill="#fcd34d" />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Wind size={20} color={COLORS.white} />
                            <Text style={styles.statVal}>{current?.wind_speed_10m} km/h</Text>
                            <Text style={styles.statLabel}>Wind</Text>
                        </View>
                        <View style={styles.stat}>
                            <Droplets size={20} color={COLORS.white} />
                            <Text style={styles.statVal}>{current?.humidity}%</Text>
                            <Text style={styles.statLabel}>Humidity</Text>
                        </View>
                        <View style={styles.stat}>
                            <CloudRain size={20} color={COLORS.white} />
                            <Text style={styles.statVal}>{current?.rain || 0} mm</Text>
                            <Text style={styles.statLabel}>Rain</Text>
                        </View>
                    </View>
                </View>

                {/* Detailed Stats Grid */}
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Pressure</Text>
                        <Text style={styles.gridVal}>{current?.surface_pressure} hPa</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Precipitation</Text>
                        <Text style={styles.gridVal}>{current?.precipitation} mm</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Cloud Cover</Text>
                        <Text style={styles.gridVal}>{current?.cloud_cover || 0}%</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Visibility</Text>
                        <Text style={styles.gridVal}>10 km</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },
    mainCard: { backgroundColor: '#3b82f6', borderRadius: 24, padding: 24, marginBottom: 24, ...SHADOWS.medium },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tempText: { fontSize: 64, fontWeight: 'bold', color: COLORS.white },
    condText: { fontSize: 20, color: '#bfdbfe', marginTop: -4 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    stat: { alignItems: 'center', gap: 4 },
    statVal: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    statLabel: { color: '#bfdbfe', fontSize: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridItem: { width: '48%', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, ...SHADOWS.light },
    gridLabel: { color: COLORS.textLight, fontSize: 13, marginBottom: 4 },
    gridVal: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' }
});

export default WeatherScreen;
