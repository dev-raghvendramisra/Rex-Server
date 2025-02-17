
<img src="src/static/Rex-Logo.png" alt="logo" height="150"/>


# Rex Server - User Documentation

## Overview

Rex Server is a Node.js-based reverse proxy server/load-balancer available as an npm package. It allows you to handle HTTP and HTTPS traffic, route requests to upstream servers, and manage worker processes efficiently. With its CLI interface, Rex makes it easy to configure and run a proxy server with custom settings.

## Master-Worker Architecture

Rex Server is built on a master-worker architecture powered by Node.js's `cluster` module. The master process is responsible for managing and supervising all worker processes. It handles tasks like spawning, restarting workers in case of failure, and ensuring overall stability and load distribution.

On the other hand, the worker processes do all the actual server-related tasks, such as handling client requests, serving static files, processing routes, and forwarding traffic to upstream servers. Each worker operates independently, ensuring high concurrency and efficient resource usage. This architecture enables Rex Server to scale seamlessly across multiple CPU cores, making it highly performant and resilient under heavy loads.

By splitting responsibilities between the master and worker processes, Rex Server ensures fault tolerance, stability, and the ability to handle a large volume of concurrent requests.


## Rex Server Architecture Overview

Rex Server is designed around a Reverse Proxy architecture, with the following key components:

1. **Reverse Proxy Layer:**
Rex acts as a reverse proxy, forwarding client requests to the appropriate backend services—whether that’s static files, defined routes, or upstream servers.


2. **Request Handling and Middleware Layer:**
Rex serves static files from the public directory, matches requests to configured routes, and forwards unmatched requests to upstream servers.


3. **Worker Process Management:**
Rex scales automatically by using multiple worker processes to handle concurrent requests efficiently, ensuring high availability and resource optimization.


4. **Load Balancing (Optional):**
If configured, Rex can distribute incoming requests to upstream servers, ensuring better load management.


5. **Logging and Monitoring:**
Rex provides logging to track server events and errors and can integrate with monitoring tools.

---

## Table of Contents

- [Installation](#installation)
- [Setting Up Rex Server](#setting-up-rex-server)
  - [Initializing Configuration](#initializing-configuration)
  - [Customizing the Configuration](#customizing-the-configuration)
- [CLI Commands](#cli-commands)
- [Starting the Server](#starting-the-server)
- [Stopping the Server](#stopping-the-server)
- [Understanding the Configuration File](#understanding-the-configuration-file)
- [Error Handling](#error-handling)
- [Common Troubleshooting](#common-troubleshooting)

---

## Installation

Rex Server can be installed globally or locally, but it is **intended for global use** as a system-wide utility in production or any environment where a reverse proxy server is needed.

### Global Installation (Recommended)

To install Rex Server globally on your system, use the following command:

```bash
npm install -g rex-server
```

This command installs Rex Server as a global package, making the command accessible from any directory in your terminal or command prompt.

### Local Installation (For Development or Testing)

If you prefer to install Rex Server locally in your project directory (e.g., for development or testing), you can use the following command:

```bash
npm install rex-server
```

Since it is installed locally, you must prefix all CLI commands with `npx`;. For example:

```bash
npx rex --init
npx rex start
```

**Note**: While local installation is supported, Rex Server is primarily designed as a global system utility for managing reverse proxy configurations across environments.

---

## Setting Up Rex Server

After installing Rex Server, you need to set up the configuration before running the server. You can initialize a default configuration or create a custom one based on your needs.

### Initializing Configuration

Run the following command to generate a default configuration file (`rex.config.yaml`).

For a global installation:
```bash
rex --init
```

For a local installation:
```bash
npx rex --init
```

This will create a `rex.config.yaml` file in your current working directory. The file will contain a basic configuration to get you started.

---

### Customizing the Configuration

Once you have the `rex.config.yaml` file, you can customize it to match your server's requirements. The configuration file defines how the server listens for requests, how it handles routing, and how workers are managed.

Example of a basic configuration:

```yml
server:
  instances:
    - port: 80
      public: "/absolute/path/to/your/public/directory"
      routes:
        - path: "/path1"
          destination: http://example.com
        - path: "/path2"
          destination: http://example.com
        - path: "/*"
          destination: http://example.com
      
workers: auto
```

**Important Notes**:
1. The `public` directory path **must be an absolute path** to ensure the server can locate the directory correctly.
2. SSL configuration (`cert` and `key`) **must also use absolute paths**. Ensure that the SSL certificate and key files are accessible to the Rex Server process.
3. Use proper permissions to allow the server to read these files.

Key sections to modify:

- **server.instances**: Define the ports the server listens to and the routing rules.
- **workers**: Specify the number of worker processes, or use `auto` to automatically scale the number of workers based on the number of CPU cores.
- **routes**: Configure URL paths to forward requests to different destinations.

---

## TL;DR of Configuration Flow

1. **Public Directory (`public`)**:  
    When you configure the `public` directory in the Rex server configuration, **it does not mean you are setting up a full SPA server**. Instead, Rex will only serve static files directly from the `public` directory. If a resource (e.g., an image, HTML, or CSS file) exists in that directory, it will be served to the client.

2. **If the Resource Does Not Exist in `public`**:  
    If Rex can't find the requested resource in the `public` directory, it won't serve a 404 immediately. Instead, **Rex will attempt to use the routes** defined in the configuration to see if any route matches the requested path.

3. **Using Routes**:  
    Routes allow you to define custom paths and forward requests to specific destinations (e.g., proxying requests to another server). If a matching route is found, Rex will forward the request to the destination specified in the route configuration.

4. **Forwarding to Upstream Servers**:  
    If neither the `public` directory nor the routes can fulfill the request, and if upstream servers are configured, **Rex will forward the request to one of the upstream servers**. This allows you to distribute requests to backend services or other proxy servers.

This flow ensures that Rex can handle both static file serving and dynamic routing, with a fallback mechanism that allows upstream requests to be used if necessary.

---

## CLI Commands

Rex Server provides a command-line interface (CLI) to manage your server. Here are the available commands:

### `rex init`

Initialize a new `rex.config.yaml` configuration file.

```bash
rex --init
```

### `rex load <configPath>`

Load the Rex-Serer with your custom configuration file (`rex.config.yaml`).

```bash
rex load /path/to/rex.config.yaml
```

Replace `/path/to/rex.config.yaml` with the actual path to your configuration file.
After this you need to use `rex start` again to get the new configurations come in flow.

### `rex start`

Start the Rex server

```bash
rex start
```

### `rex stop`

Stop the currently running Rex server.

```bash
rex stop
```

You can also manually specify the process ID (`PID`) to stop the server using:

```bash
rex stop -p <processId>
```

---

## Starting the Server

Once you've set up the configuration, you can start the server using the following command:

### Using the Default Configuration

```bash
rex start
```

This will start the server with the default configuration.

### Using a Custom Configuration

```bash
rex load /path/to/your/custom/config.yaml
```

Replace `/path/to/rex.config.yaml` with the actual path to your configuration file.
After this you need to use `rex start` again to get the new configurations come in flow.

### Note

Always run `rex test` after loading configuration to avoid any breakouts in runtime.

---

## Stopping the Server

To stop the server, you can run:

```bash
rex stop
```

If the server is running, this will safely stop it. You can also specify the PID manually:

```bash
rex stop -p <processId>
```

---

## Understanding the Configuration File

The configuration file is a YAML file (`rex.config.yaml`) that controls how Rex Server behaves. Below is an explanation of the key parts of the configuration.

### Example Configuration File

```yml
server:
  instances:
     - port: 80
        routes:
          - path: "/path1"
             destination: http://example.com
          - path: "/path2"
             destination: http://example.com

workers: auto
```

#### server.instances
This section defines the server instances and the ports they will listen on. Each instance can have different routes that map specific paths to upstream servers.

- **port**: The port the server will listen to (e.g., `80` for HTTP, `443` for HTTPS).
- **routes**: Define paths that will be proxied to other servers. You can specify the destination for each path.

#### Fallback Path Configuration

In Rex Server, you can define a fallback path also using the `/*` wildcard in your routes. This fallback path will be used when no other routes match the incoming request. The entire requested path will be appended to the destination URL.

Example configuration with a fallback path:

```yml
server:
  instances:
    - port: 80
      routes:
        - path: "/path1"
          destination: http://example.com
        - path: "/path2"
          destination: http://example.com
        - path: "/*"
          destination: http://fallback.example.com
```

In this example, if a request does not match `/path1` or `/path2`, it will be forwarded to `http://fallback.example.com` with the entire requested path appended.

**Behavior:**
- **Normal Path:** Only query strings are attached to the destination URL.
- **Fallback Path (`/*`):** The entire requested path is appended to the destination URL.

This ensures that unmatched requests are handled gracefully by the fallback server, providing a robust routing mechanism.

#### workers
The `workers` field defines the number of worker processes to use. If set to `auto`, the number of workers will be automatically determined based on the number of CPU cores.

---

## Error Handling

### Error Pages (e.g., 404, 503, 502)

When you encounter error pages like **404**, **503**, or **502**, here's what they mean and how to troubleshoot:

- **503 Service Unavailable**:  
  A **503** error means that the proxy server itself encountered an error and was unable to fulfill the request.  
  **Action**: Check the server logs for more detailed error messages.

- **502 Bad Gateway**:  
  A **502** error means that the upstream server or route's destination refused to connect.  
  **Action**: Verify the destination in your routing configuration and ensure the upstream server is operational.

- **404 Not Found**:  
  A **404** error indicates that the requested resource could not be found in the `public` directory or defined routes.  
  **Action**: Check the configuration for missing files or incorrect routes.

---

### Invalid Configuration Errors

Rex Server validates its configuration using the **Zod schema validation library**. If the configuration is invalid, detailed Zod validation errors will describe the issue.  

#### Example Error:

#### Example Error:
```json
{
  "code": "invalid_type",
  "expected": "array",
  "received": "object",
  "path": [
    "server",
    "instances"
  ],
  "message": "Expected array, received object"
}
```
The above error could occur if the config is something like this :

```yml
server:
  instances:
    port: 80
    routes:
      - path: "/path1"
        destination: http://example.com
      - path: "/path2"
        destination: http://example.com

workers: auto
```

#### Action:
- **Error Explanation**: The error indicates that the `instances` field under `server` is expected to be an array, but an object was provided instead.
- **Solution**: Modify the configuration to ensure `instances` is an array. Here is the corrected configuration:

```yml
server:
  instances:
    - port: 80
      routes:
        - path: "/path1"
          destination: http://example.com
        - path: "/path2"
          destination: http://example.com

workers: auto
```

- **Validation**: Ensure that all fields match the expected types as defined by the Zod schema.
- **Reference**: Refer to the [Zod documentation](https://zod.dev) for more details on validation rules and errors.


- Review the error message to identify the issue.
- Refer to the [Zod documentation](https://zod.dev) for more details on validation rules and errors.

---

## Common Troubleshooting

### "Port Already In Use"
If the error message indicates that the port is already in use, Rex will attempt to shut down the conflicting process. If it doesn't succeed, ensure no other services are using the port, or choose a different port in the configuration.

### "Permission Denied"
When running the server on ports below 1024 (such as 80 or 443), you may need to grant permissions to the `node` process.

#### On Linux
Use the following command to grant the necessary permissions:

```bash
sudo setcap cap_net_bind_service=+ep $(which node)
```

#### On macOS
Use the following command to grant the necessary permissions:

```bash
sudo npx setcap cap_net_bind_service=+ep $(which node)
```

If `setcap` is not available, you may need to install it using `brew`:

```bash
brew install libcap
```

---

## Notice:
Due to the instability of the Node.js cluster module on Windows, the server is currently optimized for Linux and macOS only. While you may still run it on Windows, stability and performance may be affected. We recommend using WSL or a Linux/macOS environment for the best experience.


## Conclusion

Rex Server is a powerful and flexible reverse proxy server that makes it easy to manage traffic, handle requests, and scale your application with worker processes. If you need further assistance, visit the [GitHub repository](https://github.com/dev-raghvendramisra/Rex-Server).

## Contribution

To know the contribution architecture and the function refrences of rex-server refer to [Developer documentation](https://github.com/dev-raghvendramisra/Rex-Server/blob/main/DEV_API.md)
