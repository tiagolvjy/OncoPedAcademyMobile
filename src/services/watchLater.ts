import {
    collection, getDocs, addDoc, deleteDoc, doc,
    query, where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const WatchLaterService = {
    toggle: async (userId: string, courseId: string): Promise<boolean> => {
        try {
            const q = query(
                collection(db, 'watch_later'),
                where('userId', '==', userId),
                where('courseId', '==', courseId)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                await addDoc(collection(db, 'watch_later'), {
                    userId, courseId, createdAt: new Date().toISOString(),
                });
                return true;
            } else {
                await deleteDoc(doc(db, 'watch_later', snapshot.docs[0].id));
                return false;
            }
        } catch { return false; }
    },

    getByUser: async (userId: string): Promise<string[]> => {
        try {
            const q = query(collection(db, 'watch_later'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => d.data().courseId);
        } catch { return []; }
    },
};

export default WatchLaterService;