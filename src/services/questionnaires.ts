import {
    collection, getDocs, getDoc, doc, addDoc,
    query, where, orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    text: string;
    imageURL?: string;
    options: QuestionOption[];
    order: number;
}

export interface Questionnaire {
    id: string;
    authorId: string;
    title: string;
    type: 'leveling' | 'pre_content' | 'post_content';
    courseId?: string;
    courseTitle?: string;
    timeLimit?: number;
    passingScore?: number;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface QuizResult {
    id?: string;
    userId: string;
    questionnaireId: string;
    questionnaireTitle: string;
    type: string;
    courseId?: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    answers: { questionId: string; selectedOptionId: string; correct: boolean }[];
    completedAt: string;
}

const QuestionnaireServicesMobile = {

    /**
     * Busca questionário de nivelamento geral ativo
     */
    getLeveling: async (): Promise<{ success: boolean; questionnaire?: Questionnaire }> => {
        try {
            const q = query(
                collection(db, 'questionnaires'),
                where('type', '==', 'leveling'),
                where('status', '==', 'active'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return { success: true };
            const first = snapshot.docs[0];
            return { success: true, questionnaire: { id: first.id, ...first.data() } as Questionnaire };
        } catch (error) {
            console.error('Erro ao buscar nivelamento:', error);
            return { success: false };
        }
    },

    /**
     * Busca questionários vinculados a um curso
     */
    getByCourse: async (courseId: string): Promise<{ success: boolean; questionnaires?: Questionnaire[] }> => {
        try {
            const q = query(
                collection(db, 'questionnaires'),
                where('courseId', '==', courseId),
                where('status', '==', 'active'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const questionnaires = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Questionnaire));
            return { success: true, questionnaires };
        } catch (error) {
            console.error('Erro ao buscar questionários do curso:', error);
            return { success: false };
        }
    },

    /**
     * Busca questões de um questionário
     */
    getQuestions: async (questionnaireId: string): Promise<{ success: boolean; questions?: Question[] }> => {
        try {
            const q = query(
                collection(db, 'questionnaires', questionnaireId, 'questions'),
                orderBy('order', 'asc')
            );
            const snapshot = await getDocs(q);
            const questions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question));
            return { success: true, questions };
        } catch {
            return { success: false };
        }
    },

    /**
     * Salva resultado do questionário
     */
    saveResult: async (result: Omit<QuizResult, 'id'>): Promise<{ success: boolean; error?: string }> => {
        try {
            await addDoc(collection(db, 'quiz_results'), result);
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao salvar resultado.' };
        }
    },

    /**
     * Busca resultados do usuário
     */
    getUserResults: async (userId: string): Promise<{ success: boolean; results?: QuizResult[] }> => {
        try {
            const q = query(
                collection(db, 'quiz_results'),
                where('userId', '==', userId),
                orderBy('completedAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizResult));
            return { success: true, results };
        } catch (error) {
            console.error('Erro getUserResults:', error);
            return { success: false };
        }
    },

    /**
     * Verifica se usuário já fez o nivelamento geral
     */
    hasCompletedLeveling: async (userId: string): Promise<boolean> => {
        try {
            const q = query(
                collection(db, 'quiz_results'),
                where('userId', '==', userId),
                where('type', '==', 'leveling')
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch {
            return false;
        }
    },

    /**
     * Retorna o nível com base na porcentagem
     */
    getLevel: (percentage: number): string => {
        if (percentage <= 19) return 'Muito Iniciante';
        if (percentage <= 39) return 'Iniciante';
        if (percentage <= 59) return 'Intermediário';
        if (percentage <= 79) return 'Avançado';
        return 'Especialista';
    },
};

export default QuestionnaireServicesMobile;