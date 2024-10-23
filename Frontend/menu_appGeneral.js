import {Menu} from "./frontElements/Classes/class_Menu.js";
import {Icon} from "./frontElements/Classes/icones/class_Icon.js";
import {MenuAction} from "./frontElements/Classes/menuClasses/class_MenuAction.js";


const menu_appGeneral = new Menu('leftPermanentMenu', undefined, 'button_lpm')

menu_appGeneral.addButton(
    {
        id: 'button_home',
        content: new Icon(
            {
                css: "menuIcons",
                publicURL: '../Frontend/Public/Icones/appMenus/generalMenu/home.svg',
                alt: "home"
            }),
        callback: MenuAction.goHome
    }
);
menu_appGeneral.addButton(
    {
        id: 'button_calendar',
        content: new Icon(
            {
                css: "menuIcons",
                publicURL: '../Frontend/Public/Icones/appMenus/generalMenu/calendar.svg',
                alt: "calendar"
            }),
        callback: MenuAction.goCalendar
    }
);

menu_appGeneral.addButton(
    {
        id: 'button_musicLib',
        content: new Icon(
            {
                css: "menuIcons",
                publicURL: '../Frontend/Public/Icones/appMenus/generalMenu/musicLibrary.svg',
                alt: "music"
            }),
        callback: MenuAction.goMusicLibrary
    }
);

menu_appGeneral.addButton(
    {
        id: 'button_playlistManager',
        content: new Icon(
            {
                css: "menuIcons",
                publicURL: '../Frontend/Public/Icones/appMenus/generalMenu/playlists.svg',
                alt: "playlists"
            }),
        callback: MenuAction.goPlaylistManager
    }
);

menu_appGeneral.addButton(
    {
        id: 'button_cabaretManager',
        content: new Icon(
            {
                css: "menuIcons",
                publicURL: '../Frontend/Public/Icones/appMenus/generalMenu/cabaret.svg',
                alt: "cab"
            }),
        callback: MenuAction.goCabaretManager
    }
);

menu_appGeneral.addButton(
    {
        id: 'button_staffMember',
        content: new Icon(
            {
                css: "menuIcons",
                publicURL: '../Frontend/Public/Icones/appMenus/generalMenu/staffmember.svg',
                alt: "staff"
            }),
        callback: MenuAction.goStaffMember
    }
);

menu_appGeneral.addButton(
    {
        id: 'button_logOut',
        content: new Icon(
            {
                css: "menuIcons",
                publicURL: '../Frontend/Public/Icones/appMenus/generalMenu/logout.svg',
                alt: "cabaret page button"
            }),
        callback: MenuAction.logOut
    }
);


export {menu_appGeneral};