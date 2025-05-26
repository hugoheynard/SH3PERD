import {Rider} from "@sh3pherd/router-builder";
import type {TUserId} from "../../user/types/user.domain.types.js";

type FnType = (input: { user_id: TUserId }) => Promise<boolean>;

export const createMusicLibraryRouter = (deps: {
    getUserRepertoireUseCase?: FnType;
}) => {

    return new Rider().build({ routeDefs: [
            Rider.def({
                path: "/music",
                inject: {},
                children: [
                    Rider.def({
                        path:"/userRepertoire",
                        inject: { getUserRepertoireUseCase: deps.getUserRepertoireUseCase },
                        routes: ({ getUserRepertoireUseCase }) => ({
                            "get:/": { handler: (req, res) => res.send("I am crossUserRepertoire") },
                        }),
                        children: [
                            Rider.def<{ getMeUserRepertoireUseCase: FnType }>({
                                path: "/me",
                                inject: { getMeUserRepertoireUseCase: deps.getUserRepertoireUseCase},
                                routes: ({ getMeUserRepertoireUseCase }) => ({
                                    "get:/": {
                                        handler: Rider.control<FnType>(201, {
                                            fn: getMeUserRepertoireUseCase,
                                            inputMapper: (req) => ({ user_id: req.user_id })
                                        })
                                    }
                                })
                            })
                        ],
                    })
                ],
            })]
    })
}