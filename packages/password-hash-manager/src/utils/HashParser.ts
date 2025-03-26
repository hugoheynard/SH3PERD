import type {IHashParser} from "../../types/Interfaces";

export const HashParser: IHashParser = {
    extract(versionedHash: string)  {
        const parts: string[] = versionedHash.split(":::");

        if (parts.length !== 5) {
            throw new Error(`Invalid hash format: expected 5 parts, got ${parts.length}`);
        }

        const [library, algorithm, versionConfig, hashed_at, rawHash] = parts;

        return {
            library,
            algorithm,
            versionConfig,
            hashed_at,
            rawHash,
        };
    },
};

