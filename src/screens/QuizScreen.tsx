import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import QuestionnaireServicesMobile, { Question, Questionnaire } from '../services/questionnaires';
import CertificateServicesMobile from '../services/certificates';
import CourseServicesMobile from '../services/courses';

export default function QuizScreen({ route, navigation }: any) {
    const { questionnaire } = route.params as { questionnaire: Questionnaire };
    const { user, userData } = useAuth();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answers, setAnswers] = useState<{ questionId: string; selectedOptionId: string; correct: boolean }[]>([]);
    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);

    // Timer
    const [timeLeft, setTimeLeft] = useState<number | null>(
        questionnaire.timeLimit ? questionnaire.timeLimit * 60 : null
    );
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        loadQuestions();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            finishQuiz();
            return;
        }
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [timeLeft]);

    const loadQuestions = async () => {
        const res = await QuestionnaireServicesMobile.getQuestions(questionnaire.id);
        if (res.success && res.questions && res.questions.length > 0) {
            setQuestions(res.questions);
        } else {
            Alert.alert('Erro', 'Nenhuma questão encontrada neste questionário.', [
                { text: 'Voltar', onPress: () => navigation.goBack() },
            ]);
        }
        setLoading(false);
    };

    const handleNext = () => {
        if (!selectedOption) return;

        const currentQuestion = questions[currentIndex];
        const correct = currentQuestion.options.find(o => o.id === selectedOption)?.isCorrect ?? false;

        const newAnswers = [...answers, {
            questionId: currentQuestion.id,
            selectedOptionId: selectedOption,
            correct,
        }];
        setAnswers(newAnswers);
        setSelectedOption(null);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            finishQuiz(newAnswers);
        }
    };

    const finishQuiz = async (finalAnswers?: typeof answers) => {
        if (timerRef.current) clearInterval(timerRef.current);

        const allAnswers = finalAnswers ?? answers;
        const score = allAnswers.filter(a => a.correct).length;
        const percentage = Math.round((score / questions.length) * 100);

        setSaving(true);
        setFinished(true);

        await QuestionnaireServicesMobile.saveResult({
            userId: user!.uid,
            questionnaireId: questionnaire.id,
            questionnaireTitle: questionnaire.title,
            type: questionnaire.type,
            courseId: questionnaire.courseId,
            score,
            totalQuestions: questions.length,
            percentage,
            answers: allAnswers,
            completedAt: new Date().toISOString(),
        });

        // Emitir certificado se aprovado em avaliação final
        if (
            questionnaire.type === 'post_content' &&
            questionnaire.passingScore &&
            percentage >= questionnaire.passingScore &&
            questionnaire.courseId
        ) {
            try {
                const courseRes = await CourseServicesMobile.getById(questionnaire.courseId);
                if (courseRes.success && courseRes.course && courseRes.course.hasCertificate) {
                    await CertificateServicesMobile.issue({
                        userId: user!.uid,
                        userName: userData?.name ?? user!.email ?? 'Usuário',
                        userEmail: user!.email ?? '',
                        courseId: questionnaire.courseId,
                        courseTitle: questionnaire.courseTitle ?? courseRes.course.title,
                        authorId: courseRes.course.authorId,
                        issuedAt: new Date().toISOString(),
                        validationCode: CertificateServicesMobile.generateCode(),
                    });
                }
            } catch (err) {
                console.warn('Erro ao emitir certificado:', err);
            }
        }

        setSaving(false);
    };

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // ======================== LOADING ========================
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    // ======================== RESULTADO ========================
    if (finished) {
        const score = answers.filter(a => a.correct).length;
        const percentage = Math.round((score / questions.length) * 100);
        const level = QuestionnaireServicesMobile.getLevel(percentage);
        const passed = questionnaire.passingScore ? percentage >= questionnaire.passingScore : true;

        return (
            <ScrollView contentContainerStyle={styles.resultContainer}>
                {saving ? (
                    <ActivityIndicator size="large" color="#2563EB" />
                ) : (
                    <>
                        <Ionicons
                            name={passed ? 'checkmark-circle' : 'close-circle'}
                            size={64}
                            color={passed ? '#0D9488' : '#ef4444'}
                        />
                        <Text style={styles.resultTitle}>
                            {passed ? 'Parabéns!' : 'Não foi dessa vez'}
                        </Text>

                        <View style={styles.resultCard}>
                            <Text style={styles.resultScore}>{percentage}%</Text>
                            <Text style={styles.resultDetail}>
                                {score} de {questions.length} questões corretas
                            </Text>
                            {questionnaire.type === 'leveling' && (
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelText}>Nível: {level}</Text>
                                </View>
                            )}
                            {questionnaire.passingScore && (
                                <Text style={[styles.resultDetail, { marginTop: 8 }]}>
                                    Mínimo para aprovação: {questionnaire.passingScore}%
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.buttonText}>Voltar</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        );
    }

    // ======================== QUESTÃO ATUAL ========================
    const currentQuestion = questions[currentIndex];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.progress}>
                    Questão {currentIndex + 1} de {questions.length}
                </Text>
                {timeLeft !== null && (
                    <View style={[styles.timerBadge, timeLeft < 60 && styles.timerDanger]}>
                        <Ionicons name="time-outline" size={16} color={timeLeft < 60 ? '#fff' : '#2563EB'} />
                        <Text style={[styles.timerText, timeLeft < 60 && styles.timerTextDanger]}>
                            {formatTime(timeLeft)}
                        </Text>
                    </View>
                )}
            </View>

            {/* BARRA DE PROGRESSO */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
            </View>

            {/* PERGUNTA */}
            <Text style={styles.questionText}>{currentQuestion.text}</Text>

            {/* OPÇÕES */}
            {currentQuestion.options.map((option) => (
                <TouchableOpacity
                    key={option.id}
                    style={[
                        styles.optionCard,
                        selectedOption === option.id && styles.optionSelected,
                    ]}
                    onPress={() => setSelectedOption(option.id)}
                >
                    <View style={[
                        styles.optionRadio,
                        selectedOption === option.id && styles.optionRadioSelected,
                    ]}>
                        {selectedOption === option.id && <View style={styles.optionRadioDot} />}
                    </View>
                    <Text style={[
                        styles.optionText,
                        selectedOption === option.id && styles.optionTextSelected,
                    ]}>
                        {option.text}
                    </Text>
                </TouchableOpacity>
            ))}

            {/* BOTÃO */}
            <TouchableOpacity
                style={[styles.button, !selectedOption && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={!selectedOption}
            >
                <Text style={styles.buttonText}>
                    {currentIndex + 1 < questions.length ? 'Próxima' : 'Finalizar'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' },
    container: { flexGrow: 1, padding: 20, backgroundColor: '#F0F4F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    progress: { fontSize: 14, fontWeight: '600', color: '#666' },
    timerBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#EBF5FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    timerDanger: { backgroundColor: '#ef4444' },
    timerText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
    timerTextDanger: { color: '#fff' },
    progressBar: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, marginBottom: 24 },
    progressFill: { height: 6, backgroundColor: '#2563EB', borderRadius: 3 },
    questionText: { fontSize: 18, fontWeight: '700', color: '#0A1628', marginBottom: 20, lineHeight: 26 },
    optionCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 10, padding: 16, marginBottom: 10,
        borderWidth: 2, borderColor: '#eee',
    },
    optionSelected: { borderColor: '#2563EB', backgroundColor: '#f0f5ff' },
    optionRadio: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2,
        borderColor: '#ccc', marginRight: 12, justifyContent: 'center', alignItems: 'center',
    },
    optionRadioSelected: { borderColor: '#2563EB' },
    optionRadioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563EB' },
    optionText: { flex: 1, fontSize: 15, color: '#333', lineHeight: 22 },
    optionTextSelected: { color: '#2563EB', fontWeight: '600' },
    button: {
        backgroundColor: '#2563EB', borderRadius: 10, padding: 16,
        alignItems: 'center', marginTop: 16,
    },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    resultContainer: {
        flexGrow: 1, padding: 20, backgroundColor: '#F0F4F8',
        justifyContent: 'center', alignItems: 'center',
    },
    resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#0A1628', marginTop: 16, marginBottom: 20 },
    resultCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 24,
        alignItems: 'center', width: '100%', marginBottom: 24,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    resultScore: { fontSize: 48, fontWeight: 'bold', color: '#2563EB' },
    resultDetail: { fontSize: 15, color: '#666', marginTop: 4 },
    levelBadge: {
        backgroundColor: '#0D9488', borderRadius: 20, paddingHorizontal: 16,
        paddingVertical: 6, marginTop: 12,
    },
    levelText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});