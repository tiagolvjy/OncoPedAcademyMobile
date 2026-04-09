import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { StudentUser, DoctorUser } from '../types/user';
import { uploadPhoto } from './storage';

const AuthServices = {

    registerStudent: async (data: StudentUser): Promise<{ success: boolean; error?: string }> => {
        try {
            const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const uid = credential.user.uid;

            let photoURL = null;
            if (data.photoURL) {
                try {
                    photoURL = await uploadPhoto(data.photoURL, 'profile');
                } catch {
                    console.warn('Upload da foto falhou, cadastro continua sem foto.');
                }
            }

            await setDoc(doc(db, 'users', uid), {
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: data.cpf,
                birthDate: data.birthDate,
                gender: data.gender,
                photoURL,
                role: 'student',
                status: 'active',
                institution: data.institution,
                coursePeriod: data.coursePeriod,
                specializations: data.specializations ?? null,
                observations: data.observations ?? null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            return { success: true };
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use')
                return { success: false, error: 'Email já cadastrado.' };
            if (error.code === 'auth/weak-password')
                return { success: false, error: 'Senha muito fraca.' };
            return { success: false, error: 'Erro ao realizar cadastro.' };
        }
    },

    registerDoctor: async (data: DoctorUser): Promise<{ success: boolean; error?: string }> => {
        try {
            const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const uid = credential.user.uid;

            let photoURL = null;
            if (data.photoURL) {
                try {
                    photoURL = await uploadPhoto(data.photoURL, 'profile');
                } catch {
                    console.warn('Upload da foto falhou, cadastro continua sem foto.');
                }
            }

            await setDoc(doc(db, 'users', uid), {
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: data.cpf,
                birthDate: data.birthDate,
                gender: data.gender,
                photoURL,
                role: 'doctor',
                status: 'active',
                crmVerified: false,
                institutions: data.institutions,
                crm: data.crm,
                hasMasters: data.hasMasters,
                mastersArea: data.mastersArea ?? null,
                mastersInstitution: data.mastersInstitution ?? null,
                hasPhd: data.hasPhd,
                phdArea: data.phdArea ?? null,
                phdInstitution: data.phdInstitution ?? null,
                hasPostGrad: data.hasPostGrad,
                postGradArea: data.postGradArea ?? null,
                postGradInstitution: data.postGradInstitution ?? null,
                observations: data.observations ?? null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            return { success: true };
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use')
                return { success: false, error: 'Email já cadastrado.' };
            if (error.code === 'auth/weak-password')
                return { success: false, error: 'Senha muito fraca.' };
            return { success: false, error: 'Erro ao realizar cadastro.' };
        }
    },

    login: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error: any) {
            if (
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/invalid-credential'
            ) return { success: false, error: 'Email ou senha incorretos.' };
            if (error.code === 'auth/too-many-requests')
                return { success: false, error: 'Muitas tentativas. Tente mais tarde.' };
            return { success: false, error: 'Erro ao realizar login.' };
        }
    },

    logout: async (): Promise<{ success: boolean }> => {
        try {
            await signOut(auth);
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    resetPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error: any) {
            if (error.code === 'auth/user-not-found')
                return { success: false, error: 'Email não encontrado.' };
            return { success: false, error: 'Erro ao enviar email.' };
        }
    },
};

export default AuthServices;