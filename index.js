import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.model.js";
import Food from "./models/Food.model.js";

config({
  path: ".env.local",
});

const app = express();

// eslint-disable-next-line no-undef
const port = process.env.port || 3000;

// eslint-disable-next-line no-undef
mongoose.connect(process.env.DB_URI);

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  return res.send("FoodTitan server is Running");
});

app.get("/users", async (req, res) => {
  try {
    return res.send(await User.find(req.query));
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    return res.status(201).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(409).send("User already exists");
    }
  }
});

app.get("/foods", async (req, res) => {
  try {
    return res.send(await Food.find(req.query).populate("created_by"));
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.post("/foods", async (req, res) => {
  try {
    const food = new Food(req.body);
    const result = await food.save();
    return res.status(201).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.put("/foods/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const result = await Food.updateOne(
      { _id: _id },
      { $set: { ...req.body } }
    );
    return res.status(200).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
