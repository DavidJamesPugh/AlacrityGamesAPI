import dotenv from 'dotenv';

dotenv.config({ path: './fsoenvironment.env' });
const { PORT } = process.env;
const { MONGODB_URI } = process.env;

const config = { PORT, MONGODB_URI };

export { config };
