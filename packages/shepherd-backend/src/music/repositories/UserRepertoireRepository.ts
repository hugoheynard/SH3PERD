import {autoBind} from "../../utils/classUtils/autoBind.js";
import {BaseMongoRepository} from "../../utils/repoAdaptersHelpers/BaseMongoRepository.js";
import type {TUserRepertoireEntryDomainModel, TUserRepertoireTableRow} from "../types/music.domain.types.js";
import type {TBaseMongoRepoDeps} from "../../types/mongo/mongo.types.js";
import type {TUserId} from "../../user/types/user.domain.types.js";


@autoBind
export class UserRepertoireMongoRepository extends BaseMongoRepository<TUserRepertoireEntryDomainModel> {
    constructor(input: TBaseMongoRepoDeps) {
        super(input);
    };

    async findRepertoireByUserId(user_id: TUserId): Promise<TUserRepertoireTableRow[]> {
        const result =  await this.collection.aggregate([
            // Step 1 : filter by user
            { $match: { user_id } },

            // Step 2 : join versions
            {
                $lookup: {
                    from: "musicVersions",
                    localField: "musicVersion_id",
                    foreignField: "musicVersion_id",
                    as: "version"
                }
            },
            { $unwind: "$version" },

            // Step 3 : join music
            {
                $lookup: {
                    from: "music",
                    localField: "version.music_id",
                    foreignField: "music_id",
                    as: "music"
                }
            },
            { $unwind: "$music" },

            // Step 4 : projection
            {
                $project: {
                    musicVersion_id: "$version.musicVersion_id",
                    title: "$music.title",
                    artist: "$music.artist",
                    title_override: "$version.title_override",
                    artist_override: "$version.artist_override",
                    type: "$version.type",
                    genre: "$version.genre",
                    duration: "$version.duration",
                    key: "$version.key",
                    pitch: "$version.pitch",
                    bpm: "$version.bpm",
                    energy: "$version.energy",
                    effort: "$effort",
                    mastery: "$mastery",
                }
            }
        ]);

        return result.toArray();
    };

    findSharedRepertoireByUserIds(userIds: TUserId[]): Promise<TUserRepertoireEntryDomainModel[]> {
        const result = this.collection.aggregate([
            // 1. Repertoire des deux users
            { $match: { user_id: { $in: userIds } } },

            // 2. Join version pour accéder à music_id
            {
                $lookup: {
                    from: "musicVersions",
                    localField: "musicVersion_id",
                    foreignField: "musicVersion_id",
                    as: "version"
                }
            },
            { $unwind: "$version" },

            // 3. Grouper par music_id et collecter les utilisateurs
            {
                $group: {
                    _id: "$version.music_id",
                    userIds: { $addToSet: "$user_id" }
                }
            },

            // 4. Filtrer les morceaux en commun
            {
                $match: {
                    user_id: { $all: userIds }
                }
            },

            // 5. Récupérer les music_id communs
            {
                $project: {
                    music_id: "$_id"
                }
            },

            // 6. Rejoindre avec userRepertoire pour ces music_id
            {
                $lookup: {
                    from: "userRepertoire",
                    let: { musicId: "$music_id" },
                    pipeline: [
                        {
                            $lookup: {
                                from: "musicVersions",
                                localField: "musicVersion_id",
                                foreignField: "musicVersion_id",
                                as: "version"
                            }
                        },
                        { $unwind: "$version" },
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$version.music_id", "$$musicId"]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "music",
                                localField: "version.music_id",
                                foreignField: "music_id",
                                as: "music"
                            }
                        },
                        { $unwind: "$music" },
                        {
                            $project: {
                                musicVersionId: "$version.musicVersion_id",
                                musicTitle: "$music.title",
                                musicArtist: "$music.artist",
                                versionType: "$version.type",
                                genre: "$version.genre",
                                key: "$version.key",
                                pitch: "$version.pitch",
                                bpm: "$version.bpm",
                                energy: "$version.energy",
                                effort: 1,
                                mastery: 1,
                                createdAt: "$version.created_at",
                                updatedAt: "$version.updated_at",
                                performer_id: 1
                            }
                        }
                    ],
                    as: "entries"
                }
            },

            { $unwind: "$entries" },

            // 7. Final projection (structure plate comme pour le front)
            {
                $replaceRoot: { newRoot: "$entries" }
            }
        ]);
    };
}