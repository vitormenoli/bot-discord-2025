const fs = require("fs").promises;
require("colors");
const Discord = require("discord.js");

/**
 * Handler de Carregamento de Comandos
 *
 * Este handler é responsável por carregar dinamicamente todos os comandos slash
 * do Discord localizados em ./src/commands.
 *
 * @async
 * @param {Discord.Client} client - Instância do cliente Discord.js
 *
 * Fluxo:
 * 1. Lê os diretórios dentro de ./src/commands (admin, utility, etc)
 * 2. Para cada subpasta, lê todos os arquivos .js
 * 3. Importa cada arquivo e valida se contém a propriedade 'name'
 * 4. Armazena os comandos em uma Collection para acesso rápido
 * 5. Registra todos os comandos nos servidores quando o bot estiver pronto
 *
 * Exemplo de estrutura de comando esperada:
 * {
 *   name: "ban",
 *   description: "Bane um membro",
 *   type: Discord.ApplicationCommandType.ChatInput,
 *   options: [...],
 *   run: async (client, interaction) => { }
 * }
 */
async function commandsHandler(client) {
  const slashArray = [];
  let commandsLoaded = [];
  // Collection do Discord.js para armazenar comandos em memória para acesso O(1)
  client.slashCommands = new Discord.Collection();

  try {
    // Lê todos os diretórios dentro de ./src/commands (admin, utility, etc)
    const folders = await fs.readdir("./src/commands");

    // Itera sobre cada subpasta de comandos
    for (const subfolder of folders) {
      // Lê todos os arquivos dentro de cada subpasta
      const files = await fs.readdir(`./src/commands/${subfolder}/`);

      // Processa cada arquivo .js encontrado
      for (const file of files) {
        // Ignora arquivos que não são JavaScript
        if (!file.endsWith(".js")) return;

        // Importa dinamicamente o módulo do comando
        const command = require(`../commands/${subfolder}/${file}`);

        // Valida se o comando possui a propriedade obrigatória 'name'
        if (!command.name) return;

        // Armazena o comando na Collection para acesso rápido
        client.slashCommands.set(command.name, command);
        // Adiciona à lista de comandos para registrar no Discord
        slashArray.push(command);
        // Rastreia o nome do comando para log
        commandsLoaded.push(command.name);
      }
    }

    // Registra todos os comandos slash nos servidores quando o bot estiver pronto
    client.on("clientReady", () => {
      // Define os comandos para cada servidor (guild) que o bot pertence
      client.guilds.cache.forEach((guild) => guild.commands.set(slashArray));
      // Exibe no console os comandos carregados com sucesso
      console.log(`📘 Commands Loaded: [${commandsLoaded.join(", ")}]`.blue);
    });
  } catch (error) {
    // Captura e exibe erros durante o carregamento de comandos
    console.log("Erro ao carregar comandos: ".red, error);
  }
}

module.exports = commandsHandler;
