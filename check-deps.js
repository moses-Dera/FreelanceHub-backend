import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit'; // Try default import
// import { rateLimit } from 'express-rate-limit'; // Alternative if default fails

console.log('Helmet:', typeof helmet);
console.log('RateLimit:', typeof rateLimit);

if (typeof helmet === 'function' && typeof rateLimit === 'function') {
    console.log('Imports successful and are functions');
} else {
    console.log('Imports failed or incorrect types');
}
