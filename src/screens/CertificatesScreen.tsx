import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    ActivityIndicator, RefreshControl, Share, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import CertificateServicesMobile, { Certificate } from '../services/certificates';

export default function CertificatesScreen() {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadCertificates = async () => {
        if (!user) return;
        const res = await CertificateServicesMobile.getByUser(user.uid);
        if (res.success && res.certificates) {
            setCertificates(res.certificates);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadCertificates();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadCertificates();
    }, []);

    const handleShare = async (cert: Certificate) => {
        try {
            await Share.share({
                message: `Certificado OncoPed Academy\n\nCurso: ${cert.courseTitle}\nAluno: ${cert.userName}\nData: ${new Date(cert.issuedAt).toLocaleDateString('pt-BR')}\nCódigo de validação: ${cert.validationCode}`,
            });
        } catch {}
    };

    const renderCertificate = ({ item }: { item: Certificate }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="ribbon" size={32} color="#D4A017" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardTitle}>{item.courseTitle}</Text>
                    <Text style={styles.cardDate}>
                        Emitido em {new Date(item.issuedAt).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
            </View>

            <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Código de validação</Text>
                <Text style={styles.codeValue}>{item.validationCode}</Text>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={() => handleShare(item)}>
                <Ionicons name="share-outline" size={18} color="#2563EB" />
                <Text style={styles.shareText}>Compartilhar</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={certificates}
                keyExtractor={(item) => item.id!}
                renderItem={renderCertificate}
                contentContainerStyle={certificates.length === 0 ? styles.center : styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="ribbon-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyTitle}>Nenhum certificado</Text>
                        <Text style={styles.emptySubtitle}>
                            Conclua um curso e seja aprovado na avaliação para receber seu certificado.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8', padding: 20 },
    list: { padding: 16 },
    card: {
        backgroundColor: '#fff', borderRadius: 12, padding: 20,
        marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#0A1628' },
    cardDate: { fontSize: 13, color: '#888', marginTop: 2 },
    codeContainer: {
        backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12,
        alignItems: 'center', marginBottom: 12,
    },
    codeLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
    codeValue: { fontSize: 18, fontWeight: 'bold', color: '#0A1628', marginTop: 4, letterSpacing: 2 },
    shareButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0',
    },
    shareText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
    emptyContainer: { alignItems: 'center', gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#999' },
    emptySubtitle: { fontSize: 14, color: '#bbb', textAlign: 'center', lineHeight: 20 },
});