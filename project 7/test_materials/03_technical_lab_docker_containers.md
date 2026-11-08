# Lab Manual & Technical Guide: Docker Containerization & Networking

## Lab Overview
This laboratory module covers container image creation, multi-stage builds, container lifecycle commands, bridge networking, volume persistence, and port-binding troubleshooting.

## 1. Multi-Stage Dockerfile Architecture
To minimize attack surface and image size, production Docker builds utilize multi-stage pipelines:

```dockerfile
# Stage 1: Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server .

# Stage 2: Final minimal runtime
FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
ENTRYPOINT ["./server"]
```
Key Directives:
- `AS builder`: Names the initial compile stage.
- `COPY --from=builder /app/server .`: Copies only the compiled binary artifact from the builder container into the slim final image, discarding compilers, SDKs, and intermediate caches.

## 2. Container Lifecycle & CLI Operations
- **Build image**: `docker build -t myapp:1.0 .`
- **Run container detached with port forwarding**:
  `docker run -d --name webapp -p 8080:80 --restart unless-stopped myapp:1.0`
  *Syntax Note*: `-p <HostPort>:<ContainerPort>`. The host listens on 8080 and routes incoming packets to port 80 inside the container.
- **Inspect running processes**: `docker top webapp`
- **View container logs**: `docker logs -f --tail 50 webapp`
- **Interactive shell execution**: `docker exec -it webapp /bin/sh`
- **Stop and remove**: `docker stop webapp && docker rm webapp`

## 3. Storage Persistence: Named Volumes vs. Bind Mounts
- **Named Volumes (`-v db_data:/var/lib/mysql`)**: Managed entirely by Docker within host filesystem storage (typically `/var/lib/docker/volumes/`). Recommended for databases because Docker preserves permissions and isolates volume management from host OS paths.
- **Bind Mounts (`-v /home/user/app:/usr/share/nginx/html`)**: Direct filesystem mapping of an arbitrary host path to a container path. Changes made on the host immediately reflect inside the container, making bind mounts optimal for local source-code hot reloading.

## 4. Container Networking Modes
1. **Bridge (`--network bridge`)**: Default network driver. Creates an internal private software subnet (e.g., `172.17.0.0/16`). Containers communicate with each other via internal IP addresses or custom DNS bridge aliases. External traffic requires explicit port publishing (`-p`).
2. **Host (`--network host`)**: Removes network isolation between the container and Docker host. The container directly binds to the host's physical network interfaces. No `-p` forwarding is needed; port collisions occur if the host already listens on that port.
3. **None (`--network none`)**: Disables all networking interfaces except loopback (`lo`). Used for isolated batch compute jobs.

## 5. Troubleshooting: Port Binding Conflicts
Symptom: `Error response from daemon: driver failed programming external connectivity on endpoint webapp: Bind for 0.0.0.0:8080 failed: port is already allocated`
Resolution Steps:
1. Identify the offending process occupying port 8080 on the host:
   `lsof -i :8080` (Linux/macOS) or `Get-NetTCPConnection -LocalPort 8080` / `netstat -ano | findstr :8080` (Windows).
2. Either terminate the conflicting host PID, or remap the host port in Docker run:
   `docker run -d -p 8081:80 --name webapp myapp:1.0`
