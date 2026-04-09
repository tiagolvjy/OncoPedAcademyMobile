import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
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
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Erro', error ?? 'Erro ao enviar email.');
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Recuperar senha</Text>
                <Text style={styles.description}>
                    Digite seu email e enviaremos um link para redefinir sua senha.
                </Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite seu email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Enviar</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.linkCenter}>Voltar ao login</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, color: '#1a1a1a' },
    description: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 32, lineHeight: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15, backgroundColor: '#fafafa' },
    button: { backgroundColor: '#4703D0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    linkCenter: { color: '#4703D0', fontSize: 14, textAlign: 'center', marginTop: 16 },
});