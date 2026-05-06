import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AuthServices from '../services/auth';

export default function ProfileScreen() {
    const { userData } = useAuth();

    const handleLogout = () => {
        Alert.alert('Sair', 'Deseja realmente sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => { await AuthServices.logout(); },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            {/* AVATAR */}
            {userData?.photoURL
                ? <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                : <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {userData?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
            }

            <Text style={styles.name}>{userData?.name ?? 'Usuário'}</Text>
            <Text style={styles.email}>{userData?.email ?? ''}</Text>
            <Text style={styles.role}>
                {userData?.role === 'student' ? 'Aluno' : userData?.role === 'doctor' ? 'Médico' : 'Usuário'}
            </Text>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4F8', padding: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
    avatarPlaceholder: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    avatarText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#0A1628', marginBottom: 4 },
    email: { fontSize: 14, color: '#666', marginBottom: 4 },
    role: { fontSize: 13, color: '#2563EB', fontWeight: '600', marginBottom: 32 },
    logoutBtn: {
        backgroundColor: '#ef4444', borderRadius: 10, paddingVertical: 14,
        paddingHorizontal: 40,
    },
    logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});