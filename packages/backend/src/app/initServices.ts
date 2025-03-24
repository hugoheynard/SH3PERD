import {type Db} from "mongodb";
import {type UserService, userService} from "../services/userService";
import {planningBlocksService} from "../planningBlocks/planningBlocksService";
import {authenticationService} from "../authentication/authenticationService";
import {PasswordHasher} from "../authentication/login/PasswordHasher";
import {JWT_module} from "../authentication/login/JWT_Module";
import {settingsService} from "../services/settingsService";
import {calendarService} from "../services/calendarService";
import {musicService} from "../services/musicService/musicService";
import {playlistTemplateService} from "../playlist/playlistTemplateService";
import {playlistService} from "../playlist/playlistService";
import {PlaylistModule} from "../playlist/classes/PlaylistModule";
import {registrationService} from "../registration/registrationService";



export const initServices = async (db: Db | null): any => {
    try {
        if (db === null) {
            throw new Error('Database connection is not initialized');
        }

        const registrationServiceInstance = registrationService({ users_loginsCollection: db.collection('users_logins') });
        const settingsServiceInstance = settingsService({ collection: db.collection('settings') });
        const planningBlocksServiceInstance: any = planningBlocksService( { collection: db.collection('calendar_events') });
        const userServiceInstance: UserService = userService({ collection: db.collection('staffs') });
        const musicServiceInstance: any = musicService({
            collection: db.collection('music_library'),
            musicVersionsCollection: db.collection('music_versions')
        });

        const services = {
            registrationService: registrationServiceInstance,

            authenticationService: authenticationService({
                collection: db.collection('staffs'),
                verifyPasswordFunction: new PasswordHasher().verify,
                generateTokenFunction: JWT_module.getToken,
                checkAuthTokenValidityFunction: JWT_module.decode
            }),

            settingsService: settingsServiceInstance,

            planningBlocksService: planningBlocksServiceInstance,

            calendarService: calendarService({
                eventService: planningBlocksServiceInstance,
                userService: userServiceInstance
            }),

            musicService: musicServiceInstance,

            playlistService: playlistService({
                playlistCollection: db.collection('playlists'),
                PlaylistModule: PlaylistModule
            }),
            playlistTemplateService: playlistTemplateService({ playlistTemplateCollection: db.collection('playlist_template') }),
            //contractService: contractService({ collection: db.collection('contracts') }),
            //companyService: companyService({ collection: db.collection('companies') }),
            //userService: userService,

            //

        };
        console.log('✅ initServices executed');
        return services;

    } catch (e: any) {
        console.error('Error during controller services:', e);
        throw new Error('Failed to initialize services');
    }
}