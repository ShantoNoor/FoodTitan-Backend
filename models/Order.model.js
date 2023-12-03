import mongoose from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    name: {
      require: true,
      type: String,
    },
    category: {
      require: true,
      type: String,
    },
    price: {
      require: true,
      type: Number,
    },
    buying_quantity: {
      require: true,
      type: Number,
    },
    total_price: {
      require: true,
      type: Number,
    },
    image: {
      require: true,
      type: String,
    },
    origin: {
      require: true,
      type: String,
    },
    description: {
      require: true,
      type: String,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    ordered_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
