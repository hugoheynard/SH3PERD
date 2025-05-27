import {Rider} from "@sh3pherd/router-builder";
import type {TGetMusicRepertoireUseCaseFn, TMusicRepertoireUseCases} from "../types/musicRepertoire.useCases.types.js";



export const createMusicLibraryRouter = (deps: {
    useCases: TMusicRepertoireUseCases;
}) => {
    const { getMusicRepertoireByUserId } = deps.useCases;

    return new Rider().build({ routeDefs: [
            Rider.def<any>({
                path:"/musicRepertoire",
                inject: { getMusicRepertoireByUserId },
                routes: ({ getMusicRepertoireByUserId }) => ({
                    "post:/": {
                        handler: Rider.control<any>(201, {
                            fn: getMusicRepertoireByUserId,
                            inputMapper: (req) => ({
                                asker_user_id: req.user_id,
                                target_id: req.body.target_id
                            })
                        })
                    },
                }),
                children: [
                    Rider.def<any>({
                        path: "/me",
                        inject: { getMusicRepertoireByUserId },
                        routes: ({ getMusicRepertoireByUserId }) => ({
                            "post:/": {
                                handler: Rider.control<any>(201, {
                                    fn: getMusicRepertoireByUserId,
                                    inputMapper: (req) => ({
                                        asker_user_id: req.user_id,
                                        target_user_id: req.user_id
                                    })
                                })
                            }
                        })
                    })
                ],
            })]
    })
}