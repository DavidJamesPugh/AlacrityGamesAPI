import mongoose from 'mongoose';
const dbForPurchases = mongoose.connection.useDb('purchases');
const purchaseSchema = new mongoose.Schema({
	userHash: { type: String, required: true, index: true },
	packageId: { type: String, required: true },
	created: { type: Number, required: true, index: true },
	consumed: { type: Boolean, default: false, index: true },
	site: { type: String },
	timezone: { type: String },
	backUrl: { type: String },
	
	// PayPal fields
	amount: { type: Number },
	currency: { type: String, default: 'USD' },
	returnUrl: { type: String },
	cancelUrl: { type: String },
	paypalOrderId: { type: String, index: true },
	token: {type: String},
	payerId: {type: String},
	paypalCaptured: { type: Boolean, default: false },
	
	// PlayFab fields
	playfabApplied: { type: Boolean, default: false },
	playfabError: { type: String },
	
	// Manual review flag
	needsManualReview: { type: Boolean, default: false },
	
	// Timestamps
	consumedAt: { type: Number }
}, { timestamps: true });

purchaseSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		// eslint-disable-next-line no-underscore-dangle,no-param-reassign
		returnedObject.id = returnedObject._id.toString();
		// eslint-disable-next-line no-param-reassign,no-underscore-dangle
		delete returnedObject._id;
		// eslint-disable-next-line no-param-reassign,no-underscore-dangle
		delete returnedObject.__v;
	},
});

const Purchase = dbForPurchases.model('Purchase', purchaseSchema);

export default Purchase;


