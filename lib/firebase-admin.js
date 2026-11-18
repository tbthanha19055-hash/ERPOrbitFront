import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getFirebaseCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Thiếu cấu hình Firebase Admin. Hãy điền FIREBASE_SERVICE_ACCOUNT_JSON hoặc bộ FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY trong .env.');
  }

  return cert({ projectId, clientEmail, privateKey });
}

let firestoreInstance;

export function getFirestoreDb() {
  if (firestoreInstance) return firestoreInstance;
  const firebaseApp = getApps()[0] || initializeApp({ credential: getFirebaseCredential() });
  firestoreInstance = getFirestore(firebaseApp);
  return firestoreInstance;
}
