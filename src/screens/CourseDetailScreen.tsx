import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CourseServicesMobile, { Module, Lesson } from '../services/courses';
import QuestionnaireServicesMobile, { Questionnaire } from '../services/questionnaires';

export default function CourseDetailScreen({ route }: any) {
    const { course } = route.params;
    const navigation = useNavigation<any>();
    const [modules, setModules] = useState<(Module & { lessons?: Lesson[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);

    useEffect(() => {
        loadModules();
        loadQuestionnaires();
    }, []);

    const loadModules = async () => {
        const res = await CourseServicesMobile.getModules(course.id);
        if (res.success && res.modules) {
            const modulesWithLessons = await Promise.all(
                res.modules.map(async (mod) => {
                    const lessonsRes = await CourseServicesMobile.getLessons(course.id, mod.id);
                    return { ...mod, lessons: lessonsRes.lessons ?? [] };
                })
            );
            setModules(modulesWithLessons);
        }
        setLoading(false);
    };

    const loadQuestionnaires = async () => {
        const res = await QuestionnaireServicesMobile.getByCourse(course.id);
        if (res.success && res.questionnaires) {
            setQuestionnaires(res.questionnaires);
        }
    };

    const toggleModule = (moduleId: string) => {
        setExpandedModule(expandedModule === moduleId ? null : moduleId);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* HEADER INFO */}
            <View style={styles.headerCard}>
                <Text style={styles.title}>{course.title}</Text>
                <Text style={styles.author}>Por {course.authorName}</Text>
                <Text style={styles.description}>{course.description}</Text>

                <View style={styles.metaRow}>
                    {course.duration > 0 && (
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color="#2563EB" />
                            <Text style={styles.metaText}>{course.duration}h</Text>
                        </View>
                    )}
                    {course.hasCertificate && (
                        <View style={styles.metaItem}>
                            <Ionicons name="ribbon-outline" size={16} color="#D4A017" />
                            <Text style={styles.metaText}>Certificado</Text>
                        </View>
                    )}
                    {course.verified && (
                        <View style={styles.metaItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#0D9488" />
                            <Text style={styles.metaText}>Verificado</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* CONTEÚDO DO CURSO */}
            <Text style={styles.sectionTitle}>Conteúdo do Curso</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
            ) : modules.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Nenhum módulo disponível ainda.</Text>
                </View>
            ) : (
                modules.map((mod, index) => (
                    <View key={mod.id} style={styles.moduleCard}>
                        <TouchableOpacity
                            style={styles.moduleHeader}
                            onPress={() => toggleModule(mod.id)}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.moduleTitle}>
                                    Módulo {index + 1}: {mod.title}
                                </Text>
                                <Text style={styles.lessonCount}>
                                    {mod.lessons?.length ?? 0} aula(s)
                                </Text>
                            </View>
                            <Ionicons
                                name={expandedModule === mod.id ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>

                        {expandedModule === mod.id && mod.lessons && (
                            <View style={styles.lessonsContainer}>
                                {mod.lessons.map((lesson) => (
                                    <View key={lesson.id} style={styles.lessonItem}>
                                        <Ionicons
                                            name={lesson.videoURL ? 'play-circle' : 'document-text-outline'}
                                            size={18}
                                            color="#2563EB"
                                        />
                                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                        {lesson.duration > 0 && (
                                            <Text style={styles.lessonDuration}>{lesson.duration} min</Text>
                                        )}
                                    </View>
                                ))}
                                {mod.lessons.length === 0 && (
                                    <Text style={styles.noLessons}>Nenhuma aula neste módulo.</Text>
                                )}
                            </View>
                        )}
                    </View>
                ))
            )}

            {/* QUESTIONÁRIOS DO CURSO */}
            {questionnaires.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Questionários</Text>
                    {questionnaires.map((q) => (
                        <TouchableOpacity
                            key={q.id}
                            style={styles.quizCard}
                            onPress={() => navigation.navigate('Quiz', { questionnaire: q })}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.quizTitle}>{q.title}</Text>
                                <Text style={styles.quizType}>
                                    {q.type === 'pre_content' ? 'Nivelamento (antes do curso)'
                                        : q.type === 'post_content' ? 'Avaliação (após o curso)'
                                        : 'Nivelamento geral'}
                                </Text>
                                {q.timeLimit && (
                                    <Text style={styles.quizMeta}>Tempo: {q.timeLimit} min</Text>
                                )}
                            </View>
                            <Ionicons name="play-circle" size={28} color="#2563EB" />
                        </TouchableOpacity>
                    ))}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#F0F4F8' },
    headerCard: {
        backgroundColor: '#fff', borderRadius: 12, padding: 20,
        marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#0A1628', marginBottom: 4 },
    author: { fontSize: 14, color: '#2563EB', marginBottom: 12 },
    description: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 16 },
    metaRow: { flexDirection: 'row', gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, color: '#555' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0A1628', marginBottom: 12, marginTop: 8 },
    moduleCard: {
        backgroundColor: '#fff', borderRadius: 10, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 }, elevation: 1,
        overflow: 'hidden',
    },
    moduleHeader: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, justifyContent: 'space-between',
    },
    moduleTitle: { fontSize: 15, fontWeight: '600', color: '#0A1628' },
    lessonCount: { fontSize: 12, color: '#888', marginTop: 2 },
    lessonsContainer: { paddingHorizontal: 16, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    lessonItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, gap: 10,
        borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
    },
    lessonTitle: { flex: 1, fontSize: 14, color: '#333' },
    lessonDuration: { fontSize: 12, color: '#999' },
    noLessons: { fontSize: 13, color: '#999', paddingVertical: 10 },
    emptyCard: {
        backgroundColor: '#fff', borderRadius: 10, padding: 20,
        alignItems: 'center',
    },
    emptyText: { fontSize: 14, color: '#888' },
    quizCard: {
        backgroundColor: '#fff', borderRadius: 10, padding: 16,
        marginBottom: 10, flexDirection: 'row', alignItems: 'center',
        borderLeftWidth: 4, borderLeftColor: '#2563EB',
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 }, elevation: 1,
    },
    quizTitle: { fontSize: 15, fontWeight: '600', color: '#0A1628' },
    quizType: { fontSize: 12, color: '#2563EB', marginTop: 2 },
    quizMeta: { fontSize: 12, color: '#888', marginTop: 2 },
});