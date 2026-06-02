def calculate_gpa(percentage: float) -> float:
    """
    Convert a percentage to a 10.0 GPA scale.
    """
    if percentage >= 90: return 10.0
    elif percentage >= 80: return 9.0
    elif percentage >= 70: return 8.0
    elif percentage >= 60: return 7.0
    elif percentage >= 50: return 6.0
    elif percentage >= 40: return 5.0
    else: return 0.0

def calculate_weighted_gpa(subjects):
    """
    Calculate the overall weighted GPA based on subject credits, marks, and grades.
    """
    total_credits = 0
    total_grade_points = 0.0
    
    for sub in subjects:
        credits = sub.credits
        gpa = 0.0
        
        if sub.current_marks is not None and sub.total_marks and sub.total_marks > 0:
            percentage = (sub.current_marks / sub.total_marks) * 100
            gpa = calculate_gpa(percentage)
        elif sub.grade:
            # Standard academic grade mapping
            grade_map = {'A+': 10, 'A': 10, 'B+': 9, 'B': 8, 'C+': 7, 'C': 6, 'D': 5, 'F': 0}
            gpa = grade_map.get(sub.grade.upper(), 0.0)
        else:
            continue

        total_grade_points += gpa * credits
        total_credits += credits

    if total_credits == 0:
        return 0.0, 0
    
    return round(total_grade_points / total_credits, 2), total_credits
