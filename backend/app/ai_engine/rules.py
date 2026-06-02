from app.models.subject import Subject
from app.models.planner import PlannerSession
from datetime import datetime

class RuleBasedEngine:
    @staticmethod
    def evaluate_attendance(subjects):
        insights = []
        for sub in subjects:
            if sub.attendance_percentage is None: continue
            
            if sub.attendance_percentage < 60.0:
                insights.append({
                    "insight_type": "warning",
                    "title": f"Critical Attendance: {sub.subject_name}",
                    "description": f"Your attendance is dangerously low at {sub.attendance_percentage}%. Immediate action required to prevent failure.",
                    "priority": "HIGH"
                })
            elif sub.attendance_percentage < 75.0:
                insights.append({
                    "insight_type": "warning",
                    "title": f"Low Attendance: {sub.subject_name}",
                    "description": f"Your attendance is {sub.attendance_percentage}%. Try to attend the next few classes to stay above the 75% threshold.",
                    "priority": "MEDIUM"
                })
        return insights

    @staticmethod
    def evaluate_marks(subjects):
        insights = []
        for sub in subjects:
            if sub.current_marks is None or not sub.total_marks: continue
            
            perc = (sub.current_marks / sub.total_marks) * 100
            if perc < 40.0:
                insights.append({
                    "insight_type": "alert",
                    "title": f"Failing Marks: {sub.subject_name}",
                    "description": f"You are scoring {round(perc, 1)}%. We recommend scheduling extra focus sessions.",
                    "priority": "HIGH"
                })
            elif perc < 60.0:
                insights.append({
                    "insight_type": "recommendation",
                    "title": f"Improvement Needed: {sub.subject_name}",
                    "description": f"Your score is {round(perc, 1)}%. Consider adjusting your study techniques for this subject.",
                    "priority": "MEDIUM"
                })
            elif perc >= 90.0:
                insights.append({
                    "insight_type": "suggestion",
                    "title": f"Excellent Work: {sub.subject_name}",
                    "description": "You are performing exceptionally well here. Maintain your current pace.",
                    "priority": "LOW"
                })
        return insights

    @staticmethod
    def evaluate_productivity(sessions):
        if not sessions:
            return [{
                "insight_type": "suggestion",
                "title": "Start Planning",
                "description": "Your study planner is empty. Schedule focus sessions to improve productivity.",
                "priority": "LOW"
            }]
            
        total = len(sessions)
        completed = sum(1 for s in sessions if s.completed)
        completion_rate = completed / total * 100
        
        insights = []
        if completion_rate < 50.0:
            insights.append({
                "insight_type": "recommendation",
                "title": "Low Planner Consistency",
                "description": f"You are completing only {round(completion_rate, 1)}% of your planned sessions. Try setting smaller, more achievable goals.",
                "priority": "MEDIUM"
            })
        elif completion_rate >= 80.0:
            insights.append({
                "insight_type": "suggestion",
                "title": "High Focus Consistency",
                "description": "Great job sticking to your schedule! You have a high completion rate.",
                "priority": "LOW"
            })
            
        return insights

    @staticmethod
    def run_all_rules(subjects, sessions):
        """
        Executes all rule-based conditions and aggregates the resulting insights.
        """
        all_insights = []
        all_insights.extend(RuleBasedEngine.evaluate_attendance(subjects))
        all_insights.extend(RuleBasedEngine.evaluate_marks(subjects))
        all_insights.extend(RuleBasedEngine.evaluate_productivity(sessions))
        return all_insights
