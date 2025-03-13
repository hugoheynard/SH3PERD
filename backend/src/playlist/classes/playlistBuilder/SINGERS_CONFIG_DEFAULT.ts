export interface ISingersConfig {
    quantity: number | null;
    containsDuo: boolean | null;
    splitMode: "alternate" | "half_split" | null;
}

export const SINGERS_CONFIG_DEFAULT: Readonly<ISingersConfig> = Object.freeze({
    quantity: null,
    containsDuo: null,
    splitMode: null,
});