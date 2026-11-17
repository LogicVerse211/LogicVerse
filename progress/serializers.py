
from rest_framework import serializers
from .models import MissionProgress, QuizProgress, StepProgress


class MissionProgressSerializer(serializers.ModelSerializer):
    mission_title = serializers.CharField(
        source='mission.title',
        read_only=True
    )

    class Meta:
        model = MissionProgress
        fields = [
            'id',
            'mission',
            'mission_title',
            'status',
            'started_at',
            'completed_at',
        ]


class QuizProgressSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(
        source='quiz.title',
        read_only=True
    )

    class Meta:
        model = QuizProgress
        fields = [
            'id',
            'quiz',
            'quiz_title',
            'score',
            'total_marks',
            'completed_at',
        ]


class StepProgressSerializer(serializers.ModelSerializer):
    step_title = serializers.CharField(
        source='step.title',
        read_only=True
    )
    mission_title = serializers.CharField(
        source='step.mission.title',
        read_only=True
    )

    class Meta:
        model = StepProgress
        fields = [
            'id',
            'step',
            'step_title',
            'mission_title',
            'is_completed',
            'completed_at',
        ]
