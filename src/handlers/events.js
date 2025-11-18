const fs = require("fs");
const path = require("path");

/**
 * Função Recursiva para Listar e Carregar Eventos
 *
 * Percorre recursivamente o diretório de eventos, carregando todos os arquivos .js
 * encontrados e suas subpastas. Cada arquivo de evento é importado e executado.
 *
 * @param {string} dir - Diretório a ser lido
 * @param {string[]} fileList - Array que armazena os caminhos dos arquivos processados
 * @param {string} parentFolder - Nome da pasta pai (usado para organizar eventos por categoria)
 * @param {Object} eventsObject - Objeto que agrupa eventos por sua pasta pai
 * @param {Discord.Client} client - Instância do cliente Discord.js
 *
 * Exemplo de estrutura de evento esperada:
 * {
 *   name: "memberJoin",
 *   execute: (client) => { ... }
 * }
 */
function listFiles(dir, fileList, parentFolder, eventsObject, client) {
  // Lê todos os arquivos e pastas do diretório
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    // Verifica se é um diretório e aplica recursão
    if (fs.statSync(filePath).isDirectory()) {
      // Chama recursivamente para processar subpastas
      listFiles(filePath, fileList, file, eventsObject, client);
    } else if (file.endsWith(".js")) {
      // Importa dinamicamente o módulo do evento
      const eventModule = require(filePath);
      const eventName = eventModule.name;

      // Rastreia o arquivo processado
      fileList.push(`${parentFolder}/${file}`);

      // Executa o evento se ele tiver a função 'execute'
      if (typeof eventModule.execute === "function") {
        eventModule.execute(client);
      }

      // Agrupa eventos por sua pasta pai para organização
      if (!eventsObject[parentFolder]) eventsObject[parentFolder] = [];
      eventsObject[parentFolder].push(eventName);
    }
  });
}

/**
 * Handler de Carregamento de Eventos
 *
 * Carrega recursivamente todos os eventos localizados em ./src/events.
 * Os eventos são organizados em subpastas (ex: autorole, logs, online) para melhor
 * organização e manutenção do código.
 *
 * @param {Discord.Client} client - Instância do cliente Discord.js
 *
 * Fluxo:
 * 1. Define o caminho para a pasta de eventos
 * 2. Chama listFiles para percorrer recursivamente
 * 3. Agrupa eventos por suas categorias (pasta pai)
 * 4. Exibe no console os eventos carregados com sucesso
 */
function eventsHandler(client) {
  // Caminho absoluto para a pasta de eventos
  const eventsPath = path.resolve("./src/events");
  let eventNames = [];
  // Objeto para agrupar eventos por sua pasta pai (categoria)
  const eventsObject = {};

  // Executa a função recursiva para carregar eventos
  listFiles(eventsPath, eventNames, "Events", eventsObject, client);

  // Prepara array com os eventos carregados por categoria
  const loadedEvents = [];

  // Formata a saída para exibir eventos por categoria
  for (let parentFolder in eventsObject) {
    loadedEvents.push(
      `[${parentFolder}: ${eventsObject[parentFolder].join(", ")}]`
    );
  }

  // Exibe no console os eventos carregados com sucesso
  console.log(`📁 Events Loaded: ${loadedEvents.join(" - ")}`.yellow);
}

module.exports = eventsHandler;
