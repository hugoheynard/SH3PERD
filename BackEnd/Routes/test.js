import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from'path';
import {DatabaseAction} from "../../db/audioFile_versionManager/class_DatabaseActions.js";


const app = express();
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Définir le moteur de stockage
const storage = multer.diskStorage({
    destination: '/Users/hugo/WebstormProjects/SH3PHERD/db/AudioData',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|pdf|gif|mp3|wav/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Erreur : Type de fichier non supporté !');
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limite de taille de fichier de 10MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }

}).single('file');


// Use CORS middleware
app.use(cors());
//app.use(bodyParser.json()); //TODO delete bodyparser package

// Middleware to parse JSON bodies
app.use(express.json());


app.get('/musiclibrary', async (req, res) => {

    try {
        const musicData = await new DatabaseAction().getAllDataFromTable('musicLibrary');
        res.json(musicData); // Send the data as a JSON response

    } catch (error) {

        console.error('Error retrieving music data:', error);
        res.status(500).json({ error: 'Internal Server Error' });

    }

});

app.post('/musicLibrary/createTrack', async (req, res) => {

    // Returns the id of the generated track as the database create function is returning an id as a promise

    try {

        const id = await new DatabaseAction().createEntry(req.body['trackName']);

        return res.status(201).json({
            message: 'new track created',
            id: id
        });

    } catch (error) {

        return res.status(400).json({
            message: 'Error creating track',
            error: error.message
        });
    }

});

app.put('/musicLibrary/id/:id/addVersion/', async (req, res) => {

    console.log('id', req.params.id)
    try {

        const data = await new DatabaseAction().addVersion(req.params.id, req.body);

        console.log('body', req.body)

        res.status(200).json({
            message: 'track version added',
            versionId: data.versionId
        });

    } catch (error) {

        // Respond with a 500 status code and an error message
        res.status(500).json({
            message: 'An error occurred while adding the track version',
            error: error.message


        });
    }
});


app.delete('/musicLibrary/:id', async (req, res) => {
    try {
        const result = await new DatabaseAction().deleteEntry(req.params.id);
        if (result) {
            // Assuming deleteEntry returns a truthy value if deletion was successful
            res.status(200).send({ message: 'Entry successfully deleted' });
        } else {
            // If deleteEntry returns a falsy value, treat it as if the entry was not found
            res.status(404).send({ message: 'Entry not found' });
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).send({ message: 'An error occurred while deleting the entry' });
    }
});


app.post('/musicLibrary/uploadMusic', async (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).json({ success: false, message: err });
        } else {
            if (req.file === undefined) {
                res.status(400).json({ success: false, message: 'Aucun fichier sélectionné !' });
            } else {
                res.status(200).json({
                    success: true,
                    message: 'Fichier téléchargé avec succès !',
                    file: `uploads/${req.file.filename}`
                });
            }
        }
    });
});

