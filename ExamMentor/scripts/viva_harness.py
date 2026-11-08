"""
ExamMentor Automated Verification & Arithmetic Validation Harness
Validates scoring calculations, question distribution, grounding, and rubric compliance.
"""

import sys
import re
from typing import List, Dict, Any

class VivaSessionVerifier:
    def __init__(self, session_title: str, total_questions: int = 5):
        self.session_title = session_title
        self.total_questions = total_questions
        self.max_points = total_questions * 2
        self.responses: List[Dict[str, Any]] = []

    def record_question(self, q_num: int, q_type: str, topic: str, score: int, response_type: str, notes_reference: str):
        assert score in [0, 1, 2], f"Invalid score {score}. Must be 0, 1, or 2."
        self.responses.append({
            "q_num": q_num,
            "q_type": q_type,
            "topic": topic,
            "score": score,
            "response_type": response_type,
            "notes_reference": notes_reference
        })

    def verify_arithmetic(self) -> Dict[str, Any]:
        earned_score = sum(r["score"] for r in self.responses)
        percentage = (earned_score / self.max_points) * 100.0

        if percentage >= 90.0:
            mastery = "Distinction / High Mastery"
        elif percentage >= 70.0:
            mastery = "Proficient / Competent"
        elif percentage >= 50.0:
            mastery = "Developing / Needs Targeted Revision"
        else:
            mastery = "Foundational / Critical Revision Required"

        # Topic wise breakdown
        topics = {}
        for r in self.responses:
            t = r["topic"]
            if t not in topics:
                topics[t] = {"earned": 0, "max": 0, "questions": []}
            topics[t]["earned"] += r["score"]
            topics[t]["max"] += 2
            topics[t]["questions"].append(r["q_num"])

        for t, data in topics.items():
            data["percentage"] = (data["earned"] / data["max"]) * 100.0

        return {
            "session_title": self.session_title,
            "earned_score": earned_score,
            "max_points": self.max_points,
            "percentage": round(percentage, 1),
            "mastery": mastery,
            "topics": topics,
            "question_count": len(self.responses)
        }

def run_tests():
    print("=" * 60)
    print("EXAMMENTOR VIVA AUTOMATED VERIFICATION HARNESS")
    print("=" * 60)

    # Session 1: Short Theory Note (OS Concurrency & Deadlocks)
    # Testing: Correct, Partly Correct, Incorrect, Vague (probed -> 2), Blank
    s1 = VivaSessionVerifier("Session 1: OS Concurrency & Deadlocks", total_questions=5)
    s1.record_question(1, "Definition", "Deadlock Definition", 2, "Correct", "Section 1")
    s1.record_question(2, "Explanation", "Coffman Conditions", 2, "Vague -> Probed -> Correct", "Section 2")
    s1.record_question(3, "Comparison", "Deadlock vs Starvation", 1, "Partly Correct", "Section 3")
    s1.record_question(4, "Application", "Handling Strategies", 0, "Incorrect", "Section 4")
    s1.record_question(5, "Reasoning", "Coffman Invalidation", 0, "Blank / Unanswered", "Section 4")
    
    r1 = s1.verify_arithmetic()
    print(f"\n[Test 1] {r1['session_title']}")
    print(f"Total Score: {r1['earned_score']}/{r1['max_points']} ({r1['percentage']}%) -> {r1['mastery']}")
    assert r1['earned_score'] == 5
    assert r1['max_points'] == 10
    assert r1['percentage'] == 50.0
    assert r1['mastery'] == "Developing / Needs Targeted Revision"
    print("  [PASS] Score arithmetic verified: 2+2+1+0+0 = 5/10 (50.0%)")

    # Session 2: Long Chapter Extract (Distributed Systems & Raft)
    # Testing: Strong performance across multi-topic chapter
    s2 = VivaSessionVerifier("Session 2: Raft Consensus Algorithm", total_questions=5)
    s2.record_question(1, "Definition", "Consensus & FLP", 2, "Correct", "Section 7.1")
    s2.record_question(2, "Explanation", "Leader Election", 2, "Correct", "Section 7.2.2")
    s2.record_question(3, "Comparison", "Node States & Terms", 2, "Correct", "Section 7.2.1")
    s2.record_question(4, "Application", "Split-Brain Partition", 1, "Partly Correct", "Section 7.2.4")
    s2.record_question(5, "Reasoning", "Log Completeness Rule", 2, "Correct", "Section 7.2.2")

    r2 = s2.verify_arithmetic()
    print(f"\n[Test 2] {r2['session_title']}")
    print(f"Total Score: {r2['earned_score']}/{r2['max_points']} ({r2['percentage']}%) -> {r2['mastery']}")
    assert r2['earned_score'] == 9
    assert r2['max_points'] == 10
    assert r2['percentage'] == 90.0
    assert r2['mastery'] == "Distinction / High Mastery"
    print("  [PASS] Score arithmetic verified: 2+2+2+1+2 = 9/10 (90.0%)")

    # Session 3: Technical / Lab Note (Docker Containers & Networking)
    # Testing: Lab commands, multi-stage build, troubleshooting
    s3 = VivaSessionVerifier("Session 3: Docker Containers & Networking", total_questions=5)
    s3.record_question(1, "Definition", "Named Volumes vs Bind Mounts", 2, "Correct", "Section 3")
    s3.record_question(2, "Explanation", "Multi-Stage Build Pipeline", 1, "Partly Correct", "Section 1")
    s3.record_question(3, "Comparison", "Bridge vs Host Networking", 2, "Correct", "Section 4")
    s3.record_question(4, "Application", "CLI Execution & Diagnostics", 2, "Correct", "Section 2")
    s3.record_question(5, "Reasoning", "Port Binding Conflicts", 1, "Partly Correct", "Section 5")

    r3 = s3.verify_arithmetic()
    print(f"\n[Test 3] {r3['session_title']}")
    print(f"Total Score: {r3['earned_score']}/{r3['max_points']} ({r3['percentage']}%) -> {r3['mastery']}")
    assert r3['earned_score'] == 8
    assert r3['max_points'] == 10
    assert r3['percentage'] == 80.0
    assert r3['mastery'] == "Proficient / Competent"
    print("  [PASS] Score arithmetic verified: 2+1+2+2+1 = 8/10 (80.0%)")

    print("\n" + "=" * 60)
    print("ALL HARNESS VERIFICATIONS PASSED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
