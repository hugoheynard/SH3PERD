import {Menu} from "../../frontElements/Classes/class_Menu.js";
import {Icon} from "../../frontElements/Classes/icones/class_Icon.js";


const wsMenu_Calendar = new Menu('wsMenu_Calendar', 'workspaceMenu', 'button_lpm')

wsMenu_Calendar.addButton(
    "staffMemberHome",
    new Icon(
        {
            css:'menuIcons',
            publicURL: '../Front/Public/Icones/appMenus/staffMemberMenu/staffMemberHome.svg',
            alt:'staffHome'
        }
    ),
    () => console.log('staffHome')
)

export {wsMenu_Calendar};