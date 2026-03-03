const mongoose = require("mongoose");
require("dotenv").config();
const Investor = require("./models/Investor");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/interestCalculator";

async function run() {
  await mongoose.connect(MONGO_URI);

  const all = await Investor.find();
  if (!all.length) {
    console.log("No investors found");
    process.exit(0);
  }

  // Make dates older so months > 0
  const daysAgoList = [210, 180, 150, 120]; // ~7,6,5,4 months ago

  for (let i = 0; i < all.length; i++) {
    const inv = all[i];
    const daysAgo = daysAgoList[i % daysAgoList.length];
    inv.startDate = new Date(Date.now() - daysAgo * 86400000);
    await inv.save();
  }

  console.log("✅ Investor startDate updated to older dates");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
