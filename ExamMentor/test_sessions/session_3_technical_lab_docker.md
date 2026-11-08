# ExamMentor Viva Test Session 3: Technical / Lab-Oriented Note

**Input Document:** `test_materials/03_technical_lab_docker_containers.md`  
**Topic:** Lab Manual: Docker Containerization, Multi-Stage Builds & Networking  
**Session Goal:** Verify skill performance on practical lab instructions, syntax directives, CLI arguments, systems diagnostics, and practical troubleshooting steps.

---

## 1. Session Ingestion & Initialization

### Learner Invocation:
> `/viva`
> Here are my lab notes for the Docker containerization and networking lab. Please conduct a 5-question viva.
>
> *(Attached contents of `test_materials/03_technical_lab_docker_containers.md`)*

### ExamMentor Kickoff:
```markdown
# 🎓 ExamMentor Viva Session: Docker Containerization & Networking Lab

**Source Material:** Lab Manual & Technical Guide: Docker Containerization & Networking  
**Topics Identified:**  
- Section 1: Multi-Stage Dockerfile Architecture & Directives  
- Section 2: Container Lifecycle CLI Commands & Port Forwarding Syntax  
- Section 3: Storage Persistence: Named Volumes vs. Bind Mounts  
- Section 4: Networking Modes (Bridge, Host, None)  
- Section 5: Troubleshooting: Port Binding Conflicts & Diagnostic Commands  
**Total Questions Planned:** 5  
**Scoring Rubric:**  
- `[2/2]` **Correct & Complete** — Fully covers essential points.  
- `[1/2]` **Partially Correct** — Right direction, but missing key details.  
- `[0/2]` **Incorrect / Unanswered** — Contradicts notes, skipped, or off-topic.  

*(Note: We will proceed one question at a time. Take your time to answer concisely.)*

---

### ❓ Question 1 of 5
**Category:** Definition  
**Topic:** Section 3 — Storage Persistence  

> **According to Section 3 of your lab notes, what is the operational difference between a Named Volume and a Bind Mount, and why are named volumes specifically recommended for databases?**

👉 *Please provide your oral/written answer below:*
```

---

## 2. Interactive Viva Dialogue & Rubric Evaluation

### ── Question 1 ──

**Learner Answer:**
> Named volumes are managed completely by Docker inside its internal filesystem storage (/var/lib/docker/volumes/), whereas bind mounts map an arbitrary host folder to a container folder. Named volumes are recommended for databases because Docker manages permissions and isolates volume management from host OS paths.

**ExamMentor Evaluation & Q2 Prompt:**
```markdown
### 📝 Evaluation: Question 1 of 5

- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Accurately detailed: (1) Docker-managed storage location vs arbitrary host path mapping, and (2) permission management and filesystem isolation making named volumes ideal for database persistence.
- **Gaps or Corrections:** None. Spot-on from Section 3.
- **Model Answer:** Named volumes are managed entirely by Docker within host filesystem storage (typically `/var/lib/docker/volumes/`) and are recommended for databases because Docker isolates volume management and preserves permissions. Bind mounts map an arbitrary host path directly to a container path, making them optimal for local source hot-reloading.
- **Current Running Score:** **2 / 2** (100.0%)

---

### ❓ Question 2 of 5
**Category:** Explanation  
**Topic:** Section 1 — Multi-Stage Build Architecture  

> **Explain how the multi-stage Dockerfile in Section 1 reduces final image size and attack surface. What specific directive copies the executable from the build stage?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 2 ──

**Learner Answer:**
> It uses two stages. The first stage builds the Go app and the second stage starts from Alpine and copies the binary over using COPY --from=builder /app/server . It saves space because we don't include Go.

**ExamMentor Evaluation & Q3 Prompt:**
```markdown
### 📝 Evaluation: Question 2 of 5

- **Result:** `[1/2]` — **Partially Correct**
- **Accurate Elements:** Correctly identified the 2-stage structure, the Alpine runtime, and the exact directive `COPY --from=builder /app/server .`.
- **Gaps or Corrections:** Omitted the security/attack surface explanation: discarding intermediate build caches, compilers, package managers, and SDKs from the final runtime image reduces vulnerabilities.
- **Model Answer:** Multi-stage builds compile artifacts in an initial named stage (`AS builder`) and copy only the compiled binary into a minimal runtime base (`alpine:3.19`) via `COPY --from=builder /app/server .`. This discards compilers, build SDKs, and intermediate caches, drastically reducing both the image footprint and attack surface.
- **Current Running Score:** **3 / 4** (75.0%)

---

### ❓ Question 3 of 5
**Category:** Comparison  
**Topic:** Section 4 — Container Networking Modes  

> **Compare the default Bridge network mode with Host network mode. How does port publishing (`-p`) differ between the two?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 3 ──

**Learner Answer:**
> Bridge mode puts the container in an isolated private software subnet where external access requires publishing ports with -p HostPort:ContainerPort. Host mode removes network isolation completely; the container binds directly to the host's network interfaces, so no -p port forwarding is needed, but port collisions can happen if the host port is in use.

**ExamMentor Evaluation & Q4 Prompt:**
```markdown
### 📝 Evaluation: Question 3 of 5

- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Clearly contrasted: (1) isolated subnet vs direct host interface binding, (2) requirement of `-p` forwarding in bridge mode vs no forwarding in host mode, and (3) risk of host port collision.
- **Gaps or Corrections:** None. Perfectly captures Section 4.
- **Model Answer:** In Bridge mode (`--network bridge`), containers reside in an isolated software subnet (e.g., `172.17.0.0/16`) and require explicit port publishing (`-p <HostPort>:<ContainerPort>`). In Host mode (`--network host`), network isolation is eliminated; the container directly binds to host interfaces without `-p`, risking collisions if the host port is already bound.
- **Current Running Score:** **5 / 6** (83.3%)

---

### ❓ Question 4 of 5
**Category:** Application  
**Topic:** Section 2 — CLI Operations  

> **You are tasked with running a container named `webapp` from image `myapp:1.0` in the background. It must map host port 8080 to container port 80, and restart automatically unless manually stopped. What is the exact Docker CLI command? Also, how do you open an interactive shell inside it once running?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 4 ──

**Learner Answer:**
> The command is:
> `docker run -d --name webapp -p 8080:80 --restart unless-stopped myapp:1.0`
> To get a shell inside it:
> `docker exec -it webapp /bin/sh`

**ExamMentor Evaluation & Q5 Prompt:**
```markdown
### 📝 Evaluation: Question 4 of 5

- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Flawless syntax for both the `docker run` command (including flags `-d`, `--name`, `-p 8080:80`, `--restart unless-stopped`) and the interactive execution command (`docker exec -it webapp /bin/sh`).
- **Gaps or Corrections:** None. Exactly matches Section 2.
- **Model Answer:** 
  1. `docker run -d --name webapp -p 8080:80 --restart unless-stopped myapp:1.0`
  2. `docker exec -it webapp /bin/sh`
- **Current Running Score:** **7 / 8** (87.5%)

---

### ❓ Question 5 of 5
**Category:** Reasoning  
**Topic:** Section 5 — Port Binding Conflicts & Troubleshooting  

> **If a container launch fails with `Bind for 0.0.0.0:8080 failed: port is already allocated`, what are the diagnostic commands provided in your notes to find the conflicting host process on Linux/macOS and Windows, and what are the two possible resolution strategies?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 5 ──

**Learner Answer:**
> You can find the process on Windows with netstat or Get-NetTCPConnection, and on Linux with lsof -i :8080. The fix is to kill that process.

**ExamMentor Evaluation & Final Report:**
```markdown
### 📝 Evaluation: Question 5 of 5

- **Result:** `[1/2]` — **Partially Correct**
- **Accurate Elements:** Correctly identified the diagnostic commands (`lsof -i :8080` for Linux and `netstat -ano | findstr :8080` / `Get-NetTCPConnection` for Windows) and stated terminating the conflicting process as a resolution.
- **Gaps or Corrections:** Omitted the second resolution strategy explicitly documented in Section 5: remapping the host publishing port in the `docker run` command (e.g., `-p 8081:80`) so the conflicting host process does not need to be terminated.
- **Model Answer:** To diagnose, run `lsof -i :8080` (Linux/macOS) or `Get-NetTCPConnection -LocalPort 8080` / `netstat -ano | findstr :8080` (Windows). The two resolutions are: (1) terminate the conflicting host PID, or (2) remap the host port in Docker (e.g., `-p 8081:80`).
- **Current Running Score:** **8 / 10** (80.0%)
```

---

## 3. Final Diagnostic Report & Targeted Revision Plan

```markdown
# 🏁 Viva Practice Session Complete!

## 📊 Overall Performance Summary
- **Total Score:** **8 / 10** points
- **Percentage:** **80.0%**
- **Proficiency Rating:** **Proficient / Competent**

---

## 📌 Topic-Wise Performance Breakdown
| Topic / Concept | Questions | Points Earned | Mastery Level |
| :--- | :---: | :---: | :---: |
| Storage Persistence & Volume Isolation | Q1 | 2 / 2 pts | 100.0% |
| Multi-Stage Builds & Security Surface | Q2 | 1 / 2 pts | 50.0% |
| Networking Drivers (Bridge vs Host) | Q3 | 2 / 2 pts | 100.0% |
| Docker CLI Lifecycle Commands | Q4 | 2 / 2 pts | 100.0% |
| Port Conflict Troubleshooting & Resolutions | Q5 | 1 / 2 pts | 50.0% |

---

## ⚠️ Identified Conceptual Gaps
1. **Multi-Stage Security Rationale**: Did not mention how discarding intermediate build tooling and package managers reduces attack surface.
2. **Alternative Port Remapping**: Overlooked remapping the host port (`-p 8081:80`) as a non-destructive alternative to killing running host processes.

---

## 📚 Prioritized Targeted Revision Guide
1. **Section 1: Multi-Stage Dockerfile Architecture**:
   - *Review Point*: Review attack surface reduction and caching benefits of multi-stage compilation.
2. **Section 5: Troubleshooting Port Conflicts**:
   - *Review Point*: Note both remedies for port allocation failures: PID termination and host port remapping.

---

## 🔁 Post-Viva Options
- Type **`retry`** to re-attempt Questions 2 and 5.
- Type **`revise`** for a 2-question revision drill on Docker multi-stage builds and troubleshooting.
- Type **`new`** to test another lab or subject.
```

---

## 4. Verification & Grounding Audit
- **Arithmetic Check**: Question scores $2 + 1 + 2 + 2 + 1 = 8 / 10 = 80.0\%$. Exact match.
- **CLI Accuracy**: All syntax (`-p`, `--restart unless-stopped`, `COPY --from=builder`) checked against `03_technical_lab_docker_containers.md`.
- **Zero Hallucination**: No Kubernetes, Compose, or external container tooling brought in; evaluation strictly bounded by lab notes.
