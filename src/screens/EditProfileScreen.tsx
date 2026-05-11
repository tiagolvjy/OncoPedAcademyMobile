import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from '../services/storage';

const maskPhone = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length <= 2) return `(${n}`;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
};

const GENDER_OPTIONS = [
    { label: 'Masculino', value: 'male' },
    { label: 'Feminino', value: 'female' },
    { label: 'Outro', value: 'other' },
    { label: 'Prefiro não informar', value: 'prefer_not_to_say' },
];

const genderLabel = (value: string) => {
    return GENDER_OPTIONS.find(g => g.value === value)?.label ?? value;
};

export default function EditProfileScreen({ navigation }: any) {
    const { user, userData, refreshUserData } = useAuth();

    const [name, setName] = useState(userData?.name ?? '');
    const [phone, setPhone] = useState(userData?.phone ?? '');
    const [gender, setGender] = useState(userData?.gender ?? '');
    const [institution, setInstitution] = useState(userData?.institution ?? userData?.institutions ?? '');
    const [specializations, setSpecializations] = useState(userData?.specializations ?? '');
    const [photoURI, setPhotoURI] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

    const handleSave = async () => {
        if (!user) return;
        await refreshUserData();
        if (!name.trim()) { Alert.alert('Atenção', 'Nome não pode ser vazio.'); return; }
        if (!phone || phone.replace(/\D/g, '').length < 10) {
            await refreshUserData();
            Alert.alert('Atenção', 'Telefone inválido.'); return;
        }

        setLoading(true);
        try {
            const updates: any = {
                name: name.trim(),
                phone,
                gender,
                updatedAt: new Date().toISOString(),
            };

            if (userData?.role === 'student') {
                updates.institution = institution;
                updates.specializations = specializations || null;
            } else if (userData?.role === 'doctor') {
                updates.institutions = institution;
            }

            if (photoURI) {
                try {
                    const url = await uploadPhoto(photoURI, 'profile');
                    updates.photoURL = url;
                } catch {
                    console.warn('Erro no upload da foto, continuando sem atualizar foto.');
                }
            }

            await updateDoc(doc(db, 'users', user.uid), updates);

            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
        }
        setLoading(false);
    };

    const currentPhoto = photoURI ?? userData?.photoURL;
    const firstName = userData?.name?.split(' ')[0] ?? 'U';

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container} bounces={false} keyboardShouldPersistTaps="handled">
                {/* FOTO */}
                <View style={styles.photoSection}>
                    <TouchableOpacity onPress={handlePickImage}>
                        {currentPhoto
                            ? <Image source={{ uri: currentPhoto }} style={styles.photo} />
                            : <View style={styles.photoPlaceholder}>
                                <Text style={styles.photoPlaceholderText}>{firstName.charAt(0)}</Text>
                              </View>
                        }
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* EMAIL (não editável) */}
                <Text style={styles.label}>Email</Text>
                <View style={[styles.input, styles.inputDisabled]}>
                    <Text style={styles.inputDisabledText}>{userData?.email ?? ''}</Text>
                    <Ionicons name="lock-closed-outline" size={16} color="#bbb" />
                </View>
                <Text style={styles.hint}>O email não pode ser alterado.</Text>

                {/* NOME */}
                <Text style={styles.label}>Nome completo<Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.inputEditable} value={name} onChangeText={setName}
                    placeholder="Digite seu nome" placeholderTextColor="#aaa" />

                {/* TELEFONE */}
                <Text style={styles.label}>Telefone<Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.inputEditable} value={phone}
                    onChangeText={(v) => setPhone(maskPhone(v))}
                    placeholder="(00) 00000-0000" placeholderTextColor="#aaa"
                    keyboardType="phone-pad" maxLength={15} />

                {/* SEXO */}
                <Text style={styles.label}>Sexo</Text>
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

                {/* INSTITUIÇÃO */}
                <Text style={styles.label}>
                    {userData?.role === 'student' ? 'Instituição de Ensino' : 'Instituições de Formação'}
                </Text>
                <TextInput style={styles.inputEditable} value={institution} onChangeText={setInstitution}
                    placeholder="Nome da instituição" placeholderTextColor="#aaa" />

                {/* ESPECIALIZAÇÕES (só aluno) */}
                {userData?.role === 'student' && (
                    <>
                        <Text style={styles.label}>Especializações de Interesse</Text>
                        <TextInput style={styles.inputEditable} value={specializations}
                            onChangeText={setSpecializations}
                            placeholder="Ex: Oncologia, Pediatria..." placeholderTextColor="#aaa" />
                    </>
                )}

                {/* TIPO DE CONTA */}
                <Text style={styles.label}>Tipo de conta</Text>
                <View style={[styles.input, styles.inputDisabled]}>
                    <Text style={styles.inputDisabledText}>
                        {userData?.role === 'student' ? 'Aluno' : userData?.role === 'doctor' ? 'Médico' : 'Usuário'}
                    </Text>
                    <Ionicons name="lock-closed-outline" size={16} color="#bbb" />
                </View>

                {/* BOTÃO SALVAR */}
                <TouchableOpacity
                    style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.saveBtnText}>Salvar Alterações</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#F0F4F8' },
    photoSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
    photo: { width: 100, height: 100, borderRadius: 50 },
    photoPlaceholder: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center',
    },
    photoPlaceholderText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0,
        width: 32, height: 32, borderRadius: 16, backgroundColor: '#0D9488',
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff',
    },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 14 },
    required: { color: 'tomato' },
    hint: { fontSize: 12, color: '#999', marginBottom: 4 },
    input: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
        paddingHorizontal: 14, height: 48, marginBottom: 4,
    },
    inputDisabled: { backgroundColor: '#f0f0f0' },
    inputDisabledText: { fontSize: 15, color: '#999' },
    inputEditable: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fff',
        paddingHorizontal: 14, height: 48, fontSize: 15, color: '#333', marginBottom: 4,
    },
    genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
    genderBtn: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff',
    },
    genderBtnActive: { borderColor: '#2563EB', backgroundColor: '#EBF5FF' },
    genderText: { fontSize: 13, color: '#555' },
    genderTextActive: { color: '#2563EB', fontWeight: '600' },
    saveBtn: {
        backgroundColor: '#2563EB', borderRadius: 12, height: 52,
        alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 20,
    },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});