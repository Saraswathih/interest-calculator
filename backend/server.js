const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// const {
//   S3Client,
//   PutObjectCommand,
//   GetObjectCommand,
// } = require("@aws-sdk/client-s3");

// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const ExcelJS = require("exceljs");
// AWS S3 configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
// app.get("/", (req, res) => {
//   res.send("Interest Calculator Backend is running ✅");
// });
// Export customers and transactions to Excel and upload to S3
app.get("/api/export-data", async (req, res) => {
  try {
    // Load MongoDB models
    const Customer = require("./models/Customer");
    const Transaction = require("./models/Transaction");

    // Get data from MongoDB
    const customers = await Customer.find().lean();
    const transactions = await Transaction.find().lean();

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Interest Calculator";
    workbook.created = new Date();

    // =========================
    // Customers Sheet
    // =========================

    const customerSheet = workbook.addWorksheet("Customers");

    customerSheet.columns = [
      {
        header: "Customer ID",
        key: "_id",
        width: 28,
      },
      {
        header: "Name",
        key: "name",
        width: 25,
      },
      {
        header: "Phone",
        key: "phone",
        width: 18,
      },
      {
        header: "Email",
        key: "email",
        width: 30,
      },
    ];

    customers.forEach((customer) => {
      customerSheet.addRow({
        _id: customer._id?.toString() || "",
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
      });
    });

    // =========================
    // Transactions Sheet
    // =========================

    const transactionSheet =
      workbook.addWorksheet("Transactions");

    transactionSheet.columns = [
      {
        header: "Transaction ID",
        key: "_id",
        width: 28,
      },
      {
        header: "Customer ID",
        key: "customerId",
        width: 28,
      },
      {
        header: "Amount",
        key: "amount",
        width: 18,
      },
      {
        header: "Interest",
        key: "interest",
        width: 18,
      },
      {
        header: "Date",
        key: "date",
        width: 20,
      },
    ];

    transactions.forEach((transaction) => {
      transactionSheet.addRow({
        _id: transaction._id?.toString() || "",
        customerId: transaction.customerId?.toString() || "",
        amount: transaction.amount ?? "",
        interest: transaction.interest ?? "",
        date: transaction.date
          ? new Date(transaction.date)
          : "",
      });
    });

    // =========================
    // Style Excel headers
    // =========================

    [customerSheet, transactionSheet].forEach((sheet) => {
      const headerRow = sheet.getRow(1);

      headerRow.font = {
        bold: true,
      };

      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      headerRow.height = 25;

      sheet.views = [
        {
          state: "frozen",
          ySplit: 1,
        },
      ];

      sheet.autoFilter = {
        from: "A1",
        to: `${String.fromCharCode(
          64 + sheet.columnCount
        )}1`,
      };
    });

    // =========================
    // Generate Excel file
    // =========================

    const excelBuffer = await workbook.xlsx.writeBuffer();

    // Unique S3 filename
    const fileName = `exports/Interest-Calculator-Report-${Date.now()}.xlsx`;

    // =========================
    // Upload Excel to S3
    // =========================

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: excelBuffer,
      ContentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    await s3.send(uploadCommand);

    // =========================
    // Create temporary download URL
    // =========================

    const downloadCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      ResponseContentDisposition:
        `attachment; filename="Interest-Calculator-Report.xlsx"`,
    });

    const downloadUrl = await getSignedUrl(
      s3,
      downloadCommand,
      {
        expiresIn: 300,
      }
    );

    res.json({
      success: true,
      message: "Excel report created and uploaded to Amazon S3",
      fileName,
      downloadUrl,
    });
  } catch (error) {
    console.error("Excel export error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create Excel report",
      error: error.message,
    });
  }
});

// Test AWS S3 connection
app.get("/api/s3-test", async (req, res) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: "test/interest-calculator-test.txt",
      Body:
        "AWS S3 is successfully connected to the Interest Calculator project!",
      ContentType: "text/plain",
    });

    await s3.send(command);

    res.json({
      success: true,
      message: "Successfully uploaded test file to Amazon S3",
      bucket: process.env.AWS_S3_BUCKET,
      file: "test/interest-calculator-test.txt",
    });
  } catch (error) {
    console.error("S3 upload error:", error);

    res.status(500).json({
      success: false,
      message: "S3 upload failed",
      error: error.message,
    });
  }
});

// Export customers and transactions to S3
app.get("/api/export-data", async (req, res) => {
  try {
    // Load MongoDB models
    const Customer = require("./models/Customer");
    const Transaction = require("./models/Transaction");

    // Get data from MongoDB
    const customers = await Customer.find().lean();
    const transactions = await Transaction.find().lean();

    // Create export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      customers,
      transactions,
    };

    // Convert data to JSON
    const jsonData = JSON.stringify(exportData, null, 2);

    // Create unique S3 file name
    const fileName = `exports/interest-data-${Date.now()}.json`;

    // Upload JSON file to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: jsonData,
      ContentType: "application/json",
    });

    await s3.send(uploadCommand);

    // Create temporary download URL
    const downloadCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
    });

    const downloadUrl = await getSignedUrl(s3, downloadCommand, {
      expiresIn: 300,
    });

    res.json({
      success: true,
      message: "Data exported successfully to Amazon S3",
      fileName,
      downloadUrl,
    });
  } catch (error) {
    console.error("Export error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to export data",
      error: error.message,
    });
  }
});

// MongoDB connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/interestCalculator";

console.log(
  "Using MONGO_URI:",
  process.env.MONGO_URI ? "Present" : "Missing"
);

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const customerRoutes = require("./routes/customerRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// Use routes
app.use("/api/customers", customerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/investors", require("./routes/investorRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});