export interface ISingersConfig {
    quantity: number | null;
    containsDuo: boolean | null;
    splitMode: "alternate" | "half_split" | null;
}

export class SingersConfig {
    static createDefault(): ISingersConfig {
        return {
            quantity: null,
            containsDuo: null,
            splitMode: null
        };
    };

    static createFromTemplate(input: { singersConfig: Partial<ISingersConfig> }): ISingersConfig {
        return {
            quantity: typeof input.singersConfig.quantity === 'number' ? input.singersConfig.quantity : null,
            containsDuo: typeof input.singersConfig.containsDuo === 'boolean' ? input.singersConfig.containsDuo : null,
            splitMode: typeof input.singersConfig.splitMode === 'string' ? input.singersConfig.splitMode : null,
        };
    }

    static validate(input: { singersConfig: Partial<ISingersConfig> }): Partial<ISingersConfig> {
        return {
            quantity: typeof input.singersConfig.quantity === 'number' ? input.singersConfig.quantity : null,
            containsDuo: typeof input.singersConfig.containsDuo === 'boolean' ? input.singersConfig.containsDuo : null,
            splitMode: typeof input.singersConfig.splitMode === 'string' ? input.singersConfig.splitMode : null,
        };
    }
}
