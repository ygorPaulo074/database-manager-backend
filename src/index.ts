import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Endpoints:`);
    console.log(`POST   /instances           - Criar nova instância de banco de dados`);
    console.log(`GET    /instances           - Listar todas as instâncias de banco de dados`);
    console.log(`POST   /instances/:id/start - Iniciar uma instância de banco de dados`);
    console.log(`POST   /instances/:id/stop  - Parar uma instância de banco de dados`);
    console.log(`DELETE /instances/:id       - Remover uma instância de banco de dados`);
    console.log(``)
});
