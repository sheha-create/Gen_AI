# Study Notes: Operating Systems — Concurrency and Deadlocks

## 1. Deadlock Definition
A deadlock is an operating system state where a set of processes are permanently blocked because each process holds one or more resources and is waiting for another resource acquired by some other process in the same set. Neither process can proceed without external intervention.

## 2. The Four Coffman Conditions
A deadlock can occur if and only if all four Coffman conditions hold simultaneously in the system:
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode (only one process can use the resource at any given moment).
2. **Hold and Wait**: A process must currently hold at least one resource while waiting to acquire additional resources that are currently being held by other processes.
3. **No Preemption**: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it, after that process has finished its task.
4. **Circular Wait**: A closed chain of processes exists such that each process holds at least one resource that is needed by the next process in the chain (e.g., $P_0$ waits for $P_1$, $P_1$ waits for $P_2$, ..., and $P_n$ waits for $P_0$).

## 3. Deadlock vs. Starvation
- **Deadlock**: An entire group of processes is permanently blocked. No process in the set can ever make progress. Resource utilization in the deadlock cycle drops to zero.
- **Starvation (Indefinite Blocking)**: A process is ready to execute but is repeatedly denied access to an available resource because other processes with higher priority or favored scheduling continuously bypass it. Unlike deadlock, the system as a whole continues to make progress, and other processes complete their execution.

## 4. Handling Strategies
- **Prevention**: Invalidate at least one of the four Coffman conditions (e.g., impose global resource ordering to eliminate circular wait).
- **Avoidance**: Dynamically inspect the resource allocation state using algorithms such as Dijkstra's Banker's Algorithm to guarantee the system stays in a "Safe State".
- **Detection and Recovery**: Allow deadlocks to happen, periodically run a Wait-For Graph (WFG) cycle detection algorithm, and recover via process termination or resource rollback.
