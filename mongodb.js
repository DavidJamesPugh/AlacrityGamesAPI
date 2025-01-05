const mongoose = require('mongoose');

let entryName;
let phoneNumber;

const args = process.argv;
if (args.length === 5) {
     entryName = args[3];
     phoneNumber = args[4];
}
else if (args.length > 3 || args.length < 3) {
    console.log('Missing information detected')
    process.exit(1)

}

const password = args[2];

const url = `mongodb+srv://fullstack:${password}@introcluster.reblv6x.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=IntroCluster`;



mongoose.set('strictQuery',false);

mongoose.connect(url);

const phoneSchema = new mongoose.Schema({
    name: String,
    phone: String
});

const PhoneBookEntry = mongoose.model('PhoneNumber', phoneSchema);

if(entryName && phoneNumber) {
    const entry = new PhoneBookEntry({
        name: entryName,
        phone: phoneNumber
    });


    entry.save().then(result => {
        console.log(`Added ${entryName} number ${phoneNumber} to phonebook`);
        mongoose.connection.close();
    })
}

PhoneBookEntry.find({}).then(result => {
    console.log("Phonebook:");
    result.forEach(entry => {
        console.log(entry.name, entry.phone);
    });
    mongoose.connection.close();
});