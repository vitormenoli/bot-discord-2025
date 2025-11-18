const fs = require("fs");
const path = require("path");

function listFiles(dir, fileList, parentFolder, eventsObject, client) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      listFiles(filePath, fileList, file, eventsObject, client);
    } else if (file.endsWith(".js")) {
      const eventModule = require(filePath);
      const eventName = eventModule.name;

      fileList.push(`${parentFolder}/${file}`);

      if (typeof eventModule.execute === "function") {
        eventModule.execute(client);
      }

      if (!eventsObject[parentFolder]) eventsObject[parentFolder] = [];
      eventsObject[parentFolder].push(eventName);
    }
  });
}

function eventsHandler(client) {
  const eventsPath = path.resolve("./src/events");
  let eventNames = [];
  const eventsObject = {};

  listFiles(eventsPath, eventNames, "Events", eventsObject, client);

  const loadedEvents = [];

  for (let parentFolder in eventsObject) {
    loadedEvents.push(
      `[${parentFolder}: ${eventsObject[parentFolder].join(", ")}]`
    );
  }

  console.log(`📁 Events Loaded: ${loadedEvents.join(" - ")}`.yellow);
}

module.exports = eventsHandler;
