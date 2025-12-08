import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Sun, Wind, Droplets, Sprout, FlaskConical, TrendingUp, LayoutGrid } from 'lucide-react-native';
import axios from 'axios';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');

const QuickAction = ({ icon: Icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.actionIconConf, { backgroundColor: color + '20' }]}>
            <Icon size={28} color={color} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const HomeScreen = ({ route, navigation }) => {
    const { user, token } = route.params;
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Mock latitude/longitude for now (or get from device if permission allowed)
            const lat = 20.5937;
            const lon = 78.9629;
            const weatherRes = await axios.get(`${API_BASE_URL}/weather/current?lat=${lat}&lon=${lon}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWeather(weatherRes.data);
            setLoading(false);
        } catch (error) {
            console.log('Error fetching data', error);
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greetingSub}>{getGreeting()}</Text>
                    <Text style={styles.greetingMain}>Namaste, {user?.name || 'Farmer'} 🙏</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={() => Alert.alert("Profile", "Profile Settings coming soon!")}>
                    <Text style={styles.profileInitial}>{user?.name?.charAt(0) || 'U'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Weather Card */}
                <View style={styles.weatherSection}>
                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} size="large" />
                    ) : (
                        <View style={styles.weatherCard}>
                            <View style={styles.weatherRowTop}>
                                <View>
                                    <Text style={styles.weatherDate}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
                                    <Text style={styles.weatherTemp}>{Math.round(weather?.current?.temp) || '--'}°C</Text>
                                    <Text style={styles.weatherCondition}>{weather?.current?.weather_desc || 'Sunny'}</Text>
                                </View>
                                <Sun size={64} color="#fcd34d" fill="#fcd34d" />
                            </View>

                            <View style={styles.weatherDivider} />

                            <View style={styles.weatherStats}>
                                <View style={styles.statItem}>
                                    <Wind size={16} color={COLORS.white} />
                                    <Text style={styles.statVal}>{weather?.current?.wind_speed_10m || 0} km/h</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Droplets size={16} color={COLORS.white} />
                                    <Text style={styles.statVal}>{weather?.current?.humidity || 0}%</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Quick Actions Grid */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.gridContainer}>
                    <QuickAction
                        icon={Sprout} label="Crop Rec." color={COLORS.primary}
                        onPress={() => navigation.navigate('CropRecommendation', { token })}
                    />
                    <QuickAction
                        icon={FlaskConical} label="Soil Health" color="#8b5cf6"
                        onPress={() => navigation.navigate('CropRecommendation', { token })} // Reuse for now
                    />
                    <QuickAction
                        icon={TrendingUp} label="Market Price" color="#f59e0b"
                        onPress={() => Alert.alert('Coming Soon', 'Mandi Prices')}
                    />
                    <QuickAction
                        icon={LayoutGrid} label="More" color="#64748b"
                        onPress={() => Alert.alert('Coming Soon', 'More Services')}
                    />
                </View>

                {/* AI Banner */}
                <TouchableOpacity style={styles.aiBanner} onPress={() => Alert.alert('AgriGenius', 'AI Chat coming soon!')}>
                    <View style={styles.aiContent}>
                        <Text style={styles.aiTitle}>Ask AgriGenius AI</Text>
                        <Text style={styles.aiSub}>Get instant farming advice</Text>
                    </View>
                    <View style={styles.aiIcon}>
                        <Text style={{ fontSize: 24 }}>🤖</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 40, backgroundColor: COLORS.primary },
    greetingSub: { color: '#bbf7d0', fontSize: 14, fontWeight: '600' },
    greetingMain: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
    profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    profileInitial: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },
    scrollContent: { padding: 20 },
    weatherSection: { marginTop: -30, marginBottom: 24 },
    weatherCard: { backgroundColor: '#3b82f6', borderRadius: 24, padding: 20, ...SHADOWS.medium },
    weatherRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    weatherDate: { color: '#bfdbfe', fontSize: 14, fontWeight: '500', marginBottom: 4 },
    weatherTemp: { color: COLORS.white, fontSize: 42, fontWeight: 'bold' },
    weatherCondition: { color: COLORS.white, fontSize: 16, opacity: 0.9 },
    weatherDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
    weatherStats: { flexDirection: 'row', gap: 24 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statVal: { color: COLORS.white, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    actionCard: { width: (width - 52) / 2, backgroundColor: COLORS.white, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 12, ...SHADOWS.light, height: 110 },
    actionIconConf: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    actionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    aiBanner: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...SHADOWS.medium },
    aiTitle: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    aiSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
    aiContent: { flex: 1 },
    aiIcon: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 22, justifyContent: 'center', alignItems: 'center' }
});

export default HomeScreen;
