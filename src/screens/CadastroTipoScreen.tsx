import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView
} from 'react-native';

export default function CadastroTipoScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Selecione o tipo de conta</Text>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('CadastroAluno')}
            >
                <Text style={styles.cardTitle}>Sou Aluno</Text>
                <Text style={styles.cardDescription}>
                    Estudante de medicina buscando capacitação em oncologia pediátrica.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.card, styles.cardDoctor]}
                onPress={() => navigation.navigate('CadastroMedico')}
            >
                <Text style={styles.cardTitle}>Sou Médico</Text>
                <Text style={styles.cardDescription}>
                    Profissional da saúde que deseja utilizar a plataforma para estudo, capacitação e criação de conteúdos educacionais.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Já tenho conta. Fazer login</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#1a1a1a' },
    subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 40 },
    card: {
        borderWidth: 2, borderColor: '#4703D0', borderRadius: 12,
        padding: 20, marginBottom: 16, backgroundColor: '#f8f5ff',
        marginHorizontal: 10, 
    },
    cardDoctor: { borderColor: '#1aab67', backgroundColor: '#f0fff7' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: '#1a1a1a' },
    cardDescription: { fontSize: 14, color: '#555', lineHeight: 20 },
    link: { color: '#4703D0', fontSize: 14, textAlign: 'center', marginTop: 24 },
});