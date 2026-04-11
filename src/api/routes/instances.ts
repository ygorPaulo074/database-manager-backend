import { Router, Request, Response } from 'express';
import { InstanceService } from '../../core/instance-service';

const router = Router();
const instanceService = new InstanceService();

// POST /instances - Criar nova instância
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, engine, version, startAfterCreate, port, envVars } = req.body;
    // Validação básica
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
router.get('/', async (req: Request, res: Response) => {
  try {
    const instances = await instanceService.listInstances();
    res.json(instances);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /instances/:id/start
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

// POST /instances/:id/stop
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

// DELETE /instances/:id
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