import { Router } from 'express';
import Note from '../models/Note.js';
import { authRequired } from '../middlewares/auth.js';

const router = Router();

router.use(authRequired);

router.get('/', async (req, res) => {
  const notes = await Note.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  res.json({ notes });
});

router.post('/', async (req, res) => {
  const { title, content, tags } = req.body || {};
  if (!title) return res.status(400).json({ message: 'Title required' });
  const note = await Note.create({ owner: req.user.userId, title, content, tags });
  res.json(note);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const note = await Note.findOne({ _id: id, owner: req.user.userId });
  if (!note) return res.status(404).json({ message: 'Note not found' });

  const { title, content, tags } = req.body || {};
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (tags !== undefined) note.tags = tags;

  await note.save();
  res.json(note);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const note = await Note.findOneAndDelete({ _id: id, owner: req.user.userId });
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json({ message: 'Deleted', note });
});

export default router;
