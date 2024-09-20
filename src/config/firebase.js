// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnnKO8Z3ZP6FsF1JsbU1zLiKIew049My0",
  authDomain: "fir-course-8e9d4.firebaseapp.com",
  projectId: "fir-course-8e9d4",
  storageBucket: "fir-course-8e9d4.appspot.com",
  messagingSenderId: "445974247551",
  appId: "1:445974247551:web:71409fea4c2555e812674a",
  measurementId: "G-QP1FH01RVX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth=getAuth(app);
export const db=getFirestore(app);
export const storage = getStorage(app);