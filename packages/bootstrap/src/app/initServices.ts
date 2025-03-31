import {type Db} from "mongodb";
import {type UserService, userService} from "@sh3pherd/backend/services/userService";
import {RegistrationService} from "@sh3pherd/auth-core/";
import {planningBlocksService} from "@sh3pherd/backend/planningBlocks/planningBlocksService";
import {authenticationService} from "@sh3pherd/backend/authentication/authenticationService";
import {PasswordHasher} from "@sh3pherd/backend/authentication/login/PasswordHasher";
import {JWT_module} from "@sh3pherd/backend/authentication/login/JWT_Module";
import {settingsService} from "@sh3pherd/backend/services/settingsService";
import {calendarService} from "@sh3pherd/backend/services/calendarService";
import {musicService} from "@sh3pherd/backend/services/musicService/musicService";
import {playlistTemplateService} from "@sh3pherd/backend/playlist/playlistTemplateService";
import {playlistService} from "@sh3pherd/backend/playlist/playlistService";
import {PlaylistModule} from "@sh3pherd/backend/playlist/classes/PlaylistModule";
import {generateTypedId} from "@sh3pherd/shared-utils";
import {createMongoUserRepository} from "@sh3pherd/user-adapters/";
import {createUser} from "@sh3pherd/domain-user/";
import {passwordManager} from "@sh3pherd/password-manager";




export const initServices = async (db: Db | null): any => {
    try {
        if (db === null) {
            throw new Error('Database connection is not initialized');
        }

        const userMongoRepository = createMongoUserRepository({ collection: db.collection('users_logins') });

        const registrationService =  new RegistrationService({
            generateUserIdFunction: () => generateTypedId('user'),
            hashPasswordFunction: passwordManager.hashPassword,
            createUserFunction: createUser,
            saveUserFunction: userMongoRepository.saveUser,
            findUserByEmailFunction: userMongoRepository.findUserByEmail,
        });

        const settingsServiceInstance = settingsService({ collection: db.collection('settings') });
        const planningBlocksServiceInstance: any = planningBlocksService( { collection: db.collection('calendar_events') });
        const userServiceInstance: UserService = userService({ collection: db.collection('staffs') });
        const musicServiceInstance: any = musicService({
            collection: db.collection('music_library'),
            musicVersionsCollection: db.collection('music_versions')
        });

        const services = {
            registrationService: registrationService,

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