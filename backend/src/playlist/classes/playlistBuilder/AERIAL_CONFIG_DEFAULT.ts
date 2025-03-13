export interface IAerialConfig {
    performancePosition: "start" | "end" | "manual" | null;
}

export const AERIAL_CONFIG_DEFAULT: Readonly<IAerialConfig> = Object.freeze({
    performancePosition: null,
}) ;
