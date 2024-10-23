import {BackEndCall} from "./BackEndCalls.js";

export class Music_BackendCall extends BackEndCall{
    constructor(input) {
        super(input);
    }

    async getMusicLib () {

        try {
            const response = await fetch(`${this.endpoint}/musiclibrary`);

            if (!response.ok) {

                throw new Error('Network response was not ok ' + response.statusText);

            }

            const data = await response.json(); // Parse the JSON response

            return data.map(row => JSON.parse(row.jsonData));


        } catch (error) {

            console.error('There has been a problem with your fetch operation:', error);

        }
    };

    async POST_newTrack(formDataJSON) {

        return fetch(`${this.endpoint}/musicLibrary/createTrack`, {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(formDataJSON)

        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok - ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                return {'containerID': data.id};
            })
            .catch(error => console.error('Error:', error));




    };

    async PUT_newVersion(formDataJSON) {

        return fetch(`${this.endpoint}/musicLibrary/id/${formDataJSON.containerID}/addVersion/`, {

            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataJSON)
        })
            .then(response => {

                if(!response.ok) {

                    throw new Error('Network response was not ok - ' + response.status)

                }

                return response.json();

            })
            .then(data => data.type)
            .catch(error => console.error('Error:', error));
    };

    async DELETE_track(musicIdToDelete) {

        fetch(`${this.endpoint}/musicLibrary/id/${musicIdToDelete}`, {

            method: 'DELETE',
        })

            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                location.reload();

                return response.json();
            })

            .then(data => {

                console.log('User deleted:', data);

            })

            .catch(error => {

                console.error('There was a problem with the fetch operation:', error);

            });

    };

    async POST_uploadMusicFile(formData) {

        return fetch(`${this.endpoint}/musicLibrary/uploadMusic`, {

            method: 'POST',
            body: formData

        })
            .then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));

    };
}