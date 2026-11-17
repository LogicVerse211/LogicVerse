
from django.db.models import Count, Avg, Max, OuterRef, Subquery

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import MissionProgress, QuizProgress, StepProgress
from .serializers import (
    MissionProgressSerializer,
    QuizProgressSerializer,
    StepProgressSerializer
)
from accounts.permissions import IsLearner


# 1. View learner's mission progress
class MissionProgressListAPIView(generics.ListAPIView):
    serializer_class = MissionProgressSerializer
    permission_classes = [IsAuthenticated, IsLearner]

    def get_queryset(self):
        return MissionProgress.objects.filter(
            user=self.request.user
        ).select_related('mission').order_by('-started_at')


# 2. View learner's quiz results
class QuizProgressListAPIView(generics.ListAPIView):
    serializer_class = QuizProgressSerializer
    permission_classes = [IsAuthenticated, IsLearner]

    def get_queryset(self):
        return QuizProgress.objects.filter(
            user=self.request.user
        ).select_related('quiz').order_by('-completed_at')


# 3. View learner's completed steps
class StepProgressListAPIView(generics.ListAPIView):
    serializer_class = StepProgressSerializer
    permission_classes = [IsAuthenticated, IsLearner]

    def get_queryset(self):
        return StepProgress.objects.filter(
            user=self.request.user
        ).select_related(
            'step',
            'step__mission'
        ).order_by('-completed_at')


# 4. View learner's quiz performance
class QuizPerformanceAPIView(APIView):
    permission_classes = [IsAuthenticated, IsLearner]

    def get(self, request):

        latest_score_query = QuizProgress.objects.filter(
            user=request.user,
            quiz_id=OuterRef('quiz_id')
        ).order_by('-completed_at').values('score')[:1]

        performance = QuizProgress.objects.filter(
            user=request.user
        ).values(
            'quiz_id',
            'quiz__title'
        ).annotate(
            total_attempts=Count('id'),
            best_score=Max('score'),
            average_score=Avg('score'),
            total_marks=Max('total_marks'),
            latest_score=Subquery(latest_score_query)
        ).order_by('quiz_id')

        results = []

        for item in performance:
            results.append({
                'quiz_id': item['quiz_id'],
                'quiz_title': item['quiz__title'],
                'total_attempts': item['total_attempts'],
                'latest_score': item['latest_score'],
                'best_score': item['best_score'],
                'average_score': round(item['average_score'], 2),
                'total_marks': item['total_marks']
            })

        return Response(results)
