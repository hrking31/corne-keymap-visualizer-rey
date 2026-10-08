// Configuración de la app web de Firebase (proyecto corne-rey). Estos valores son
// públicos por diseño: identifican la app, no dan acceso a nada. Lo que protege los
// datos son las reglas de firestore.rules.
export const firebaseConfig = {
  apiKey: "AIzaSyClsvkDgjmsgbM752-YpDtARZx5Bcy_Wr4",
  // El inicio de sesión se sirve desde el mismo dominio de la app (Firebase Hosting
  // atiende /__/auth/ en cada sitio y en cada vista previa): así funciona aunque el
  // navegador bloquee las cookies de terceros. En local, el dominio de Firebase.
  authDomain:
    typeof location !== "undefined" && location.hostname.endsWith(".web.app")
      ? location.hostname
      : "corne-rey.firebaseapp.com",
  projectId: "corne-rey",
  storageBucket: "corne-rey.firebasestorage.app",
  messagingSenderId: "725556610949",
  appId: "1:725556610949:web:e5a4741d325bbf3947a6ec",
};
