import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.model.js";
import Food from "./models/Food.model.js";
import Order from "./models/Order.model.js";

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
    const { search, page, ...query } = req.query;

    if (search !== "") {
      query.name = { $regex: new RegExp(search, "i") };
    }

    const result = await Promise.all([
      Food.find(query)
        .skip(9 * (page - 1))
        .limit(9)
        .populate("created_by"),
      Food.countDocuments(query),
    ]);

    return res.send(result);
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

app.delete("/foods/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const result = await Food.deleteOne({ _id: _id });
    return res.status(200).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.get("/orders", async (req, res) => {
  try {
    return res.send(await Order.find(req.query).populate("created_by"));
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.post("/orders", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = new Order(req.body);
    const food = (await Food.find({ _id: req.body.food_id }))[0];
    food.quantity = food.quantity - req.body.buying_quantity;
    food.order_count = food.order_count + 1;

    const result = await Promise.all([order.save(), food.save()]);
    await session.commitTransaction();

    return res.status(201).send(result);
  } catch (err) {
    await session.abortTransaction();
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  } finally {
    session.endSession();
  }
});

app.delete("/orders/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const result = await Order.deleteOne({ _id: _id });
    return res.status(200).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.get("/home", async (req, res) => {
  try {
    const top_food = await Food.find().sort({ order_count: -1 }).limit(6);
    const images = await Food.aggregate([
      { $sample: { size: 12 } },
      { $project: { image: 1 } },
    ]);
    const total_food_items = await Food.countDocuments();
    const registered = await User.countDocuments();

    return res
      .status(200)
      .send({ top_food, images, total_food_items, registered });
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
