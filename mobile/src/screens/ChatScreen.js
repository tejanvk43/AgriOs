import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send, User, Bot, Volume2 } from 'lucide-react-native';
import axios from 'axios';
import { COLORS, SHADOWS } from '../constants/theme';
import { API_BASE_URL } from '../config';

const ChatScreen = ({ route, navigation }) => {
    const { token, user } = route.params || {};
    const [messages, setMessages] = useState([
        { id: '1', text: `Namaste ${user?.name || 'Farmer'}! I am AgriGenius. How can I help you today?`, sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            // Use voice-audio endpoint for consistency with web, it returns text + audio base64
            // We start with just text display
            const res = await axios.post(`${API_BASE_URL}/ai/voice-audio`, {
                message: userMsg.text,
                language: 'en-IN' // Default, could be dynamic
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data && res.data.replyText) {
                const aiMsg = {
                    id: (Date.now() + 1).toString(),
                    text: res.data.replyText,
                    sender: 'ai',
                    audio: res.data.audioBase64 // Store for future playback
                };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            console.log("Chat Error", error);
            const errMsg = { id: Date.now().toString(), text: "Sorry, I'm having trouble connecting to the farm server right now.", sender: 'ai', isError: true };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}>
                {!isUser && (
                    <View style={[styles.avatar, styles.avatarAi]}>
                        <Bot size={20} color={COLORS.white} />
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                    <Text style={[styles.msgText, isUser ? styles.textUser : styles.textAi]}>{item.text}</Text>
                </View>
                {isUser && (
                    <View style={[styles.avatar, styles.avatarUser]}>
                        <User size={20} color={COLORS.white} />
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={{ color: COLORS.white, fontSize: 24 }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AgriGenius Assistant</Text>
                <Volume2 size={24} color={COLORS.white} style={{ opacity: 0.5 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                style={{ flex: 1 }}
            />

            {loading && (
                <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.typingText}>AgriGenius is typing...</Text>
                </View>
            )}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={10}>
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask anything about crops, market..."
                        placeholderTextColor="#94a3b8"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
                        <Send size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...SHADOWS.medium },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },

    listContent: { padding: 20, paddingBottom: 10 },
    msgRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', gap: 8 },
    msgRowUser: { justifyContent: 'flex-end' },
    msgRowAi: { justifyContent: 'flex-start' },

    avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    avatarAi: { backgroundColor: COLORS.primary },
    avatarUser: { backgroundColor: '#f59e0b' }, // Amber

    bubble: { padding: 12, borderRadius: 20, maxWidth: '75%' },
    bubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    bubbleAi: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4, ...SHADOWS.light },

    msgText: { fontSize: 15, lineHeight: 22 },
    textUser: { color: COLORS.white },
    textAi: { color: COLORS.text },

    typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingBottom: 12 },
    typingText: { fontSize: 12, color: COLORS.textLight },

    inputArea: { flexDirection: 'row', padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'center', gap: 12 },
    input: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10, maxHeight: 100, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: '#e2e8f0' },
    sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium },
});

export default ChatScreen;
