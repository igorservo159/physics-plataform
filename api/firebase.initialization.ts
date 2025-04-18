import * as firebase from 'firebase-admin';
import * as fs from 'fs';

// Determina o caminho do arquivo
const firebaseConfigPath = process.env.NODE_ENV === 'production'
  ? 'config/prod/service-account.prod.json'
  : 'config/dev/service-account.dev.json';

// Lê e transforma em objeto
const serviceAccount = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

const firebaseAdminApp = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

export default firebaseAdminApp;
