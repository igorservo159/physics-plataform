import * as firebase from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Mostra o valor atual de NODE_ENV
console.log('NODE_ENV:', process.env.NODE_ENV);

// Determina o caminho do arquivo
const firebaseConfigPath = process.env.NODE_ENV === 'production'
  ? 'config/prod/service-account.prod.json'
  : 'config/dev/service-account.dev.json';

console.log('firebaseConfigPath:', firebaseConfigPath);

// Verifica se o arquivo existe
if (!fs.existsSync(firebaseConfigPath)) {
  console.error('Arquivo de configuração Firebase não encontrado:', firebaseConfigPath);
  process.exit(1);
}

// Lê e transforma em objeto
const raw = fs.readFileSync(firebaseConfigPath, 'utf8');
console.log('Conteúdo bruto do arquivo JSON:', raw);

const serviceAccount = JSON.parse(raw);

// Verifica se project_id está presente
console.log('project_id:', serviceAccount.project_id);

// Inicializa o Firebase Admin
const firebaseAdminApp = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

export default firebaseAdminApp;
