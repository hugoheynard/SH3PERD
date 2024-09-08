const db_Object = `{
    "event_id": "V7Hy0Kxa061cO6uBvc2w6CUSv3XFf_EaEiFy",
    "date": "2024-09-06",
    "time": "12:00",
    "duration": "30",
    "staff" : ["Hugo"],
    "eventType": "rehearsal",
    "techInstall": "on",
    "techAssist": "on",
    "staffSelectionMethod": "By category",
    "selectedStaffCategory": "dj",
    "description": "This is an event recalled from the db"
}`;

const recallEvent = JSON.parse(db_Object)


export {recallEvent};