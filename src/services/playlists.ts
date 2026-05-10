import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, where, orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Playlist {
    id?: string;
    userId: string;
    name: string;
    description?: string;
    courseIds: string[];
    createdAt: string;
}

const PlaylistsService = {
    getByUser: async (userId: string): Promise<Playlist[]> => {
        try {
            const q = query(
                collection(db, 'playlists'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Playlist));
        } catch { return []; }
    },

    create: async (data: Omit<Playlist, 'id'>): Promise<boolean> => {
        try {
            await addDoc(collection(db, 'playlists'), data);
            return true;
        } catch { return false; }
    },

    addCourse: async (playlistId: string, courseIds: string[]): Promise<boolean> => {
        try {
            await updateDoc(doc(db, 'playlists', playlistId), { courseIds });
            return true;
        } catch { return false; }
    },

    delete: async (playlistId: string): Promise<boolean> => {
        try {
            await deleteDoc(doc(db, 'playlists', playlistId));
            return true;
        } catch { return false; }
    },
};

export default PlaylistsService;