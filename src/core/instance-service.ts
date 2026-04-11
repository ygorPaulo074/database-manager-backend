import { PrismaClient } from '@prisma/client'
import DockerManager from "./docker-manager";
import net from "net";
import { CreateContainerOptions } from './docker-manager';

export class InstanceService {
    private dockerManager: DockerManager;
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
        this.dockerManager = new DockerManager();
    }

    // Função para criar uma nova instância de banco de dados
    async createInstance(name: string, engine: string, version: string, startAfterCreate: boolean, port?: string, envVars?: string[]): Promise<void> {
        const existing = await this.prisma.instance.findUnique({
            where: { name }
        });
        if (existing) {
            throw new Error(`Instance with name "${name}" already exists.`);
        }

        let containerId: string | undefined;
        let instanceId: string | undefined;

        try {
            // Verifica se a porta está disponível
            if (port) {
                const portNum = parseInt(port, 10);
                await this.isInstancePortAvailable(portNum); // Verifica se a porta já está atribuída a outra instância
                const isAvailable = await this.isPortAvailable(portNum); // Verifica se a porta está disponível localmente
                if (!isAvailable) {
                    throw new Error(`Port ${port} is already in use.`);
                }}
       
            const containerOptions: CreateContainerOptions = {
            image: `${engine}:${version}`,
            name: name,
            env: envVars ?? [],
            ...(port && { portBindings: { [`${port}/tcp`]: [{ HostPort: port }] } })
            };

            const container = await this.dockerManager.createContainer(containerOptions);
            containerId = container.id; // Atribui o ID do container criado ao objeto de opções
            instanceId = await this.insertInstanceMetadata(name, engine, version, port, containerId);

            if (startAfterCreate) {
                    await this.startInstance(instanceId);
                /* Aqui, o método startInstance automaticamente cria o container
                e atualiza o status para "running" no banco de dados, então só é necessário 
                chamar startInstance.*/
            }
        
        } catch (error) {
            console.error("Error during instance creation:", error);

            // Rollback: remove container
            if (containerId) {
                await this.dockerManager.removeContainer(containerId).catch(e => console.error(e));
            }

            // Rollback: remove registro do banco (se foi criado)
            if (instanceId) {
                await this.prisma.instance.delete({ where: { id: instanceId } }).catch(e => console.error(e));
            }
            throw error;
        }
    }        
    // Função para iniciar uma instância de banco de dados
    async startInstance(instanceId: string): Promise<void> {
        const instance = await this.getInstanceById(instanceId);
        try {
            await this.dockerManager.startContainer(instance.containerId!);
            await this.prisma.instance.update({
                where: { id: instanceId },
                data: { status: 'running' }
            });
        } catch (error) {
            console.error("Error starting instance:", error);
            await this.prisma.instance.update({
                where: { id: instanceId },
                data: { status: 'error' }
            });
            throw error;
        }
    }

    // Função para parar uma instância de banco de dados    
    async stopInstance(instanceId: string): Promise<void> {
        const instance = await this.getInstanceById(instanceId);
        try {
            await this.dockerManager.stopContainer(instance.containerId!);
            await this.prisma.instance.update({
                where: { id: instanceId },
                data: { status: 'stopped' }
            });
        } catch (error) {
            console.error("Error stopping instance:", error);
            await this.prisma.instance.update({
                where: { id: instanceId },
                data: { status: 'error' }
            });
            throw error;
        }
    }    

    // Função para remover uma instância de banco de dados
    async removeInstance(instanceId: string): Promise<void> {
        const instance = await this.getInstanceById(instanceId);
        try {
            await this.dockerManager.removeContainer(instance.containerId!);
            await this.prisma.instance.delete({
                where: { id: instanceId }
             });
        }
        catch (error) {
            console.error("Error removing instance:", error);
            throw error;
        }
    }

    // Função para listar todas as instâncias de banco de dados
    async listInstances(): Promise<any[]> {
        try {
            const instances = await this.prisma.instance.findMany();
            return instances.map(instance => ({
                id: instance.id,
                name: instance.name,
                engine: instance.engine,
                version: instance.version,
                port: instance.port,
                status: instance.status,
                createdAt: instance.createdAt,
            }));
        } catch (error) {
            console.error("Error listing instances:", error);
            throw error;
        }
    }

        // --- HELPER FUNCTIONS ---

    // Função para verificar se uma instância existe e obter seus detalhes

    private async getInstanceById(instanceId: string) {
        const instance = await this.prisma.instance.findUnique({
            where: { id: instanceId }
         });
        if (!instance) {
            throw new Error(`Instance with ID "${instanceId}" not found.`);
        }
        if (!instance.containerId) {
            throw new Error(`Instance with ID "${instanceId}" does not have an associated container.`);
        }
        if (instance.status === 'error') {
            throw new Error(`Instance with ID "${instanceId}" is in an error state.`);
        }

        return instance;
    }  

    // Função para verificar se uma porta está disponível localmente
    private async isPortAvailable(port: number): Promise<boolean> {

        return new Promise((resolve) => {

            // Verificação Local
            console.log(`Checking local availability of port ${port}...`);

            const server = net.createServer();
            server.once('error', () => {
                resolve(false); // Porta está em uso
                console.error(`Port ${port} is already in use locally.`);
            });
            server.once('listening', () => {
                server.close();
                resolve(true); // Porta está disponível
                console.log(`Port ${port} is available locally.`);
            });
            server.listen(port);

        });
    }

    // Função para verificar disponibilidade de uma porta para uma instância
    private async isInstancePortAvailable(port: number): Promise<void> {
        const existing = await this.prisma.instance.findFirst({
            where: { port: port }
        });
        if (existing) {
            throw new Error(`Port ${port} is already assigned to instance "${existing.name}".`);
        }
    }
    
    // Função para inserir metadados da instância no banco de dados
    private async insertInstanceMetadata(name: string, engine: string, version: string, port?: string, containerId?: string): Promise<string> {
        try {
        const newInstance = await this.prisma.instance.create({
            data: {
            name,
            engine,
            version,
            port: port ? parseInt(port, 10) : null,
            status: "stopped", // Status será atualizado quando o container for iniciado
            containerId: containerId ?? null, // Container ID será preenchido quando o container for criado
            },    
        });

            return newInstance.id;

        } catch (error) {
            console.error("Error inserting instance metadata:", error);
            throw error;
        }
    } 

}

export default InstanceService;
