import mongoose from 'mongoose';

const dbForNotes = mongoose.connection.useDb('noteApp');

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 3,
    required: true,
  },
  important: Boolean,
});
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    returnedObject.id = returnedObject._id.toString();
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject._id;
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject.__v;
  },
});

const Note = dbForNotes.model('Note', noteSchema);
export default Note;
