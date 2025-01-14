import Note from '../models/note.js';

const initNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
];

const nonExistingId = async () => {
  const note = new Note({ content: 'willremovethissoon' });
  await note.save();
  await note.deleteOne();

  // eslint-disable-next-line no-underscore-dangle
  return note._id.toString();
};

const notesInDB = async () => {
  const notes = await Note.find({});
  return notes.map((note) => note.toJSON());
};

const Helper = {
  initNotes,
  nonExistingId,
  notesInDB,
};

export { Helper };
