import {
    collection, getDocs, addDoc, deleteDoc, updateDoc, doc,
    query, where, orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Comment {
    id?: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    courseId: string;
    text: string;
    createdAt: string;
}

const CommentsService = {
    getByCourse: async (courseId: string): Promise<Comment[]> => {
        try {
            const q = query(
                collection(db, 'comments'),
                where('courseId', '==', courseId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
        } catch (error) {
            console.error('Erro comentários getByCourse:', error);
            return [];
        }
    },

    add: async (comment: Omit<Comment, 'id'>): Promise<boolean> => {
        try {
            await addDoc(collection(db, 'comments'), comment);
            return true;
        } catch (error) {
            console.error('Erro comentários add:', error);
            return false;
        }
    },

    delete: async (commentId: string): Promise<boolean> => {
        try {
            await deleteDoc(doc(db, 'comments', commentId));
            return true;
        } catch {
            return false;
        }
    },

    update: async (commentId: string, text: string): Promise<boolean> => {
        try {
            await updateDoc(doc(db, 'comments', commentId), { text });
            return true;
        } catch {
            return false;
        }
    },
};

export default CommentsService;