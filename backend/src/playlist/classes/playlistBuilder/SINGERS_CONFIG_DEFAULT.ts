export interface ISingersConfig {
    numberOfSingers: number | null;
    containsDuo: boolean | null;
    splitMode: "alternate" | "half_split" | null;
}

export const SINGERS_CONFIG_DEFAULT: Readonly<ISingersConfig> = Object.freeze({
    numberOfSingers: null,
    containsDuo: null,
    splitMode: null,
});