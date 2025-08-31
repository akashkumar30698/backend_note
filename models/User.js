import mongoose from 'mongoose';


const userSchema = new mongoose.Schema(
{
email: { type: String, unique: true, required: true, lowercase: true, trim: true },
name: { type: String, trim: true },
// Token version to invalidate refresh tokens on logout-all
tokenVersion: { type: Number, default: 0 }
},
{ timestamps: true }
);


export default mongoose.model('User', userSchema);