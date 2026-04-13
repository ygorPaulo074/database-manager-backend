import { PrismaClient } from '@prisma/client';
import { DockerManager } from './docker-manager';
import { InstanceService } from './instance-service';
import fs from 'fs/promises';
import path from 'path';

export class BackupService {
  constructor(
    private instanceService: InstanceService,
    private prisma: PrismaClient,
    private dockerManager: DockerManager
  ) {}

  async createBackup(instanceId: string, customDestination?: string): Promise<{ id: string; filePath: string; size: number }>{

    // Verifica se a instância existe e tem um container associado

    const instance = await this.prisma.instance.findUnique({
    where: { id: instanceId }
    });
    if (!instance) throw new Error('Instance not found');
    if (!instance.containerId) throw new Error('Instance has no container');

    let extension: string;
    let cmd : string[];
    let dumpOutput: string;

    const cred = await this.prisma.instanceCredential.findUnique({
      where: { instanceId }
    });
    if (!cred) throw new Error('Credentials not found for this instance');

    // Define extensão do arquivo e comando de backup com base no tipo de banco de dados
    switch (instance.engine) {
      case 'mysql':
        cmd = ['sh', '-c', `mysqldump -u ${cred.username} --password=${cred.password} --all-databases`];
        try {
            dumpOutput = await this.dockerManager.execInContainer(instance.containerId, cmd);
        } catch (error) {
            console.error("Error executing backup command in container:", error);
            throw new Error('Failed to create backup');
        }
        extension = 'sql';
        break;
      case 'postgresql':
        cmd = ['sh', '-c', `PGPASSWORD=${cred.password} pg_dumpall -U ${cred.username} --clean`];
        try {
            dumpOutput = await this.dockerManager.execInContainer(instance.containerId, cmd);
        } catch (error) {
            console.error("Error executing backup command in container:", error);
            throw new Error('Failed to create backup');
        }
        extension = 'sql';
        break;
        case 'redis':
          cmd = ['sh', '-c', `redis-cli -a ${cred.password} --rdb /tmp/dump.rdb && cat /tmp/dump.rdb`];
          try {
            dumpOutput = await this.dockerManager.execInContainer(instance.containerId, cmd);
          } catch (error) {
            console.error("Error executing backup command in container:", error);
            throw new Error('Failed to create backup');
          }
          extension = 'rdb';
          break;
      default:
        throw new Error('Unsupported database engine');
      }

        // Define o caminho do arquivo de backup

        let filePath: string;
        const creationDate = new Date().toISOString().replace(/[:.]/g, '-');

        if (customDestination) {
            filePath = path.resolve(customDestination);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
        } else {
            const backupsDir = path.resolve('C:\\Database_Manager\\backups');
            filePath = path.join(backupsDir, `backup_${instanceId}_${creationDate}.${extension}`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
        }

        // Salva o backup no sistema de arquivos
        
      await fs.writeFile(filePath, dumpOutput);    
      const size = (await fs.stat(filePath)).size;

      const backupRecord = await this.prisma.backup.create({
        data: {
          instanceId,
          filePath,
          size,
        },
      });

      return {
        id: backupRecord.id,
        filePath,
        size,
          };    
        }

    async listBackups(instanceId: string): Promise<{ id: string; filePath: string; size: number, createdAt: Date }[]> {
        const backups = await this.prisma.backup.findMany({
            where: { instanceId },
            orderBy: { createdAt: 'desc' }
        });

        return backups
            .filter(backup => backup.size !== null)
            .map(backup => ({
                id: backup.id,
                filePath: backup.filePath,
                size: backup.size as number,
                createdAt: backup.createdAt,
            }));

      }

    async deleteBackup(backupId: string): Promise<void> {
        const backup = await this.prisma.backup.findUnique({
            where: { id: backupId }
        });
        if (!backup) throw new Error('Backup not found');
        try {
            await fs.unlink(backup.filePath);
        } catch (error) {
            console.error("Error deleting backup file:", error);
        }
        await this.prisma.backup.delete({
            where: { id: backupId }
         });
    }
}
