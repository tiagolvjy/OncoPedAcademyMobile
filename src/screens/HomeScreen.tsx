import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Image, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import CourseServicesMobile, { Course } from '../services/courses';
import QuestionnaireServicesMobile, { QuizResult } from '../services/questionnaires';

export default function HomeScreen() {
    const { user, userData } = useAuth();
    const navigation = useNavigation<any>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const firstName = userData?.name?.split(' ')[0] ?? 'Usuário';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user) return;
        const [coursesRes, resultsRes] = await Promise.all([
            CourseServicesMobile.getPublished(),
            QuestionnaireServicesMobile.getUserResults(user.uid),
        ]);
        if (coursesRes.success && coursesRes.courses) setCourses(coursesRes.courses);
        if (resultsRes.success && resultsRes.results) setResults(resultsRes.results);
        setRefreshing(false);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    const goToTab = (tabName: string, params?: any) => {
        navigation.navigate(tabName, params);
    };

    const goToCourseDetail = (course: Course) => {
        navigation.navigate('Cursos', {
            screen: 'CourseDetail',
            params: { course },
        });
    };

    const lastResult = results.length > 0 ? results[0] : null;
    const levelingResult = results.find(r => r.type === 'leveling');

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} min atrás`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Ontem';
        return `${days} dias atrás`;
    };

    const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        if (type === 'leveling') return 'analytics-outline';
        if (type === 'pre_content') return 'school-outline';
        return 'checkmark-circle-outline';
    };

    const getActivityColor = (type: string) => {
        if (type === 'leveling') return '#D4A017';
        if (type === 'pre_content') return '#2563EB';
        return '#0D9488';
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 30 }}
            bounces={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
            {/* ===== HEADER ESCURO ===== */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.brandText}>
                        <Text style={styles.brandOnco}>OncoPed</Text> Academy
                    </Text>
                    {userData?.photoURL
                        ? <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                        : <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
                          </View>
                    }
                </View>

                <Text style={styles.greeting}>Bem-vindo, {firstName}!</Text>
                <Text style={styles.greetingSub}>
                    {levelingResult
                        ? `Seu nível: ${QuestionnaireServicesMobile.getLevel(levelingResult.percentage)}. Continue assim!`
                        : 'Você está progredindo muito bem. Continue assim!'
                    }
                </Text>
            </View>

            {/* ===== CONTINUE DE ONDE PAROU ===== */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Continue de Onde Parou</Text>
                    <View style={styles.sectionBar} />
                </View>

                {lastResult ? (
                    <View style={styles.progressCard}>
                        <View style={styles.circleContainer}>
                            <View style={styles.circleOuter}>
                                <View style={styles.circleInner}>
                                    <Text style={styles.circlePercent}>{lastResult.percentage}%</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.progressCourse}>
                            {lastResult.questionnaireTitle}
                        </Text>
                        <Text style={styles.progressMeta}>
                            {lastResult.score} de {lastResult.totalQuestions} acertos
                        </Text>

                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={() => goToTab('Cursos')}
                        >
                            <Text style={styles.continueText}>Ver Cursos</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.progressCard}>
                        <Ionicons name="book-outline" size={40} color="#ccc" style={{ marginBottom: 12 }} />
                        <Text style={styles.progressCourse}>Nenhum curso iniciado</Text>
                        <Text style={styles.progressMeta}>Explore a biblioteca e comece agora!</Text>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={() => goToTab('Cursos')}
                        >
                            <Text style={styles.continueText}>Explorar Cursos</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* ===== CURSOS RECENTES (CARROSSEL) ===== */}
            {courses.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Cursos Disponíveis</Text>
                        <TouchableOpacity onPress={() => goToTab('Cursos')}>
                            <Text style={styles.verMais}>Ver Mais</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                        {courses.slice(0, 5).map((course) => (
                            <TouchableOpacity
                                key={course.id}
                                style={styles.courseCard}
                                onPress={() => goToCourseDetail(course)}
                            >
                                <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                                <Text style={styles.courseAuthor}>Por {course.authorName}</Text>
                                <View style={styles.courseMeta}>
                                    {course.duration > 0 && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="time-outline" size={12} color="#999" />
                                            <Text style={styles.metaText}>{course.duration}h</Text>
                                        </View>
                                    )}
                                    {course.hasCertificate && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="ribbon-outline" size={12} color="#D4A017" />
                                            <Text style={styles.metaText}>Cert.</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* ===== ATIVIDADES RECENTES ===== */}
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Atividades Recentes</Text>
                    {results.length > 3 && (
                        <TouchableOpacity onPress={() => goToTab('Perfil', { screen: 'QuizHistory' })}>
                            <Text style={styles.verMais}>Ver Mais</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {results.length === 0 ? (
                    <View style={styles.emptyActivity}>
                        <Ionicons name="time-outline" size={32} color="#ccc" />
                        <Text style={styles.emptyText}>Nenhuma atividade recente.</Text>
                    </View>
                ) : (
                    results.slice(0, 3).map((result) => (
                        <View key={result.id} style={styles.activityItem}>
                            <View style={[styles.activityIcon, { backgroundColor: getActivityColor(result.type) + '20' }]}>
                                <Ionicons
                                    name={getActivityIcon(result.type)}
                                    size={20}
                                    color={getActivityColor(result.type)}
                                />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle} numberOfLines={1}>
                                    {result.questionnaireTitle}
                                </Text>
                                <Text style={styles.activityMeta}>
                                    {result.percentage}% · {getTimeAgo(result.completedAt)}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },

    // ===== HEADER =====
    header: {
        backgroundColor: '#172F50',
        paddingTop: 56,
        paddingBottom: 28,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    brandText: { fontSize: 18, fontWeight: '700', color: '#fff' },
    brandOnco: { color: '#0D9488' },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    avatarPlaceholder: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#0D9488',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#D4A017', marginBottom: 4 },
    greetingSub: { fontSize: 14, color: '#B0BEC5', lineHeight: 20 },

    // ===== SECTIONS =====
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionHeader: { marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0A1628' },
    sectionBar: { width: 40, height: 3, backgroundColor: '#2563EB', borderRadius: 2, marginTop: 6 },
    sectionHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
    },
    verMais: { fontSize: 14, color: '#2563EB', fontWeight: '600' },

    // ===== PROGRESS CARD =====
    progressCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 24,
        alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05,
        shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
    },
    circleContainer: { marginBottom: 16 },
    circleOuter: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 6, borderColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center',
    },
    circleInner: { justifyContent: 'center', alignItems: 'center' },
    circlePercent: { fontSize: 26, fontWeight: 'bold', color: '#0A1628' },
    progressCourse: { fontSize: 17, fontWeight: '700', color: '#0A1628', marginBottom: 4, textAlign: 'center' },
    progressMeta: { fontSize: 13, color: '#888', marginBottom: 16 },
    continueButton: {
        backgroundColor: '#D4A017', borderRadius: 20, paddingHorizontal: 28,
        paddingVertical: 10,
    },
    continueText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

    // ===== CAROUSEL =====
    carousel: { marginLeft: -4 },
    courseCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16,
        width: 180, marginRight: 12, shadowColor: '#000',
        shadowOpacity: 0.04, shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    courseTitle: { fontSize: 14, fontWeight: '700', color: '#0A1628', marginBottom: 6, lineHeight: 20 },
    courseAuthor: { fontSize: 12, color: '#2563EB', marginBottom: 10 },
    courseMeta: { flexDirection: 'row', gap: 10 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaText: { fontSize: 11, color: '#999' },

    // ===== ACTIVITIES =====
    activityItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 }, elevation: 1,
    },
    activityIcon: {
        width: 42, height: 42, borderRadius: 21,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    activityContent: { flex: 1 },
    activityTitle: { fontSize: 14, fontWeight: '600', color: '#0A1628' },
    activityMeta: { fontSize: 12, color: '#888', marginTop: 2 },
    emptyActivity: {
        backgroundColor: '#fff', borderRadius: 12, padding: 24,
        alignItems: 'center', gap: 8,
    },
    emptyText: { fontSize: 14, color: '#999' },
});