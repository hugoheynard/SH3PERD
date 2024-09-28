import {Menu} from "../../frontElements/Classes/class_Menu.js";
import {Icon} from "../../frontElements/Classes/icones/class_Icon.js";
import {MenuAction} from "../../frontElements/Classes/menuClasses/class_MenuAction.js";
import {CalendarMenuAction} from "./planningClasses/class_CalendarMenuAction.js";


const wsMenu_Calendar = new Menu('wsMenu_Calendar', 'workspaceMenu', 'button_lpm')

wsMenu_Calendar.addEnsemble(
    {
        id: 'calMenu_viewButtonsEnsemble',
        css: 'defaultButtonEnsembles'
    });

wsMenu_Calendar.addButton(
    {
        id: "calendarViewIndiv",
        content: new Icon(
            {
                css: 'menuIcons',
                publicURL: '../Front/Public/Icones/appMenus/calendarMenu/viewIndiv.svg',
                alt: 'vI'
            }
        ),
        callback: CalendarMenuAction.calViewIndiv,
        ensemble: 'calMenu_viewButtonsEnsemble'
    }
)

wsMenu_Calendar.addButton(
    {
        id: "calendarViewCat",
        content: new Icon(
            {
                css: 'menuIcons',
                publicURL: '../Front/Public/Icones/appMenus/calendarMenu/viewCat.svg',
                alt: 'vI'
            }
        ),
        callback: CalendarMenuAction.calViewCat,
        ensemble: 'calMenu_viewButtonsEnsemble'
    }
)

wsMenu_Calendar.addButton(
    {
        id: "calendarViewAll",
        content: new Icon(
            {
                css: 'menuIcons',
                publicURL: '../Front/Public/Icones/appMenus/calendarMenu/viewAll.svg',
                alt: 'vI'
            }
        ),
        callback: CalendarMenuAction.calViewAll,
        ensemble: 'calMenu_viewButtonsEnsemble'
    }
)
wsMenu_Calendar.addButton(
    {
        id: 'createEvent',
        content: new Icon(
            {
                css: 'menuIcons',
                publicURL: '../Front/Public/Icones/appMenus/calendarMenu/addEvent.svg',
                alt: 'vI'
            }
        ),
        callback: CalendarMenuAction.calAddEventWindow,
    }
)

wsMenu_Calendar.addButton(
    {
        id: 'createTimeFrame',
        content: new Icon(
            {
                css: 'menuIcons',
                publicURL: '../Front/Public/Icones/appMenus/calendarMenu/addTimeFrame.svg',
                alt: 'vI'
            }
        ),
        callback: CalendarMenuAction.calAddTimeframeWindow,
    }
)


export {wsMenu_Calendar};