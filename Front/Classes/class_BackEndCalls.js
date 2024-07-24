class BackEndCall {

    static async getMusicLib () {

        try {
            const response = await fetch('http://localhost:3000/musiclibrary');

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

        return fetch('http://localhost:3000/musicLibrary/createTrack', {

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

            .catch(error => {

                console.error('Error:', error);

            });




    };

    static PUT_newVersion(formDataJSON) {
        console.log(formDataJSON);

        return fetch(`http://localhost:3000/musicLibrary/${formDataJSON.containerID}/addVersion/`, {

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
            .then(data => {

                return data.type;

            })

            .catch(error => {

                console.error('Error:', error);

            });
    };

    static DELETE_track(musicIdToDelete) {

        fetch(`http://localhost:3000/musicLibrary/${musicIdToDelete}`, {

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

    static POST_uploadFile(formData) {

        return fetch(`http://localhost:3000/musicLibrary/uploadMusic`, {

            method: 'POST',
            body: formData

        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });


    }
}

export {BackEndCall};