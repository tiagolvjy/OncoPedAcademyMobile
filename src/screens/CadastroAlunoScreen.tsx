import React, { useState } from 'react';
import {
    Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, ScrollView,
    KeyboardAvoidingView, Platform, View, Image
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import AuthServices from '../services/auth';

const schema = Yup.object({
    name: Yup.string().required('Campo obrigatório'),
    email: Yup.string().required('Campo obrigatório').email('Email inválido'),
    password: Yup.string().required('Campo obrigatório').min(8, 'Mínimo 8 caracteres'),
    confirmPassword: Yup.string()
        .required('Campo obrigatório')
        .oneOf([Yup.ref('password')], 'Senhas não conferem'),
    phone: Yup.string().required('Campo obrigatório'),
    cpf: Yup.string().required('Campo obrigatório'),
    birthDate: Yup.string().required('Campo obrigatório'),
    gender: Yup.string().required('Campo obrigatório'),
    institution: Yup.string().required('Campo obrigatório'),
    coursePeriod: Yup.number()
        .typeError('Deve ser um número')
        .required('Campo obrigatório')
        .min(1, 'Mínimo 1').max(12, 'Máximo 12'),
    specializations: Yup.string().optional(),
});

const GENDER_OPTIONS = [
    { label: 'Masculino', value: 'male' },
    { label: 'Feminino', value: 'female' },
    { label: 'Outro', value: 'other' },
    { label: 'Prefiro não informar', value: 'prefer_not_to_say' },
];

export default function CadastroAlunoScreen({ navigation }: any) {

    const [loading, setLoading] = useState(false);
    const [photoURI, setPhotoURI] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    // ===========================================================================
    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled) {
            setPhotoURI(result.assets[0].uri);
        }
    }
    // ===========================================================================
    const onSubmit = async (data: any) => {
        setLoading(true);
        const { success, error } = await AuthServices.registerStudent({
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            cpf: data.cpf,
            birthDate: data.birthDate,
            gender: data.gender,
            institution: data.institution,
            coursePeriod: Number(data.coursePeriod),
            specializations: data.specializations,
            photoURL: photoURI ?? undefined,
            role: 'student',
        });
        setLoading(false);
        if (success) {
            Alert.alert('Sucesso!', 'Cadastro realizado com sucesso!', [
                { text: 'Fazer login', onPress: () => navigation.navigate('Login') }
            ]);
        } else {
            Alert.alert('Erro', error ?? 'Erro ao realizar cadastro.');
        }
    }
    // ===========================================================================
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Cadastro de Aluno</Text>

                {/* FOTO DE PERFIL */}
                <Text style={styles.label}>Foto de perfil <Text style={styles.optional}>(opcional)</Text></Text>
                <View style={styles.photoContainer}>
                    {photoURI
                        ? <Image source={{ uri: photoURI }} style={styles.photo} />
                        : <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoPlaceholderText}>Sem foto</Text>
                          </View>
                    }
                    <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                        <Text style={styles.photoButtonText}>{photoURI ? 'Trocar foto' : 'Selecionar foto'}</Text>
                    </TouchableOpacity>
                </View>

                {/* NOME */}
                <Text style={styles.label}>Nome completo *</Text>
                <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, errors.name && styles.inputError]}
                        placeholder="Digite seu nome completo" onChangeText={onChange} value={value} />
                )} />
                {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

                {/* EMAIL */}
                <Text style={styles.label}>Email *</Text>
                <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, errors.email && styles.inputError]}
                        placeholder="Digite seu email" keyboardType="email-address"
                        autoCapitalize="none" onChangeText={onChange} value={value} />
                )} />
                {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

                {/* SENHA */}
                <Text style={styles.label}>Senha *</Text>
                <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, errors.password && styles.inputError]}
                        placeholder="Mínimo 8 caracteres" secureTextEntry onChangeText={onChange} value={value} />
                )} />
                {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

                {/* CONFIRMAR SENHA */}
                <Text style={styles.label}>Confirmar senha *</Text>
                <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, errors.confirmPassword && styles.inputError]}
                        placeholder="Repita a senha" secureTextEntry onChangeText={onChange} value={value} />
                )} />
                {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}

                {/* TELEFONE */}
                <Text style={styles.label}>Telefone *</Text>
                <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, errors.phone && styles.inputError]}
                        placeholder="(XX) XXXXX-XXXX" keyboardType="phone-pad"
                        onChangeText={onChange} value={value} />
                )} />
                {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

                {/* CPF */}
                <Text style={styles.label}>CPF *</Text>
                <Controller control={control} name="cpf" render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, errors.cpf && styles.inputError]}
                        placeholder="XXX.XXX.XXX-XX" keyboardType="numeric"
                        onChangeText={onChange} value={value} />
                )} />
                {errors.cpf && <Text style={styles.error}>{errors.cpf.message}</Text>}

                {/* DATA DE NASCIMENTO */}
                <Text style={styles.label}>Data de nascimento *</Text>
                <Controller control={control} name="birthDate" render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, errors.birthDate && styles.inputError]}
                        placeholder="DD/MM/AAAA" keyboardType="numeric"
                        onChangeText={onChange} value={value} />
                )} />
                {errors.birthDate && <Text style={styles.error}>{errors.birthDate.message}</Text>}

                {/* SEXO */}
                <Text style={styles.label}>Sexo *</Text>
                <Controller control={control} name="gender" render={({ field: { onChange, value } }) => (
                    <View style={styles.optionsRow}>
                        {GENDER_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                style={[styles.optionBtn, value === opt.value && styles.optionBtnActive]}
                                onPress={() => onChange(opt.value)}
                            >
                                <Text style={[styles.optionText, value === opt.value && styles.optionTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )} />
                {errors.gender && <Text style={styles.error}>{errors.gender.message}</Text>}

                {/* INSTITUIÇÃO */}
                <Text style={styles.label}>Instituição de ensino *</Text>
                <Controller control={control} name="institution" render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, errors.institution && styles.inputError]}
                        placeholder="Nome da instituição" onChangeText={onChange} value={value} />
                )} />
                {errors.institution && <Text style={styles.error}>{errors.institution.message}</Text>}

                {/* PERÍODO */}
                <Text style={styles.label}>Período do curso * (1-12)</Text>
                <Controller control={control} name="coursePeriod" render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, errors.coursePeriod && styles.inputError]}
                        placeholder="Ex: 5" keyboardType="numeric"
                        onChangeText={onChange} value={value?.toString()} />
                )} />
                {errors.coursePeriod && <Text style={styles.error}>{errors.coursePeriod.message}</Text>}

                {/* ESPECIALIZAÇÕES */}
                <Text style={styles.label}>Especializações de interesse <Text style={styles.optional}>(opcional)</Text></Text>
                <Controller control={control} name="specializations" render={({ field: { onChange, value } }) => (
                    <TextInput style={styles.input} placeholder="Ex: Oncologia, Pediatria..."
                        onChangeText={onChange} value={value} />
                )} />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Cadastrar</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.linkCenter}>Voltar</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, marginTop: 16, color: '#1a1a1a' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333', marginTop: 8 },
    optional: { fontWeight: 'normal', color: '#999' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 15, backgroundColor: '#fafafa' },
    inputError: { borderColor: 'tomato' },
    error: { color: 'tomato', fontSize: 12, marginBottom: 8 },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    optionBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fafafa' },
    optionBtnActive: { borderColor: '#4703D0', backgroundColor: '#f0ebff' },
    optionText: { fontSize: 13, color: '#555' },
    optionTextActive: { color: '#4703D0', fontWeight: '600' },
    button: { backgroundColor: '#4703D0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    linkCenter: { color: '#4703D0', fontSize: 14, textAlign: 'center', marginTop: 16, marginBottom: 24 },
    photoContainer: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16, marginTop: 4 },
    photo: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' },
    photoPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    photoPlaceholderText: { fontSize: 12, color: '#999' },
    photoButton: { borderWidth: 1, borderColor: '#4703D0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
    photoButtonText: { color: '#4703D0', fontSize: 14, fontWeight: '600' },
});