const Discord = require("discord.js");
const color = require("../../config").discord.color;

module.exports = {
  name: "ban",
  description: "Bane um membro do servidor.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "member",
      description: "Member to ban.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "Reason for the ban.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.BanMembers
      )
    ) {
      return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser("member");
    const member = interaction.guild.members.cache.get(user.id);
    const reason = interaction.options.getString("reason") || "Not provided";

    const buttons = {
      confirm: new Discord.ButtonBuilder()
        .setCustomId("confirm_ban")
        .setLabel("Confirmar")
        .setStyle(Discord.ButtonStyle.Success),
      cancel: new Discord.ButtonBuilder()
        .setCustomId("cancel_ban")
        .setLabel("Cancelar")
        .setStyle(Discord.ButtonStyle.Danger),
    };

    const row = new Discord.ActionRowBuilder().addComponents([
      buttons.confirm,
      buttons.cancel,
    ]);

    if (!member)
      return interaction.reply({
        content: "❌ Membro não encontrado no servidor.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    if (member.user.id === interaction.user.id)
      return interaction.reply({
        content: "❌ Você não pode se banir.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    if (member.user.id === client.user.id)
      return interaction.reply({
        content: "❌ Você não pode me banir.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    if (!member.bannable)
      return interaction.reply({
        content:
          "❌ Não posso banir este membro. Verifique minha permissão e a hierarquia de cargos.",
        flags: Discord.MessageFlags.Ephemeral,
      });

    const embed = new Discord.EmbedBuilder()
      .setColor(color)
      .setTitle("Confirmação de Banimento")
      .setDescription(
        `> 🔎 Você tem certeza que deseja banir ${member} do servidor?\n\n> 📔 **Reason:** ${reason}`
      );

    const msg = await interaction.reply({ embeds: [embed], components: [row] });

    const filter = (i) =>
      i.user.id === interaction.user.id &&
      (i.customId === "confirm_ban" || i.customId === "cancel_ban");

    const collector = msg.createMessageComponentCollector({
      filter,
      time: 15_000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();

      const embed = new Discord.EmbedBuilder().setColor(cor);

      if (i.customId === "confirm_ban") {
        try {
          await member.ban({ reason: [reason] });

          embed
            .setTitle("Banimento Confirmado")
            .setDescription(
              `> ✅ O membro ${member} foi banido com sucesso!\n\n> 📔 **Reason:** ${reason}`
            );

          interaction.editReply({ embeds: [embed], components: [] });
        } catch (error) {
          embed
            .setColor("Red")
            .setTitle("Erro ao Banir Membro")
            .setDescription(
              `❌ Não foi possível banir o membro ${member}. Verifique minha permissão e a hierarquia de cargos.`
            );
          interaction.editReply({ embeds: [embed], components: [] });
        }
      } else {
        embed
          .setColor("Red")
          .setTitle("Banimento Cancelado")
          .setDescription(
            `> ❌ O banimento do membro ${member} foi cancelado.`
          );
        interaction.editReply({ embeds: [embed], components: [] });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        const embed = new Discord.EmbedBuilder()
          .setColor("Orange")
          .setTitle("Tempo Esgotado")
          .setDescription("⏰ O tempo para confirmar o banimento expirou.");
        interaction.editReply({ embeds: [embed], components: [] });
      }
    });
  },
};
