# ExamMentor End-to-End Sample Viva Session

This example illustrates a complete 5-question viva session using the ExamMentor skill, showing the one-at-a-time pacing, 0/1/2 rubric application, vague answer probing, and the final diagnostic report.

---

### Phase 1: User Invocation
**User**:
> `/viva`
> Here are my quick notes on HTTP Protocols:
> "HTTP/1.1 introduced persistent connections via Keep-Alive and chunked transfer encoding, but suffers from Head-of-Line (HoL) blocking at the application/HTTP layer because requests on a single TCP connection must be processed in FIFO order.
> HTTP/2 introduced binary framing, multiplexing of streams over a single TCP connection, header compression using HPACK, and Server Push. However, HTTP/2 still experiences HoL blocking at the transport (TCP) layer if a packet is dropped.
> HTTP/3 solves TCP HoL blocking by running over QUIC, which uses UDP. Streams are independent at the transport layer, so a dropped packet on stream A does not stall stream B. QUIC also integrates TLS 1.3 for 0-RTT handshakes."

---

### Phase 2: Session Initialization Banner
**ExamMentor**:
# 🎓 ExamMentor Viva Session: HTTP Protocol Evolution

**Source Material:** Pasted Study Notes: HTTP Protocols  
**Topics Identified:** HTTP/1.1 persistent connections, HTTP/2 binary framing & multiplexing, HPACK, HTTP/3 QUIC & UDP, Head-of-Line (HoL) blocking  
**Total Questions Planned:** 5  
**Scoring Rubric:**  
- `[2/2]` **Correct & Complete** — Fully covers essential points.  
- `[1/2]` **Partially Correct** — Right direction, but missing key details.  
- `[0/2]` **Incorrect / Unanswered** — Contradicts notes, skipped, or off-topic.  

---

### ❓ Question 1 of 5
**Category:** Definition  
**Topic:** HTTP/1.1 Architecture  

> **According to your notes, what mechanism did HTTP/1.1 introduce to avoid opening a new TCP connection for every resource request, and what is the primary limitation that still plagued it?**

👉 *Please provide your oral/written answer below:*

---

### Phase 3: Dialogue & Question Evaluation Flow

#### Q1 Exchange:
**User**:
> It introduced persistent connections with Keep-Alive, but it still had Head of Line blocking where requests had to be processed in order.

**ExamMentor**:
### 📝 Evaluation: Question 1 of 5
- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Correctly identified persistent connections (Keep-Alive) and FIFO Head-of-Line (HoL) blocking.
- **Gaps or Corrections:** None; answer directly matched the provided notes.
- **Model Answer:** HTTP/1.1 introduced persistent connections via Keep-Alive and chunked transfer encoding, but suffered from Head-of-Line (HoL) blocking because requests on a single TCP connection had to be processed in FIFO order.
- **Current Running Score:** **2 / 2** (100%)

---

### ❓ Question 2 of 5
**Category:** Explanation  
**Topic:** HTTP/2 Optimization  

> **Explain how HTTP/2 achieves multiplexing and how it compresses headers according to your notes.**

👉 *Please provide your oral/written answer below:*

---

#### Q2 Exchange (Testing partial / vague answer + probe):
**User**:
> It breaks things into binary frames so they can share one connection, and compresses headers with something called pack.

**ExamMentor**:
🔍 **Viva Examiner Follow-Up Probe:**
> *You correctly mentioned binary frames and header compression, but what is the exact acronym/name of the header compression algorithm specified in your notes?*

*(Please clarify this point before your answer is evaluated and scored.)*

**User**:
> Ah, it is HPACK!

**ExamMentor**:
### 📝 Evaluation: Question 2 of 5
- **Result:** `[2/2]` — **Correct & Complete (Resolved via Probe)**
- **Accurate Elements:** Identified binary framing over a single TCP connection and correctly clarified the compression algorithm as HPACK.
- **Gaps or Corrections:** Needed initial clarification for HPACK.
- **Model Answer:** HTTP/2 achieves multiplexing through binary framing across a single TCP connection and compresses headers using HPACK.
- **Current Running Score:** **4 / 4** (100%)

---

### ❓ Question 3 of 5
**Category:** Comparison  
**Topic:** Head-of-Line Blocking (HTTP/2 vs HTTP/3)  

> **Compare the level at which Head-of-Line (HoL) blocking occurs in HTTP/2 versus how HTTP/3 resolves it.**

👉 *Please provide your oral/written answer below:*

---

#### Q3 Exchange (Testing partial answer):
**User**:
> HTTP/2 has HoL blocking on TCP when packets drop. HTTP/3 fixes this by using UDP.

**ExamMentor**:
### 📝 Evaluation: Question 3 of 5
- **Result:** `[1/2]` — **Partially Correct**
- **Accurate Elements:** Accurately noted that HTTP/2 has TCP-level HoL blocking and HTTP/3 uses UDP.
- **Gaps or Corrections:** Omitted the specific mechanism (QUIC protocol) and how independent streams prevent packet drops on one stream from stalling another.
- **Model Answer:** In HTTP/2, HoL blocking occurs at the transport (TCP) layer when a packet drop stalls all multiplexed streams. HTTP/3 resolves this by running over QUIC (via UDP), making streams independent at the transport layer so a dropped packet on stream A does not stall stream B.
- **Current Running Score:** **5 / 6** (83.3%)

---

### ❓ Question 4 of 5
**Category:** Application  
**Topic:** HTTP/3 Connection Setup  

> **A client wants to establish an encrypted connection with near-zero latency penalty using HTTP/3. What feature and version mentioned in your notes allows this?**

👉 *Please provide your oral/written answer below:*

---

#### Q4 Exchange (Testing factual error):
**User**:
> It uses SSL 3.0 with TCP fast open.

**ExamMentor**:
### 📝 Evaluation: Question 4 of 5
- **Result:** `[0/2]` — **Incorrect**
- **Accurate Elements:** Recognized that encryption and fast handshake are involved.
- **Gaps or Corrections:** Stated SSL 3.0 and TCP fast open; the notes specifically state QUIC integrates TLS 1.3 for 0-RTT handshakes.
- **Model Answer:** HTTP/3 relies on QUIC integrating TLS 1.3, which enables 0-RTT handshakes.
- **Current Running Score:** **5 / 8** (62.5%)

---

### ❓ Question 5 of 5
**Category:** Reasoning  
**Topic:** Protocol Architecture Trade-offs  

> **Why did multiplexing in HTTP/2 fail to eliminate Head-of-Line blocking entirely, even though it solved HTTP-layer request blocking?**

👉 *Please provide your oral/written answer below:*

---

#### Q5 Exchange:
**User**:
> Because HTTP/2 still runs over a single TCP connection. TCP guarantees in-order delivery of bytes, so if one TCP packet is lost, the entire TCP connection halts until retransmission occurs.

**ExamMentor**:
### 📝 Evaluation: Question 5 of 5
- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Clear understanding of single TCP stream dependency and packet loss stalling all multiplexed traffic.
- **Gaps or Corrections:** None.
- **Model Answer:** HTTP/2 multiplexes over a single TCP stream; because TCP mandates in-order byte delivery, any lost segment causes transport-layer HoL blocking for all streams on that connection.
- **Current Running Score:** **7 / 10** (70.0%)

---

### Phase 4: Final Diagnostic Report & Revision Plan

# 🏁 Viva Practice Session Complete!

## 📊 Overall Performance Summary
- **Total Score:** **7 / 10** points
- **Percentage:** **70.0%**
- **Proficiency Rating:** **Proficient / Competent**

---

## 📌 Topic-Wise Performance Breakdown
| Topic / Concept | Questions | Points Earned | Mastery Level |
| :--- | :---: | :---: | :---: |
| HTTP/1.1 & HTTP/2 Fundamentals | Q1, Q2 | 4 / 4 pts | 100% |
| HoL Blocking Comparison & Reasoning | Q3, Q5 | 3 / 4 pts | 75% |
| HTTP/3 & QUIC Transport Integration | Q4 | 0 / 2 pts | 0% |

---

## ⚠️ Identified Conceptual Gaps
- **QUIC Handshake & Security**: Missed that QUIC integrates TLS 1.3 for 0-RTT handshakes; confused with legacy SSL.
- **Stream Independence**: Omitted how QUIC handles individual stream isolation during transport packet loss.

---

## 📚 Prioritized Targeted Revision Guide
1. **HTTP/3 & QUIC Security**:
   - *Review Point*: Note that HTTP/3 integrates TLS 1.3 within QUIC for 0-RTT connection establishment.
   - *Action*: Re-read the final sentence of your HTTP/3 notes.
2. **Transport vs Application HoL Blocking**:
   - *Review Point*: Review how independent streams in QUIC prevent cross-stream stalling when packets are lost.

---

## 🔁 Post-Viva Options
- Type **`retry`** to re-attempt Question 3 or Question 4.
- Type **`revise`** for a 2-question targeted follow-up quiz on HTTP/3 and QUIC.
- Type **`new`** to submit new study notes for a fresh viva session.
