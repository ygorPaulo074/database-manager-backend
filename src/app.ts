import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import instanceRoutes from './api/routes/instances';

// Configuração do Swagger

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Database Manager API',
      version: '1.0.0',
      description: 'Database Manager API - Gerenciamento de instâncias de banco de dados usando Docker',
    },
  },
  apis: ['./src/api/routes/instances.ts'], // Caminho para os arquivos de rotas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
const app = express();

// Middlewares globais
app.use(helmet());                // segurança
app.use(cors());                  // libera CORS
app.use(morgan('dev'));           // logs no terminal
app.use(express.json());          // parse JSON

// Rota para a documentação do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use('/instances', instanceRoutes);

// Tratamento de erros (deve ser o último middleware)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;