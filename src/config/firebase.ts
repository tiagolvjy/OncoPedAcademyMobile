import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCxsPRvmtGFkvPDRfKiYbwyGnkBDNpxB4A",
    authDomain: "oncoped-academy.firebaseapp.com",
    projectId: "oncoped-academy",
    storageBucket: "oncoped-academy.firebasestorage.app",
    messagingSenderId: "900080691110",
    appId: "1:900080691110:web:16a2c3d703fcc6c1229167"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;