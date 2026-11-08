# ExamMentor Scoring Rubric & Evaluation Principles

This document defines the transparent scoring system and pedagogical evaluation principles used across all ExamMentor viva sessions.

---

## 1. The Standard 0/1/2 Rubric

Every viva question has a maximum potential score of **2 points**.

| Score | Evaluation Label | Operational Definition | Criteria & Indicator |
| :---: | :--- | :--- | :--- |
| **2** | **Correct & Complete** | Fully satisfied expected answer points. | • Contains all core terms, principles, or steps stated in the notes.<br>• Demonstrates clear conceptual comprehension without major inaccuracies.<br>• Answers the specific cognitive demand of the question. |
| **1** | **Partially Correct / Incomplete** | Substantially correct direction, but key elements omitted or minor inaccuracies present. | • States at least 50% of essential concepts but omits secondary required components.<br>• Identifies the high-level mechanism but misses exact terminology or crucial qualification from the notes.<br>• Confuses minor details while grasping the primary theorem/step. |
| **0** | **Incorrect / Unanswered / Off-Topic** | Misses core principles, asserts false statements, or provides no answer. | • Factually contradicts the provided study notes.<br>• Discusses unrelated concepts or guesses without grounding.<br>• Explicitly skips, types "pass", "I don't know", or submits empty response.<br>• Remains completely ambiguous even after a follow-up probe. |

---

## 2. Follow-Up Probing Protocol (Vagueness Handling)

When an initial learner response is ambiguous, underspecified, or hints at knowledge without precision:
1. **Trigger Condition**:
   - Learner mentions a relevant concept without defining or naming it (e.g., *"It stops processes when they wait on each other"* instead of *"circular wait"*).
   - Learner provides an answer that is technically true in general software engineering, but the question specifically asks for the terminology/step defined in the notes.
2. **Probe Rules**:
   - Issue **exactly one** focused probe.
   - Do **not** reveal the answer in the probe.
   - Keep the probe concise and encouraging.
   - Example probe format:
     > `🔎 Examiner Probe: You mentioned that processes hold resources while waiting. What is the specific formal name of this condition according to your notes?`
3. **Scoring After Probe**:
   - If the learner supplies the missing terminology: award **2 points**.
   - If the learner remains vague or gives only partial clarification: award **1 point**.
   - If the learner gives an incorrect answer or admits they don't know: award **0 points** (or **1 point** if their initial answer already legitimately satisfied the partial threshold).

---

## 3. Grounding Verification & Zero-Hallucination Guardrails

- **Primary Source Law**: All valid knowledge strictly derives from the user-provided study notes.
- **Forbidden Actions**:
  1. Never penalize a learner for omitting details that were never present in their supplied notes.
  2. Never cite external textbooks, RFCs, or standards unless specifically referenced in the provided text.
  3. Never invent page numbers, footnote markers, or chapter headings. If notes are unpaginated text, refer to Section Titles (e.g., `## Section: Process Synchronization`) or quote the relevant excerpt.
- **Pedagogical Distinctions**:
  - Always separate **concept omission** (what was missed) from **factual error** (what was stated incorrectly).

---

## 4. Running Score Tracking & Arithmetic

At every question transition, the system recalculates and displays:
$$\text{Current Score} = \sum_{i=1}^{k} s_i \quad \text{out of} \quad 2k \text{ maximum points}$$
Where $k$ is the current question number, and $s_i \in \{0, 1, 2\}$.

Final Score Calculation:
$$\text{Final Percentage} = \left(\frac{\sum_{i=1}^{N} s_i}{2N}\right) \times 100\%$$
- Fractional percentages should be rounded to 1 decimal place (e.g., $83.3\%$).
