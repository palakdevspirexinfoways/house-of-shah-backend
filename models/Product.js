const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
    },
    category: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    collection: {
      type: String,
      trim: true,
      default: '',
    },
    homepageHighlight: {
      type: String,
      trim: true,
      default: '',
    },
    dynamicText: {
      type: String,
      trim: true,
      default: '',
    },
    weight: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Product', productSchema);
