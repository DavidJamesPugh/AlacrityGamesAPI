
const mongoose = require('mongoose');



const dbForNotes = mongoose.connection.useDb('noteApp');

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
})
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
module.exports = dbForNotes.model('Note', noteSchema)