import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// 🔥 CONFIGURA AQUÍ TUS CREDENCIALES DE FIREBASE
// Ve a: https://console.firebase.google.com
// Configuración ⚙ → Tus apps → SDK Web

const firebaseConfig = {
  apiKey: "PEGA_TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
