# Chapter 7 Extract: Consensus and Fault Tolerance in Distributed Systems

## 7.1 The Distributed Consensus Problem
In asynchronous distributed networks with crash-stop or crash-recovery fault models, consensus is the fundamental problem of getting a cluster of autonomous nodes to agree on a single data value or a deterministic sequence of state machine transitions. Under the FLP Impossibility Theorem (Fischer, Lynch, Paterson, 1985), no completely asynchronous consensus protocol can guarantee both safety and liveness in the presence of even a single unannounced node crash. Practical consensus protocols circumvent FLP by assuming partial synchrony—periods where message transmission delays are bounded.

## 7.2 The Raft Consensus Algorithm
Raft achieves consensus by decomposing the consensus problem into three independent subproblems:
1. **Leader Election**: Selecting one node to act as the primary coordinator.
2. **Log Replication**: Accepting client command entries, appending them to the local log, and replicating them across the follower nodes.
3. **Safety Enforcement**: Guaranteeing that if any server applies a log entry at a given index to its state machine, no other server will ever apply a different log entry for that exact index.

### 7.2.1 Node States and Term Counters
A Raft node exists in one of three mutually exclusive states at any given time:
- **Leader**: Handles all client requests, coordinates log replication, and transmits periodic heartbeats (`AppendEntries` RPCs with empty payloads) to maintain authority.
- **Follower**: Passive state; responds to incoming RPCs from leaders and candidates. Does not initiate communication.
- **Candidate**: Active transitional state entered when an election timeout elapses without receiving a heartbeat. Initiates a new election term and issues `RequestVote` RPCs to all peers.

Time is structured into logical **Terms**, represented by monotonically increasing integers. Terms act as logical clocks in Raft:
- If a candidate or leader detects that its current term is smaller than another node's term, it immediately reverts to Follower status and updates its local term.
- If a server receives a request carrying a stale term counter, the request is immediately rejected.

### 7.2.2 Leader Election Mechanics
Each follower node initializes a randomized election timeout between 150ms and 300ms. The randomization prevents split-vote situations where multiple nodes transition simultaneously:
1. When a follower's election timer expires, it increments its `currentTerm`, transitions to the Candidate state, votes for itself, and broadcasts `RequestVote` RPCs in parallel to all cluster nodes.
2. A candidate wins the election if and only if it receives affirmative votes from a strict majority ($\lfloor N/2 \rfloor + 1$) of nodes in the cluster.
3. Each node can cast at most one vote per term, granted on a first-come, first-served basis, provided the candidate's log is at least as up-to-date as the voter's own log (Log Completeness Rule).

### 7.2.3 Log Replication and Commit Rule
Once elected, the leader receives state updates from clients:
1. The leader appends the command to its own log as an uncommitted entry.
2. The leader sends `AppendEntries` RPCs to all follower nodes.
3. When the entry has been safely replicated to a majority of cluster nodes, the leader marks the entry as **committed**.
4. The leader applies the committed command to its local state machine and returns the execution result to the client.
5. In subsequent `AppendEntries` heartbeats, the leader includes its updated `commitIndex`, notifying followers to commit and apply the entry to their respective local state machines.

### 7.2.4 Split-Brain and Partition Tolerance
In a network partition scenario where a 5-node cluster is severed into a minority partition $\{A, B\}$ and a majority partition $\{C, D, E\}$:
- The minority partition cannot achieve a quorum of 3 votes. If an isolated candidate in $\{A, B\}$ attempts an election, it cannot gather $\ge 3$ votes, preventing a rogue leader from committing entries.
- The majority partition $\{C, D, E\}$ possesses 3 out of 5 nodes. It successfully elects a leader and continues to safely replicate and commit client transactions.
- When the network partition heals, the isolated nodes receive `AppendEntries` from the true leader with a higher term counter, revert to followers, and overwrite any uncommitted conflicting log indices to achieve uniform convergence.
