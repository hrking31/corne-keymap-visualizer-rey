// Configuración de la app web de Firebase (proyecto corne-rey). Estos valores son
// públicos por diseño: identifican la app, no dan acceso a nada. Lo que protege los
// datos son las reglas de firestore.rules.
export const firebaseConfig = {
  apiKey: "AIzaSyClsvkDgjmsgbM752-YpDtARZx5Bcy_Wr4",
  // El dominio que Firebase registró en Google al crear el proyecto. Con cualquier otro
  // (p. ej. el de la propia app o el de una vista previa) Google responde «La solicitud
  // de esta app no es válida» hasta registrarlo a mano en Google Cloud. Con la ventana
  // emergente (signInWithPopup) funciona desde cualquier dirección de la app.
  authDomain: "corne-rey.firebaseapp.com",
  projectId: "corne-rey",
  storageBucket: "corne-rey.firebasestorage.app",
  messagingSenderId: "725556610949",
  appId: "1:725556610949:web:e5a4741d325bbf3947a6ec",
};
