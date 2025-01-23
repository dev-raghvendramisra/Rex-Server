
<img src="src/root/static/Rex-Logo.png" height="150"/>


# Rex Server - User Documentation

## Overview

Rex Server is a Node.js-based reverse proxy server available as an npm package. It allows you to handle HTTP and HTTPS traffic, route requests to upstream servers, and manage worker processes efficiently. With its CLI interface, Rex makes it easy to configure and run a proxy server with custom settings.

### Rex Server Architecture

Rex Server is designed around a **Reverse Proxy** architecture, with the following key components:

1. **Reverse Proxy Layer**:  
    Rex acts as a reverse proxy, forwarding client requests to the appropriate backend services—whether that's static files, defined routes, or upstream servers.

2. **Request Handling and Middleware Layer**:  
    Rex serves static files from the `public` directory, matches requests to configured routes, and forwards unmatched requests to upstream servers.

3. **Worker Process Management**:  
    Rex scales automatically by using multiple worker processes to handle concurrent requests efficiently, ensuring high availability and resource optimization.

4. **Load Balancing (Optional)**:  
    If configured, Rex can distribute incoming requests to upstream servers, ensuring better load management.

5. **Logging and Monitoring**:  
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

To use Rex Server in your project, you need to install it as an npm package.

### Step 1: Install Rex Server

You can install Rex Server globally or as a local dependency in your project.

#### Option 1: Global Installation
```bash
npm install -g rex-server
```

#### Option 2: Local Installation
```bash
npm install rex-server
```

If installed locally, you can run Rex Server using `npx rex-server`.

---

## Setting Up Rex Server

After installing Rex Server, you need to set up the configuration before running the server. You can initialize a default configuration or create a custom one based on your needs.

### Initializing Configuration

Run the following command to generate a default configuration file (`rex.config.yaml`).

```bash
rex --init
```

This will create a `rex.config.yaml` file in your current working directory. The file will contain a basic configuration to get you started.

### Customizing the Configuration

Once you have the `rex.config.yaml` file, you can customize it to match your server's requirements. The configuration file defines how the server listens for requests, how it handles routing, and how workers are managed.

Example of a basic configuration:

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
rex init
```

### `rex use <configPath>`

Start the server using a specific configuration file (`rex.config.yaml`).

```bash
rex use /path/to/rex.config.yaml
```

Replace `/path/to/rex.config.yaml` with the actual path to your configuration file.

### `rex start`

Start the Rex server with the default configuration.

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

This will start the server with default configuration.

### Using a Custom Configuration

```bash
rex use /path/to/your/custom/config.yaml
```

Replace `/path/to/your/custom/config.yaml` with the actual path to your configuration file.

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
```
Invalid config file syntax: Path "server.instances[0].port" must be between 0 and 65535.
```

#### Action:
- Review the error message to identify the issue.
- Refer to the [Zod documentation](https://zod.dev) for more details on validation rules and errors.

---

## Common Troubleshooting

### "Port Already In Use"
If the error message indicates that the port is already in use, Rex will attempt to shut down the conflicting process. If it doesn't succeed, ensure no other services are using the port, or choose a different port in the configuration.

### "Permission Denied"
When running the server on ports below 1024 (such as 80 or 443), you may need to grant permissions to the `node` process on Linux:

```bash
sudo setcap cap_net_bind_service=+ep $(which node)
```

---

## Conclusion

Rex Server is a powerful and flexible reverse proxy server that makes it easy to manage traffic, handle requests, and scale your application with worker processes. If you need further assistance, visit the [GitHub repository](https://github.com/dev-raghvendramisra/Rex-Server).
