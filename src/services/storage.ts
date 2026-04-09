import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../config/firebase';

export const uploadPhoto = async (uri: string, folder: string): Promise<string> => {
    const storage = getStorage();
    const uid = auth.currentUser?.uid ?? Date.now().toString();
    const storageRef = ref(storage, `${folder}/${uid}_${Date.now()}.jpg`);

    const response = await fetch(uri);
    const blob = await response.blob();

    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
};