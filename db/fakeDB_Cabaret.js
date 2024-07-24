class Cabaret {

    constructor(title, trackList, intensity, membersConfigurations, eventMatchPreference, perReadyStatus, insideCompatibility) {

        this.title = title;
        this.trackList = trackList;
        this.intensity = intensity;
        this.membersConfigurations = membersConfigurations;
        this.eventMatchPreference = eventMatchPreference;
        this.perReadyStatus = perReadyStatus;
        this.insideCompatibility = insideCompatibility;

    }

}

const monnet = new Cabaret("monnet", [], 1, [{name:"config1", staff:[]}], ["La French"], true, true);
const spain = new Cabaret("spain", [], 2, [{name:"config1", staff:[]}], ["Circus"], true, true);
const brasil = new Cabaret("brasil", [], 3, [{name:"config1", staff:[]}], ["Circus"], true, true);
const celine = new Cabaret("celine", [], 2, [{name:"config1", staff:[]}], ["La French"], true, true);
const actu = new Cabaret("actu", [], 3, [{name:"config1", staff:[]}], ["La French"], true, true);
const disco = new Cabaret("disco", [], 3, [{name:"config1", staff:[]}], ["Candy"], true, true);


const cabList = [monnet, spain, brasil, actu, celine, disco];

const cabWeekOrder_userDefined = {

    "sunday":[spain, actu, brasil],
    "monday":[monnet, celine, actu],
    "tuesday":[celine, actu, disco],
    "wednesday":[celine, spain, actu],
    "thursday":[monnet, spain, brasil],
    "friday":[monnet, actu, disco],

};

export {cabWeekOrder_userDefined, cabList};