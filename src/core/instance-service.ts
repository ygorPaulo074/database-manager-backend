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
    async createInstance(name: string, engine: string, version: string, port?: string, env?: string): Promise<void> {
        try {
            // Verifica se a porta está disponível
            if (port) {
                const portNum = parseInt(port, 10);
                const isAvailable = await this.isPortAvailable(portNum);
                if (!isAvailable) {
                    throw new Error(`Port ${port} is already in use.`);
                }}  
        } catch (error) {
            console.error("Error creating instance:", error);
            throw error;
        }
        const containerOptions: CreateContainerOptions = {
            image: `${engine}:${version}`,
            name: name,
            HostConfig: {
             ...(port && { 
                PortBindings: { [`${port}/tcp`]: [{ HostPort: port }] },
                }),
            },
            env: env ? [env] : undefined,
        };
        await this.dockerManager.createContainer(containerOptions);
        
}        
    // Função para iniciar uma instância de banco de dados

    // Função para parar uma instância de banco de dados

    // Função para remover uma instância de banco de dados

    // Função para listar todas as instâncias de banco de dados

    // Função para verificar se uma porta está disponível
    async isPortAvailable(port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.once('error', () => {
                resolve(false); // Porta está em uso
            });
            server.once('listening', () => {
                server.close();
                resolve(true); // Porta está disponível
            });
            server.listen(port);
        });
    }
}

export default InstanceService;
