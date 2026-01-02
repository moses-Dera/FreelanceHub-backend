import { execSync } from 'child_process';
import process from 'process';
import fs from 'fs';

const env = {
    ...process.env,
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db"
};

try {
    console.log('Running prisma generate...');
    const output = execSync('npx prisma generate', { env, encoding: 'utf-8' });
    fs.writeFileSync('gen.log', output);
    console.log('Generation success!');
} catch (error) {
    console.error('Generation failed');
    const log = `STDOUT:\n${error.stdout}\n\nSTDERR:\n${error.stderr}\n\nMESSAGE:\n${error.message}`;
    fs.writeFileSync('gen.log', log);
    process.exit(1);
}
