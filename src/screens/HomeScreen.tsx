import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
    const { userData } = useAuth();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.greeting}>
                Olá, {userData?.name?.split(' ')[0] ?? 'Usuário'}!
            </Text>
            <Text style={styles.subtitle}>Bem-vindo à OncoPed Academy</Text>

            {/* CARD PROGRESSO */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Meu Progresso</Text>
                <Text style={styles.cardText}>Nenhum curso iniciado ainda.</Text>
            </View>

            {/* CARD ATIVIDADES */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Atividades Recentes</Text>
                <Text style={styles.cardText}>Nenhuma atividade recente.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#F0F4F8' },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#0A1628', marginTop: 8 },
    subtitle: { fontSize: 15, color: '#666', marginBottom: 24 },
    card: {
        backgroundColor: '#fff', borderRadius: 12, padding: 20,
        marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#0A1628', marginBottom: 8 },
    cardText: { fontSize: 14, color: '#888' },
});