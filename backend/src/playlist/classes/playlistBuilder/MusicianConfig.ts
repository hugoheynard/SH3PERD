export interface IMusicianConfig {
    role: "solo" | "duo" | null;
}

export class MusicianConfig {
    static createDefault(): IMusicianConfig {
        return {
            role: null,
        };
    };
}