import {
    collection, getDocs, addDoc,
    query, where, orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Certificate {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    courseId: string;
    courseTitle: string;
    authorId: string;
    issuedAt: string;
    validationCode: string;
}

const CertificateServicesMobile = {

    /**
     * Busca certificados do usuário
     */
    getByUser: async (userId: string): Promise<{ success: boolean; certificates?: Certificate[] }> => {
        try {
            const q = query(
                collection(db, 'certificates'),
                where('userId', '==', userId),
                orderBy('issuedAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const certificates = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Certificate));
            return { success: true, certificates };
        } catch (error) {
            console.error('Erro ao buscar certificados:', error);
            return { success: false };
        }
    },

    /**
     * Verifica se o usuário já tem certificado de um curso
     */
    hasCertificate: async (userId: string, courseId: string): Promise<boolean> => {
        try {
            const q = query(
                collection(db, 'certificates'),
                where('userId', '==', userId),
                where('courseId', '==', courseId)
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch {
            return false;
        }
    },

    /**
     * Emite um certificado
     */
    issue: async (data: Omit<Certificate, 'id'>): Promise<{ success: boolean; error?: string }> => {
        try {
            // Verifica se já existe
            const exists = await CertificateServicesMobile.hasCertificate(data.userId, data.courseId);
            if (exists) return { success: false, error: 'Certificado já emitido para este curso.' };

            await addDoc(collection(db, 'certificates'), data);
            return { success: true };
        } catch {
            return { success: false, error: 'Erro ao emitir certificado.' };
        }
    },

    /**
     * Gera código de validação único
     */
    generateCode: (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 12; i++) {
            if (i > 0 && i % 4 === 0) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },
};

export default CertificateServicesMobile;