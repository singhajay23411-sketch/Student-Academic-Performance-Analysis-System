from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

logger = logging.getLogger(__name__)

class ReminderScheduler:
    """
    Core APScheduler architecture for processing background reminders.
    This will eventually push notifications (push/email/websocket) 
    prior to exams and planner sessions.
    """
    def __init__(self):
        self.scheduler = AsyncIOScheduler()

    def start(self):
        self.scheduler.start()
        logger.info("APScheduler for SAPAS Reminders started successfully.")

    def stop(self):
        self.scheduler.shutdown()
        logger.info("APScheduler for SAPAS Reminders stopped.")

    def schedule_exam_reminder(self, exam_id: str, trigger_time):
        """
        Future integration: Trigger logic to alert user of an impending exam.
        """
        pass

    def schedule_planner_reminder(self, session_id: str, trigger_time):
        """
        Future integration: Trigger logic to alert user a focus session is starting.
        """
        pass

# Global instance to be optionally attached to app lifecycle events in main.py
scheduler_instance = ReminderScheduler()
