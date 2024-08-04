import {Menu} from "./frontElements/Classes/class_Menu.js";
import {Icon} from "./frontElements/Classes/icones/class_Icon.js";
import {MenuAction} from "./frontElements/Classes/menuClasses/class_MenuAction.js";


const menu_appGeneral = new Menu('leftPermanentMenu', undefined, 'button_lpm')

menu_appGeneral.addButton(
    'button_home',
    new Icon(
        {
            css: "menuIcons",
            publicURL: '../Front/Public/Icones/appMenus/generalMenu/home.svg',
            alt: "home"
        }),
    MenuAction.goHome
);
menu_appGeneral.addButton(
     'button_calendar',
     new Icon(
         {
             css: "menuIcons",
             publicURL: '../Front/Public/Icones/appMenus/generalMenu/calendar.svg',
             alt: "calendar"
         }),
     MenuAction.goCalendar
);

menu_appGeneral.addButton(
    'button_musicLib',
     new Icon(
         {
             css: "menuIcons",
             publicURL: '../Front/Public/Icones/appMenus/generalMenu/musicLibrary.svg',
             alt: "music"
         }),
     MenuAction.goMusicLibrary
);

menu_appGeneral.addButton(
     'button_playlistManager',
     new Icon(
         {
             css: "menuIcons",
             publicURL: '../Front/Public/Icones/appMenus/generalMenu/playlists.svg',
             alt: "playlists"
         }),
     MenuAction.goPlaylistManager
);

menu_appGeneral.addButton(
     'button_cabaretManager',
     new Icon(
         {
             css: "menuIcons",
             publicURL: '../Front/Public/Icones/appMenus/generalMenu/cabaret.svg',
             alt: "cab"
         }),
     MenuAction.goCabaretManager
);

menu_appGeneral.addButton(
     'button_staffMember',
     new Icon(
         {
             css: "menuIcons",
             publicURL: '../Front/Public/Icones/appMenus/generalMenu/staffmember.svg',
             alt: "staff"
         }),
     MenuAction.goStaffMember
);

menu_appGeneral.addButton(
     'button_logOut',
     new Icon(
         {
             css: "menuIcons",
             publicURL: '../Front/Public/Icones/appMenus/generalMenu/logout.svg',
             alt: "cabaret page button"
         }),
     MenuAction.logOut
);


export {menu_appGeneral};