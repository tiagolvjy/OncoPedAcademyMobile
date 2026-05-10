import {
    collection, getDocs, addDoc,
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
        } catch { return []; }
    },

    add: async (comment: Omit<Comment, 'id'>): Promise<boolean> => {
        try {
            await addDoc(collection(db, 'comments'), comment);
            return true;
        } catch { return false; }
    },
};

export default CommentsService;