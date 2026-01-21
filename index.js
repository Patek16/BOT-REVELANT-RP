const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  PermissionFlagsBits
} = require("discord.js");
const fs = require("fs");

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== DATABASE =====
const dbPath = "./data.json";
let db = {
  regolamento: "Regolamento non impostato.",
  profili: {},
  economia: {}
};

if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath));
}

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ===== SLASH COMMANDS =====
const commands = [
  new SlashCommandBuilder()
    .setName("regolamento")
    .setDescription("Gestione regolamento")
    .addSubcommand(s =>
      s.setName("mostra").setDescription("Mostra regolamento")
    )
    .addSubcommand(s =>
      s.setName("modifica")
        .setDescription("Modifica regolamento")
        .addStringOption(o =>
          o.setName("testo").setDescription("Nuovo regolamento").setRequired(true)
        )
    ),

  new SlashCommandBuilder()
    .setName("profilo")
    .setDescription("Profilo RP")
    .addSubcommand(s =>
      s.setName("crea")
        .addStringOption(o => o.setName("nome").setRequired(true))
        .addStringOption(o => o.setName("eta").setRequired(true))
        .addStringOption(o => o.setName("lavoro").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("mostra")
        .addUserOption(o => o.setName("utente"))
    ),

  new SlashCommandBuilder()
    .setName("eco")
    .setDescription("Economia")
    .addSubcommand(s =>
      s.setName("balance")
        .addUserOption(o => o.setName("utente"))
    )
].map(c => c.toJSON());

// ===== REGISTER COMMANDS =====
client.once("clientReady", async () => {
  console.log(`✅ Bot online come ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);
  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );
});

// ===== INTERACTIONS =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // REGOLAMENTO
  if (interaction.commandName === "regolamento") {
    if (interaction.options.getSubcommand() === "mostra") {
      return interaction.reply(db.regolamento);
    }

    if (interaction.options.getSubcommand() === "modifica") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "❌ Solo admin", ephemeral: true });
      }
      db.regolamento = interaction.options.getString("testo");
      saveDB();
      return interaction.reply("✅ Regolamento aggiornato");
    }
  }

  // PROFILO
  if (interaction.commandName === "profilo") {
    if (interaction.options.getSubcommand() === "crea") {
      db.profili[interaction.user.id] = {
        nome: interaction.options.getString("nome"),
        eta: interaction.options.getString("eta"),
        lavoro: interaction.options.getString("lavoro")
      };
      saveDB();
      return interaction.reply("✅ Profilo creato");
    }

    if (interaction.options.getSubcommand() === "mostra") {
      const user = interaction.options.getUser("utente") || interaction.user;
      const p = db.profili[user.id];
      if (!p) return interaction.reply("❌ Profilo non trovato");
      return interaction.reply(
        `👤 **${p.nome}**\n🎂 ${p.eta}\n💼 ${p.lavoro}`
      );
    }
  }

  // ECONOMIA
  if (interaction.commandName === "eco") {
    const user = interaction.options.getUser("utente") || interaction.user;
    db.economia[user.id] ??= 0;
    return interaction.reply(`💰 Saldo: ${db.economia[user.id]}`);
  }
});

client.login(TOKEN);
