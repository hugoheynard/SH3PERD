import mongoose from 'mongoose';


// URL de connexion MongoDB Atlas
const mongoUri = 'mongodb+srv://Cluster83466:YkRya3REd1lq@cluster83466.otv86.mongodb.net/shepherd?retryWrites=true&w=majority&appName=Cluster83466"';

// Fonction de connexion Mongoose
const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoUri, {});
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas', error);
        process.exit(1);
    }
};

await connectToMongo()




export {connectToMongo};
