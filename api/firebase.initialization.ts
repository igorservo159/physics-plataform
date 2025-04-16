// firebase.initialization.ts

let firebaseConfigPath;

// Determinando o caminho do arquivo de credenciais com base no ambiente
if (process.env.NODE_ENV === 'production') {
  firebaseConfigPath = 'config/prod/service-account.prod.json';
} else {
  firebaseConfigPath = 'config/dev/service-account.dev.json';
}

import * as firebase from 'firebase-admin';

const firebaseAdminApp = firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfigPath),
});

export default firebaseAdminApp;
