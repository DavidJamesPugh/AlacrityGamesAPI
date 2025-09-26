import dotenv from 'dotenv';

dotenv.config({ path: './.env' });
console.log('PORT:', process.env.PORT);
const { PORT } = process.env;
const MONGODB_URI = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI;


const config = { PORT, MONGODB_URI };

export { config };
