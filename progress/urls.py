
from django.urls import path

from .views import (
    MissionProgressListAPIView,
    QuizProgressListAPIView,
    StepProgressListAPIView,
    QuizPerformanceAPIView
)

urlpatterns = [
    path(
        'missions/',
        MissionProgressListAPIView.as_view(),
        name='mission-progress'
    ),
    path(
        'quizzes/',
        QuizProgressListAPIView.as_view(),
        name='quiz-progress'
    ),
    path(
        'steps/',
        StepProgressListAPIView.as_view(),
        name='step-progress'
    ),
    path(
        'quiz-performance/',
        QuizPerformanceAPIView.as_view(),
        name='quiz-performance'
    ),
]
