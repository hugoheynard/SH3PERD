import sqlite3 from 'sqlite3';
const sqlite3Verbose = sqlite3.verbose();

class Database {
    constructor() {
        if (!Database.instance) {
            this.db = new sqlite3.Database('/Users/hugo/WebstormProjects/SH3PHERD/db/database.sqlite', (err) => {
                if (err) {
                    console.error('Failed to connect to the database.sqlite:', err.message);
                } else {
                    console.log('Connected to the SQLite database.sqlite.');
                }

            });

            Database.instance = this;

        }

        return Database.instance
        //return Object.freeze(Database.instance);

    };

    getConnection() {

        return new Promise((resolve, reject) => {

            if (this.db) {

                resolve(this.db);

            } else {

                reject(new Error('Database connection not established.'));

            }

        });

    };

    async closeDatabaseAsync() {

        return new Promise((resolve, reject) => {

            if (this.db) {

                this.db.close((err) => {

                    if (err) {

                        reject(err);

                    } else {

                        console.log('Database connection closed.');

                        resolve();

                    }

                });

            } else {

                resolve(); // If there's no open connection, resolve immediately
            }

        });

    }
}

export {Database};