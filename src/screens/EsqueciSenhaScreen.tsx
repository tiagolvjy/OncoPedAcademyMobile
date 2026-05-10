import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthServices from '../services/auth';

export default function EsqueciSenhaScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) { Alert.alert('Atenção', 'Digite seu email.'); return; }
        setLoading(true);
        const { success, error } = await AuthServices.resetPassword(email);
        setLoading(false);
        if (success) {
            Alert.alert('Sucesso', 'Verifique sua caixa de email para redefinir a senha.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } else {
            Alert.alert('Erro', error ?? 'Erro ao enviar email.');
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} keyboardShouldPersistTaps="handled">
                {/* HEADER */}
                <View style={styles.header}>
                    <Image source={require('../../assets/logoOncoPedAcademy.png')} style={styles.logo} resizeMode="contain" />
                </View>

                {/* CARD */}
                <View style={styles.card}>
                    <Text style={styles.title}>Recuperar Senha</Text>
                    <Text style={styles.subtitle}>
                        Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
                    </Text>

                    {/* ÍCONE */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail-outline" size={48} color="#2563EB" />
                    </View>

                    <Text style={styles.label}>Digite seu e-mail</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o e-mail cadastrado"
                            placeholderTextColor="#aaa"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.buttonText}>Enviar link</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={18} color="#2563EB" />
                        <Text style={styles.backText}>Voltar ao login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: { backgroundColor: '#172F50', paddingTop: 50, paddingBottom: 70, alignItems: 'center' },
    logo: { width: 160, height: 110 },
    card: {
        flex: 1, backgroundColor: '#fff', marginTop: -35,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 28, paddingTop: 36, paddingBottom: 40,
    },
    title: { fontSize: 26, fontWeight: 'bold', color: '#2563EB', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 24 },
    iconContainer: {
        alignSelf: 'center', backgroundColor: '#EBF5FF', width: 90, height: 90,
        borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 28,
    },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
        borderRadius: 25, backgroundColor: '#fafafa', paddingHorizontal: 16, height: 50, marginBottom: 24,
    },
    input: { flex: 1, fontSize: 15, color: '#333' },
    button: {
        backgroundColor: '#2563EB', borderRadius: 25, height: 52,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
    backRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    backText: { color: '#2563EB', fontSize: 15, fontWeight: '600' },
});