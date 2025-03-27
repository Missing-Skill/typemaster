const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with improved options and retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/typing-game",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        keepAlive: true,
        retryWrites: true,
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        heartbeatFrequencyMS: 10000,
        retryReads: true,
        w: "majority",
        readPreference: "primary",
        writeConcern: {
          w: "majority",
          j: true,
          wtimeout: 10000,
        },
      }
    );
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

// Start connection
connectWithRetry();

// Handle MongoDB connection errors
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected. Attempting to reconnect...");
  connectWithRetry();
});

// Define Result Schema
const resultSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true },
  results: {
    wpm: { type: Number, required: true },
    cpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    error: { type: Number, required: true },
    totalTime: { type: Number, required: true },
    totalCharacters: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const Result = mongoose.model("Result", resultSchema);

// Routes with improved error handling
app.post("/api/results", async (req, res) => {
  try {
    console.log("Received POST request with data:", req.body);

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database connection not ready",
        error: "Please try again in a few moments",
      });
    }

    // Validate required fields
    if (!req.body.name || !req.body.usn || !req.body.results) {
      return res.status(400).json({
        message: "Missing required fields",
        error: "name, usn, and results are required",
      });
    }

    const result = new Result(req.body);
    const savedResult = await result.save();
    console.log("Result saved successfully:", savedResult);

    res.status(201).json({
      message: "Result saved successfully",
      result: savedResult,
    });
  } catch (error) {
    console.error("Error saving result:", error);

    // Handle specific MongoDB errors
    if (
      error.name === "MongoNetworkError" ||
      error.name === "MongoTimeoutError"
    ) {
      return res.status(503).json({
        message: "Database connection error",
        error: "Please try again in a few moments",
      });
    }

    res.status(500).json({
      message: "Error saving result",
      error: error.message,
      details: error.errors,
    });
  }
});

app.get("/api/results", async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database connection not ready",
        error: "Please try again in a few moments",
      });
    }

    console.log("Fetching results...");
    const results = await Result.find().sort({ createdAt: -1 });
    console.log(`Found ${results.length} results`);
    res.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);

    // Handle specific MongoDB errors
    if (
      error.name === "MongoNetworkError" ||
      error.name === "MongoTimeoutError"
    ) {
      return res.status(503).json({
        message: "Database connection error",
        error: "Please try again in a few moments",
      });
    }

    res.status(500).json({
      message: "Error fetching results",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
