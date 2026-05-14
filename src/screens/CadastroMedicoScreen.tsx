import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AuthServices from '../services/auth';

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

function RadioToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <View style={{ marginTop: 10, marginBottom: 4 }}>
            <Text style={rs.label}>{label}</Text>
            <View style={rs.row}>
                <TouchableOpacity style={rs.option} onPress={() => onChange(true)}>
                    <View style={[rs.radio, value && rs.radioActive]}>
                        {value && <View style={rs.radioDot} />}
                    </View>
                    <Text style={rs.optionText}>Sim</Text>
                </TouchableOpacity>
                <TouchableOpacity style={rs.option} onPress={() => onChange(false)}>
                    <View style={[rs.radio, !value && rs.radioActive]}>
                        {!value && <View style={rs.radioDot} />}
                    </View>
                    <Text style={rs.optionText}>Não</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const rs = StyleSheet.create({
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
    row: { flexDirection: 'row', gap: 20 },
    option: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    radio: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
        borderColor: '#ccc', justifyContent: 'center', alignItems: 'center',
    },
    radioActive: { borderColor: '#2563EB' },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB' },
    optionText: { fontSize: 14, color: '#333' },
});

export default function CadastroMedicoScreen({ navigation }: any) {
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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [institutions, setInstitutions] = useState('');
    const [crm, setCrm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Step 3
    const [hasPostGrad, setHasPostGrad] = useState(false);
    const [postGradInstitution, setPostGradInstitution] = useState('');
    const [postGradArea, setPostGradArea] = useState('');
    const [hasMasters, setHasMasters] = useState(false);
    const [mastersInstitution, setMastersInstitution] = useState('');
    const [mastersArea, setMastersArea] = useState('');

    // Step 4
    const [hasPhd, setHasPhd] = useState(false);
    const [phdInstitution, setPhdInstitution] = useState('');
    const [phdArea, setPhdArea] = useState('');

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
        if (!email.trim()) { Alert.alert('Atenção', 'Preencha o email.'); return false; }
        if (!password || password.length < 8) { Alert.alert('Atenção', 'Senha deve ter no mínimo 8 caracteres.'); return false; }
        if (password !== confirmPassword) { Alert.alert('Atenção', 'As senhas não conferem.'); return false; }
        if (!institutions.trim()) { Alert.alert('Atenção', 'Preencha as instituições de formação.'); return false; }
        if (!crm.trim()) { Alert.alert('Atenção', 'Preencha o CRM.'); return false; }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
        else if (step === 3) setStep(4);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const { success, error } = await AuthServices.registerDoctor({
            name, email, password, phone, cpf, birthDate, gender: gender as any,
            institutions, crm,
            hasMasters, mastersArea: mastersArea || undefined, mastersInstitution: mastersInstitution || undefined,
            hasPhd, phdArea: phdArea || undefined, phdInstitution: phdInstitution || undefined,
            hasPostGrad, postGradArea: postGradArea || undefined, postGradInstitution: postGradInstitution || undefined,
            photoURL: photoURI ?? undefined,
            role: 'doctor',
        });
        setLoading(false);
                if (success) {
                    Alert.alert(
                        'Conta criada com sucesso! 🎉',
                        'Bem-vindo à OncoPed Academy! Seu CRM será verificado pela equipe. Enquanto isso, explore os cursos disponíveis.'
                    );

        } else {
            Alert.alert('Erro', error ?? 'Erro ao realizar cadastro.');
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Image source={require('../../assets/logoOncoPedAcademy.png')} style={styles.logo} resizeMode="contain" />
                </View>

                <View style={styles.card}>
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        if (step > 1) setStep(step - 1);
                        else if (navigation.canGoBack()) navigation.goBack();
                        else navigation.navigate('Login');}}>
                        <Ionicons name="arrow-back" size={22} color="#0A1628" />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Cadastro Médico</Text>
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

                            <Text style={styles.label}>Instituições de Formação<Text style={styles.required}>*</Text></Text>
                            <TextInput style={styles.input} placeholder="Digite o nome da sua universidade"
                                placeholderTextColor="#aaa" value={institutions} onChangeText={setInstitutions} />

                            <Text style={styles.label}>CRM<Text style={styles.required}>*</Text></Text>
                            <TextInput style={styles.input} placeholder="Digite seu CRM"
                                placeholderTextColor="#aaa" value={crm} onChangeText={setCrm} />

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
                            <RadioToggle label="Possui Especialização?" value={hasPostGrad} onChange={setHasPostGrad} />
                            {hasPostGrad && (
                                <>
                                    <Text style={styles.label}>Instituição de Formação:</Text>
                                    <TextInput style={styles.input} placeholder="Digite o nome da sua universidade"
                                        placeholderTextColor="#aaa" value={postGradInstitution} onChangeText={setPostGradInstitution} />
                                    <Text style={styles.label}>Área da Especialização:</Text>
                                    <TextInput style={styles.input} placeholder="Digite a área abordada"
                                        placeholderTextColor="#aaa" value={postGradArea} onChangeText={setPostGradArea} />
                                </>
                            )}

                            <RadioToggle label="Possui Mestrado?" value={hasMasters} onChange={setHasMasters} />
                            {hasMasters && (
                                <>
                                    <Text style={styles.label}>Instituição de Formação:</Text>
                                    <TextInput style={styles.input} placeholder="Digite o nome da sua universidade"
                                        placeholderTextColor="#aaa" value={mastersInstitution} onChangeText={setMastersInstitution} />
                                    <Text style={styles.label}>Área do Mestrado:</Text>
                                    <TextInput style={styles.input} placeholder="Digite a área abordada"
                                        placeholderTextColor="#aaa" value={mastersArea} onChangeText={setMastersArea} />
                                </>
                            )}

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(2)}>
                                    <Text style={styles.btnSecondaryText}>Voltar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
                                    <Text style={styles.btnPrimaryText}>Próximo</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* ===== STEP 4 ===== */}
                    {step === 4 && (
                        <>
                            <RadioToggle label="Possui Doutorado?" value={hasPhd} onChange={setHasPhd} />
                            {hasPhd && (
                                <>
                                    <Text style={styles.label}>Instituição de Formação:</Text>
                                    <TextInput style={styles.input} placeholder="Digite o nome da sua universidade"
                                        placeholderTextColor="#aaa" value={phdInstitution} onChangeText={setPhdInstitution} />
                                    <Text style={styles.label}>Área do Doutorado:</Text>
                                    <TextInput style={styles.input} placeholder="Digite a área abordada"
                                        placeholderTextColor="#aaa" value={phdArea} onChangeText={setPhdArea} />
                                </>
                            )}

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(3)}>
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
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    backButtonText: { fontSize: 15, color: '#0A1628', fontWeight: '500' },
});