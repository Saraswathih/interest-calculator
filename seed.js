const mongoose = require("mongoose");
require("dotenv").config();

const Customer = require("./models/Customer");
const Investor = require("./models/Investor");
const Transaction = require("./models/Transaction");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/interestCalculator";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const calcInterest = (amount, rate, months) => (amount * rate * months) / 1200;
const daysAgo = (d) => new Date(Date.now() - d * 86400000);

const customersSeed = [
  { name: "Ramesh", phone: "9876500001", address: "Bengaluru", status: "active" },
  { name: "Arjun", phone: "9876500002", address: "Mysuru", status: "active" },
  { name: "Meera", phone: "9876500003", address: "Mandya", status: "active" },
  { name: "Sita", phone: "9876500004", address: "Tumakuru", status: "active" },
  { name: "Kiran", phone: "9876500005", address: "Hassan", status: "active" },
  { name: "Deeksha", phone: "9876500006", address: "Shivamogga", status: "active" },
  { name: "Tanisha", phone: "9876500007", address: "Hubballi", status: "active" },
  { name: "Shiva", phone: "9876500008", address: "Dharwad", status: "active" },
  { name: "Rohit", phone: "9876500009", address: "Udupi", status: "active" },
  { name: "Jagriti Thakur", phone: "9876500010", address: "Ballari", status: "active" },
  { name: "Suresh Prabha", phone: "9876500011", address: "Belagavi", status: "active" },
  { name: "Prabha", phone: "9876500012", address: "Kalaburagi", status: "active" }
];

const investorsSeed = [
  {
    name: "Shiva",
    phone: "9000000001",
    address: "Bengaluru",
    investedAmount: 100000,
    monthlyReturnRate: 1,
    startDate: daysAgo(210), // ~7 months ago
    status: "active"
  },
  {
    name: "Jagriti Thakur",
    phone: "9000000002",
    address: "Mysuru",
    investedAmount: 150000,
    monthlyReturnRate: 2,
    startDate: daysAgo(240), // ~8 months ago
    status: "active"
  },
  {
    name: "Suresh Prabha",
    phone: "9000000003",
    address: "Hubballi",
    investedAmount: 120000,
    monthlyReturnRate: 1.5,
    startDate: daysAgo(150), // ~5 months ago
    status: "active"
  },
  {
    name: "Rohit",
    phone: "9000000004",
    address: "Udupi",
    investedAmount: 90000,
    monthlyReturnRate: 2,
    startDate: daysAgo(120), // ~4 months ago
    status: "active"
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected:", MONGO_URI);

  await Transaction.deleteMany({});
  await Customer.deleteMany({});
  await Investor.deleteMany({});

  const customers = await Customer.insertMany(customersSeed);
  const investors = await Investor.insertMany(investorsSeed);

  console.log("✅ Customers:", customers.length);
  console.log("✅ Investors:", investors.length);

  const rates = [1, 1.25, 1.5, 2, 2.5];
  const durations = [1, 2, 3, 6, 9, 12];

  const txns = [];

  // We force:
  // - first 6 customers: "Upcoming" dues (loan dates 0–20 days ago)
  // - next 6 customers: "Outstanding" dues (loan dates 45–120 days ago)
  for (let idx = 0; idx < customers.length; idx++) {
    const c = customers[idx];

    const isUpcomingGroup = idx < 6;
    const loanAgeDays = isUpcomingGroup ? rand(0, 20) : rand(45, 120);

    const loansCount = rand(1, 2);

    for (let i = 0; i < loansCount; i++) {
      const amount = rand(12000, 75000);
      const interestRate = pick(rates);
      const durationMonths = pick(durations);
      const startDate = daysAgo(loanAgeDays + rand(0, 10)); // little variation

      const interestAmount = Number(
        calcInterest(amount, interestRate, durationMonths).toFixed(2)
      );
      const totalAmount = Number((amount + interestAmount).toFixed(2));

      // Given (loan out)
      txns.push({
        customerId: c._id,
        type: "Given",
        amount,
        interestRate,
        durationMonths,
        startDate,
        interestAmount,
        totalAmount
      });

      // Repayment chance:
      // Upcoming group -> smaller repayments (still due)
      // Outstanding group -> some paid, some overdue still
      const repayChance = isUpcomingGroup ? 0.5 : 0.75;

      if (Math.random() < repayChance) {
        const repaidPct = isUpcomingGroup ? rand(20, 55) : rand(35, 85);
        const repaid = Math.round((totalAmount * repaidPct) / 100);

        txns.push({
          customerId: c._id,
          type: "Taken",
          amount: repaid,
          interestRate: 0,
          durationMonths: 0,
          startDate: daysAgo(rand(0, 25)), // repayments look recent
          interestAmount: 0,
          totalAmount: repaid
        });
      }
    }
  }

  // Investor transactions (create some real movement)
  for (const inv of investors) {
    // investor gave you money (inflow to your app)
    txns.push({
      investorId: inv._id,
      type: "Given",
      amount: rand(50000, 150000),
      interestRate: 0,
      durationMonths: 0,
      startDate: daysAgo(rand(40, 180)),
      interestAmount: 0,
      totalAmount: 0
    });

    // you paid something back (outflow)
    txns.push({
      investorId: inv._id,
      type: "Taken",
      amount: rand(12000, 45000),
      interestRate: 0,
      durationMonths: 0,
      startDate: daysAgo(rand(5, 30)),
      interestAmount: 0,
      totalAmount: 0
    });
  }

  await Transaction.insertMany(txns);
  console.log("✅ Transactions seeded:", txns.length);

  console.log("🎉 Done! Data will always be fresh because dates are relative.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
