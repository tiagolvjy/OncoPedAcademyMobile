import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import QuestionnaireServicesMobile, { QuizResult } from '../services/questionnaires';

export default function QuizHistoryScreen() {
    const { user } = useAuth();
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        if (!user) return;
        const res = await QuestionnaireServicesMobile.getUserResults(user.uid);
        if (res.success && res.results) {
            setResults(res.results);
        }
        setLoading(false);
    };

    const renderResult = ({ item }: { item: QuizResult }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons
                    name={item.percentage >= 60 ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={item.percentage >= 60 ? '#0D9488' : '#ef4444'}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.cardTitle}>{item.questionnaireTitle}</Text>
                    <Text style={styles.cardType}>
                        {item.type === 'leveling' ? 'Nivelamento geral'
                            : item.type === 'pre_content' ? 'Nivelamento do curso'
                            : 'Avaliação final'}
                    </Text>
                </View>
                <Text style={[styles.percentage, { color: item.percentage >= 60 ? '#0D9488' : '#ef4444' }]}>
                    {item.percentage}%
                </Text>
            </View>
            <Text style={styles.detail}>
                {item.score}/{item.totalQuestions} acertos · {new Date(item.completedAt).toLocaleDateString('pt-BR')}
            </Text>
            {item.type === 'leveling' && (
                <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>
                        {QuestionnaireServicesMobile.getLevel(item.percentage)}
                    </Text>
                </View>
            )}
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
                data={results}
                keyExtractor={(item) => item.id!}
                renderItem={renderResult}
                contentContainerStyle={results.length === 0 ? styles.center : styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="stats-chart-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyTitle}>Nenhum resultado</Text>
                        <Text style={styles.emptySubtitle}>Responda questionários para ver seu histórico.</Text>
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
        backgroundColor: '#fff', borderRadius: 12, padding: 16,
        marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#0A1628' },
    cardType: { fontSize: 12, color: '#888', marginTop: 2 },
    percentage: { fontSize: 20, fontWeight: 'bold' },
    detail: { fontSize: 13, color: '#888' },
    levelBadge: {
        alignSelf: 'flex-start', backgroundColor: '#0D9488', borderRadius: 12,
        paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
    },
    levelText: { color: '#fff', fontWeight: '600', fontSize: 12 },
    emptyContainer: { alignItems: 'center', gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#999' },
    emptySubtitle: { fontSize: 14, color: '#bbb', textAlign: 'center' },
});