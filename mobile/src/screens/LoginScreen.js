import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { Leaf, Phone, Lock, ChevronRight } from 'lucide-react-native';
import axios from 'axios';
import { COLORS, SHADOWS } from '../constants/theme';
import { API_BASE_URL } from '../config';

const LoginScreen = ({ navigation }) => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!mobileNumber || !password) {
            Alert.alert('Details Required', 'Please enter your mobile number and password.');
            return;
        }
        setLoading(true);
        try {
            console.log('Attempting login with:', mobileNumber);
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { mobileNumber, password });

            setLoading(false);

            if (res.data && res.data.token) {
                navigation.replace('Home', { user: res.data, token: res.data.token });
            } else {
                Alert.alert('Login Failed', 'Invalid response from server.');
            }
        } catch (error) {
            setLoading(false);
            console.log('Login Error:', error);
            const msg = error.response?.data?.message || 'Please check your connection.';
            Alert.alert('Login Failed', msg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        {/* <Lock size={20} color={COLORS.textLight} style={styles.inputIcon} /> */}
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#94a3b8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <View style={styles.btnContent}>
                                <Text style={styles.primaryButtonText}>Login</Text>
                                {/* <ChevronRight size={20} color={COLORS.white} /> */}
                            </View>
                        )}
                    </TouchableOpacity>
                </View >

    <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? Contact Admin</Text>
    </View>
            </View >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    brandSection: { alignItems: 'center', marginBottom: 40 },
    logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    appName: { fontSize: 32, fontWeight: '800', color: COLORS.primary, letterSpacing: -1 },
    appTagline: { fontSize: 16, color: COLORS.textLight, marginTop: 4 },
    formCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, ...SHADOWS.light },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
    instructionText: { fontSize: 14, color: COLORS.textLight, marginBottom: 24 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, marginBottom: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#e2e8f0' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500' },
    primaryButton: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8, ...SHADOWS.medium },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    primaryButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    footer: { marginTop: 24, alignItems: 'center' },
    footerText: { color: COLORS.textLight, fontSize: 14 },
});

export default LoginScreen;
