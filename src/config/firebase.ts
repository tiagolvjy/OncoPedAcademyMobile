import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCxsPRvmtGFkvPDRfKiYbwyGnkBDNpxB4A",
    authDomain: "oncoped-academy.firebaseapp.com",
    projectId: "oncoped-academy",
    storageBucket: "oncoped-academy.firebasestorage.app",
    messagingSenderId: "900080691110",
    appId: "1:900080691110:web:16a2c3d703fcc6c1229167"
};

let app: any;
let auth: any;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} else {
    app = getApp();
    auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;