import {
    collection, getDocs, getDoc, doc,
    query, where, orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Course {
    id: string;
    title: string;
    description: string;
    authorId: string;
    authorName: string;
    status: string;
    verified: boolean;
    hasCertificate: boolean;
    duration: number;
    coverImage?: string;
    createdAt: string;
}

export interface Module {
    id: string;
    title: string;
    order: number;
}

export interface Lesson {
    id: string;
    title: string;
    duration: number;
    order: number;
    videoURL?: string;
}

const CourseServicesMobile = {

    /**
     * Lista cursos publicados (visíveis para alunos)
     */
    getPublished: async (): Promise<{ success: boolean; courses?: Course[] }> => {
        try {
            const q = query(
                collection(db, 'courses'),
                where('status', '==', 'published'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const courses = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Course));
            return { success: true, courses };
        } catch (error) {
            console.error('Erro ao buscar cursos:', error);
            return { success: false };
        }
    },

    /**
     * Busca um curso pelo ID
     */
    getById: async (id: string): Promise<{ success: boolean; course?: Course }> => {
        try {
            const snap = await getDoc(doc(db, 'courses', id));
            if (!snap.exists()) return { success: false };
            return { success: true, course: { id: snap.id, ...snap.data() } as Course };
        } catch {
            return { success: false };
        }
    },

    /**
     * Lista módulos de um curso
     */
    getModules: async (courseId: string): Promise<{ success: boolean; modules?: Module[] }> => {
        try {
            const q = query(
                collection(db, 'courses', courseId, 'modules'),
                orderBy('order', 'asc')
            );
            const snapshot = await getDocs(q);
            const modules = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Module));
            return { success: true, modules };
        } catch {
            return { success: false };
        }
    },

    /**
     * Lista aulas de um módulo
     */
    getLessons: async (courseId: string, moduleId: string): Promise<{ success: boolean; lessons?: Lesson[] }> => {
        try {
            const q = query(
                collection(db, 'courses', courseId, 'modules', moduleId, 'lessons'),
                orderBy('order', 'asc')
            );
            const snapshot = await getDocs(q);
            const lessons = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lesson));
            return { success: true, lessons };
        } catch {
            return { success: false };
        }
    },
};

export default CourseServicesMobile;