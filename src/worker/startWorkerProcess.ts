import { IPCERRMessage, NodeJsErr, REX_CONFIG } from "@types";
import https, { Server as HttpsServer } from "https";
import http, { Server as HttpServer } from "http";
import cluster, { Worker } from "cluster";
import { formatObjects, logger } from "@lib";
import { informMasterAboutEvt, workerReady } from "@utils";
import {
  staticReqMiddleware,
  upstreamReqMiddleware,
  routeReqMiddleware,
  fallbackMiddleware,
} from "server/middleware";
import MiddlewareIntitializer from "../server/middlewareIntitializer";
import { getSSLConfig } from "@utils";

/**
 * Starts a worker process that handles HTTP and HTTPS requests on the specified ports.
 *
 * This function creates HTTP and/or HTTPS servers based on the configuration and binds them to the specified ports.
 * It also handles uncaught exceptions and forwards errors to the master process.
 *
 * @param {REX_CONFIG} config - The configuration for the worker, including the ports to listen on and SSL settings.
 *
 * @example
 * startWorkerProcess({
 *   server: { listen: [80, 443] },
 *   sslConfig: { cert: 'path/to/cert', key: 'path/to/key' },
 * });
 */

export function startWorkerProcess(config: REX_CONFIG) {
  const serverInstances = config.server.instances;
  type serverType = HttpServer | HttpsServer;
  config.initUpstream = 0;
  const servers: serverType[] = [];
  let readyServers = 0;

  try {
    serverInstances.forEach((server) => {
      if (server.port == 443) {
        const httpsServer = https.createServer(
          getSSLConfig({
            cert: server.sslConfig?.cert as string,
            key: server.sslConfig?.key as string,
          }),
          MiddlewareIntitializer(
            config,
            server,
            staticReqMiddleware,
            routeReqMiddleware,
            upstreamReqMiddleware,
            fallbackMiddleware
          )
        );

       httpsServer.listen(server.port, () => {
          readyServers++;
          if (readyServers == serverInstances.length) {
            workerReady(cluster.worker as Worker);
          }
        });
       return servers.push(httpsServer);
      }
      const httpServer = http.createServer(
        MiddlewareIntitializer(
          config,
          server,
          staticReqMiddleware,
          routeReqMiddleware,
          upstreamReqMiddleware,
          fallbackMiddleware
        )
      );
      httpServer.listen(server.port, () => {
        readyServers++;
        if (readyServers == serverInstances.length) {
          workerReady(cluster.worker as Worker);
        }
      });
      servers.push(httpServer);
    });
  } catch (error) {
    informMasterAboutEvt<IPCERRMessage>({
      type: "error",
      data: error as NodeJsErr,
    });
    logger.error(
      `SERVER_ STARTUP_FAILED_IN ${cluster.worker?.id} ${formatObjects(
        error as Object
      )}`
    );
  }

  servers.forEach((server) => {
    server.on("error", (err: unknown) => {
      informMasterAboutEvt<IPCERRMessage>({
        type: "error",
        data: err as NodeJsErr,
      });
      logger.error(
        `SERVER_ERROR_OCCURED_IN_WORKER ${cluster.worker?.id} ${err}`
      );
    });
  });

  process.on("uncaughtException", (err: unknown) => {
    informMasterAboutEvt<IPCERRMessage>({
      type: "error",
      data: err as NodeJsErr,
    });
    logger.error(
      `UNCAUGHT_EXCEPTION_FOUND_IN_WORKER ${cluster.worker?.id} ${formatObjects(
        err as Object
      )}`
    );
  });
  
  process.on("SIGTERM", () => {
    logger.warn(`🛠️  Worker process ${cluster.worker?.id} shutting down ..`);
    process.exit(0);
  });
}





