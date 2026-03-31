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
export * from './music.versions.js';
export * from './music-references.js';
export * from './music-repertoire.js';
export * from './music-tracks.js';
export * from './music-tab-configs.js';



export { SRecordMetadata } from './metadata.types.js';

//COMPANY
export * from './company.domain.js';
export * from './contracts.domain.types.js'
export * from './contract.viewModel.types.js';
export * from './contracts.dto.types.js';


//CALENDAR
export * from './event.domain.js';
export { createIdSchema } from './utils/createIdSchema.js';


//Utils
export * from './utils/form.js';

//Microservices
export * from './microservice-patterns.js';




