const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data.json'));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online come ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'menu') {

      const member = interaction.member;
      const roles = member.roles.cache;

      const isStaff =
        roles.has(data.roles.helper) ||
        roles.has(data.roles.mod) ||
        roles.has(data.roles.admin);

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('player_info')
          .setLabel('📄 Info Server')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('player_ticket')
          .setLabel('📬 Ticket')
          .setStyle(ButtonStyle.Secondary)
      );

      if (isStaff) {
        buttons.addComponents(
          new ButtonBuilder()
            .setCustomId('staff_panel')
            .setLabel('🛡️ Pannello Staff')
            .setStyle(ButtonStyle.Danger)
        );
      }

      await interaction.reply({
        content: '📋 **Menu principale**',
        components: [buttons],
        ephemeral: true
      });
    }
  }

  // CLICK BUTTON
  if (interaction.isButton()) {

    if (interaction.customId === 'player_info') {
      return interaction.reply({
        content: '📄 Info server in arrivo...',
        ephemeral: true
      });
    }

    if (interaction.customId === 'player_ticket') {
      return interaction.reply({
        content: '📬 Sistema ticket in arrivo...',
        ephemeral: true
      });
    }

    if (interaction.customId === 'staff_panel') {
      return interaction.reply({
        content: '🛡️ **Pannello staff** (in sviluppo)',
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
