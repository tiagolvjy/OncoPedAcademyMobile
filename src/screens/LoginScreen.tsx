import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import AuthServices from '../services/auth';

const schema = Yup.object({
    email: Yup.string().required('Campo obrigatório').email('Email inválido'),
    password: Yup.string().required('Campo obrigatório').min(6, 'Mínimo 6 caracteres'),
});

export default function LoginScreen({ navigation }: any) {

    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        const { success, error } = await AuthServices.login(data.email, data.password);
        setLoading(false);
        if (success) {
            Alert.alert('Sucesso', 'Login realizado com sucesso!');
            // navegação para home futuramente
        } else {
            Alert.alert('Erro', error ?? 'Erro ao realizar login.');
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>OncoPed Academy</Text>
                <Text style={styles.subtitle}>Entrar</Text>

                <Text style={styles.label}>Email</Text>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Digite seu email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />
                {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

                <Text style={styles.label}>Senha</Text>
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Digite sua senha"
                            secureTextEntry
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />
                {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

                <TouchableOpacity onPress={() => navigation.navigate('EsqueciSenha')}>
                    <Text style={styles.link}>Esqueci minha senha</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Entrar</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('CadastroTipo')}>
                    <Text style={styles.linkCenter}>Não tem conta? Cadastre-se</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4, color: '#1a1a1a' },
    subtitle: { fontSize: 20, textAlign: 'center', marginBottom: 32, color: '#555' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 15, backgroundColor: '#fafafa' },
    inputError: { borderColor: 'tomato' },
    error: { color: 'tomato', fontSize: 12, marginBottom: 8 },
    link: { color: '#4703D0', fontSize: 13, marginBottom: 24, marginTop: 4 },
    linkCenter: { color: '#4703D0', fontSize: 14, textAlign: 'center', marginTop: 16 },
    button: { backgroundColor: '#4703D0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});