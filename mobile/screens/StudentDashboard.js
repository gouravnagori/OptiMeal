import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI, menuAPI, messAPI } from '../services/api';
import MealCard from '../components/MealCard';
import Toast from 'react-native-toast-message';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [meals, setMeals] = useState({
        breakfast: true,
        lunch: true,
        highTea: true,
        dinner: true,
    });
    const [menu, setMenu] = useState({
        breakfast: [],
        lunch: [],
        highTea: [],
        dinner: [],
    });
    const [mealTimings, setMealTimings] = useState({});
    const [lockedMeals, setLockedMeals] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    const messId = user && user.messId ? (user.messId._id || user.messId) : null;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await Promise.all([
            fetchAttendance(),
            fetchMenu(),
            fetchTimings(),
        ]);
    };

    const getLocalDateString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchAttendance = async () => {
        try {
            const dateStr = getLocalDateString();
            const res = await attendanceAPI.get(user._id, dateStr);
            if (res.data) {
                setMeals({
                    breakfast: res.data.breakfast !== false,
                    lunch: res.data.lunch !== false,
                    highTea: res.data.highTea !== false,
                    dinner: res.data.dinner !== false,
                });
            }
        } catch (error) {
            console.error('Fetch attendance error:', error);
        }
    };

    const fetchMenu = async () => {
        if (!messId) return;
        try {
            const dateStr = getLocalDateString();
            const res = await menuAPI.getDaily(messId, dateStr);
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
        }
    };



    const fetchTimings = async () => {
        if (!messId) return;
        try {
            const res = await messAPI.getTimings(messId);
            if (res.data && res.data.mealTimings) {
                setMealTimings(res.data.mealTimings);
                checkLockedMeals(res.data.mealTimings);
            }
        } catch (error) {
            console.error('Fetch timings error:', error);
        }
    };

    const checkLockedMeals = (timings) => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const currentTime = hours + ':' + mins;

        const locked = {};
        const mealTypes = ['breakfast', 'lunch', 'highTea', 'dinner'];
        mealTypes.forEach(meal => {
            if (timings[meal] && timings[meal].requestDeadline) {
                locked[meal] = currentTime >= timings[meal].requestDeadline;
            } else {
                locked[meal] = false;
            }
        });
        setLockedMeals(locked);
    };

    const toggleMeal = async (mealType) => {
        if (lockedMeals[mealType] === true) {
            Toast.show({ type: 'error', text1: 'Request locked', text2: 'Deadline has passed' });
            return;
        }

        const newStatus = meals[mealType] !== true;
        setMeals(prev => ({ ...prev, [mealType]: newStatus }));

        try {
            await attendanceAPI.update({
                studentId: user._id,
                messId: messId,
                date: getLocalDateString(),
                mealType: mealType,
                status: newStatus,
            });
            Toast.show({ type: 'success', text1: newStatus ? '✅ Opted In' : '❌ Opted Out' });
        } catch (error) {
            setMeals(prev => ({ ...prev, [mealType]: !newStatus }));
            const msg = error.response && error.response.data && error.response.data.message;
            Toast.show({ type: 'error', text1: msg || 'Update failed' });
        }
    };

    const formatTime = (start, end) => {
        if (!start || !end) return 'Time not set';
        const format = (t) => {
            const parts = t.split(':');
            if (parts.length < 2) return t;
            const hour = parseInt(parts[0], 10);
            const mins = parts[1];
            return (hour % 12 || 12) + ':' + mins + ' ' + (hour >= 12 ? 'PM' : 'AM');
        };
        return format(start) + ' - ' + format(end);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const userName = user && user.name ? user.name.split(' ')[0] : 'User';

    return (
        <LinearGradient colors={['#0f0f0f', '#1a1a2e']} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, <Text style={styles.name}>{userName}</Text>! 👋</Text>
                        <Text style={styles.subtitle}>Ready to save some food today?</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today's Meals</Text>
                    <Text style={styles.sectionSubtitle}>Toggle to opt in/out</Text>

                    <MealCard
                        type="breakfast"
                        time={formatTime(mealTimings.breakfast?.servingStart, mealTimings.breakfast?.servingEnd)}
                        isSelected={meals.breakfast === true}
                        onToggle={() => toggleMeal('breakfast')}
                        isLocked={lockedMeals.breakfast === true}
                        menuItems={menu.breakfast}
                        deadline={mealTimings.breakfast?.requestDeadline}
                    />
                    <MealCard
                        type="lunch"
                        time={formatTime(mealTimings.lunch?.servingStart, mealTimings.lunch?.servingEnd)}
                        isSelected={meals.lunch === true}
                        onToggle={() => toggleMeal('lunch')}
                        isLocked={lockedMeals.lunch === true}
                        menuItems={menu.lunch}
                        deadline={mealTimings.lunch?.requestDeadline}
                    />
                    <MealCard
                        type="highTea"
                        time={formatTime(mealTimings.highTea?.servingStart, mealTimings.highTea?.servingEnd)}
                        isSelected={meals.highTea === true}
                        onToggle={() => toggleMeal('highTea')}
                        isLocked={lockedMeals.highTea === true}
                        menuItems={menu.highTea}
                        deadline={mealTimings.highTea?.requestDeadline}
                    />
                    <MealCard
                        type="dinner"
                        time={formatTime(mealTimings.dinner?.servingStart, mealTimings.dinner?.servingEnd)}
                        isSelected={meals.dinner === true}
                        onToggle={() => toggleMeal('dinner')}
                        isLocked={lockedMeals.dinner === true}
                        menuItems={menu.dinner}
                        deadline={mealTimings.dinner?.requestDeadline}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <Text style={styles.infoText}>
                        Meal requests automatically lock after the deadline. Please plan responsibly.
                    </Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greeting: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
    name: { color: '#10b981' },
    subtitle: { color: '#666', marginTop: 4 },
    logoutBtn: { backgroundColor: '#333', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    logoutText: { color: '#fff', fontWeight: '600' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    sectionSubtitle: { color: '#666', marginBottom: 16 },
    infoBox: { flexDirection: 'row', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
    infoIcon: { fontSize: 16, marginRight: 12 },
    infoText: { color: '#93c5fd', flex: 1, fontSize: 13 },
});

export default StudentDashboard;
