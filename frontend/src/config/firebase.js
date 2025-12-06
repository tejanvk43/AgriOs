import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyACvEkD4_3MEFKUN32A8Qw58xJ2UdW35l0",
    authDomain: "technozolo.firebaseapp.com",
    projectId: "technozolo",
    storageBucket: "technozolo.firebasestorage.app",
    messagingSenderId: "815772999183",
    appId: "1:815772999183:web:b1c2f0f61d6c894d5a4d7a",
    measurementId: "G-7WBFBJQBGF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
