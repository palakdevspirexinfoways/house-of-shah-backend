const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a gallery title'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category or issue volume'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL'],
      trim: true,
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

module.exports = mongoose.model('Gallery', gallerySchema);
