const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

const Requirement = require("../../models/Requirement");

const firefoxData = require("./seedFirefox");

async function seedFirefoxToDB() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI nerastas .env faile.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("prisijungta prie MongoDB Atlas.");

    let addedCount = 0;
    let updatedCount = 0;

    for (const item of firefoxData) {
      const requirementDoc = {
        reqId: item.featureId,
        nfrType: "Ground-Truth",
        title: item.title,
        description: item.description,
        context: {
          system: "Mozilla Firefox",
          architecture: "Open-source Desktop Browser",
          platform: "Cross-platform (Windows, macOS, Linux)",
        },
        standard: "Mozilla QA Archive / PRD",
        acceptanceCriteria: item.acceptanceCriteria,
        groundTruthScenarios: item.groundTruthScenarios,
      };

      const result = await Requirement.findOneAndUpdate(
        { reqId: item.featureId },
        { $set: requirementDoc },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      if (
        result.createdAt &&
        result.updatedAt &&
        result.createdAt.getTime() === result.updatedAt.getTime()
      ) {
        addedCount++;
      } else {
        updatedCount++;
      }
    }

    console.log(`\nimportas baigtas`);
    console.log(`prideta nauju moduliu: ${addedCount}`);
    console.log(`atnaujinta egzistuojanciu: ${updatedCount}`);
  } catch (error) {
    console.error("klaida ikeliant duomenis:", error);
  } finally {
    mongoose.connection.close();
    console.log("Atsijungta nuo DB");
    process.exit();
  }
}

seedFirefoxToDB();
