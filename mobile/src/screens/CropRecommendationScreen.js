import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, SafeAreaView, StatusBar, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, Sprout, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react-native';
import axios from 'axios';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { API_BASE_URL } from '../config';

const CropRecommendationScreen = ({ route, navigation }) => {
    const { token } = route.params;

    // Step 1: Input
    // Step 2: Loading
    // Step 3: Results
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState(false);

    const [formData, setFormData] = useState({
        n: '', p: '', k: '', ph: '', budget: '10000', customCrop: ''
    });
    const [recommendations, setRecommendations] = useState(null);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            extractSoilData(result.assets[0].uri);
        }
    };

    const extractSoilData = async (uri) => {
        setAnalyzingImage(true);
        const data = new FormData();
        data.append('image', {
            uri: uri,
            type: 'image/jpeg',
            name: 'soil_health_card.jpg',
        });

        try {
            const res = await axios.post(`${API_BASE_URL}/ai/extract-soil`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (res.data) {
                setFormData(prev => ({
                    ...prev,
                    n: res.data.n || prev.n,
                    p: res.data.p || prev.p,
                    k: res.data.k || prev.k,
                    ph: res.data.ph || prev.ph
                }));
                Alert.alert("Success", "Soil Data Extracted Automatically!");
            }
        } catch (error) {
            console.log("Extraction Error", error);
            const msg = error.response?.data?.message || "Failed to extract data.";
            Alert.alert("Error", msg);
        } finally {
            setAnalyzingImage(false);
        }
    };

    const getRecommendations = async () => {
        setLoading(true);
        setStep(2); // Show Loading Screen

        try {
            const payload = {
                soilData: { n: formData.n, p: formData.p, k: formData.k, ph: formData.ph },
                budget: formData.budget,
                customCrop: formData.customCrop
            };

            const res = await axios.post(`${API_BASE_URL}/ai/recommend`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data && res.data.recommendations) {
                setRecommendations(res.data);
                setStep(3); // Show Results
            } else {
                Alert.alert("Error", "No recommendations received.");
                setStep(1);
            }
        } catch (error) {
            console.log("Recommendation Error", error);
            const msg = error.response?.data?.message || "Something went wrong.";
            Alert.alert("Error", msg);
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER STEPS ---

    const renderInputStep = () => (
        <View style={styles.formContainer}>
            <View style={styles.uploadCard}>
                <View>
                    <Text style={styles.cardTitle}>Auto-Fill from Soil Card</Text>
                    <Text style={styles.cardSub}>Upload a photo of your report</Text>
                </View>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} disabled={analyzingImage}>
                    {analyzingImage ? <ActivityIndicator color={COLORS.white} /> : <Camera size={20} color={COLORS.white} />}
                    <Text style={styles.uploadBtnText}>{analyzingImage ? 'Scanning...' : 'Upload'}</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Soil Details (Manual / Edit)</Text>
            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>Nitrogen (N)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g. 140"
                        value={formData.n}
                        onChangeText={t => handleInputChange('n', t)}
                    />
                </View>
                <View style={styles.col}>
                    <Text style={styles.label}>Phosphorus (P)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g. 40"
                        value={formData.p}
                        onChangeText={t => handleInputChange('p', t)}
                    />
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>Potassium (K)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g. 180"
                        value={formData.k}
                        onChangeText={t => handleInputChange('k', t)}
                    />
                </View>
                <View style={styles.col}>
                    <Text style={styles.label}>pH Level</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g. 6.5"
                        value={formData.ph}
                        onChangeText={t => handleInputChange('ph', t)}
                    />
                </View>
            </View>

            <Text style={styles.sectionHeader}>Requirements</Text>
            <Text style={styles.label}>Budget (₹ per acre)</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formData.budget}
                onChangeText={t => handleInputChange('budget', t)}
            />

            <Text style={styles.label}>Specific Crop (Optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Tomato (Optional)"
                value={formData.customCrop}
                onChangeText={t => handleInputChange('customCrop', t)}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={getRecommendations}>
                <Text style={styles.submitBtnText}>Analyze & Recommend</Text>
                <ArrowRight size={20} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );

    const renderResultsStep = () => (
        <View>
            <View style={styles.insightBanner}>
                <Text style={styles.insightTitle}>Market Insight 📈</Text>
                <Text style={styles.insightText}>{recommendations?.market_insight}</Text>
            </View>

            {recommendations?.recommendations?.map((crop, index) => (
                <View key={index} style={styles.cropCard}>
                    <View style={styles.cropHeader}>
                        <View>
                            <Text style={styles.cropName}>{crop.crop_name}</Text>
                            <Text style={styles.cropMatch}>{crop.confidence_score}% Match</Text>
                        </View>
                        <View style={styles.profitBadge}>
                            <Text style={styles.profitText}>{crop.economics.profit_potential} Profit</Text>
                        </View>
                    </View>

                    <Text style={styles.reasonText}>{crop.suitability_reason}</Text>

                    <View style={styles.econGrid}>
                        <View style={styles.econItem}>
                            <Text style={styles.econLabel}>Cost/Acre</Text>
                            <Text style={styles.econVal}>₹{crop.economics.estimated_cost_per_acre}</Text>
                        </View>
                        <View style={styles.econItem}>
                            <Text style={styles.econLabel}>Yield</Text>
                            <Text style={styles.econVal}>{crop.economics.expected_yield_per_acre}</Text>
                        </View>
                    </View>

                    <View style={styles.timelineBox}>
                        <Text style={styles.timelineText}>📅 Sow in {crop.timeline.sowing_month} • {crop.timeline.duration_days} Days</Text>
                    </View>
                </View>
            ))}

            <TouchableOpacity style={styles.resetBtn} onPress={() => setStep(1)}>
                <Text style={styles.resetBtnText}>Analyze Another Crop</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: COLORS.white, fontSize: 24 }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Crop Recommendation</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {step === 1 && renderInputStep()}

                {step === 2 && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Analyzing soil parameters...</Text>
                        <Text style={styles.loadingSub}>Consulting AI Agronomist...</Text>
                    </View>
                )}

                {step === 3 && renderResultsStep()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },

    // From UI
    uploadCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, ...SHADOWS.medium },
    cardTitle: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    cardSub: { color: '#94a3b8', fontSize: 12 },
    uploadBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', gap: 6, alignItems: 'center' },
    uploadBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 12 },

    sectionHeader: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 12, marginTop: 8 },
    row: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },
    label: { fontSize: 13, color: COLORS.textLight, marginBottom: 6 },
    input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 15, color: COLORS.text, marginBottom: 16 },

    submitBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 16, ...SHADOWS.medium },
    submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },

    // Loading
    loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    loadingText: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    loadingSub: { color: COLORS.textLight, marginTop: 8 },

    // Results
    insightBanner: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20 },
    insightTitle: { color: '#1d4ed8', fontWeight: 'bold', marginBottom: 4 },
    insightText: { color: '#3b82f6', fontSize: 13, lineHeight: 20 },

    cropCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16, ...SHADOWS.light },
    cropHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cropName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    cropMatch: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
    profitBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    profitText: { color: '#16a34a', fontSize: 12, fontWeight: 'bold' },
    reasonText: { fontSize: 14, color: COLORS.textLight, marginBottom: 16, lineHeight: 20 },
    econGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    econItem: { flex: 1, backgroundColor: '#f8fafc', padding: 10, borderRadius: 8 },
    econLabel: { fontSize: 11, color: '#64748b' },
    econVal: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
    timelineBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timelineText: { fontSize: 12, color: '#64748b', fontWeight: '500' },

    resetBtn: { padding: 16, alignItems: 'center' },
    resetBtnText: { color: COLORS.primary, fontWeight: 'bold' }
});

export default CropRecommendationScreen;
