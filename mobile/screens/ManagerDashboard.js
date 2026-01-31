import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Modal,
    FlatList,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI, studentAPI } from '../services/api';
import StatBox from '../components/StatBox';
import Toast from 'react-native-toast-message';

const ManagerDashboard = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        breakfast: 0,
        lunch: 0,
        highTea: 0,
        dinner: 0,
        totalStudents: 0,
    });
    const [refreshing, setRefreshing] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [unverifiedCount, setUnverifiedCount] = useState(0);

    const messId = user && user.messId ? (user.messId._id || user.messId) : null;
    const messCode = user && user.messId && user.messId.messCode ? user.messId.messCode : 'N/A';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await Promise.all([fetchStats(), fetchPendingCount()]);
    };

    const fetchStats = async () => {
        if (!messId) return;
        try {
            const res = await attendanceAPI.getStats(messId);
            if (res.data) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    };

    const fetchPendingCount = async () => {
        if (!messId) return;
        try {
            const res = await studentAPI.getPending(messId);
            if (res.data) {
                setUnverifiedCount(res.data.length);
                setPendingStudents(res.data);
            }
        } catch (error) {
            console.error('Fetch pending error:', error);
        }
    };

    const handleVerify = async (studentId) => {
        try {
            await studentAPI.verify(studentId);
            setPendingStudents(prev => prev.filter(s => s._id !== studentId));
            setUnverifiedCount(prev => prev - 1);
            Toast.show({ type: 'success', text1: 'Student Verified!' });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Verification failed' });
        }
    };

    const handleReject = async (studentId) => {
        Alert.alert(
            'Reject Student',
            'Are you sure you want to reject this student?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await studentAPI.reject(studentId);
                            setPendingStudents(prev => prev.filter(s => s._id !== studentId));
                            setUnverifiedCount(prev => prev - 1);
                            Toast.show({ type: 'success', text1: 'Student Rejected' });
                        } catch (error) {
                            Toast.show({ type: 'error', text1: 'Rejection failed' });
                        }
                    },
                },
            ]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const openModal = () => setShowVerifyModal(true);
    const closeModal = () => setShowVerifyModal(false);

    const renderStudent = ({ item }) => (
        <View style={styles.studentCard}>
            <View>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentEmail}>{item.email}</Text>
            </View>
            <View style={styles.actionBtns}>
                <TouchableOpacity style={styles.verifyBtn} onPress={() => handleVerify(item._id)}>
                    <Text style={styles.verifyBtnText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item._id)}>
                    <Text style={styles.rejectBtnText}>✕</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <LinearGradient colors={['#0f0f0f', '#1a1a2e']} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Dashboard</Text>
                        <Text style={styles.subtitle}>Overview for Today</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <StatBox title="Breakfast" count={stats.breakfast} total={stats.totalStudents} color="#f97316" />
                        </View>
                        <View style={styles.statItem}>
                            <StatBox title="Lunch" count={stats.lunch} total={stats.totalStudents} color="#10b981" />
                        </View>
                    </View>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <StatBox title="High Tea" count={stats.highTea} total={stats.totalStudents} color="#ec4899" />
                        </View>
                        <View style={styles.statItem}>
                            <StatBox title="Dinner" count={stats.dinner} total={stats.totalStudents} color="#3b82f6" />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <TouchableOpacity style={styles.actionBtn} onPress={openModal}>
                        <Text style={styles.actionText}>Verify New Students</Text>
                        {unverifiedCount > 0 ? (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unverifiedCount}</Text>
                            </View>
                        ) : (
                            <View style={styles.allVerified}>
                                <Text style={styles.allVerifiedText}>All Verified</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MenuEditor')}>
                        <Text style={styles.actionText}>Edit Today's Menu</Text>
                        <Text style={styles.arrowText}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MessTimings')}>
                        <Text style={styles.actionText}>Mess Timings</Text>
                        <Text style={styles.arrowText}>→</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Mess Code</Text>
                    <Text style={styles.messCode}>{messCode}</Text>
                    <Text style={styles.infoHint}>Share this code with students to join</Text>
                </View>
            </ScrollView>

            <Modal visible={showVerifyModal === true} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pending Verifications</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {pendingStudents.length === 0 ? (
                            <Text style={styles.emptyText}>No pending verifications</Text>
                        ) : (
                            <FlatList
                                data={pendingStudents}
                                keyExtractor={(item) => item._id}
                                renderItem={renderStudent}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greeting: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
    subtitle: { color: '#666', marginTop: 4 },
    logoutBtn: { backgroundColor: '#333', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    logoutText: { color: '#fff', fontWeight: '600' },
    statsGrid: { marginBottom: 24 },
    statRow: { flexDirection: 'row', marginBottom: 0 },
    statItem: { flex: 1, marginRight: 6, marginLeft: 6 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
    actionBtn: { backgroundColor: '#1f1f3a', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#333' },
    actionText: { color: '#fff', fontWeight: '500' },
    arrowText: { color: '#666', fontSize: 18 },
    badge: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    allVerified: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    allVerifiedText: { color: '#10b981', fontSize: 12 },
    infoBox: { backgroundColor: '#1f1f3a', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    infoTitle: { color: '#666', fontSize: 12, marginBottom: 8 },
    messCode: { color: '#10b981', fontSize: 32, fontWeight: 'bold', letterSpacing: 4 },
    infoHint: { color: '#666', fontSize: 12, marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    closeBtn: { color: '#666', fontSize: 24 },
    emptyText: { color: '#666', textAlign: 'center', paddingVertical: 40 },
    studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f0f0f', padding: 16, borderRadius: 12, marginBottom: 10 },
    studentName: { color: '#fff', fontWeight: '600' },
    studentEmail: { color: '#666', fontSize: 12, marginTop: 2 },
    actionBtns: { flexDirection: 'row' },
    verifyBtn: { backgroundColor: '#10b981', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    verifyBtnText: { color: '#fff', fontSize: 18 },
    rejectBtn: { backgroundColor: '#ef4444', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    rejectBtnText: { color: '#fff', fontSize: 18 },
});

export default ManagerDashboard;
