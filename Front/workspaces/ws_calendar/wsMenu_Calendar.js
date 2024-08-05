import {Menu} from "../../frontElements/Classes/class_Menu.js";
import {Icon} from "../../frontElements/Classes/icones/class_Icon.js";
import {MenuAction} from "../../frontElements/Classes/menuClasses/class_MenuAction.js";


const wsMenu_Calendar = new Menu('wsMenu_Calendar', 'workspaceMenu', 'button_lpm')

wsMenu_Calendar.addButton(
    "calendarViewIndiv",
    new Icon(
        {
            css:'menuIcons',
            publicURL: '../Front/Public/Icones/appMenus/calendarMenu/viewIndiv.svg',
            alt:'vI'
        }
    ),
    MenuAction.calViewIndiv
)

wsMenu_Calendar.addButton(
    "calendarViewCat",
    new Icon(
        {
            css:'menuIcons',
            publicURL: '../Front/Public/Icones/appMenus/calendarMenu/viewCat.svg',
            alt:'vI'
        }
    ),
    MenuAction.calViewCat
)

wsMenu_Calendar.addButton(
    "calendarViewAll",
    new Icon(
        {
            css:'menuIcons',
            publicURL: '../Front/Public/Icones/appMenus/calendarMenu/viewAll.svg',
            alt:'vI'
        }
    ),
    MenuAction.calViewAll
)

export {wsMenu_Calendar};