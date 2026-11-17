
from django.db import models
from django.contrib.auth.models import User
from missions.models import Mission
from quizzes.models import Quiz


class MissionProgress(models.Model):
    STATUS_CHOICES = [
        ('started', 'Started'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='mission_progress'
    )
    mission = models.ForeignKey(
        Mission,
        on_delete=models.CASCADE,
        related_name='learner_progress'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='started'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'mission')

    def __str__(self):
        return f"{self.user.username} - {self.mission.title}"


class QuizProgress(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='quiz_progress'
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='learner_progress'
    )
    score = models.PositiveIntegerField(default=0)
    total_marks = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title}"

class StepProgress(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='step_progress'
    )
    step = models.ForeignKey(
        'missions.MissionStep',
        on_delete=models.CASCADE,
        related_name='learner_progress'
    )
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        unique_together = ('user', 'step')

    def __str__(self):
        return f"{self.user.username} - {self.step.title}"
