import { Router, Request, Response } from 'express';
import { InstanceService } from '../../core/instance-service';

const router = Router();
const instanceService = new InstanceService();

// POST /instances - Criar nova instância
/**
 * @swagger
 * /instances:
 *   post:
 *     summary: Criar nova instância de banco de dados
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - engine
 *               - version
 *             properties:
 *               name:
 *                 type: string
 *               engine:
 *                 type: string
 *               version:
 *                 type: string
 *               startAfterCreate:
 *                 type: boolean
 *               port:
 *                 type: integer
 *               envVars:
 *                 type: object
 *     responses:
 *       201:
 *         description: Instância criada com sucesso
 *       400:
 *         description: Erro na criação
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, engine, version, startAfterCreate, port, envVars } = req.body;
        if (!name || !engine || !version) {
            return res.status(400).json({ error: 'Missing required fields: name, engine, version' });
        }
        await instanceService.createInstance(name, engine, version, startAfterCreate, port, envVars);
        res.status(201).json({ message: 'Instance created successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// GET /instances - Listar todas as instâncias
/**
 * @swagger
 * /instances:
 *   get:
 *     summary: Listar todas as instâncias
 *     responses:
 *       200:
 *         description: Lista de instâncias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   engine:
 *                     type: string
 *                   version:
 *                     type: string
 *                   port:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   containerId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Erro interno
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const instances = await instanceService.listInstances();
        res.json(instances);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /instances/:id/start - Iniciar uma instância
/**
 * @swagger
 * /instances/{id}/start:
 *   post:
 *     summary: Iniciar uma instância
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instância iniciada
 *       400:
 *         description: Erro na solicitação
 *       404:
 *         description: Instância não encontrada
 */
router.post('/:id/start', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Instance ID is required' });
    try {
        await instanceService.startInstance(id as string);
        res.json({ message: 'Instance started' });
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
});

// POST /instances/:id/stop - Parar uma instância
/**
 * @swagger
 * /instances/{id}/stop:
 *   post:
 *     summary: Parar uma instância
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instância parada
 *       400:
 *         description: Erro na solicitação
 *       404:
 *         description: Instância não encontrada
 */
router.post('/:id/stop', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Instance ID is required' });
    try {
        await instanceService.stopInstance(id as string);
        res.json({ message: 'Instance stopped' });
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
});

// DELETE /instances/:id - Remover uma instância
/**
 * @swagger
 * /instances/{id}:
 *   delete:
 *     summary: Remover uma instância
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instância removida
 *       400:
 *         description: Erro na solicitação
 *       404:
 *         description: Instância não encontrada
 */
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Instance ID is required' });
    try {
        await instanceService.removeInstance(id as string);
        res.json({ message: 'Instance removed' });
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
});

export default router;

