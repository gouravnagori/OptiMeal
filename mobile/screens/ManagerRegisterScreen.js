import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

const ManagerRegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [messName, setMessName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const { registerManager } = useAuth();

    const handleRegister = async () => {
        if (!name || !email || !password || !messName) {
            Toast.show({ type: 'error', text1: 'Please fill required fields' });
            return;
        }

        setLoading(true);
        const result = await registerManager({ name, email, password, messName, location });
        setLoading(false);

        if (result.success) {
            Toast.show({ type: 'success', text1: 'Registration successful!', text2: 'Mess Code: ' + (result.data?.messCode || 'Check email') });
            navigation.navigate('Login');
        } else {
            Toast.show({ type: 'error', text1: result.message });
        }
    };

    return (
        <LinearGradient colors={['#0f0f0f', '#1a1a2e']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Manager Registration</Text>
                    <Text style={styles.subtitle}>Create your mess and start managing</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mess Name"
                        placeholderTextColor="#666"
                        value={messName}
                        onChangeText={setMessName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Location (optional)"
                        placeholderTextColor="#666"
                        value={location}
                        onChangeText={setLocation}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading === true}
                    >
                        {loading === true ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Create Mess</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.goBack()}>
                        <Text style={styles.linkText}>Already have an account? </Text>
                        <Text style={styles.link}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    header: { marginBottom: 32 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    subtitle: { color: '#666', marginTop: 8 },
    form: {},
    input: {
        backgroundColor: '#1f1f3a',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    linkText: { color: '#666' },
    link: { color: '#10b981', fontWeight: '600' },
});

export default ManagerRegisterScreen;
