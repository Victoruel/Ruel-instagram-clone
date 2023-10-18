import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyABoWbXOodTPJtOd9A5iahJQChv0YIaN7k",
	authDomain: "ruel-instagram-clone.firebaseapp.com",
	projectId: "ruel-instagram-clone",
	storageBucket: "ruel-instagram-clone.appspot.com",
	messagingSenderId: "190386011838",
	appId: "1:190386011838:web:73fed395e90cd32fa528ef",
	measurementId: "G-D4KNGTD6BT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestoreDb = getFirestore(app);
export const authProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
