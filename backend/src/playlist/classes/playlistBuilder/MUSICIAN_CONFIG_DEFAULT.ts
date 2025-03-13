export interface IMusicianConfig {
    role: "solo" | "duo" | null;
}

export const MUSICIAN_CONFIG_DEFAULT: Readonly<IMusicianConfig> = Object.freeze({
    role: null,
});