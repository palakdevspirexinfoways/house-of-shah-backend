const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    companyName: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Please provide a contact number'],
      trim: true,
    },
    interestedProduct: {
      type: [String],
      required: [true, 'Please provide interested product categories'],
    },
    natureOfBusiness: {
      type: [String],
      required: [true, 'Please provide nature of business'],
    },
    additionalRemarks: {
      type: String,
      trim: true,
    },
    resetPasswordOTP: {
      type: String,
    },
    resetPasswordOTPExpires: {
      type: Date,
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

module.exports = mongoose.model('User', userSchema);
