// Entry point for @sh3pherd/shared-types
export * from './ids.js';


export * from './api.types.js';
export * from './metadata.types.js';

//AUTH
export * from './auth.domain.js';
export * from './auth.dto.types.js';


//USER
export * from './user/user.domain.js';
export * from './user/user-credentials.js';
export * from './user/user-profile.js';
export * from './user/user-preferences.js';
export * from './user/user.readModels.types.js';



export * from './user/user-group.types.js';

/**
 * MUSIC
 */

export * from './music.domain.schemas.js';
export * from './music.domain.types.js';
export * from './music-versions.types.js';
export * from './music-references.types.js';
export * from './music-repertoire.types.js';
export * from './music-tracks.js';
export * from './music-tab-configs.js';

/**
 * PLAYLISTS
 */

export * from './playlists.js';


export { SRecordMetadata } from './metadata.types.js';

//PERMISSIONS
export * from './permissions.types.js';

//PLATFORM CONTRACT
export * from './platform-contract.types.js';

//PRICING
export * from './pricing.types.js';

//COMPANY
export * from './company/communication.types.js';
export * from './company/company.types.js';
export * from './company/orgnode.types.js';
export * from './company/membership-event.types.js';
export * from './company/company-settings.dto.js';
export * from './company.domain.js';    // barrel re-export + deprecated aliases
export * from './contracts.domain.types.js'
export * from './contract.viewModel.types.js';
export * from './contracts.dto.types.js';


//INTEGRATIONS
export * from './integrations/index.js';

//CALENDAR
export * from './event.domain.js';
export { createIdSchema } from './utils/createIdSchema.js';


//Utils
export * from './utils/form.js';

//CROSS SEARCH
export * from './music-cross-search.types.js';

//Microservices
export * from './microservice-patterns.js';

//Password Reset
export * from './password-reset.types.js';




