import express from 'express';
import cors from 'cors';
import routes from './routes/index';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api', routes);

app.use(errorHandler);

export default app;

