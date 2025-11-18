/**
 * Bot Discord 2025 - Arquivo Principal
 *
 * Este arquivo é o ponto de entrada da aplicação. Responsável por:
 * - Inicializar o cliente Discord.js com intents necessários
 * - Carregar handlers de comandos e eventos
 * - Gerenciar interações de slash commands
 * - Tratar erros não capturados
 * - Realizar login do bot
 */

const Discord = require("discord.js");

/**
 * Cria e configura a instância do cliente Discord.js
 *
 * Intents: Definem quais eventos o bot pode receber (filtra eventos não necessários)
 * Partials: Permite recuperar objetos incompletamente carregados (importante para
 *          eventos de reações, mensagens antigas, etc)
 */
const client = new Discord.Client({
  // Intents: Intenções - permissões para receber tipos específicos de eventos
  intents: [
    Discord.IntentsBitField.Flags.DirectMessages, // Mensagens diretas
    Discord.IntentsBitField.Flags.GuildInvites, // Convites de servidor
    Discord.IntentsBitField.Flags.GuildMembers, // Informações de membros
    Discord.IntentsBitField.Flags.GuildPresences, // Status de membros (online/offline)
    Discord.IntentsBitField.Flags.Guilds, // Informações de servidores
    Discord.IntentsBitField.Flags.MessageContent, // Conteúdo de mensagens
    Discord.IntentsBitField.Flags.GuildMessageReactions, // Reações em mensagens
    Discord.IntentsBitField.Flags.GuildEmojisAndStickers, // Emojis e stickers customizados
    Discord.IntentsBitField.Flags.GuildVoiceStates, // Estado de canais de voz
    Discord.IntentsBitField.Flags.GuildMessages, // Mensagens em servidores
  ],
  // Partials: Permite processar objetos incompletos do Discord
  partials: [
    Discord.Partials.User, // Usuários
    Discord.Partials.Message, // Mensagens
    Discord.Partials.Reaction, // Reações
    Discord.Partials.Channel, // Canais
    Discord.Partials.GuildMember, // Membros do servidor
  ],
});

// Carrega o handler de comandos slash
require("./src/handlers/commands")(client);
// Carrega o handler de eventos do bot
require("./src/handlers/events")(client);

/**
 * Event Listener: Quando uma interação é criada (slash commands, botões, modals, etc)
 *
 * Este listener verifica se a interação é um comando slash e, se for,
 * busca o comando na Collection e executa a função 'run'
 */
client.on("interactionCreate", (interaction) => {
  // Verifica se a interação é um comando slash
  if (interaction.type === Discord.InteractionType.ApplicationCommand) {
    // Busca o comando na Collection usando o nome
    const command = client.slashCommands.get(interaction.commandName);

    // Se o comando não existir, envia uma mensagem de erro
    if (!command) {
      interaction.reply({ ephemeral: true, content: "Algo deu errado!" });
    } else {
      // Executa a função 'run' do comando
      command.run(client, interaction);
    }
  }
});

// Carrega as configurações (token, cores, etc)
const config = require("./src/config");

// Realiza o login do bot no Discord usando o token do .env
client.login(config.discord.token);

/**
 * Tratamento de Erros Não Capturados
 *
 * Estes listeners capturam erros que poderiam derrubar a aplicação,
 * permitindo que o bot continue funcionando mesmo com erros inesperados
 */

// Promise rejeitada sem try/catch
process.on("unhandledRejection", (reason, p) => {
  console.error("[ Event Error: unhandledRejection ]", p, "reason:", reason);
});

// Exceção não capturada em código síncrono
process.on("uncaughtException", (err, origin) => {
  console.error("[ Event Error: uncaughtException ]", err, origin);
});

// Monitor de exceções não capturadas (aviso de erro)
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.error("[ Event Error: uncaughtExceptionMonitor ]", err, origin);
});

// Exporta o cliente para uso em outros módulos
module.exports = client;
