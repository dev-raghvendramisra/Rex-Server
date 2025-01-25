
<img src="src/static/Rex-Logo.png" height="150"/>


# Rex Server - Developer Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Code Structure](#code-structure)
- [Key Components](#key-components)
- [Request Flow](#request-flow)
- [Function Reference](#function-reference)
- [Error Handling](#error-handling)
- [Development and Contribution Guidelines](#development-and-contribution-guidelines)

## Overview
Rex Server is a Node.js-based reverse proxy server that combines high performance, flexibility, and scalability. It serves as a reverse proxy, routing client requests to static files, configured routes, or upstream servers. It also supports features like load balancing, worker scaling, and middleware extensibility.

## Architecture
1. **Reverse Proxy Architecture**  
    Rex Server acts as an intermediary between clients and backend services, forwarding requests to the appropriate destination (static files, routes, or upstream servers).

2. **Master-Worker Model**  
    The master process manages worker processes and oversees server lifecycle management. Worker processes handle incoming requests, ensuring high concurrency and fault tolerance.

3. **Middleware-Driven Request Handling**  
    Requests are processed through a middleware stack, enabling modular and extensible handling of static files, routing, and upstream forwarding.

4. **Load Balancing**  
    When configured, Rex distributes requests across multiple upstream servers, enhancing performance and fault tolerance.

## Code Structure
```
src/
├── cli/                     # Command-line interface implementation
│   └── actions/             # CLI actions like start, stop, initialize
├── conf/                    # Configuration files and constants
├── lib/                     # Helper libraries (logging, formatting, etc.)
├── master/                  # Master process management
├── server/                  # Core server implementation
│   ├── middleware/              # Request Middlewares (static, routes, upstream)
│   ├── middlewareInitializer.ts  # Initializes middleware stack
│   ├── proxyReq.ts               # Handles proxy requests
│   └── startWorkerProcess.ts     # Worker process initialization
├── root/                    # Static directory for mock.rex.config.yaml and static HTML files
├── worker/                  # Worker process management
├── utils/                   # General utility functions
└── types/                   # Type definitions (Zod schemas, interfaces)
```

## Key Components
### Master Process
**File:** `src/master/index.ts`  
Manages worker processes, handles lifecycle events, and processes messages from workers.

### Worker Processes
**File:** `src/server/startWorkerProcess.ts`  
Handles incoming requests and processes them through middleware.

### Middleware Layer
**File:** `src/server/middlewareInitializer.ts`  
Processes requests through static file Middlewares, route matching, and upstream forwarding.

## Initialization

When `index.ts` is invoked from the CLI through functions like `startRexServer`, it uses functions such as `startMasterProcess` to start the master process and `startWorkerProcess` to start worker processes. This is managed by the Node.js `cluster` module. The master process oversees the worker processes and makes decisions, while the workers start servers to handle connections. Load balancing between the workers is handled by the operating system when we use `cluster` which reduces one overhead.

Request flow is explained below breifly-

## Request Flow
**Incoming Request:**  
A request is received by a worker process.

**Middleware Processing:**

- **Static Request Middleware:** Checks the public directory for the requested resource.
- **Route Middleware:** Matches the request path to a configured route.
- **Upstream Middleware:** Forwards the request to an upstream server if no route matches.

**Response:**  
The worker sends the response back to the client. If an error occurs, the appropriate error page (404, 502, or 503) is served.

## Function Reference
### `src/actions/initializeRexConfig.ts`
**Function:** `initializeRexConfig()`  
**Description:** Creates a default configuration file by copying from a mock configuration.  
**Parameters:** None  

### `src/actions/startRexServer.ts`
**Function:** `startRexServer(masterPidPath, configPath)`  
**Description:** Ensures any running server is stopped, parses the config, and starts the server.  
**Parameters:**  
- `masterPidPath`: Path to the master PID file.  
- `configPath`: Optional path to the configuration file.  

### `src/actions/stopRexServer.ts`
**Function:** `stopRexServer(options, masterPidPath)`  
**Description:** Stops the server by reading the PID and sending a `SIGTERM` signal.  
**Parameters:**  
- `options`: Object containing the PID.  
- `masterPidPath`: Path to the master PID file.  

### `src/master/index.ts`
**Functions:**  
1. `startMasterProcess(config)`  
    **Description:** Starts the master process and forks worker processes.  
    **Parameters:**  
    - `config`: Configuration object parsed from the config file.  

2. `terminateMasterProcess(cluster)`  
    **Description:** Terminates all worker processes and exits the master process.  
    **Parameters:**  
    - `cluster`: The cluster module instance managing the workers.  

### `src/server/startWorkerProcess.ts`
**Function:** `startWorkerProcess(config)`  
**Description:** Initializes worker processes, binds them to ports, and starts the middleware stack.  
**Parameters:**  
- `config`: Configuration object parsed from the config file.  

### `src/server/middlewareInitializer.ts`
**Function:** `MiddlewareInitializer(config, serverInstance, ...Middlewares)`  
**Description:** Sets up the middleware chain for request processing.  
**Parameters:**  
- `config`: Configuration object.  
- `serverInstance`: The server instance.  
- `...Middlewares`: Middleware functions.  

### `src/middleware/staticReqMiddleware.ts`
**Function:** `staticReqMiddleware()`  
**Description:** Serves files from the `public` directory if they exist.  
**Parameters:**  
- `props`: Middleware props containing `req`, `res`, and other details.  

### `src/middleware/routeReqMiddleware.ts`
**Function:** `routeReqMiddleware()`  
**Description:** Matches requests to defined routes and proxies them to the destination.  
**Parameters:**  
- `props`: Middleware props containing `req`, `res`, and other details.  

### `src/middleware/upstreamReqMiddleware.ts`
**Functions:**  
1. `upstreamReqMiddleware()`  
    **Description:** Forwards requests to upstream servers when no static file or route matches.  
    **Parameters:**  
    - `props`: Middleware props containing `req`, `res`, and other details.  

2. `getNextUpstream(upstreams, crrIndex)`  
    **Description:** Determines the next upstream server to forward the request to.  
    **Parameters:**  
    - `upstreams`: List of upstream servers.  
    - `crrIndex`: Current index of the upstream server.  

### `src/middleware/fallbackmiddleware.ts`
**Function:** `fallbackmiddleware()`  
**Description:** Serves an appropriate error page (404, 502, or 503) based on the error.  
**Parameters:**  
- `props`: Middleware props containing `req`, `res`, and other details.  

### `src/utils/processUtils.ts`
**Functions:**  
1. `readPid(pidPath)`  
    **Description:** Reads the PID from the specified file.  
    **Parameters:**  
    - `pidPath`: Path to the PID file.  

2. `writePid(pidPath, pid)`  
    **Description:** Writes the PID to the specified file.  
    **Parameters:**  
    - `pidPath`: Path to the PID file.  
    - `pid`: Process ID to write.  

3. `doesPidExists(pidPath)`  
    **Description:** Checks if the PID file exists and throws an error if missing.  
    **Parameters:**  
    - `pidPath`: Path to the PID file.  

### `src/utils/configParser.ts`
**Function:** `configParser(configPath)`  
**Description:** Reads, parses, and validates the `rex.config.yaml` file.  
**Parameters:**  
- `configPath`: Path to the configuration file.  

### `src/utils/reqUtils.ts`
**Functions:**  
1. `createReqOptions(req, proxyURL, destination)`  
    **Description:** Creates options for forwarding requests to proxy destinations.  
    **Parameters:**  
    - `req`: Incoming request.  
    - `proxyURL`: Parsed URL.  
    - `destination`: Target destination URL.  

2. `getCtypeAndStream(pathname, staticDir)`  
    **Description:** Retrieves the content type and file stream for a static resource.  
    **Parameters:**  
    - `pathname`: File path.  
    - `staticDir`: Path to the static directory.  

3. `Middlewareedirects(maxRedirect, res, crrRedirect)`  
    **Description:** Ensures requests don't exceed the maximum redirect count.  
    **Parameters:**  
    - `maxRedirect`: Max redirects allowed.  
    - `res`: Server response.  
    - `crrRedirect`: Current redirect count.  

### `src/utils/errUtils.ts`
**Functions:**  
1. `handlePortErr(err)`  
    **Description:** Handles errors related to port binding or conflicts.  
    **Parameters:**  
    - `err`: Error object.  

2. `handleMemErr(err)`  
    **Description:** Handles memory-related errors (e.g., out-of-memory conditions).  
    **Parameters:**  
    - `err`: Error object.  

### `src/utils/ipcUtils.ts`
**Functions:**  
1. `informMasterAboutEvt(message)`  
    **Description:** Sends a message from a worker to the master process.  
    **Parameters:**  
    - `message`: Message object to send.  

2. `informParentAboutEvt(message)`  
    **Description:** Sends a message from the worker to the parent process.  
    **Parameters:**  
    - `message`: Message object to send.  

## Error Handling
### Validation Errors
**Source:** `rex.config.yaml`  
**Description:** Invalid configuration fields are flagged by Zod validation.  
**Solution:** Refer to the error message and the Zod documentation.

### Runtime Errors
- **503 Service Unavailable:** Indicates a worker process or proxy server error.  
  **Action:** Check server logs for detailed error messages.
- **502 Bad Gateway:** Indicates an issue with upstream servers or route destinations.  
  **Action:** Verify upstream servers are reachable and routes are correctly configured.
- **404 Not Found:** Indicates the requested resource was not found in the public directory or defined routes.  
  **Action:** Check the public directory and route configuration.

## Development and Contribution Guidelines
### Setting Up the Development Environment
1. Clone the repository:
    ```bash
    git clone https://github.com/dev-raghvendramisra/Rex-Server.git
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Build the project (if necessary):
    ```bash
    npm run build
    ```
4. To Run the server in development mode:
    ```bash
    npm start
    ```

5. keep in mind that Rex-Server runs as background process so when you are done run the below command to ensure it does'nt keep consuming resources :
    ```bash
    npm start
    ```

### Adding New Features
- **Follow the Code Structure:**
  - Place new middleware in `src/middleware/`.
  - Add new CLI commands in `src/cli/`.
- **Write Tests:**
  - Add unit tests for new functionality in the `test/` directory.
- **Update Documentation:**
  - Update the README and developer documentation with details about new features.

### Coding Standards
- Use TypeScript for type safety.
- Follow the existing code style and naming conventions.
- Run `npm run lint` to ensure code quality.

### Submitting Pull Requests
1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature/new-feature
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Add new feature"
    ```
4. Push your branch and open a pull request.

## Conclusion
This documentation provides a detailed look at Rex Server's architecture, code structure, and development guidelines. By following these practices, you can effectively contribute to the project or extend its functionality. For more details, refer to the GitHub repository.
