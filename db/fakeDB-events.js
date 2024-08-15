import {RecurrentEvent} from "../BackEnd/Classes/Activity_classes/class_RecurrentEvent.js";
import {PrivateEvent} from "../BackEnd/Classes/Activity_classes/class_PrivateEvent.js";
import {art1, art2} from "./fakeDB.js";

//Mockup recurrent events

const WTF = new RecurrentEvent("2024-12-11", "2025-12-19", "WTF", "weekly event");
const circus = new RecurrentEvent("2024-12-12", "2025-12-21", "Circus", "weekly event");
const laFrench = new RecurrentEvent("2024-12-10", "2025-12-21", "La French", "weekly event");
const table_WeeklyEvents = [WTF,circus, laFrench];




//Mockup private events

const unlimited = new PrivateEvent(new Date(2024, 11, 19, 21, 0), 240, [art1, art2], {title: "John Cage"}, "unlimited", "LPC");
const moonlight = new PrivateEvent(new Date(2024, 11, 18, 20, 0), 150, [art1], undefined,"moonlight", "FR");
const group = new PrivateEvent(new Date(2024, 11, 18, 20, 0), 300, [art1], {title: "Moonlight"}, "group", "LPC");
const table_privateEvents = [unlimited, moonlight, group];




//Mockup special events






export {table_WeeklyEvents, table_privateEvents};