import mongoose from "mongoose";
import {Contract} from "./Contract_Schema.js";
import {connectToMongo} from "../mongoDB_connect.js";


const staff_Schema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    artistName: {
        type: String,
        trim: true,
        required: false,
        default: null
    },
    contact: {
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            trim: true,
            required: false
        }
    },
    functions: {
        category: {
            type: String,
            enum: ['dj', 'musician', 'singer', 'dancer', 'performer'],
            required: true,
        },
        subCategory: {
            type: String,
            validate: {
                validator: function(value) {
                    const subCategoriesByCategory = {
                        dj: [],
                        musician: ['guitar', 'saxophone', 'violin', 'trumpet', 'percussion'],
                        singer: ['club', 'cabaret'],
                        dancer: [],
                        performer: ['aerial', 'magician'],
                    };
                    const validSubCategories = subCategoriesByCategory[this.functions.category];
                    return !value || validSubCategories.includes(value);
                },
                message: props => `subCategory '${props.value}' isn't valid for category '${props.instance.category}'`
            }
        }
    },
})


const Staff = mongoose.model('staff', staff_Schema);

const test = new Staff({
    firstName: 'Tanguy',
    lastName: 'Paumier',
    artistName: 'Mike Send',
    contact: {
        email: 'mikesend.contact@gmail.com'
    },
    functions: {
        category: 'dj'
    }
})



test.save().then(() => console.log('User created'))
    .catch(err => {
        if (err.code === 11000) {
            console.error('Error: This email belongs to an existing user');
        }
        //console.error('Error creating user:', err)
    });

await connectToMongo()
Contract.findOne({ _id: new mongoose.Types.ObjectId('66e0623bf5b6a92a3a4015a1') })
    .populate('owner')  // Populate the 'staff' field with staff details
    .then(contract => {
        if (!contract) {
            console.log('Contrat non trouvé');
        } else {
            console.log('Contrat trouvé:', contract);
        }
    })
    .catch(err => {
        console.error('Erreur lors de la récupération du contrat:', err);
    });

export {Staff};