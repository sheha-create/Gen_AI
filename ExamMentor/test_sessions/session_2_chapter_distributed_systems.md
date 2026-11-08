# ExamMentor Viva Test Session 2: Longer Chapter Extract

**Input Document:** `test_materials/02_chapter_extract_distributed_systems.md`  
**Topic:** Chapter 7: Consensus and Fault Tolerance in Distributed Systems (Raft Algorithm)  
**Session Goal:** Verify skill performance on a complex multi-section chapter extract, validating topic extraction, question balance, precise section references (without hallucinating unstated page numbers), and high-mastery reporting.

---

## 1. Session Ingestion & Initialization

### Learner Invocation:
> `/viva`
> I've attached my reading notes for Chapter 7: Consensus and Fault Tolerance in Distributed Systems. Let's do a 5-question viva session.
>
> *(Attached contents of `test_materials/02_chapter_extract_distributed_systems.md`)*

### ExamMentor Kickoff:
```markdown
# 🎓 ExamMentor Viva Session: Raft Consensus & Fault Tolerance

**Source Material:** Chapter 7 Extract: Consensus and Fault Tolerance in Distributed Systems  
**Topics Identified:**  
- Section 7.1: Distributed Consensus & FLP Impossibility Theorem (Partial Synchrony)  
- Section 7.2: Raft Consensus Algorithm & 3 Subproblems  
- Section 7.2.1: Node States (Leader, Follower, Candidate) & Logical Term Counters  
- Section 7.2.2: Leader Election Mechanics, Randomized Timeouts & Quorum Rules  
- Section 7.2.3: Log Replication, Commit Rule & Heartbeats  
- Section 7.2.4: Split-Brain & Network Partition Tolerance  
**Total Questions Planned:** 5  
**Scoring Rubric:**  
- `[2/2]` **Correct & Complete** — Fully covers essential points.  
- `[1/2]` **Partially Correct** — Right direction, but missing key details.  
- `[0/2]` **Incorrect / Unanswered** — Contradicts notes, skipped, or off-topic.  

*(Note: We will proceed one question at a time. Take your time to answer concisely.)*

---

### ❓ Question 1 of 5
**Category:** Definition  
**Topic:** Section 7.1 — Consensus & The FLP Impossibility Theorem  

> **According to Section 7.1 of your notes, what does the FLP Impossibility Theorem state regarding asynchronous consensus, and what practical assumption allows algorithms like Raft to circumvent it?**

👉 *Please provide your oral/written answer below:*
```

---

## 2. Interactive Viva Dialogue & Rubric Evaluation

### ── Question 1 ──

**Learner Answer:**
> The FLP Impossibility Theorem states that in a completely asynchronous network, no consensus protocol can guarantee both safety and liveness if even a single node can crash unannounced. Practical algorithms like Raft circumvent this by assuming partial synchrony, meaning there are periods where message delays are bounded.

**ExamMentor Evaluation & Q2 Prompt:**
```markdown
### 📝 Evaluation: Question 1 of 5

- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Perfectly stated both the core limitation of FLP (cannot guarantee safety and liveness with 1 unannounced crash under full asynchrony) and the circumventing assumption (partial synchrony / bounded transmission delays).
- **Gaps or Corrections:** None. Exactly matches Section 7.1.
- **Model Answer:** Under the FLP Impossibility Theorem, no completely asynchronous consensus protocol can guarantee both safety and liveness with even a single unannounced node crash. Practical protocols circumvent FLP by assuming partial synchrony—periods where network transmission delays are bounded.
- **Current Running Score:** **2 / 2** (100.0%)

---

### ❓ Question 2 of 5
**Category:** Explanation  
**Topic:** Section 7.2.2 — Leader Election Protocol  

> **Explain the mechanics of a Raft election when a follower node times out. How does it transition, what does it broadcast, and under what condition does it declare victory?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 2 ──

**Learner Answer:**
> When the election timeout expires, the follower increments its term counter, transitions to Candidate, votes for itself, and broadcasts RequestVote RPCs to all peers. It wins if it gets affirmative votes from a strict majority of nodes (floor(N/2) + 1).

**ExamMentor Evaluation & Q3 Prompt:**
```markdown
### 📝 Evaluation: Question 2 of 5

- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Accurately detailed: (1) incrementing `currentTerm`, (2) candidate state transition, (3) self-voting, (4) broadcasting `RequestVote` RPCs, and (5) the strict majority quorum rule ($\lfloor N/2 \rfloor + 1$).
- **Gaps or Corrections:** None. Clear and comprehensive.
- **Model Answer:** When a follower's election timer expires, it increments `currentTerm`, transitions to Candidate, votes for itself, and broadcasts `RequestVote` RPCs in parallel to all peers. It wins the election if and only if it receives affirmative votes from a strict majority ($\lfloor N/2 \rfloor + 1$) of nodes in the cluster.
- **Current Running Score:** **4 / 4** (100.0%)

---

### ❓ Question 3 of 5
**Category:** Comparison  
**Topic:** Section 7.2.1 — Raft Node States & Term Handling  

> **Compare the responsibilities of a Leader versus a Follower node in Raft. What happens immediately if either node observes an RPC containing a term number greater than its own?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 3 ──

**Learner Answer:**
> The Leader handles all client requests, replicates logs to peers, and sends periodic heartbeat AppendEntries RPCs. The Follower is passive; it only responds to incoming RPCs from leaders/candidates and does not initiate messages. If any node sees an RPC with a term higher than its own, it immediately steps down to Follower (if it was leader/candidate) and updates its term to the higher value.

**ExamMentor Evaluation & Q4 Prompt:**
```markdown
### 📝 Evaluation: Question 3 of 5

- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Accurately differentiated active leadership (client traffic, log replication, heartbeats) from passive followership, and stated the term precedence rule (reverting to follower and updating local term).
- **Gaps or Corrections:** None. Fully aligned with Section 7.2.1.
- **Model Answer:** A Leader handles client requests, coordinates log replication, and transmits periodic `AppendEntries` heartbeats; Followers are passive and only respond to incoming RPCs. If any node detects an incoming term higher than its own, it immediately reverts to Follower status and updates its local term.
- **Current Running Score:** **6 / 6** (100.0%)

---

### ❓ Question 4 of 5
**Category:** Application  
**Topic:** Section 7.2.4 — Network Partition & Split-Brain Scenario  

> **Consider a 5-node Raft cluster partitioned into {A, B} and {C, D, E}. If a client attempts to write a transaction to node A, explain what happens to that write, and what happens when the network partition heals.**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 4 ──

**Learner Answer:**
> Since {A, B} is a minority of 2 out of 5, it cannot form a quorum. Node A cannot commit the write. When the partition heals, the majority side {C, D, E} joins back and A accepts their data.

**ExamMentor Evaluation & Q5 Prompt:**
```markdown
### 📝 Evaluation: Question 4 of 5

- **Result:** `[1/2]` — **Partially Correct**
- **Accurate Elements:** Correctly identified that {A, B} is a minority lacking the required 3-node quorum, so the write cannot be committed.
- **Gaps or Corrections:** Omitted the specific mechanism during partition healing: isolated nodes receive `AppendEntries` from the legitimate leader with a higher term counter, step down to followers, and actively overwrite their uncommitted conflicting log entries to ensure uniform convergence.
- **Model Answer:** The minority partition $\{A, B\}$ has only 2 nodes, failing the 3-node quorum ($\lfloor 5/2 \rfloor + 1 = 3$), so the write remains uncommitted. Meanwhile, majority $\{C, D, E\}$ continues operating. When the partition heals, nodes in $\{A, B\}$ receive `AppendEntries` with a higher term counter from the true leader, revert to followers, and overwrite uncommitted conflicting entries to converge with the leader's log.
- **Current Running Score:** **7 / 8** (87.5%)

---

### ❓ Question 5 of 5
**Category:** Reasoning  
**Topic:** Section 7.2.2 & 7.2.3 — Safety & The Log Completeness Rule  

> **Why does Raft enforce the rule that a follower only votes for a candidate whose log is at least as up-to-date as the voter's own log? What catastrophic safety failure would occur if this rule were omitted?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 5 ──

**Learner Answer:**
> It prevents a node with an obsolete or missing log from becoming leader. If an out-of-date candidate could win, it could overwrite already-committed log entries with its own stale log, violating the core Raft safety property that committed entries can never be lost or replaced.

**ExamMentor Evaluation & Final Report:**
```markdown
### 📝 Evaluation: Question 5 of 5

- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Accurately articulated the safety preservation: preventing stale candidates from winning and protecting committed log entries from being overwritten.
- **Gaps or Corrections:** None. Strong analytical reasoning.
- **Model Answer:** Raft enforces the Log Completeness Rule to ensure a candidate elected leader contains all entries committed in previous terms. Without this rule, an out-of-date leader could overwrite committed log entries, violating the Leader Completeness and State Machine Safety properties.
- **Current Running Score:** **9 / 10** (90.0%)
```

---

## 3. Final Diagnostic Report & Targeted Revision Plan

```markdown
# 🏁 Viva Practice Session Complete!

## 📊 Overall Performance Summary
- **Total Score:** **9 / 10** points
- **Percentage:** **90.0%**
- **Proficiency Rating:** **Distinction / High Mastery**

---

## 📌 Topic-Wise Performance Breakdown
| Topic / Concept | Questions | Points Earned | Mastery Level |
| :--- | :---: | :---: | :---: |
| Consensus Foundations & FLP Impossibility | Q1 | 2 / 2 pts | 100.0% |
| Node States, Term Logic & Role Transitions | Q3 | 2 / 2 pts | 100.0% |
| Election Mechanics & Quorum Thresholds | Q2 | 2 / 2 pts | 100.0% |
| Partition Tolerance & Log Convergence | Q4 | 1 / 2 pts | 50.0% |
| Safety Properties & Log Completeness | Q5 | 2 / 2 pts | 100.0% |

---

## ⚠️ Identified Conceptual Gaps
- **Partition Healing & Convergence Protocol**: Missed the exact mechanics of log overwriting when isolated followers receive higher-term `AppendEntries` RPCs after network reconvergence.

---

## 📚 Prioritized Targeted Revision Guide
1. **Section 7.2.4: Split-Brain and Partition Tolerance**:
   - *Review Point*: Review how uncommitted entries are discarded/overwritten upon reconnecting with the majority cluster leader holding a higher term.
   - *Reference*: `Section 7.2.4 Split-Brain and Partition Tolerance`.

---

## 🔁 Post-Viva Options
- Type **`retry`** to re-attempt Question 4 to reach a 100% perfect score.
- Type **`revise`** for a short drill on Raft log replication edge cases.
- Type **`new`** to test another chapter or subject.
```

---

## 4. Verification & Grounding Audit
- **Arithmetic Check**: Individual question scores are $2 + 2 + 2 + 1 + 2 = 9 / 10 = 90.0\%$. Matches precisely.
- **Citation Integrity**: Referenced `Section 7.1`, `Section 7.2.1`, `Section 7.2.2`, `Section 7.2.4`. Did not invent arbitrary textbook page numbers.
- **Cognitive Diversity**: All 5 question types (Definition, Explanation, Comparison, Application, Reasoning) were executed.
