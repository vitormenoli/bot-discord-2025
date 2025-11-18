/**
 * Evento: Ready (Pronto)
 *
 * Este evento é acionado quando o bot termina de se conectar ao Discord
 * e está pronto para receber e responder a eventos.
 *
 * Responsabilidades:
 * - Exibir confirmação visual que o bot está online
 * - Indicar o nome/username do bot
 * - Servir como ponto de verificação que a inicialização foi bem-sucedida
 */

require("colors");

module.exports = {
  name: "ready",
  /**
   * Executa quando o bot está pronto
   *
   * @param {Discord.Client} client - Instância do cliente Discord
   */
  execute: (client) => {
    // Listener para quando o cliente estiver pronto
    // Este evento dispara após o bot ter carregado os comandos e eventos
    client.on("clientReady", () => {
      // Exibe no console uma mensagem verde indicando que o bot está online
      // Com o username do bot para fácil identificação
      console.log(`✅ Estou online em [${client.user.username}]`.green);
    });
  },
};
