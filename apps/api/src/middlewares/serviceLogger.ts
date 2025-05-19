import { logger } from "../utils/logger";

/**
 * Creates a proxy for a service class that logs method calls
 * @param ServiceClass The service class to wrap
 * @returns A proxy of the service class with logging
 */
export function createServiceLogger<T extends object>(ServiceClass: T): T {
  return new Proxy(ServiceClass, {
    get(target: any, prop: string | symbol) {
      // Get the original property
      const originalProperty = target[prop];

      // If the property is not a function or it's a special method, return it as is
      if (
        typeof originalProperty !== "function" ||
        prop === "constructor" ||
        typeof prop !== "string"
      ) {
        return originalProperty;
      }

      // Return a wrapped version of the original method
      return function (...args: any[]) {
        const methodName = `${ServiceClass.constructor.name}.${String(prop)}`;

        // Log method call with parameters
        logger.info(
          `>>> ${methodName} CALLED with params: ${safeStringify(args)}`
        );

        // Call the original method
        try {
          const result = originalProperty.apply(target, args);

          // Check if result is a Promise
          if (result instanceof Promise) {
            return result
              .then((resolvedValue) => {
                // Only log errors, not return values
                return resolvedValue;
              })
              .catch((error) => {
                logger.error(`!!! ${methodName} FAILED with error: ${error}`);
                throw error;
              });
          } else {
            // For synchronous methods - no return value logging
            return result;
          }
        } catch (error) {
          logger.error(`!!! ${methodName} FAILED with error: ${error}`);
          throw error;
        }
      };
    },
  }) as T;
}

/**
 * Safely converts an object to a string for logging, handling circular references
 * @param obj The object to stringify
 * @returns A string representation of the object
 */
function safeStringify(obj: any): string {
  try {
    // Handle circular references
    const cache: any[] = [];
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (cache.includes(value)) {
            // Return a simplified version for circular references
            return "[Circular Reference]";
          }
          cache.push(value);
        }
        return value;
      },
      2
    );
  } catch (error) {
    return "[Unable to stringify value]";
  }
}
