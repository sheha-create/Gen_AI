# ExamMentor (`/viva`): Development & Testing Prompts Log

This document records the complete repository of prompts used to design, implement, test, and validate the ExamMentor oral exam skill across all five project milestones.

---

## 1. Master Agent Prompt (PRD Specification)

The foundational specification prompt guiding the implementation:

```text
Create ExamMentor as a reusable agent skill named /viva. It must work in a brand-new session and use only the learner's supplied notes as its primary source. Read the notes, identify topics, prepare a balanced set of viva questions, then ask exactly one question at a time and wait for the answer. Evaluate each answer using a consistent 0/1/2 rubric, explain missing or incorrect concepts, and keep a running score. At the end, provide the score, topic-wise weaknesses and a targeted revision list. Do not invent facts or page references. Build incrementally, test with three different inputs, and compare the same task with and without the skill. Include the skill files, setup instructions, prompts.md and test evidence.
```

---

## 2. Milestone 1: Skill Structure & Trigger Prompt

Prompt used to define the agent skill frontmatter, directory layout, and metadata registration:

```text
Design the SKILL.md file for ExamMentor conforming to Antigravity's workspace skill format (.agents/skills/viva/SKILL.md). Ensure the YAML frontmatter specifies 'viva' as the unique skill name, and provides a clear description targeting oral examination, viva voce preparation, study note testing, and /viva invocation. Define the end-to-end user workflow, core operational rules (one-at-a-time questioning, 0/1/2 rubric, zero hallucination), and modular references for rubric, question types, and UI templates.
```

---

## 3. Milestone 2: Note Ingestion & Question Planning Prompt

Prompt used to formulate the ingestion pipeline, topic extraction, and question blueprinting:

```text
Develop the prompt instructions for Step 1 (Intake) and Step 2 (Question Planning) of the /viva skill:
1. Accept pasted text or document attachments. If unreadable, instruct the agent to ask the user to paste text directly rather than making assumptions.
2. Scan the material to identify key terms, processes, definitions, and examiner focus areas.
3. Determine question count (default to 5 if unspecified).
4. Blueprint a balanced 5-category cognitive distribution:
   - Definition: Precise terminology and concepts.
   - Explanation: Internal mechanisms and step-by-step procedures.
   - Comparison: Distinguishing between two related ideas.
   - Application: Practical scenario or code/command problem solving.
   - Reasoning: Trade-offs, failure modes, and architectural rationale.
```

---

## 4. Milestone 3: Interactive Dialogue, Probing & 0/1/2 Rubric Prompts

Prompt specifying the turn-taking loop, single follow-up probe logic, and evaluation schema:

```text
Formulate the evaluation and response prompting rules for each viva question:
1. Enforce strict single-question delivery: Output exactly Question N, then immediately STOP and wait for the learner's response.
2. If the learner's answer is ambiguous or vague, trigger a single focused follow-up probe ('Viva Examiner Probe') without revealing the answer.
3. When evaluating the final answer, apply the strict 0/1/2 rubric:
   - 2 pts: Correct & Complete (satisfies key criteria).
   - 1 pt: Partially Correct (right direction, but missing secondary required points).
   - 0 pts: Incorrect or Unanswered (contradicts notes or skipped).
4. Feedback must detail:
   - Score label ([X/2])
   - Accurate elements
   - Missing or mistaken points
   - Concise model answer strictly grounded in the notes
   - Running total score and percentage
```

---

## 5. Milestone 4: Diagnostic Reporting & Remediation Prompts

Prompt used to structure the post-viva evaluation report, topic matrix, and interactive retry flow:

```text
Design the final summary report template and remediation logic:
1. Calculate overall score: (Earned Points / Total Points) * 100%. Assign mastery tier (Distinction >=90%, Proficient >=70%, Developing >=50%, Needs Revision <50%).
2. Output a structured Markdown table detailing points earned per topic/concept.
3. List identified conceptual gaps.
4. Provide a prioritized revision guide linking back to exact section headers from the learner's notes. Do not hallucinate external page numbers.
5. Provide interactive next steps:
   - 'retry': re-asks missed questions one by one.
   - 'revise': runs a 2-question drill on weak areas.
   - 'new': resets session for new material.
```

---

## 6. Milestone 5: Test Execution & Persona Simulation Prompts

Prompts used to simulate the 3 distinct test sessions and the baseline comparison:

### Test Session 1: Theory Notes & Rubric Archetype Stress Test
```text
User Persona: Undergraduate Computer Science Student.
Input: test_materials/01_short_theory_operating_systems.md
Prompt:
"/viva
Here are my study notes on OS Concurrency and Deadlocks: [pasted content]"

Simulated Responses:
- Q1 (Definition): Full, accurate answer -> Tests 2/2 scoring.
- Q2 (Explanation): Informal/vague response -> Tests examiner probe trigger and post-probe 2/2 scoring.
- Q3 (Comparison): Partial answer omitting progress/utilization -> Tests 1/2 partial scoring.
- Q4 (Application): Confused Avoidance with Detection & Recovery -> Tests 0/2 incorrect scoring.
- Q5 (Reasoning): "Pass, I didn't study this" -> Tests 0/2 blank/unanswered scoring.
- Follow-up: Send 'retry' to verify the remediation loop.
```

### Test Session 2: Long Chapter Extract & Section Grounding Test
```text
User Persona: Distributed Systems Graduate Student.
Input: test_materials/02_chapter_extract_distributed_systems.md
Prompt:
"/viva
I've attached my reading notes for Chapter 7: Consensus and Fault Tolerance in Distributed Systems. Let's do a 5-question viva session."

Simulated Responses:
- Provide comprehensive answers demonstrating high mastery (90%), with a minor omission on network partition log convergence in Q4.
- Verify grounding against Sections 7.1, 7.2.1, 7.2.2, 7.2.3, and 7.2.4 without inventing page numbers.
```

### Test Session 3: Technical / Lab Manual Test
```text
User Persona: DevOps / Systems Engineering Lab Student.
Input: test_materials/03_technical_lab_docker_containers.md
Prompt:
"/viva
Here are my lab notes for the Docker containerization and networking lab. Please conduct a 5-question viva."

Simulated Responses:
- Test technical command validation (docker run flags, docker exec syntax).
- Test troubleshooting diagnostic commands (lsof, netstat, port remapping).
- Verify 80% Proficient score calculation and lab revision checklist.
```

### Baseline (No-Skill) Comparative Prompt
```text
Prompt to standard model without skill:
"Here are my notes on OS Concurrency and Deadlocks. Test me on them in an oral exam style: [pasted content of 01_short_theory_operating_systems.md]"

Observe failure modes:
1. Batched dumping of all 5 questions at once.
2. Subjective, non-numerical grading.
3. Uncritical acceptance of vague answers.
4. Hallucination of database ARIES and memory paging concepts.
5. Superficial, non-actionable conclusion.
```
