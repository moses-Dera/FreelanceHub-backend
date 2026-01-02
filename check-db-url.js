import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;

console.log("Checking DATABASE_URL...");
if (!url) {
    console.error("ERROR: DATABASE_URL is undefined or empty.");
} else {
    try {
        // Simple manual parsing or Regex to avoid printing the full string
        // postgresql://user:password@host:port/database
        const match = url.match(/^postgres(ql)?:\/\/([^:]+)(:(.+))?@([^/]+)\/(.+)$/);

        if (match) {
            console.log("Structure seems valid.");
            console.log(`Protocol: ${match[1] || 'postgres'}`);
            console.log(`User: ${match[2]}`);
            if (match[4]) {
                console.log(`Password: [PRESENT] (Length: ${match[4].length})`);
                console.log(`Password Type: ${typeof match[4]}`);
            } else {
                console.error("ERROR: Password component is MISSING in the URL.");
            }
            console.log(`Host portion: ${match[5]}`);
            console.log(`Path/DB: ${match[6]}`);
        } else {
            console.error("ERROR: DATABASE_URL does not match standard PostgreSQL connection string format.");
            console.log("First 10 chars:", url.substring(0, 10));
        }
    } catch (e) {
        console.error("Error parsing URL:", e);
    }
}
