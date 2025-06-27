import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../app/firebase';

export async function getUserStats() {
    const user = auth.currentUser;

    if (!user) {
        console.log('No user logged in');
        return null;
    }

    const uid = user.uid;
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const points = data.xp;
        const streaks = data.currentStreak;
        const level = data.level;

        return { points, streaks, level };
    } else {
        console.log('No such document!');
        return null;
    }
}
