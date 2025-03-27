const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with improved options
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/typing-game", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Timeout after 30s instead of 10s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    connectTimeoutMS: 30000,
    keepAlive: true,
    retryWrites: true,
  })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1); // Exit if cannot connect to database
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
    res.status(500).json({
      message: "Error saving result",
      error: error.message,
      details: error.errors, // Include validation errors if any
    });
  }
});

app.get("/api/results", async (req, res) => {
  try {
    console.log("Fetching results...");
    const results = await Result.find().sort({ createdAt: -1 });
    console.log(`Found ${results.length} results`);
    res.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
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
