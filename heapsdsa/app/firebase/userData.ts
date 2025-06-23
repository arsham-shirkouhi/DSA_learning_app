import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

export async function getUserStats() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        console.log('No user logged in');
        return null;
    }

    const uid = user.uid;
    const db = getFirestore();
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const points = data.xp;
        const streaks = data.currentStreak;  // or whichever streak you want
        const level = data.level;

        return { points, streaks, level };

    } else {
        console.log('No such document!');
        return null;
    }
}
