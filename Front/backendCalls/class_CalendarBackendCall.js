import {DateMethod} from "../../backend/Utilities/class_DateMethods.js";
import {BackEndCall} from "./class_BackEndCalls.js";

export class Calendar_BackendCall {
    //CALENDAR

    static async POST_event(formDataJSON) {
        try {
            const response = await fetch(`${BackEndCall.endpoint}/calendar/events`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formDataJSON)
            })

            if (!response.ok) {
                throw new Error(`network Error : ${response.status} - ${response.statusText}`);
            }

        } catch(e) {
            console.error('Error while creating new event', e)
            throw e;
        }
    }

    static PUT_event(formDataJSON) {
        console.log('goodPUT')
    }
    static DELETE_event() {
        console.log('delete')
    }

    static async getDay(date = DateMethod.today) {
        try {
            const response = await fetch(`${BackEndCall.endpoint}/calendar/date`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = await response.json().then(res => res.data)
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