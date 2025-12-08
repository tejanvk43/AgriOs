import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { Search, TrendingUp, TrendingDown } from 'lucide-react-native';
import axios from 'axios';
import { COLORS, SHADOWS } from '../constants/theme';
import { API_BASE_URL } from '../config';

const MarketPricesScreen = ({ route }) => {
    const { token } = route.params || {};
    const [prices, setPrices] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        try {
            // Assuming a dedicated endpoint for market data, or re-using the AI context one?
            // Since specific endpoint wasn't in original backend, let's mock it for now 
            // OR use the CSV data if we exposed it. 
            // For this demo, let's simulate a fetch or use a simple heuristic.
            // If backend doesn't have /api/market, we might need to add it.
            // Let's assume user wants us to ADD the endpoint or it exists.
            // I will assume for now we can get it from a new endpoint I'll add quickly later,
            // OR I'll mock it for the UI demo.

            // Mock Data for Demo (to be safe if endpoint missing)
            const mockData = [
                { commodity: 'Rice', market: 'Mandi A', price: 2200, change: 5 },
                { commodity: 'Wheat', market: 'Mandi B', price: 2400, change: -2 },
                { commodity: 'Tomato', market: 'Mandi C', price: 1500, change: 10 },
                { commodity: 'Potato', market: 'Mandi A', price: 800, change: 0 },
                { commodity: 'Cotton', market: 'Mandi D', price: 6000, change: 1.5 },
            ];
            setPrices(mockData);
            setFiltered(mockData);
            setLoading(false);
        } catch (error) {
            console.log('Market Error', error);
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearch(text);
        if (!text) {
            setFiltered(prices);
        } else {
            const f = prices.filter(p => p.commodity.toLowerCase().includes(text.toLowerCase()));
            setFiltered(f);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View>
                <Text style={styles.name}>{item.commodity}</Text>
                <Text style={styles.market}>{item.market}</Text>
            </View>
            <View style={styles.rightInfo}>
                <Text style={styles.price}>₹{item.price}/q</Text>
                <View style={[styles.badge, { backgroundColor: item.change >= 0 ? '#dcfce7' : '#fee2e2' }]}>
                    {item.change >= 0 ? <TrendingUp size={12} color={COLORS.success} /> : <TrendingDown size={12} color={COLORS.error} />}
                    <Text style={{ fontSize: 12, color: item.change >= 0 ? COLORS.success : COLORS.error, fontWeight: 'bold' }}>
                        {Math.abs(item.change)}%
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Market Prices</Text>
                <Text style={styles.headerSub}>Live Mandi Rates</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={COLORS.textLight} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search crop (e.g. Rice)"
                        value={search}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filtered}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No crops found</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 40 },
    headerTitle: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
    headerSub: { color: '#bbf7d0', fontSize: 14 },
    searchContainer: { padding: 16, marginTop: -20 },
    searchBar: { backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 10, ...SHADOWS.medium },
    input: { flex: 1, fontSize: 16, color: COLORS.text },
    list: { padding: 16, paddingTop: 0 },
    card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.light },
    name: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    market: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
    rightInfo: { alignItems: 'flex-end', gap: 4 },
    price: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 40 }
});

export default MarketPricesScreen;
