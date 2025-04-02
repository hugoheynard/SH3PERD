//import {authenticationController} from "@sh3pherd/backend/authentication/authenticationController";
//import {settingsController} from "@sh3pherd/backend/controllers/settingsController";
//import {calendarController} from "@sh3pherd/backend/controllers/calendarController";
//import {planningBlocksController} from "@sh3pherd/backend/planningBlocks/planningBlocksController";
//import {musicLibraryController} from "@sh3pherd/backend/controllers/musicLibraryController";
//import {playlistController} from "@sh3pherd/backend/playlist/playlistController";
import {createRegisterController, type IRegisterController} from "@sh3pherd/auth";



export interface AppControllers {
    registerController: IRegisterController;
    [key: string]: any;
}

export const initControllers = ({ services }: any): AppControllers => {

    try {
        const controllers = {
            registerController: createRegisterController({
                registerService: services.registrationService,
            }),

/*
            authenticationController: authenticationController({ authenticationService: services.authenticationService }),
            settingsController: settingsController({ settingsService: services.settingsService}),
            planningBlocksController: planningBlocksController({ planningBlocksService: services.planningBlocksService}), //TODO: on en est là test API
            calendarController: calendarController({
                calendarService: services.calendarService,
                userService: services.userService,
                planningBlocksService: services.planningBlocksService}),
            musicLibraryController: musicLibraryController( { musicService: services.musicService }),
            playlistController: playlistController({
                playlistService: services.playlistService,
                playlistTemplateService: services.playlistTemplateService
            }),





                        userController: userController({
                            services: {
                                contractService: services.contractService,
                                companyService: services.companyService
                            }
                        }),

                        companyController: new CompanyController({companyService: services.companyService}),

                        contractController: contractController({
                            contractService: services.contractService,
                            companyService: services.companyService
                        }),

                        staffController: userController({
                            services: {
                                userService: services.userService
                            }
                        }),


                        */

        }
        console.log('✅ initControllers executed');
        return controllers;
    } catch (e) {
        console.error('Error during controller initialization:', e);
        throw new Error('Failed to initialize services');
    }
};