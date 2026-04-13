import { rejects } from "assert";
import Docker from "dockerode";
import { Container } from "dockerode";
import Stream from "stream";

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

    // Função para executar métodos nos containers do Docker
/**
 * Executa um comando dentro de um container e retorna a saída padrão (stdout).
 * @param containerId ID do container Docker
 * @param cmd Comando e argumentos (ex: ['pg_dump', '--version'])
 * @returns Promise com a saída do comando (stdout)
 * @throws Se o comando falhar (código de saída != 0) com a mensagem de erro (stderr)
 */
    async execInContainer(containerId: string, cmd: string[]): Promise<string> {
    const container = this.docker.getContainer(containerId);

    // Cria a instância de exec
    const exec = await container.exec({
        Cmd: cmd,
        AttachStdout: true,
        AttachStderr: true,
    });

    return new Promise((resolve, reject) => {
        exec.start({}, (err, stream) => {
        if (err) return reject(err);
        if (!stream) return reject(new Error('No stream returned from exec.start'));

        let stdout = '';
        let stderr = '';

        stream.on('data', (chunk: Buffer) => {
            let offset = 0;
            while (offset < chunk.length) {
            const streamType = chunk[offset]; // 1 = stdout, 2 = stderr
            const size = chunk.readUInt32BE(offset + 4);
            const data = chunk.slice(offset + 8, offset + 8 + size).toString('utf8');
            if (streamType === 1) {
                stdout += data;
            } else if (streamType === 2) {
                stderr += data;
            }
            offset += 8 + size;
            }
        });

        stream.on('end', () => {
            if (stderr) {
            reject(new Error(stderr));
            } else {
            resolve(stdout);
            }
        });

        stream.on('error', reject);
        });
        setTimeout(() => {
            reject(new Error('Command execution timed out'));
        }, 30000); // Timeout de 30 segundos
    });
    }
    
}

export default DockerManager;
export type { CreateContainerOptions };

