import { PlaylistSettingsValidator } from "../PlaylistSettingsValidator";
import {IPlaylistSettings} from "../../playlistBuilder/PLAYLIST_SETTINGS_DEFAULT";

describe("PlaylistSettingsValidator", () => {
    let validator: PlaylistSettingsValidator;

    beforeEach(() => {
        validator = new PlaylistSettingsValidator();
    });

    test("should return errors when settings are invalid", () => {
        const invalidSettings: Partial<IPlaylistSettings> = {
            name: "" as any, // ❌ Doit être non vide
            description: 123 as any, // ❌ Doit être une string
            usage: "weekly" as unknown as IPlaylistSettings["usage"], // ❌ Doit être 'daily' ou 'event'
            tags: ["rock", 42] as any, // ❌ Tous les tags doivent être des strings
            energy: 5 as unknown as IPlaylistSettings["energy"], // ❌ Doit être entre 1 et 4
            requiredLength: 12 as any, // ❌ Doit être un multiple de 5
            numberOfSongs: -3 as any, // ❌ Doit être positif
            singers: "yes" as any, // ❌ Doit être un boolean
            musicians: null as any, // ❌ Doit être un boolean
            aerial: undefined as any, // ❌ Doit être un boolean
        };

        const result = validator.getValidationObject({ settingsToValidate: invalidSettings });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toEqual({
            name: "Name must be a non-empty string",
            description: "Description must be a string",
            usage: "Usage must be 'daily' or 'event'",
            tags: "Tags must be an array of strings",
            energy: "Energy must be a number between 1 and 4",
            requiredLength: "Required length must be a positive multiple of 5",
            numberOfSongs: "Number of songs must be a positive number",
            singers: "Singers must be a boolean",
            musicians: "Musicians must be a boolean",
            aerial: "Aerial must be a boolean",
        });
    });

    test("should return valid settings when all inputs are correct", () => {
        const validSettings: Partial<IPlaylistSettings> = {
            name: "My Playlist",
            description: "A cool playlist",
            usage: "daily",
            tags: ["rock", "pop"],
            energy: 3,
            requiredLength: 15,
            numberOfSongs: 10,
            singers: true,
            musicians: false,
            aerial: false,
        };

        const result = validator.getValidationObject({ settingsToValidate: validSettings });

        expect(result).toEqual({
            name: true,
            description: true,
            usage: true,
            tags: true,
            energy: true,
            requiredLength: true,
            numberOfSongs: true,
            singers: true,
            musicians: true,
            aerial: true,
        });
    });

    test("should return partial errors when some settings are correct and others incorrect", () => {
        const mixedSettings: Partial<IPlaylistSettings> = {

            description: 123 as any, // ❌ Doit être une string
            usage: "event" as unknown as IPlaylistSettings["usage"], // ✅ Valide
            tags: ["rock", "pop"], // ✅ Valide
            energy: 5 as unknown as IPlaylistSettings["energy"], // ❌ Doit être entre 1 et 4
            requiredLength: 20, // ✅ Valide
            numberOfSongs: -5, // ❌ Doit être positif
            singers: true, // ✅ Valide
            musicians: "no" as any, // ❌ Doit être un boolean
            aerial: false, // ✅ Valide
        };

        const result = validator.getValidationObject({ settingsToValidate: mixedSettings });

        expect(result).toEqual({
            name: false,
            description: false,
            usage: true,
            numberOfSongs: false,
            tags: true,
            energy: false,
            requiredLength: true,
            singers: true,
            musicians: false,
            aerial: true,
            errors: {
                name: "Name must be a non-empty string",
                description: "Description must be a string",
                energy: "Energy must be a number between 1 and 4",
                numberOfSongs: "Number of songs must be a positive number",
                musicians: "Musicians must be a boolean",
            },
        });
    });

    test("should return an error if no settings are provided", () => {
        const result = validator.getValidationObject({ settingsToValidate: undefined as any });

        expect(result).toEqual({
            errors: {
                general: "No settings to validate",
            },
        });
    });
});
