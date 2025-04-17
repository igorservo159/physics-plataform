import { writeFileSync } from 'fs';

const targetPath = './src/environments/environment.prod.ts';

const requiredVars = [
  'NG_APP_FIREBASE_API_KEY',
  'NG_APP_FIREBASE_AUTH_DOMAIN',
  'NG_APP_FIREBASE_PROJECT_ID',
  'NG_APP_FIREBASE_STORAGE_BUCKET',
  'NG_APP_FIREBASE_MESSAGING_SENDER_ID',
  'NG_APP_FIREBASE_APP_ID'
];

// Verificação das variáveis obrigatórias
for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`❌ Erro: Variável de ambiente '${key}' não está definida.`);
    process.exit(1);
  }
}

// Geração do conteúdo do arquivo
const envConfigFile = `
/**
 * Este arquivo foi gerado automaticamente pelo script generate-env.ts
 */

export const environment = {
  production: true,
  firebase: {
    apiKey: '${process.env['NG_APP_FIREBASE_API_KEY']}',
    authDomain: '${process.env['NG_APP_FIREBASE_AUTH_DOMAIN']}',
    projectId: '${process.env['NG_APP_FIREBASE_PROJECT_ID']}',
    storageBucket: '${process.env['NG_APP_FIREBASE_STORAGE_BUCKET']}',
    messagingSenderId: '${process.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID']}',
    appId: '${process.env['NG_APP_FIREBASE_APP_ID']}'
  },
  apiUrl: 'http://localhost:3000/'
};
`;

try {
  writeFileSync(targetPath, envConfigFile.trim());
  console.log(`✅ Arquivo '${targetPath}' gerado com sucesso!`);
} catch (err) {
  console.error(`❌ Falha ao escrever o arquivo ${targetPath}:`, err);
  process.exit(1);
}
