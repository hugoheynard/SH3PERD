import {Database} from "../../backend/appServer_dbConnections/dbConnect.js";

class DatabaseAction {

    constructor() {

        this.db = new Database().getConnection();

    };

    async getAllDataFromTable(tableName) {

        const db = await new Database().getConnection();

        const query = `SELECT * from ${tableName}`;

        try {

            return new Promise((resolve, reject) => {

                db.all(query, [], (err, rows) => {

                    if (err) {

                        reject(err);

                    } else {

                        resolve(rows);
                    }

                });

            });

        } catch (err) {

            console.error('Error fetching music data:', err);
            throw err;

        }

    };

    async getLastID() {

        const db = await new Database().getConnection();

        return new Promise((resolve, reject) => {

            const query = `SELECT MAX(id) FROM musicLibrary`;

            db.get(query, [], (err, row) => {

                if (err) {

                    reject(err);

                } else {

                    resolve(
                        //if row === null start at 1
                        (() => {

                            if(!row['MAX(id)']) {

                                return 1;

                            }

                            return row['MAX(id)'] + 1;

                        })()

                    );

                }

            });

        });

    };

    async createEntry(trackName) {

        return new Promise(async (resolve, reject) => {

            try {

                const db = await new Database().getConnection();

                const baseObject = {

                    id: await this.getLastID(),
                    trackName: trackName,
                    versions: {},
                    vCountId: 0,
                    creationDate: new Date(Date.now())

                };

                db.run('INSERT INTO musicLibrary (trackName, jsonData) VALUES (?, ?)', [trackName, JSON.stringify(baseObject)], (err) => {

                    if (err) {

                        console.error('Error inserting data:', err.message);
                        reject(err);
                        return;

                    }

                    console.log(`A row has been inserted`, 'id:', baseObject.id);

                    resolve(baseObject.id);

                });

            } catch(error) {

                console.error('Error connecting to database:', error.message);
                reject(error);
            }

        })



    };

    async deleteEntry(id) {

        const db = await new Database().getConnection();

        const deleteQuery = 'DELETE FROM musicLibrary WHERE id = ?';

        db.run(deleteQuery, [id], function(err) {

            if (err) {

                console.error('Error deleting data:', err.message);
                return;

            }

            console.log(`Row(s) deleted with id ${id}`);

        });

    };

    updateName(id, newName) {

        try {
            //TODO: updates name in the dbRow

            //updates the base level of the jsonData
            this.db.run(`UPDATE musicLibrary SET jsonData = json_set(jsonData, '$.trackName', ?) WHERE id = ?`, [newName, id], (err) => {

                if (err) {

                    console.error('Error updating data:', err.message);

                }

            });

        } catch (err) {

            console.error('Error in addVersion:', err.message);

        }


    };

    async getData(id) {

        const db = await new Database().getConnection();

        const queryObjectData = `SELECT * FROM musicLibrary WHERE id = ?`;

        return new Promise((resolve, reject) => {

            db.get(queryObjectData, [id], (err, row) => {

                if (err) {
                    console.error('Error retrieving data:', err.message);
                    reject(err);

                } else {

                    resolve(row ? row.jsonData : null);

                }

            });

        });
    };

    async updateJsonData(id, data) {

        const db = await new Database().getConnection();

        return new Promise((resolve, reject) => {

            try {

                const newData = JSON.stringify(data);

                const updateQuery = `UPDATE musicLibrary SET jsonData = ? WHERE id = ?`

                db.run(updateQuery, [newData, id], (err) => {

                    if (err) {

                        console.error('Database update failed:', err.message);
                        reject(new Error('Database update failed: ' + err.message));
                    }

                    console.log(`Row(s) updated: `);
                    resolve(id);

                });

            } catch (error) {

                console.error('Database operation failed:', error);
                reject(new Error('Database operation failed: ' + error.message));

            }
        })


    };

    async addVersion(id, trackVersionObj) {

        console.log(trackVersionObj)

        const generateVersionId = objData => objData.id + 'v' + objData.vCountId;

        return new Promise(async (resolve, reject) => {

            try {

                //get data from row and turn back to object
                const data = JSON.parse(await this.getData(id));

                //creates new property from uniqueID
                data.versions[generateVersionId(data)] = {id: generateVersionId(data), ...trackVersionObj};


                //updateTopLevel
                data.vCountId += 1;
                data.lastUpdate = new Date(Date.now());

                //update jsonData in DB
                resolve(await this.updateJsonData(id, data));


            } catch (error) {

                reject(error);
            }

        });


    };

    async removeVersion(versionId) {

        const dbRowIdFromVersionId = versionId => versionId.split('v')[0];

        //get rowID from versionID
        const rowId = dbRowIdFromVersionId(versionId);

        //get data from row and turn back to object
        const data = JSON.parse(await this.getData(rowId));

        //delete property
        delete data.versions[versionId];

        //update jsonData in DB
        this.updateJsonData(rowId, data);

    };

}

export {DatabaseAction};



const wipe = async (start) => {
    for (let i = start; i < 30; i++) {
        await new DatabaseAction().deleteEntry(i)
    }
};


//wipe(0)