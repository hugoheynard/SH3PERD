export interface IAerialConfig {
    performancePosition: "start" | "end" | "manual" | null;
}

export class AerialConfig {
    static createDefault(): IAerialConfig {
        return {
            performancePosition: null,
        };
    }
}
