const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Schema definition
const passwordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Social', 'Work', 'Banking', 'Other'], // Predefined categories
      default: 'Other',
    },
    name: { type: String, required: true }, // e.g., "Google", "LinkedIn"
    username: { type: String, required: true }, // e.g., "user@example.com"
    password: { type: String, required: true }, // Encrypted
    notes: { type: String }, // Optional notes about the credential
    tags: { type: [String] }, // Tags for organization or searching
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Encrypt password before saving
passwordSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Decrypt password for use (optional, if needed)
passwordSchema.methods.decryptPassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// Static method to create a new password record
passwordSchema.statics.createPassword = async function (passwordData) {
  try {
    const record = new this(passwordData);
    return await record.save();
  } catch (err) {
    throw new Error(err.message);
  }
};

// Static method to get all passwords for a user
passwordSchema.statics.getPasswordsByUser = async function (userId) {
  try {
    return await this.find({ userId }).select('-password');
  } catch (err) {
    throw new Error(err.message);
  }
};

// Static method to get a single password (with decryption option)
passwordSchema.statics.getPassword = async function (id) {
  try {
    const passwordRecord = await this.findById(id);
    if (!passwordRecord) throw new Error('Password record not found');
    return passwordRecord;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Static method to edit a password record
passwordSchema.statics.editPassword = async function (id, updateData) {
  try {
    const updatedRecord = await this.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedRecord) throw new Error('Password record not found');
    return updatedRecord;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Static method to delete a password record
passwordSchema.statics.deletePassword = async function (id) {
  try {
    const deletedRecord = await this.findByIdAndDelete(id);
    if (!deletedRecord) throw new Error('Password record not found');
    return deletedRecord;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Export the model
module.exports = mongoose.model('Password', passwordSchema);
