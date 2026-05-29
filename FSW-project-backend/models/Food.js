import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    price: Number,
    category: String,
    image: String,
    availability: {
      type: Boolean,
      default: true,
    },
    calories: Number,
    ingredients: [String],
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    ratings: Number,
    reviews: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Food', foodSchema);
