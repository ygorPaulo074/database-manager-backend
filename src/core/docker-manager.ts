import Docker from "dockerode";
import { Container } from "dockerode";

interface CreateContainerOptions {
  image: string; // Imagem do Docker a ser usada
  name: string; // Nome do container
  portBindings?: Record<string, [{ HostPort: string }]>; // Para mapear portas
  env?: string[]; // Variáveis de ambiente
  binds?: string[]; // Para montar volumes
}

// Classe para gerenciar os containers Docker
export class DockerManager {
    private docker: Docker;
    constructor() {
        this.docker = new Docker();
    }
        
    // Função para criar um container
    async createContainer(options: CreateContainerOptions): Promise<Container> {
        try {
        const { image, name, portBindings, env, binds } = options;
        const container = await this.docker.createContainer({
            Image: image,
            name: name,
            Env: env,
            
            // Configura as portas expostas com base nas bindings fornecidas
            // Se portBindings for fornecido, mapeia as portas expostas; caso contrário, não expõe nenhuma porta
            ExposedPorts: portBindings ? Object.keys(portBindings).reduce((acc, portProto) => {
                acc[portProto] = {};
                return acc;
                }, 
                {} as Record<string, {}>): undefined,

            HostConfig: {
            PortBindings: portBindings,
            Binds: binds,
            },
        });
        return container;
        
    } catch (error) {
        console.error("Error creating container:", error);
        throw error;
    }
}

    // Função para listar os containers
    async listContainers(): Promise<Container[]> {
        try {
            const containers = await this.docker.listContainers({ all: true });
            return containers.map(containerInfo => this.docker.getContainer(containerInfo.Id));
        } catch (error) {
            console.error("Error listing containers:", error);
            throw error;
        }
    }

    // Função para iniciar um container
    async startContainer(containerId: string): Promise<void> {
        try {
            const container = this.docker.getContainer(containerId);
            await container.start();
        } catch (error) {
            console.error("Error starting container:", error);
            throw error;
        }
    }

    // Função para parar um container
    async stopContainer(containerId: string): Promise<void> {
        try {
            const container = this.docker.getContainer(containerId);
            await container.stop();
        } catch (error) {
            console.error("Error stopping container:", error);
            throw error;
        }
    }

    // Função para remover um container
    async removeContainer(containerId: string): Promise<void> {
        try {
            const container = this.docker.getContainer(containerId);
            await container.remove({ force: true });
        } catch (error) {
            console.error("Error removing container:", error);
            throw error;
        }
    }

    // Função para obter os logs de um container
    async getContainerLogs(containerId: string): Promise<string> {
        try {
            const container = this.docker.getContainer(containerId);
            const logs = await container.logs({ stdout: true, stderr: true });
            return logs.toString();
        } catch (error) {
            console.error("Error getting container logs:", error);
            throw error;
        }
    }
}

export default DockerManager;
export type { CreateContainerOptions };

