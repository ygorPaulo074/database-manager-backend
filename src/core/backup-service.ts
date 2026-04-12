import { PrismaClient } from '@prisma/client';
import { DockerManager } from './docker-manager';
import fs from 'fs/promises';
import path from 'path';

export class BackupService {
  constructor(
    private prisma: PrismaClient,
    private dockerManager: DockerManager
  ) {}
  
  // Métodos:
  async createBackup(instanceId: string, customDestination?: string): Promise<{ id: string; filePath: string; size: number }>{

    if (customDestination) {
        const filePath = path.resolve(customDestination);
    } else {
        const backupsDir = path.resolve(__dirname, 'C:/Database_Manager/backups');
        await fs.mkdir(backupsDir, { recursive: true });
        const filePath = path.join(backupsDir, `backup_${instanceId}_${Date.now()}.sql`);
    }
    


    const instance = await this.prisma.instance.findUnique({
    where: { id: instanceId }
    });
    if (!instance) throw new Error('Instance not found');
    if (!instance.containerId) throw new Error('Instance has no container');


  }
  
}