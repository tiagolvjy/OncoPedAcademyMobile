import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert, BackHandler,
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
    const [showReview, setShowReview] = useState(false);

    // Timer
    const [timeLeft, setTimeLeft] = useState<number | null>(
        questionnaire.timeLimit ? questionnaire.timeLimit * 60 : null
    );
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const exitConfirmed = useRef(false);
    const confirmExit = () => {
        Alert.alert(
            'Sair do questionário?',
            'Se você sair agora, seu progresso será perdido. Tem certeza que deseja sair?',
            [
                { text: 'Continuar respondendo', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: () => {
                        exitConfirmed.current = true;
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    // Esconder tab bar durante o questionário
    useEffect(() => {
        const tabNav = navigation.getParent()?.getParent?.() ?? navigation.getParent();
        if (tabNav) {
            tabNav.setOptions({ tabBarStyle: { display: 'none' } });
        }

        return () => {
            if (tabNav) {
                tabNav.setOptions({
                    tabBarStyle: {
                        backgroundColor: '#fff',
                        borderTopWidth: 1,
                        borderTopColor: '#eee',
                        height: 60,
                        paddingBottom: 8,
                        paddingTop: 4,
                    },
                });
            }
        };
    }, []);

    // Travar saída durante o questionário (gesture/swipe)
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (finished || exitConfirmed.current) return;

            e.preventDefault();
            Alert.alert(
                'Sair do questionário?',
                'Se você sair agora, seu progresso será perdido. Tem certeza que deseja sair?',
                [
                    { text: 'Continuar respondendo', style: 'cancel' },
                    {
                        text: 'Sair',
                        style: 'destructive',
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation, finished]);

    // Travar botão de voltar do Android
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (finished) return false;
            confirmExit();
            return true;
        });

        return () => backHandler.remove();
    }, [finished]);

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

    // ======================== REVISÃO DAS RESPOSTAS ========================
    if (showReview) {
        return (
            <ScrollView contentContainerStyle={styles.reviewContainer}>
                <Text style={styles.reviewTitle}>Revisão das Respostas</Text>
                <Text style={styles.reviewSubtitle}>
                    Veja quais questões você acertou e errou para fins de aprendizado.
                </Text>

                {questions.map((question, qIndex) => {
                    const answer = answers[qIndex];
                    const isCorrect = answer?.correct ?? false;

                    return (
                        <View key={question.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <Ionicons
                                    name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                                    size={22}
                                    color={isCorrect ? '#0D9488' : '#ef4444'}
                                />
                                <Text style={styles.reviewQuestionNum}>Questão {qIndex + 1}</Text>
                            </View>
                            <Text style={styles.reviewQuestionText}>{question.text}</Text>

                            {question.options.map((option) => {
                                const isSelected = answer?.selectedOptionId === option.id;
                                const isCorrectOption = option.isCorrect;

                                let optionStyle = styles.reviewOption;
                                let textStyle = styles.reviewOptionText;
                                let iconName: keyof typeof Ionicons.glyphMap | null = null;
                                let iconColor = '#999';

                                if (isCorrectOption) {
                                    optionStyle = { ...styles.reviewOption, ...styles.reviewOptionCorrect };
                                    textStyle = { ...styles.reviewOptionText, ...styles.reviewOptionTextCorrect };
                                    iconName = 'checkmark-circle';
                                    iconColor = '#0D9488';
                                } else if (isSelected && !isCorrectOption) {
                                    optionStyle = { ...styles.reviewOption, ...styles.reviewOptionWrong };
                                    textStyle = { ...styles.reviewOptionText, ...styles.reviewOptionTextWrong };
                                    iconName = 'close-circle';
                                    iconColor = '#ef4444';
                                }

                                return (
                                    <View key={option.id} style={optionStyle}>
                                        {iconName && (
                                            <Ionicons name={iconName} size={18} color={iconColor} style={{ marginRight: 8 }} />
                                        )}
                                        <Text style={textStyle}>{option.text}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Voltar</Text>
                </TouchableOpacity>
            </ScrollView>
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
                            style={styles.reviewButton}
                            onPress={() => setShowReview(true)}
                        >
                            <Ionicons name="eye-outline" size={20} color="#2563EB" />
                            <Text style={styles.reviewButtonText}>Ver respostas</Text>
                        </TouchableOpacity>

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
            {/* HEADER CUSTOM COM BOTÃO VOLTAR */}
            <View style={styles.quizHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={confirmExit}>
                    <Ionicons name="arrow-back" size={22} color="#0A1628" />
                </TouchableOpacity>
                <Text style={styles.quizHeaderTitle} numberOfLines={1}>
                    {questionnaire.title}
                </Text>
                {timeLeft !== null && (
                    <View style={[styles.timerBadge, timeLeft < 60 && styles.timerDanger]}>
                        <Ionicons name="time-outline" size={14} color={timeLeft < 60 ? '#fff' : '#2563EB'} />
                        <Text style={[styles.timerText, timeLeft < 60 && styles.timerTextDanger]}>
                            {formatTime(timeLeft)}
                        </Text>
                    </View>
                )}
            </View>

            {/* PROGRESSO */}
            <View style={styles.progressRow}>
                <Text style={styles.progress}>
                    Questão {currentIndex + 1} de {questions.length}
                </Text>
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

    // QUIZ HEADER
    quizHeader: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    quizHeaderTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0A1628' },

    progressRow: { marginBottom: 8 },
    progress: { fontSize: 14, fontWeight: '600', color: '#666' },
    timerBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#EBF5FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    },
    timerDanger: { backgroundColor: '#ef4444' },
    timerText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
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

    // RESULTADO
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
    reviewButton: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderWidth: 2, borderColor: '#2563EB', borderRadius: 10,
        padding: 14, marginBottom: 10, width: '100%', justifyContent: 'center',
    },
    reviewButtonText: { color: '#2563EB', fontWeight: 'bold', fontSize: 16 },

    // REVISÃO
    reviewContainer: { flexGrow: 1, padding: 20, backgroundColor: '#F0F4F8' },
    reviewTitle: { fontSize: 22, fontWeight: 'bold', color: '#0A1628', marginBottom: 6 },
    reviewSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
    reviewCard: {
        backgroundColor: '#fff', borderRadius: 12, padding: 16,
        marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    reviewQuestionNum: { fontSize: 14, fontWeight: '700', color: '#0A1628' },
    reviewQuestionText: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 12 },
    reviewOption: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        borderRadius: 8, marginBottom: 6, backgroundColor: '#f9f9f9',
        borderWidth: 1, borderColor: '#eee',
    },
    reviewOptionCorrect: {
        backgroundColor: '#E6F7F5', borderColor: '#0D9488',
    },
    reviewOptionWrong: {
        backgroundColor: '#FEF2F2', borderColor: '#ef4444',
    },
    reviewOptionText: { flex: 1, fontSize: 14, color: '#555' },
    reviewOptionTextCorrect: { color: '#0D9488', fontWeight: '600' },
    reviewOptionTextWrong: { color: '#ef4444', fontWeight: '600' },
});