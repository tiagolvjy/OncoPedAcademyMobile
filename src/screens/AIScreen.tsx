import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AIScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>IA Dicas</Text>
            <Text style={styles.subtitle}>Pesquisa inteligente em breve.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8', padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#0A1628', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
});