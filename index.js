const {
  Client,
  GatewayIntentBits,
  Events,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

// CREA IL CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// BOT ONLINE
client.once(Events.ClientReady, () => {
  console.log('✅ Bot GTA RP Online');
});

// SLASH COMMAND /menu
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'menu') {

    const menu = new StringSelectMenuBuilder()
      .setCustomId('main_menu')
      .setPlaceholder('Seleziona un’opzione')
      .addOptions([
        {
          label: '📋 Whitelist',
          value: 'whitelist'
        },
        {
          label: '❓ Aiuto',
          value: 'help'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: '🎮 **Menu RP**',
      components: [row],
      ephemeral: true
    });
  }
});

// CLICK MENU
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId !== 'main_menu') return;

  if (interaction.values[0] === 'whitelist') {
    await interaction.reply({
      content: '📋 Sistema whitelist in costruzione',
      ephemeral: true
    });
  }

  if (interaction.values[0] === 'help') {
    await interaction.reply({
      content: '❓ Contatta uno staff per assistenza',
      ephemeral: true
    });
  }
});

// LOGIN BOT
client.login(process.env.TOKEN);
