import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface AuthContextData {
    user: User | null;
    userData: any | null;
    loading: boolean;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
    user: null,
    userData: null,
    loading: true,
    refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (uid: string, retries = 3): Promise<void> => {
        try {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) {
                setUserData({ id: snap.id, ...snap.data() });
            } else if (retries > 0) {
                // Documento pode não existir ainda (cadastro em andamento)
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchUserData(uid, retries - 1);
            } else {
                setUserData(null);
            }
        } catch {
            setUserData(null);
        }
    };

    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user.uid);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await fetchUserData(firebaseUser.uid);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);