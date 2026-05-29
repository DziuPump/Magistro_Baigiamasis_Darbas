const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Requirement = require("../models/Requirement.js");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

async function importAdditionalData() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI nerastas .env faile.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Prisijungta prie MongoDB Atlas.");

    const filesToImport = [
      "nfr_dataset_additional_30.json",
      "nfr_dataset_additional_40.json",
    ];

    let totalImported = 0;

    for (const fileName of filesToImport) {
      const filePath = path.resolve(__dirname, fileName);

      if (!fs.existsSync(filePath)) {
        console.warn(`File not found ${fileName} skip...`);
        continue;
      }

      const rawData = fs.readFileSync(filePath, "utf8");
      const requirements = JSON.parse(rawData);

      const dataWithFlags = requirements.map((req) => ({
        ...req,
        isDeleted: false,
      }));

      await Requirement.insertMany(dataWithFlags);
      totalImported += requirements.length;
      console.log(`Is failo ${fileName} ikelta ${requirements.length} irasu.`);
    }

    console.log(
      `\nImportas baigtas, prideta ${totalImported} nauju reikalavimu.`,
    );
    process.exit(0);
  } catch (error) {
    console.error("klaida importuojant duomenis:", error);
    process.exit(1);
  }
}

importAdditionalData();
