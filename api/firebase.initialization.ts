import * as firebase from 'firebase-admin';
import * as fs from 'fs';

// Determina o caminho do arquivo
const firebaseConfigPath = process.env.NODE_ENV === 'production'
  ? 'config/prod/service-account.prod.json'
  : 'config/dev/service-account.dev.json';

// Verifica se o arquivo existe
if (!fs.existsSync(firebaseConfigPath)) {
  console.error('Arquivo de configuração Firebase não encontrado:', firebaseConfigPath);
  process.exit(1);
}

// Lê e transforma em objeto
const raw = fs.readFileSync(firebaseConfigPath, 'utf8');

const serviceAccount = JSON.parse(raw);

// Inicializa o Firebase Admin
const firebaseAdminApp = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

export default firebaseAdminApp;
