// Vercel build: writes client/env.js from BACKEND_URL and copies shared config next to the client.
import fs from 'fs';
fs.mkdirSync('client/shared',{recursive:true});
fs.copyFileSync('shared/config.js','client/shared/config.js');
fs.writeFileSync('client/env.js',`window.BACKEND_URL=${JSON.stringify(process.env.BACKEND_URL||'')};\n`);
console.log('built; BACKEND_URL =',process.env.BACKEND_URL||'(same origin)');
