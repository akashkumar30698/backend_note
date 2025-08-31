import mongoose from 'mongoose';


const otpSchema = new mongoose.Schema(
{
email: { type: String, index: true, required: true, lowercase: true, trim: true },
codeHash: { type: String, required: true },
expiresAt: { type: Date, required: true },
attempts: { type: Number, default: 0 },
maxAttempts: { type: Number, default: 5 }
},
{ timestamps: true }
);


// TTL index to auto-clean expired OTP docs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


export default mongoose.model('Otp', otpSchema);