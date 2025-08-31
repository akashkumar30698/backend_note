import mongoose from 'mongoose';


const noteSchema = new mongoose.Schema(
{
owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
title: { type: String, required: true },
content: { type: String, default: '' },
tags: [{ type: String }]
},
{ timestamps: true }
);


noteSchema.index({ owner: 1, createdAt: -1 });


export default mongoose.model('Note', noteSchema);