import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { messAPI } from '../services/api';
import Toast from 'react-native-toast-message';

const MessTimingsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [timings, setTimings] = useState({
        breakfast: { servingStart: '07:30', servingEnd: '09:30', requestDeadline: '07:00' },
        lunch: { servingStart: '12:00', servingEnd: '14:00', requestDeadline: '11:00' },
        highTea: { servingStart: '17:00', servingEnd: '18:00', requestDeadline: '16:00' },
        dinner: { servingStart: '19:30', servingEnd: '21:30', requestDeadline: '19:00' },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const messId = user && user.messId ? (user.messId._id || user.messId) : null;

    useEffect(() => {
        fetchTimings();
    }, []);

    const fetchTimings = async () => {
        if (!messId) {
            setLoading(false);
            return;
        }
        try {
            const res = await messAPI.getTimings(messId);
            if (res.data && res.data.mealTimings) {
                setTimings(res.data.mealTimings);
            }
        } catch (error) {
            console.error('Fetch timings error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (meal, field, value) => {
        setTimings(prev => ({
            ...prev,
            [meal]: { ...prev[meal], [field]: value },
        }));
    };

    const saveTimings = async () => {
        setSaving(true);
        try {
            await messAPI.updateTimings({ messId, mealTimings: timings });
            Toast.show({ type: 'success', text1: 'Timings saved!' });
            navigation.goBack();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to save timings' });
        } finally {
            setSaving(false);
        }
    };

    const renderMealTiming = (mealType, title, emoji) => {
        const mealData = timings[mealType] || {};
        return (
            <View style={styles.mealSection} key={mealType}>
                <Text style={styles.mealTitle}>{emoji} {title}</Text>

                <View style={styles.row}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Serving Start</Text>
                        <TextInput
                            style={styles.input}
                            value={mealData.servingStart || ''}
                            onChangeText={(text) => handleChange(mealType, 'servingStart', text)}
                            placeholder="HH:MM"
                            placeholderTextColor="#666"
                        />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Serving End</Text>
                        <TextInput
                            style={styles.input}
                            value={mealData.servingEnd || ''}
                            onChangeText={(text) => handleChange(mealType, 'servingEnd', text)}
                            placeholder="HH:MM"
                            placeholderTextColor="#666"
                        />
                    </View>
                </View>

                <View style={styles.deadlineField}>
                    <Text style={styles.label}>🔒 Request Deadline</Text>
                    <TextInput
                        style={styles.input}
                        value={mealData.requestDeadline || ''}
                        onChangeText={(text) => handleChange(mealType, 'requestDeadline', text)}
                        placeholder="HH:MM"
                        placeholderTextColor="#666"
                    />
                    <Text style={styles.hint}>Students cannot change preference after this time</Text>
                </View>
            </View>
        );
    };

    if (loading === true) {
        return (
            <LinearGradient colors={['#0f0f0f', '#1a1a2e']} style={styles.loading}>
                <ActivityIndicator size="large" color="#10b981" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0f0f0f', '#1a1a2e']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Mess Timings</Text>
                    <Text style={styles.subtitle}>Set serving times & request deadlines</Text>
                </View>

                {renderMealTiming('breakfast', 'Breakfast', '🌅')}
                {renderMealTiming('lunch', 'Lunch', '☀️')}
                {renderMealTiming('highTea', 'High Tea', '🍵')}
                {renderMealTiming('dinner', 'Dinner', '🌙')}

                <TouchableOpacity style={styles.saveBtn} onPress={saveTimings} disabled={saving === true}>
                    {saving === true ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Timings</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { marginBottom: 24 },
    backBtn: { color: '#10b981', fontSize: 16, marginBottom: 12 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { color: '#666', marginTop: 4 },
    mealSection: { marginBottom: 20, backgroundColor: '#1f1f3a', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
    mealTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    row: { flexDirection: 'row' },
    field: { flex: 1, marginRight: 6, marginLeft: 6 },
    deadlineField: { marginTop: 12 },
    label: { color: '#888', fontSize: 12, marginBottom: 6 },
    input: { backgroundColor: '#0f0f0f', padding: 12, borderRadius: 8, color: '#fff', borderWidth: 1, borderColor: '#333' },
    hint: { color: '#666', fontSize: 11, marginTop: 4 },
    saveBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default MessTimingsScreen;
