import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CadastroTipoScreen({ navigation }: any) {
    return (
        <View style={{ flex: 1 }}>
            {/* HEADER */}
            <View style={styles.header}>
                <Image source={require('../../assets/logoOncoPedAcademy.png')} style={styles.logo} resizeMode="contain" />
            </View>

            {/* CARD */}
            <View style={styles.card}>
                <Text style={styles.title}>Criar Conta</Text>
                <Text style={styles.subtitle}>Selecione o tipo de conta para começar</Text>

                {/* ALUNO */}
                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => navigation.navigate('CadastroAluno')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#EBF5FF' }]}>
                        <Ionicons name="school-outline" size={28} color="#2563EB" />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Sou Aluno</Text>
                        <Text style={styles.optionDescription}>
                            Estudante de medicina buscando capacitação em oncologia pediátrica.
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                {/* MÉDICO */}
                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => navigation.navigate('CadastroMedico')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#E6F7F5' }]}>
                        <Ionicons name="medkit-outline" size={28} color="#0D9488" />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Sou Médico</Text>
                        <Text style={styles.optionDescription}>
                            Profissional da saúde que deseja estudar, capacitar-se e criar conteúdos educacionais.
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                {/* VOLTAR */}
                <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={18} color="#2563EB" />
                    <Text style={styles.backText}>Já tenho conta. Fazer login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { backgroundColor: '#172F50', paddingTop: 50, paddingBottom: 70, alignItems: 'center' },
    logo: { width: 160, height: 110 },
    card: {
        flex: 1, backgroundColor: '#fff', marginTop: -35,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 24, paddingTop: 36, paddingBottom: 40,
    },
    title: { fontSize: 26, fontWeight: 'bold', color: '#2563EB', marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 28 },
    optionCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 16, padding: 16, marginBottom: 14,
        borderWidth: 1.5, borderColor: '#eee',
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    iconCircle: {
        width: 52, height: 52, borderRadius: 26,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    optionContent: { flex: 1 },
    optionTitle: { fontSize: 17, fontWeight: '700', color: '#0A1628', marginBottom: 4 },
    optionDescription: { fontSize: 13, color: '#666', lineHeight: 18 },
    backRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, marginTop: 28,
    },
    backText: { color: '#2563EB', fontSize: 15, fontWeight: '600' },
});