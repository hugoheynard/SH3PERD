import {DateMethod} from "../../../backend/Utilities/class_DateMethods.js";

export class BackEndCall {

    static endpoint = 'http://localhost:3000'

    static async getMusicLib () {

        try {
            const response = await fetch(`${BackEndCall.endpoint}/musiclibrary`);

            if (!response.ok) {

                throw new Error('Network response was not ok ' + response.statusText);

            }

            const data = await response.json(); // Parse the JSON response

            return data.map(row => JSON.parse(row.jsonData));


        } catch (error) {

            console.error('There has been a problem with your fetch operation:', error);

        }
    };

    static POST_newTrack(formDataJSON) {

        return fetch(`${BackEndCall.endpoint}/musicLibrary/createTrack`, {

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

    static PUT_newVersion(formDataJSON) {

        return fetch(`${BackEndCall.endpoint}/musicLibrary/id/${formDataJSON.containerID}/addVersion/`, {

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

    static DELETE_track(musicIdToDelete) {

        fetch(`${BackEndCall.endpoint}/musicLibrary/id/${musicIdToDelete}`, {

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

    static POST_uploadMusicFile(formData) {

        return fetch(`${BackEndCall.endpoint}/musicLibrary/uploadMusic`, {

            method: 'POST',
            body: formData

        })
            .then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));

    };

    //CALENDAR

    static POST_event(formDataJSON) {
        console.log('goodPOST')
    }
    static PUT_event(formDataJSON) {
        console.log('goodPUT')
    }
    static DELETE_event() {
        console.log('delete')
    }

    //CALENDAR
    static async getDay(date = DateMethod.today) {
        try {
            const response = await fetch(`${BackEndCall.endpoint}/calendar/${date}`);

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = await response.json();
            console.log(data)
            //DATA PROCESSING:
            // converts date back from string to Date Object
            for (const key in data.events) {
                const event = data.events[key]

                if (event.date) {
                    event.date = new Date(event.date)
                }
            }

            return data

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    };
}