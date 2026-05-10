import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    Image, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import AuthServices from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
    const { userData } = useAuth();
    const navigation = useNavigation<any>();

    const firstName = userData?.name?.split(' ')[0] ?? 'Usuário';

    const handleLogout = () => {
        Alert.alert('Sair', 'Deseja realmente sair da conta?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => { await AuthServices.logout(); },
            },
        ]);
    };

    const MenuItem = ({ icon, label, value, onPress, external }: {
        icon: keyof typeof Ionicons.glyphMap;
        label: string;
        value?: string;
        onPress?: () => void;
        external?: boolean;
    }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
            <Ionicons name={icon} size={20} color="#2563EB" style={styles.menuIcon} />
            <Text style={styles.menuLabel}>{label}</Text>
            {value && <Text style={styles.menuValue}>{value}</Text>}
            <Ionicons
                name={external ? 'open-outline' : 'chevron-forward'}
                size={16}
                color="#ccc"
            />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} bounces={false}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.brandText}>
                        <Text style={styles.brandOnco}>OncoPed</Text> Academy
                    </Text>
                    {userData?.photoURL
                        ? <Image source={{ uri: userData.photoURL }} style={styles.headerAvatar} />
                        : <View style={styles.headerAvatarPlaceholder}>
                            <Text style={styles.headerAvatarText}>{firstName.charAt(0)}</Text>
                          </View>
                    }
                </View>
            </View>

            {/* USER CARD */}
            <View style={styles.userCard}>
                {userData?.photoURL
                    ? <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                    : <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
                      </View>
                }
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userData?.name ?? 'Usuário'}</Text>
                    <Text style={styles.userEmail}>{userData?.email ?? ''}</Text>
                </View>
            </View>

            {/* CONTA */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>CONTA</Text>
                <View style={styles.menuCard}>
                    <MenuItem icon="person-outline" label="Perfil"
                        onPress={() => navigation.navigate('EditProfile')} />
                    <View style={styles.divider} />
                    <MenuItem icon="mail-outline" label="E-mail" value={userData?.email ?? ''} />
                    <View style={styles.divider} />
                    <MenuItem icon="lock-closed-outline" label="Senha"
                        onPress={() => Alert.alert('Em breve', 'Alteração de senha será implementada em breve.')} />
                </View>
            </View>

            {/* MEUS DADOS */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>MEUS DADOS</Text>
                <View style={styles.menuCard}>
                    <MenuItem icon="ribbon-outline" label="Meus Certificados"
                        onPress={() => navigation.navigate('Certificates')} />
                    <View style={styles.divider} />
                    <MenuItem icon="stats-chart-outline" label="Histórico de Questionários"
                        onPress={() => navigation.navigate('QuizHistory')} />
                </View>
            </View>

            {/* PRIVACIDADE E SEGURANÇA */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>PRIVACIDADE E SEGURANÇA</Text>
                <View style={styles.menuCard}>
                    <MenuItem icon="document-text-outline" label="Termos de uso"
                        onPress={() => Alert.alert('Termos de Uso', 'Os termos de uso estarão disponíveis em breve.')} />
                    <View style={styles.divider} />
                    <MenuItem icon="shield-checkmark-outline" label="LGPD"
                        onPress={() => Alert.alert('LGPD', 'Política de privacidade estará disponível em breve.')} />
                </View>
            </View>

            {/* SUPORTE E SOBRE */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>SUPORTE E SOBRE</Text>
                <View style={styles.menuCard}>
                    <MenuItem icon="help-circle-outline" label="Ajuda" external
                        onPress={() => Alert.alert('Ajuda', 'Central de ajuda estará disponível em breve.')} />
                    <View style={styles.divider} />
                    <MenuItem icon="information-circle-outline" label="Sobre a versão" value="v1.0.0" />
                </View>
            </View>

            {/* LOGOUT */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>

            {/* DEV: RESET ONBOARDING */}
            <TouchableOpacity
                style={styles.devBtn}
                onPress={async () => {
                    await AsyncStorage.removeItem('@onboarding_done');
                    Alert.alert('Pronto', 'Onboarding resetado! Faça logout para ver.');
                }}
            >
                <Text style={styles.devBtnText}>Resetar Onboarding (dev)</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },

    // HEADER
    header: { backgroundColor: '#172F50', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    brandText: { fontSize: 18, fontWeight: '700', color: '#fff' },
    brandOnco: { color: '#0D9488' },
    headerAvatar: { width: 36, height: 36, borderRadius: 18 },
    headerAvatarPlaceholder: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D9488',
        justifyContent: 'center', alignItems: 'center',
    },
    headerAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // USER CARD
    userCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        marginHorizontal: 16, marginTop: -10, borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }, elevation: 3, gap: 14,
    },
    avatar: { width: 56, height: 56, borderRadius: 28 },
    avatarPlaceholder: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
    userInfo: { flex: 1 },
    userName: { fontSize: 17, fontWeight: '700', color: '#0A1628' },
    userEmail: { fontSize: 13, color: '#888', marginTop: 2 },

    // SECTIONS
    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: '#2563EB', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },

    // MENU CARD
    menuCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
    },
    menuIcon: { marginRight: 12 },
    menuLabel: { flex: 1, fontSize: 15, color: '#333' },
    menuValue: { fontSize: 13, color: '#999', marginRight: 8, maxWidth: 160 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 48 },

    // LOGOUT
    logoutBtn: {
        borderWidth: 2, borderColor: '#ef4444', borderRadius: 12,
        paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff',
    },
    logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },

    // DEV
    devBtn: {
        marginHorizontal: 16, marginTop: 12, paddingVertical: 10,
        alignItems: 'center', backgroundColor: '#eee', borderRadius: 8,
    },
    devBtnText: { color: '#888', fontSize: 12 },
});