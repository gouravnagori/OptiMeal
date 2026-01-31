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
import { menuAPI } from '../services/api';
import Toast from 'react-native-toast-message';

const MenuEditorScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [menu, setMenu] = useState({
        breakfast: [],
        lunch: [],
        highTea: [],
        dinner: [],
    });
    const [newItems, setNewItems] = useState({
        breakfast: '',
        lunch: '',
        highTea: '',
        dinner: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const messId = user && user.messId ? (user.messId._id || user.messId) : null;

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        if (!messId) {
            setLoading(false);
            return;
        }
        try {
            const today = new Date().toISOString();
            const res = await menuAPI.getDaily(messId, today);
            if (res.data) {
                setMenu({
                    breakfast: res.data.breakfast || [],
                    lunch: res.data.lunch || [],
                    highTea: res.data.highTea || [],
                    dinner: res.data.dinner || [],
                });
            }
        } catch (error) {
            console.error('Fetch menu error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = (mealType) => {
        const item = newItems[mealType].trim();
        if (!item) return;
        setMenu(prev => ({
            ...prev,
            [mealType]: [...prev[mealType], item],
        }));
        setNewItems(prev => ({ ...prev, [mealType]: '' }));
    };

    const removeItem = (mealType, index) => {
        setMenu(prev => ({
            ...prev,
            [mealType]: prev[mealType].filter((_, i) => i !== index),
        }));
    };

    const saveMenu = async () => {
        setSaving(true);
        try {
            await menuAPI.update({
                messId,
                date: new Date().toISOString(),
                breakfast: menu.breakfast,
                lunch: menu.lunch,
                highTea: menu.highTea,
                dinner: menu.dinner,
            });
            Toast.show({ type: 'success', text1: 'Menu saved!' });
            navigation.goBack();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to save menu' });
        } finally {
            setSaving(false);
        }
    };

    const renderMealSection = (mealType, title, emoji) => {
        const items = menu[mealType] || [];
        return (
            <View style={styles.mealSection} key={mealType}>
                <Text style={styles.mealTitle}>{emoji} {title}</Text>

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder={'Add ' + title.toLowerCase() + ' item...'}
                        placeholderTextColor="#666"
                        value={newItems[mealType]}
                        onChangeText={(text) => setNewItems(prev => ({ ...prev, [mealType]: text }))}
                        onSubmitEditing={() => addItem(mealType)}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={() => addItem(mealType)}>
                        <Text style={styles.addBtnText}>+</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemsList}>
                    {items.map((item, index) => (
                        <View key={index} style={styles.itemChip}>
                            <Text style={styles.itemText}>{item}</Text>
                            <TouchableOpacity onPress={() => removeItem(mealType, index)}>
                                <Text style={styles.removeText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    {items.length === 0 ? (
                        <Text style={styles.emptyText}>No items added</Text>
                    ) : null}
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
                    <Text style={styles.title}>Edit Today's Menu</Text>
                </View>

                {renderMealSection('breakfast', 'Breakfast', '🌅')}
                {renderMealSection('lunch', 'Lunch', '☀️')}
                {renderMealSection('highTea', 'High Tea', '🍵')}
                {renderMealSection('dinner', 'Dinner', '🌙')}

                <TouchableOpacity style={styles.saveBtn} onPress={saveMenu} disabled={saving === true}>
                    {saving === true ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Menu</Text>
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
    mealSection: { marginBottom: 24, backgroundColor: '#1f1f3a', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
    mealTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
    inputRow: { flexDirection: 'row' },
    input: { flex: 1, backgroundColor: '#0f0f0f', padding: 12, borderRadius: 8, color: '#fff', borderWidth: 1, borderColor: '#333', marginRight: 8 },
    addBtn: { backgroundColor: '#10b981', width: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    addBtnText: { color: '#fff', fontSize: 24 },
    itemsList: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
    itemChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
    itemText: { color: '#fff', fontSize: 13, marginRight: 8 },
    removeText: { color: '#ef4444', fontSize: 14 },
    emptyText: { color: '#666', fontStyle: 'italic' },
    saveBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default MenuEditorScreen;
