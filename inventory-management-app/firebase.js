import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyDwv_57wGqcb158EyySjOVlC3XpYQ8ynJ8",
    authDomain: "inventorymanagement-b3a2c.firebaseapp.com",
    projectId: "inventorymanagement-b3a2c",
    storageBucket: "inventorymanagement-b3a2c.appspot.com",
    messagingSenderId: "852846344688",
    appId: "1:852846344688:web:e300569c7530856639c535",
    measurementId: "G-99P7BR7MYY"
 };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };