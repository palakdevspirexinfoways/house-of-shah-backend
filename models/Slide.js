const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema(
  {
    tagline: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    desc: {
      type: String,
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

module.exports = mongoose.model('Slide', slideSchema);
