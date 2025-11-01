const API_MODELS_KEY = Symbol('API_MODELS_KEY');

/**
 * Marks a DTO as globally available in Swagger extraModels.
 * e.g. @ApiModel()
 */
export function ApiModel(): ClassDecorator {
  return (target) => {
    const existing = Reflect.getMetadata(API_MODELS_KEY, globalThis) || [];
    Reflect.defineMetadata(API_MODELS_KEY, [...existing, target], globalThis);
  };
}

/**
 * Retrieves all DTOs marked with @ApiModel().
 * to be used in SwaggerModule setup.
 * e.g. extraModels: getApiModels()
 */
export function getApiModels(): any[] {
  return Reflect.getMetadata(API_MODELS_KEY, globalThis) || [];
}
