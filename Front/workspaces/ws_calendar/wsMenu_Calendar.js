import {Menu} from "../../frontElements/Classes/class_Menu.js";
import {Icon} from "../../frontElements/Classes/icones/class_Icon.js";
import {MenuAction} from "../../frontElements/Classes/menuClasses/class_MenuAction.js";


const wsMenu_Calendar = new Menu('wsMenu_Calendar', 'workspaceMenu', 'button_lpm')

wsMenu_Calendar.addEnsemble(
    {
        id: 'calMenu_viewButtonsEnsemble',
        css: 'defaultButtonEnsembles'
    });

wsMenu_Calendar.addButton_V2(
    {
        id: "calendarViewIndiv",
        content: new Icon(
            {
                css: 'menuIcons',
                publicURL: '../Front/Public/Icones/appMenus/calendarMenu/viewIndiv.svg',
                alt: 'vI'
            }
        ),
        callback: MenuAction.calViewIndiv,
        ensemble: 'calMenu_viewButtonsEnsemble'
    }
)

wsMenu_Calendar.addButton_V2(
    {
        id: "calendarViewCat",
        content: new Icon(
            {
                css: 'menuIcons',
                publicURL: '../Front/Public/Icones/appMenus/calendarMenu/viewCat.svg',
                alt: 'vI'
            }
        ),
        callback: MenuAction.calViewCat,
        ensemble: 'calMenu_viewButtonsEnsemble'
    }
)

wsMenu_Calendar.addButton_V2(
    {
        id: "calendarViewAll",
        content: new Icon(
            {
                css: 'menuIcons',
                publicURL: '../Front/Public/Icones/appMenus/calendarMenu/viewAll.svg',
                alt: 'vI'
            }
        ),
        callback: MenuAction.calViewAll,
        ensemble: 'calMenu_viewButtonsEnsemble'
    }
)


export {wsMenu_Calendar};