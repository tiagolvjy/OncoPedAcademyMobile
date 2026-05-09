import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    const [showPassword, setShowPassword] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        const { success, error } = await AuthServices.login(data.email, data.password);
        setLoading(false);
        if (!success) {
            Alert.alert('Erro', error ?? 'Erro ao realizar login.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                bounces={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ===== HEADER ESCURO COM LOGO ===== */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logoOncoPedAcademy.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* ===== CARD BRANCO ===== */}
                <View style={styles.card}>
                    <Text style={styles.title}>Bem-Vindo</Text>
                    <Text style={styles.subtitle}>
                        Conecte-se e retome sua jornada no seu próprio ritmo.
                    </Text>

                    {/* EMAIL */}
                    <Text style={styles.label}>Digite seu e-mail</Text>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Digite o e-mail cadastrado"
                                    placeholderTextColor="#aaa"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onChangeText={onChange}
                                    value={value}
                                />
                            </View>
                        )}
                    />
                    {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

                    {/* SENHA */}
                    <Text style={styles.label}>Digite sua senha</Text>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Digite sua senha"
                                    placeholderTextColor="#aaa"
                                    secureTextEntry={!showPassword}
                                    onChangeText={onChange}
                                    value={value}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={22}
                                        color="#999"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

                    {/* ESQUECI SENHA */}
                    <TouchableOpacity
                        style={styles.forgotRow}
                        onPress={() => navigation.navigate('EsqueciSenha')}
                    >
                        <Ionicons name="alert-circle-outline" size={16} color="#2563EB" />
                        <Text style={styles.forgotText}>Esqueci minha senha</Text>
                    </TouchableOpacity>

                    {/* BOTÃO ENTRAR */}
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

                    {/* CADASTRO */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerLabel}>Não Possui conta?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('CadastroTipo')}>
                            <Text style={styles.registerLink}>Cadastre-se</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    // ===== HEADER =====
    header: {
        backgroundColor: '#172F50',
        paddingTop: 60,
        paddingBottom: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 140,
    },

    // ===== CARD =====
    card: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: -40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 28,
        paddingTop: 36,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2563EB',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 28,
    },

    // ===== CAMPOS =====
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        backgroundColor: '#fafafa',
        paddingHorizontal: 16,
        marginBottom: 6,
        height: 50,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    inputError: {
        borderColor: 'tomato',
    },
    eyeButton: {
        padding: 4,
    },
    error: {
        color: 'tomato',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 8,
    },

    // ===== ESQUECI SENHA =====
    forgotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
        marginBottom: 28,
    },
    forgotText: {
        color: '#2563EB',
        fontSize: 13,
        fontWeight: '500',
    },

    // ===== BOTÃO =====
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 25,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
    },

    // ===== CADASTRO =====
    registerContainer: {
        alignItems: 'center',
        gap: 4,
    },
    registerLabel: {
        fontSize: 14,
        color: '#666',
    },
    registerLink: {
        fontSize: 15,
        color: '#2563EB',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});