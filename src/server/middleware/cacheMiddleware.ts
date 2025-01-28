import { formatObjects, logger } from "@lib";
import { serveFromCache } from "@utils";
import cacheStore, { checkCachingPermission } from "cache/cacheManager";
import { Middleware } from "server/middlewareIntitializer";

const cacheMiddleware: Middleware = async ({ proxyURL, serverInstance, next, res }) => {
    const cacheAllowed = checkCachingPermission(serverInstance);
    if (!cacheAllowed) {
        return next();
    }
    const isHit = serveFromCache(proxyURL.urlString, res);
    if (!isHit) {
        logger.info(`CACHE MISS for ${proxyURL.urlString}\n ${formatObjects(cacheStore.getState())}`);
        return next();
    } else {
        return logger.info(`CACHE HIT for ${proxyURL.urlString}`);
    }
};

export default cacheMiddleware;