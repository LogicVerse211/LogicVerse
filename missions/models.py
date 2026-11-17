
from django.db import models


class Mission(models.Model):

    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    algorithm = models.CharField(max_length=100)
    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default='beginner'
    )
    description = models.TextField()
    story = models.TextField()
    learning_goal = models.TextField()
    instructions = models.TextField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class MissionStep(models.Model):
    mission = models.ForeignKey(
        Mission,
        on_delete=models.CASCADE,
        related_name='steps'
    )
    step_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    explanation = models.TextField()
    visual_data = models.JSONField(default=dict, blank=True)
    hint = models.TextField(blank=True)

    class Meta:
        ordering = ['step_number']
        unique_together = ('mission', 'step_number')

    def __str__(self):
        return f"{self.mission.title} - Step {self.step_number}"


class MissionDecision(models.Model):
    step = models.ForeignKey(
        MissionStep,
        on_delete=models.CASCADE,
        related_name='decisions'
    )
    option_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    feedback = models.TextField()
    next_step = models.ForeignKey(
        MissionStep,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='previous_decisions'
    )

    def __str__(self):
        return f"{self.step.title} - {self.option_text}"
