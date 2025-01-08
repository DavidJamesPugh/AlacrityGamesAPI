import mongoose from 'mongoose';

const dbForPhone = mongoose.connection.useDb('phoneBook');

const phoneSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  phone: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator(v) {
        return /\d{2,3}-\d{5,}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
});
phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const objectToReturn = { ...returnedObject }; // Create a new object
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    objectToReturn.id = objectToReturn._id.toString();
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete objectToReturn._id;
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete objectToReturn.__v;
    return objectToReturn;
  },
});
const PhoneNumber = dbForPhone.model('PhoneNumber', phoneSchema);
export default PhoneNumber;
