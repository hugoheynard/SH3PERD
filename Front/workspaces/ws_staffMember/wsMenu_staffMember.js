import {Icon} from "../../frontElements/Classes/icones/class_Icon.js";
import {MenuAction} from "../../frontElements/Classes/menuClasses/class_MenuAction.js";
import {Menu} from "../../frontElements/Classes/class_Menu.js";


const wsMenu_staffMember = new Menu('staffMemberMenu', 'workspaceMenu', 'button_lpm');

wsMenu_staffMember.addButton(
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

wsMenu_staffMember.addButton(
    "staffMemberInfos",
    new Icon(
        {
            css:'menuIcons',
            publicURL: '../Front/Public/Icones/appMenus/staffMemberMenu/staffMemberInfos.svg',
            alt:'staffInfos'
        }
    ),
    MenuAction.goStaffMemberInfosPage
)

wsMenu_staffMember.addButton(
    "staffMemberContracts",
    new Icon(
        {
            css:'menuIcons',
            publicURL: '../Front/Public/Icones/appMenus/staffMemberMenu/staffMemberContracts.svg',
            alt:'staffContracts'
        }
    ),
    MenuAction.goWorkPeriodsPage
)

wsMenu_staffMember.addButton(
    "staffMemberDocuments",
    new Icon(
        {
            css:'menuIcons',
            publicURL: '../Front/Public/Icones/appMenus/staffMemberMenu/staffMemberDocuments.svg',
            alt:'staffDocs'
        }
    ),
    () => console.log('staffDocs')
)

export {wsMenu_staffMember};