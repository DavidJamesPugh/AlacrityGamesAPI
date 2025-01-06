
const mongoose = require('mongoose');


const dbForPhone = mongoose.connection.useDb('phoneBook');


const phoneSchema = new mongoose.Schema({
    name: String,
    phone: String
});
phoneSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
module.exports = dbForPhone.model('PhoneNumber', phoneSchema)