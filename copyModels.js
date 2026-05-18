import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, 'node_modules', '@vladmandic', 'face-api', 'model');
const publicDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.readdirSync(modelsDir).forEach(file => {
  if (
    file.includes('tiny_face_detector') || 
    file.includes('face_landmark_68_net') || 
    file.includes('face_recognition_net')
  ) {
    fs.copyFileSync(path.join(modelsDir, file), path.join(publicDir, file));
    console.log(`Copied ${file}`);
  }
});

console.log('Models copied successfully!');
