import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AuthServices from '../services/auth';

// ===== MÁSCARAS =====
const maskCPF = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 11);
    return n.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};
const maskPhone = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length <= 2) return `(${n}`;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
};
const maskDate = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 8);
    if (n.length <= 2) return n;
    if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
    return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
};

const GENDER_OPTIONS = [
    { label: 'Masculino', value: 'male' },
    { label: 'Feminino', value: 'female' },
    { label: 'Outro', value: 'other' },
    { label: 'Prefiro não informar', value: 'prefer_not_to_say' },
];

export default function CadastroAlunoScreen({ navigation }: any) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [photoURI, setPhotoURI] = useState<string | null>(null);

    // Step 1
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');

    // Step 2
    const [institution, setInstitution] = useState('');
    const [coursePeriod, setCoursePeriod] = useState('');
    const [graduated, setGraduated] = useState(false);
    const [specializations, setSpecializations] = useState('');

    // Step 3
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
        });
        if (!result.canceled) setPhotoURI(result.assets[0].uri);
    };

    const validateStep1 = () => {
        if (!name.trim()) { Alert.alert('Atenção', 'Preencha o nome completo.'); return false; }
        if (!gender) { Alert.alert('Atenção', 'Selecione o sexo.'); return false; }
        if (!birthDate || birthDate.length < 10) { Alert.alert('Atenção', 'Preencha a data de nascimento.'); return false; }
        if (!cpf || cpf.length < 14) { Alert.alert('Atenção', 'Preencha o CPF.'); return false; }
        if (!phone || phone.length < 14) { Alert.alert('Atenção', 'Preencha o telefone.'); return false; }
        return true;
    };

    const validateStep2 = () => {
        if (!institution.trim()) { Alert.alert('Atenção', 'Preencha a instituição de ensino.'); return false; }
        if (!graduated) {
            if (!coursePeriod.trim()) { Alert.alert('Atenção', 'Preencha o período do curso.'); return false; }
            const period = Number(coursePeriod);
            if (isNaN(period) || period < 1 || period > 12) { Alert.alert('Atenção', 'Período deve ser entre 1 e 12.'); return false; }
        }
        return true;
    };

    const validateStep3 = () => {
        if (!email.trim()) { Alert.alert('Atenção', 'Preencha o email.'); return false; }
        if (!password || password.length < 8) { Alert.alert('Atenção', 'Senha deve ter no mínimo 8 caracteres.'); return false; }
        if (password !== confirmPassword) { Alert.alert('Atenção', 'As senhas não conferem.'); return false; }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const handleSubmit = async () => {
        if (!validateStep3()) return;
        setLoading(true);
        const { success, error } = await AuthServices.registerStudent({
            name, email, password, phone, cpf, birthDate, gender: gender as any,
            institution, coursePeriod: graduated ? 0 : Number(coursePeriod),
            specializations: specializations || undefined,
            photoURL: photoURI ?? undefined,
            role: 'student',
        });
        setLoading(false);
        if (success) {
            Alert.alert('Sucesso!', 'Cadastro realizado com sucesso!', [
                { text: 'Fazer login', onPress: () => navigation.navigate('Login') },
            ]);
        } else {
            Alert.alert('Erro', error ?? 'Erro ao realizar cadastro.');
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
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                    if (step > 1) setStep(step - 1);
                    else navigation.goBack();
                }}>
                    <Ionicons name="arrow-back" size={22} color="#0A1628" />
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
                    <Text style={styles.title}>Cadastro do Aluno</Text>
                    <Text style={styles.subtitle}>Preencha seus dados para criar sua conta e começar sua jornada de aprendizado.</Text>

                    {/* ===== STEP 1 ===== */}
                    {step === 1 && (
                        <>
                            <Text style={styles.label}>Foto de perfil</Text>
                            <TouchableOpacity style={styles.photoRow} onPress={handlePickImage}>
                                {photoURI
                                    ? <Image source={{ uri: photoURI }} style={styles.photo} />
                                    : <View style={styles.photoPlaceholder}>
                                        <Ionicons name="person-outline" size={32} color="#aaa" />
                                      </View>
                                }
                                <Text style={styles.photoLabel}>Adicionar foto</Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Nome completo<Text style={styles.required}>*</Text></Text>
                            <TextInput style={styles.input} placeholder="Digite seu nome completo"
                                placeholderTextColor="#aaa" value={name} onChangeText={setName} />

                            <View style={styles.row}>
                                <View style={styles.halfField}>
                                    <Text style={styles.label}>Sexo<Text style={styles.required}>*</Text></Text>
                                    <View style={styles.genderRow}>
                                        {GENDER_OPTIONS.map(opt => (
                                            <TouchableOpacity key={opt.value}
                                                style={[styles.genderBtn, gender === opt.value && styles.genderBtnActive]}
                                                onPress={() => setGender(opt.value)}>
                                                <Text style={[styles.genderText, gender === opt.value && styles.genderTextActive]}>
                                                    {opt.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                                <View style={styles.halfField}>
                                    <Text style={styles.label}>Data de nascimento<Text style={styles.required}>*</Text></Text>
                                    <TextInput style={styles.input} placeholder="dd/mm/aaaa"
                                        placeholderTextColor="#aaa" keyboardType="numeric"
                                        value={birthDate} onChangeText={(v) => setBirthDate(maskDate(v))} maxLength={10} />
                                </View>
                            </View>

                            <Text style={styles.label}>CPF<Text style={styles.required}>*</Text></Text>
                            <TextInput style={styles.input} placeholder="000.000.000-00"
                                placeholderTextColor="#aaa" keyboardType="numeric"
                                value={cpf} onChangeText={(v) => setCpf(maskCPF(v))} maxLength={14} />

                            <Text style={styles.label}>Telefone<Text style={styles.required}>*</Text></Text>
                            <TextInput style={styles.input} placeholder="(00) 00000-0000"
                                placeholderTextColor="#aaa" keyboardType="phone-pad"
                                value={phone} onChangeText={(v) => setPhone(maskPhone(v))} maxLength={15} />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
                                    <Text style={styles.btnPrimaryText}>Próximo</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* ===== STEP 2 ===== */}
                    {step === 2 && (
                        <>
                            <Text style={styles.label}>Instituição de Ensino<Text style={styles.required}>*</Text></Text>
                            <TextInput style={styles.input} placeholder="Digite o nome da sua universidade"
                                placeholderTextColor="#aaa" value={institution} onChangeText={setInstitution} />

                            <Text style={styles.label}>Período do Curso{!graduated && <Text style={styles.required}>*</Text>}</Text>
                            <TextInput
                                style={[styles.input, graduated && { backgroundColor: '#eee', color: '#999' }]}
                                placeholder="Apenas número"
                                placeholderTextColor="#aaa" keyboardType="numeric"
                                value={graduated ? 'Finalizado' : coursePeriod}
                                onChangeText={setCoursePeriod} maxLength={2}
                                editable={!graduated}
                            />

                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={() => {
                                    setGraduated(!graduated);
                                    if (!graduated) setCoursePeriod('');
                                }}
                            >
                                <View style={[styles.checkbox, graduated && styles.checkboxActive]}>
                                    {graduated && <Ionicons name="checkmark" size={14} color="#fff" />}
                                </View>
                                <Text style={styles.checkboxLabel}>Já finalizei o curso</Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Especializações de Interesse</Text>
                            <TextInput style={styles.input} placeholder="Digite suas preferências de especializações"
                                placeholderTextColor="#aaa" value={specializations} onChangeText={setSpecializations} />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(1)}>
                                    <Text style={styles.btnSecondaryText}>Voltar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
                                    <Text style={styles.btnPrimaryText}>Próximo</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* ===== STEP 3 ===== */}
                    {step === 3 && (
                        <>
                            <Text style={styles.label}>Email<Text style={styles.required}>*</Text></Text>
                            <TextInput style={styles.input} placeholder="Digite seu e-mail"
                                placeholderTextColor="#aaa" keyboardType="email-address"
                                autoCapitalize="none" value={email} onChangeText={setEmail} />

                            <Text style={styles.label}>Criar Senha<Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputRow}>
                                <TextInput style={styles.inputFlex} placeholder="Mínimo 8 caracteres"
                                    placeholderTextColor="#aaa" secureTextEntry={!showPassword}
                                    value={password} onChangeText={setPassword} />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Confirmar Senha<Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputRow}>
                                <TextInput style={styles.inputFlex} placeholder="Mínimo 8 caracteres"
                                    placeholderTextColor="#aaa" secureTextEntry={!showConfirm}
                                    value={confirmPassword} onChangeText={setConfirmPassword} />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(2)}>
                                    <Text style={styles.btnSecondaryText}>Voltar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btnPrimary, loading && { opacity: 0.6 }]}
                                    onPress={handleSubmit} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" />
                                        : <Text style={styles.btnPrimaryText}>Criar Conta</Text>}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
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
        paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40,
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0A1628', marginBottom: 6 },
    subtitle: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 10 },
    required: { color: 'tomato' },
    input: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fafafa',
        paddingHorizontal: 14, height: 48, fontSize: 15, color: '#333', marginBottom: 4,
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
        borderRadius: 10, backgroundColor: '#fafafa', paddingHorizontal: 14, height: 48, marginBottom: 4,
    },
    inputFlex: { flex: 1, fontSize: 15, color: '#333' },
    row: { flexDirection: 'row', gap: 12 },
    halfField: { flex: 1 },
    genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
    genderBtn: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fafafa',
    },
    genderBtnActive: { borderColor: '#2563EB', backgroundColor: '#EBF5FF' },
    genderText: { fontSize: 12, color: '#555' },
    genderTextActive: { color: '#2563EB', fontWeight: '600' },
    photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    photo: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#eee' },
    photoPlaceholder: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: '#f0f0f0',
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed',
    },
    photoLabel: { fontSize: 13, color: '#2563EB' },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
    btnPrimary: {
        backgroundColor: '#2563EB', borderRadius: 25, height: 48,
        paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center',
    },
    btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    btnSecondary: {
        borderWidth: 2, borderColor: '#2563EB', borderRadius: 25, height: 48,
        paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center',
    },
    btnSecondaryText: { color: '#2563EB', fontWeight: 'bold', fontSize: 15 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 4 },
    checkbox: {
        width: 22, height: 22, borderRadius: 4, borderWidth: 2,
        borderColor: '#ddd', justifyContent: 'center', alignItems: 'center',
    },
    checkboxActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    checkboxLabel: { fontSize: 13, color: '#555' },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    backButtonText: { fontSize: 15, color: '#0A1628', fontWeight: '500' },
});