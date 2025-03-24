import {authenticationController} from "../authentication/authenticationController";
import {settingsController} from "../controllers/settingsController";
import {calendarController} from "../controllers/calendarController";
import {planningBlocksController} from "../planningBlocks/planningBlocksController";
import {musicLibraryController} from "../controllers/musicLibraryController";
import {playlistController} from "../playlist/playlistController";
import {playlistTemplateService} from "../playlist/playlistTemplateService";
import {registrationController} from "../registration/registrationController";



export interface Controllers {
    settingsController: any;
    [key: string]: any;
}

export const initControllers = ({ services }: any): any => {

    try {


        const controllers ={
            registrationController: registrationController({
                registrationService: services.registrationService
            }),


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




            /*
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