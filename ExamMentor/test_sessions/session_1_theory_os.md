# ExamMentor Viva Test Session 1: Short Theory Note

**Input Document:** `test_materials/01_short_theory_operating_systems.md`  
**Topic:** Operating Systems — Concurrency and Deadlocks  
**Session Goal:** Verify adherence to 0/1/2 rubric, one-at-a-time questioning, probing on vague answer, handling correct, partly correct, incorrect, vague, and blank responses, and verifying the retry loop.

---

## 1. Session Ingestion & Initialization

### Learner Invocation:
> `/viva`
> Here are my study notes:
>
> *(Pasted contents of `test_materials/01_short_theory_operating_systems.md`)*

### ExamMentor Response:
```markdown
# 🎓 ExamMentor Viva Session: OS Concurrency & Deadlocks

**Source Material:** Operating Systems — Concurrency and Deadlocks  
**Topics Identified:** Deadlock Definition, Four Coffman Conditions, Deadlock vs. Starvation, Handling Strategies (Prevention, Avoidance, Detection & Recovery)  
**Total Questions Planned:** 5  
**Scoring Rubric:**  
- `[2/2]` **Correct & Complete** — Fully covers essential points.  
- `[1/2]` **Partially Correct** — Right direction, but missing key details.  
- `[0/2]` **Incorrect / Unanswered** — Contradicts notes, skipped, or off-topic.  

*(Note: We will proceed one question at a time. Take your time to answer concisely.)*

---

### ❓ Question 1 of 5
**Category:** Definition  
**Topic:** Deadlock Core Concept  

> **According to your notes, how is a deadlock formally defined in an operating system, and why can neither process proceed without external intervention?**

👉 *Please provide your oral/written answer below:*
```

---

## 2. Interactive Viva Dialogue & Rubric Evaluation

### ── Question 1: [Testing Correct Answer] ──

**Learner Answer:**
> A deadlock is an OS state where a set of processes are permanently blocked because each process holds at least one resource and is waiting for another resource acquired by some other process in the same set. Since each is waiting on another in that set, neither can proceed without external intervention.

**ExamMentor Evaluation & Q2 Prompt:**
```markdown
### 📝 Evaluation: Question 1 of 5

- **Result:** `[2/2]` — **Correct & Complete**
- **Accurate Elements:** Accurately captured permanent blocking, the circular holding/waiting condition within a set of processes, and why external intervention is needed.
- **Gaps or Corrections:** None. Fully aligned with Section 1 of your notes.
- **Model Answer:** A deadlock is an operating system state where a set of processes are permanently blocked because each process holds one or more resources and is waiting for another resource acquired by some other process in the same set. Neither can proceed without external intervention.
- **Current Running Score:** **2 / 2** (100.0%)

---

### ❓ Question 2 of 5
**Category:** Explanation  
**Topic:** Coffman Conditions  

> **Explain the four Coffman conditions required for a deadlock to occur. Can a deadlock occur if only three of these conditions hold?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 2: [Testing Vague Answer + Examiner Probe] ──

**Learner Initial Answer:**
> You need mutual exclusion, holding a resource while waiting, no taking resources away, and processes waiting in a circle. It happens when things get stuck.

**ExamMentor Single Follow-Up Probe:**
```markdown
🔍 **Viva Examiner Follow-Up Probe:**
> *You listed the four conditions informally! To get full credit, please answer the second half of the question: according to your notes, can a deadlock occur if only three of these conditions hold? What is the exact rule?*

*(Please clarify this point before your answer is evaluated and scored.)*
```

**Learner Clarification:**
> No, all four conditions must hold simultaneously for a deadlock to occur. If even one condition is broken, deadlock cannot happen.

**ExamMentor Evaluation & Q3 Prompt:**
```markdown
### 📝 Evaluation: Question 2 of 5

- **Result:** `[2/2]` — **Correct & Complete (Resolved via Probe)**
- **Accurate Elements:** Correctly identified all four conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) and confirmed that all four must hold simultaneously for deadlock to occur.
- **Gaps or Corrections:** Required clarification on the simultaneous necessity rule, which was resolved cleanly.
- **Model Answer:** A deadlock can occur if and only if all four Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) hold simultaneously in the system. If even one condition is invalidated, deadlock is prevented.
- **Current Running Score:** **4 / 4** (100.0%)

---

### ❓ Question 3 of 5
**Category:** Comparison  
**Topic:** Deadlock vs. Starvation  

> **Compare Deadlock and Starvation. What is the fundamental difference in terms of system-wide progress and resource utilization?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 3: [Testing Partly Correct Answer] ──

**Learner Answer:**
> In a deadlock, processes are permanently blocked. In starvation, a process waits for a really long time because high priority processes keep jumping ahead of it.

**ExamMentor Evaluation & Q4 Prompt:**
```markdown
### 📝 Evaluation: Question 3 of 5

- **Result:** `[1/2]` — **Partially Correct**
- **Accurate Elements:** Accurately contrasted the permanent blocking of deadlocks with priority-based indefinite delay in starvation.
- **Gaps or Corrections:** Omitted the specific contrast regarding resource utilization and system-wide progress: in starvation, the system as a whole continues to make progress and complete other processes, whereas in deadlock, resource utilization in the blocked set drops to zero and no process in the set can advance.
- **Model Answer:** In deadlock, an entire group of processes is permanently blocked, resource utilization in the cycle drops to zero, and no process in the set can ever make progress. In starvation, an individual process is repeatedly bypassed due to scheduling preference, but the system as a whole continues making progress and completing other processes.
- **Current Running Score:** **5 / 6** (83.3%)

---

### ❓ Question 4 of 5
**Category:** Application  
**Topic:** Deadlock Avoidance vs. Detection  

> **Suppose an operating system periodically constructs and checks a Wait-For Graph (WFG) for cycles. Based on your notes, which handling strategy is this (Prevention, Avoidance, or Detection & Recovery), and how does it recover if a cycle is discovered?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 4: [Testing Incorrect Answer] ──

**Learner Answer:**
> This is Deadlock Avoidance using Dijkstra's algorithm, and it recovers by rolling back memory pages automatically.

**ExamMentor Evaluation & Q5 Prompt:**
```markdown
### 📝 Evaluation: Question 4 of 5

- **Result:** `[0/2]` — **Incorrect**
- **Accurate Elements:** Mentioned rollback as a recovery concept.
- **Gaps or Corrections:** Factual classification error. Periodically inspecting a Wait-For Graph for cycles is **Detection and Recovery**, not Avoidance (Avoidance uses dynamic safe-state checks before resource allocation, such as the Banker's Algorithm). Recovery in your notes is executed via process termination or resource rollback, not memory page rollback.
- **Model Answer:** Constructing a Wait-For Graph (WFG) and detecting cycles is Deadlock Detection and Recovery. When a cycle is detected, the system recovers via process termination or resource rollback.
- **Current Running Score:** **5 / 8** (62.5%)

---

### ❓ Question 5 of 5
**Category:** Reasoning  
**Topic:** Coffman Condition Invalidation  

> **Why does imposing a global linear ordering on all resource allocations prevent deadlocks? Which specific Coffman condition does this strategy invalidate?**

👉 *Please provide your oral/written answer below:*
```

---

### ── Question 5: [Testing Blank / Pass Answer] ──

**Learner Answer:**
> Pass, I didn't study this part carefully.

**ExamMentor Evaluation & Final Report:**
```markdown
### 📝 Evaluation: Question 5 of 5

- **Result:** `[0/2]` — **Unanswered / Skipped**
- **Accurate Elements:** Honest submission of pass.
- **Gaps or Corrections:** Missed the reasoning behind resource ordering and Coffman condition invalidation.
- **Model Answer:** Imposing a global linear ordering on all resources forces processes to request resources strictly in increasing sequence. This mathematically eliminates the possibility of a closed cycle of dependency, thereby directly invalidating the **Circular Wait** Coffman condition.
- **Current Running Score:** **5 / 10** (50.0%)
```

---

## 3. Final Diagnostic Report & Targeted Revision Plan

```markdown
# 🏁 Viva Practice Session Complete!

## 📊 Overall Performance Summary
- **Total Score:** **5 / 10** points
- **Percentage:** **50.0%**
- **Proficiency Rating:** **Developing / Needs Targeted Revision**

---

## 📌 Topic-Wise Performance Breakdown
| Topic / Concept | Questions | Points Earned | Mastery Level |
| :--- | :---: | :---: | :---: |
| Deadlock Definition & Fundamentals | Q1 | 2 / 2 pts | 100.0% |
| Coffman Conditions (Simultaneous Rule) | Q2 | 2 / 2 pts | 100.0% |
| Deadlock vs. Starvation Progress & Metrics | Q3 | 1 / 2 pts | 50.0% |
| Handling Strategies: Detection vs Avoidance | Q4 | 0 / 2 pts | 0.0% |
| Prevention Mechanics (Circular Wait Elimination)| Q5 | 0 / 2 pts | 0.0% |

---

## ⚠️ Identified Conceptual Gaps
1. **Detection vs Avoidance Strategy Confusion**: Confused runtime Wait-For Graph (WFG) cycle detection with dynamic Banker's Algorithm avoidance.
2. **Coffman Invalidation Logic**: Did not identify that global resource ordering eliminates the **Circular Wait** condition.
3. **System Progress Metrics**: Missed the distinction that in starvation the system as a whole continues progressing, while in deadlock progress ceases completely.

---

## 📚 Prioritized Targeted Revision Guide
1. **Section 4: Handling Strategies**:
   - *Review Point*: Review the definitions of Prevention (invalidating conditions), Avoidance (Banker's Algorithm safe states), and Detection & Recovery (Wait-For Graph cycle checks + process termination / resource rollback).
   - *Action*: Re-read `Section 4: Handling Strategies` in your notes.
2. **Section 2 & 4: Circular Wait Prevention**:
   - *Review Point*: Connect how global resource ordering strictly prevents the 4th Coffman condition (Circular Wait).
3. **Section 3: Starvation vs. Deadlock**:
   - *Review Point*: Remember that during starvation, higher-priority jobs complete; in deadlock, all progress stops.

---

## 🔁 Post-Viva Options
- Type **`retry`** to re-attempt your missed questions (Q4 and Q5) for upgraded feedback.
- Type **`revise`** for a targeted 2-question revision drill on Handling Strategies.
- Type **`new`** to test a different topic.
```

---

## 4. Verification of Retry Round

**Learner Input:**
> `retry`

**ExamMentor Response:**
```markdown
### 🔄 ExamMentor Retry Mode: Retrying Missed Questions

Let's re-attempt the questions where you lost points. Here is your first retry:

---
### ❓ Retry Question (Original Q4) [Category: Application]
> **Suppose an operating system periodically constructs and checks a Wait-For Graph (WFG) for cycles. Based on your notes, which handling strategy is this (Prevention, Avoidance, or Detection & Recovery), and how does it recover if a cycle is discovered?**

👉 *Please provide your corrected answer below:*
```

**Learner Input:**
> This is Deadlock Detection and Recovery! If a cycle is detected, the OS recovers by process termination or resource rollback.

**ExamMentor Response:**
```markdown
### 📝 Evaluation: Retry Question 1 of 2
- **Result:** `[2/2]` — **Correct & Complete!**
- **Accurate Elements:** Excellent correction! You accurately categorized it as Detection and Recovery and correctly identified process termination or resource rollback.
- **Model Answer:** Constructing a Wait-For Graph (WFG) and detecting cycles is Deadlock Detection and Recovery, recovering via process termination or resource rollback.
```

---

## 5. Test Session 1 Verification Summary
- **Rubric Integrity**: 2 points for Q1 (correct), 2 points for Q2 (clarified after probe), 1 point for Q3 (partial), 0 points for Q4 (incorrect), 0 points for Q5 (blank).
- **Arithmetic Check**: $2 + 2 + 1 + 0 + 0 = 5 / 10$ ($50.0\%$).
- **Grounding**: 100% grounded in `01_short_theory_operating_systems.md`. No external memory page replacement or unstated concepts accepted.
- **Pacing**: Strictly 1 question at a time.
- **Retry Feature**: Successfully demonstrated.
