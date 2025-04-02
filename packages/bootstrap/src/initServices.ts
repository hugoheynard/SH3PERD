import {type Db} from "mongodb";
//Register Service imports
import {RegisterService} from "@sh3pherd/auth";
import {generateTypedId} from "@sh3pherd/shared-utils";
import {createMongoUserRepository} from "@sh3pherd/user-adapters";
import {passwordManager} from "@sh3pherd/password-manager";
import {createUser} from "@sh3pherd/user";


//import {type UserService, userService} from "@sh3pherd/backend/services/userService";
//import {planningBlocksService} from "@sh3pherd/backend/planningBlocks/planningBlocksService";
//import {settingsService} from "@sh3pherd/backend/services/settingsService";
//import {calendarService} from "@sh3pherd/backend/services/calendarService";
//import {musicService} from "@sh3pherd/backend/services/musicService/musicService";
//import {playlistTemplateService} from "@sh3pherd/backend/playlist/playlistTemplateService";
//import {playlistService} from "@sh3pherd/backend/playlist/playlistService";
//import {PlaylistModule} from "@sh3pherd/backend/playlist/classes/PlaylistModule";





export const initServices = async (db: Db | null): any => {

    try {
        if (db === null) {
            throw new Error('Database connection is not initialized');
        }

        // registrationService initialization
        const userMongoRepository = createMongoUserRepository({ collection: db.collection('users_logins') });

        const registerService =  new RegisterService({
            generateUserIdFunction: () => generateTypedId('user'),
            hashPasswordFunction: passwordManager.hashPassword,
            createUserFunction: createUser,
            saveUserFunction: userMongoRepository.saveUser,
            findUserByEmailFunction: userMongoRepository.findUserByEmail,
        });



/*
        const settingsServiceInstance = settingsService({ collection: db.collection('settings') });
        const planningBlocksServiceInstance: any = planningBlocksService( { collection: db.collection('calendar_events') });
        const userServiceInstance: UserService = userService({ collection: db.collection('staffs') });
        const musicServiceInstance: any = musicService({
            collection: db.collection('music_library'),
            musicVersionsCollection: db.collection('music_versions')
        });

 */

        const services = {
            registerService: registerService,
/*
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
*/
        };
        console.log('✅ initServices executed');
        return services;

    } catch (e: any) {
        console.error('Error during controller services:', e);
        throw new Error('Failed to initialize services');
    }
}