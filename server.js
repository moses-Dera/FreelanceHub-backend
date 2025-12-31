import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import contractRoutes from './routes/contractRoutes.js';

dotenv.config();

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', proposalRoutes);
app.use('/api/contracts', contractRoutes);


if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
