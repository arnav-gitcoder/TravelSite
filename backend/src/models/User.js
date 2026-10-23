import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password: { type: String, required: true, minlength: 6, select: false },
    role:  { type: String, enum: ['customer'], default: 'customer' },
    avatar: String,
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcryptjs.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);