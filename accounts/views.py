
from collections import defaultdict

from django.contrib.auth.models import User
from django.views.generic import TemplateView
from django.db.models import Count

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserProfile
from .serializers import RegistrationSerializer
from .permissions import IsLearner, IsTeacher

from missions.models import Mission
from quizzes.models import Quiz
from progress.models import MissionProgress, StepProgress, QuizProgress


# 1. User Registration
class RegistrationAPIView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "message": "Registration successful.",
                "username": user.username,
                "role": user.userprofile.role,
                "is_approved": user.userprofile.is_approved
            },
            status=status.HTTP_201_CREATED
        )


# 2. User Logout
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')

            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {'message': 'Logout successful.'},
                status=status.HTTP_200_OK
            )

        except TokenError:
            return Response(
                {'error': 'Invalid or expired refresh token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


# 3. Learner Dashboard
class LearnerDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsLearner]

    def get(self, request):
        user = request.user

        mission_progress = MissionProgress.objects.filter(user=user)

        total_started = mission_progress.count()

        total_completed = mission_progress.filter(
            status='completed'
        ).count()

        total_steps_completed = StepProgress.objects.filter(
            user=user,
            is_completed=True
        ).count()

        quiz_records = QuizProgress.objects.filter(
            user=user
        ).select_related('quiz').order_by('-completed_at')

        total_attempts = quiz_records.count()

        quiz_data = defaultdict(list)

        for record in quiz_records:
            quiz_data[record.quiz_id].append(record)

        quiz_performance = []

        for quiz_id, attempts in quiz_data.items():
            scores = [attempt.score for attempt in attempts]

            quiz_performance.append({
                'quiz_id': quiz_id,
                'quiz_title': attempts[0].quiz.title,
                'total_attempts': len(attempts),
                'latest_score': attempts[0].score,
                'best_score': max(scores),
                'average_score': round(
                    sum(scores) / len(scores), 2
                ),
                'total_marks': attempts[0].total_marks
            })

        return Response({
            'message': 'Welcome to Learner Dashboard!',
            'mission_summary': {
                'total_started': total_started,
                'total_completed': total_completed
            },
            'total_steps_completed': total_steps_completed,
            'quiz_summary': {
                'total_attempts': total_attempts,
                'quiz_performance': quiz_performance
            }
        })


# 4. Teacher Dashboard
class TeacherDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):

        # Overall Statistics
        total_learners = UserProfile.objects.filter(
            role='learner'
        ).count()

        total_missions = Mission.objects.count()

        active_missions = Mission.objects.filter(
            is_active=True
        ).count()

        total_quizzes = Quiz.objects.count()

        total_mission_started = MissionProgress.objects.count()

        total_mission_completed = MissionProgress.objects.filter(
            status='completed'
        ).count()

        total_quiz_attempts = QuizProgress.objects.count()

        # Learner Information
        learners = User.objects.filter(
            userprofile__role='learner'
        ).order_by('username')

        learner_data = []

        for learner in learners:

            # Mission Progress
            mission_records = MissionProgress.objects.filter(
                user=learner
            ).select_related('mission')

            started_missions = mission_records.count()

            completed_missions = mission_records.filter(
                status='completed'
            ).count()

            # Completed Steps
            completed_steps = StepProgress.objects.filter(
                user=learner,
                is_completed=True
            ).count()

            # Quiz Performance
            quiz_records = QuizProgress.objects.filter(
                user=learner
            ).select_related('quiz').order_by('-completed_at')

            quiz_data = defaultdict(list)

            for record in quiz_records:
                quiz_data[record.quiz_id].append(record)

            quiz_performance = []

            for quiz_id, attempts in quiz_data.items():

                scores = [attempt.score for attempt in attempts]

                quiz_performance.append({
                    'quiz_id': quiz_id,
                    'quiz_title': attempts[0].quiz.title,
                    'total_attempts': len(attempts),
                    'latest_score': attempts[0].score,
                    'best_score': max(scores),
                    'average_score': round(
                        sum(scores) / len(scores), 2
                    ),
                    'total_marks': attempts[0].total_marks
                })

            learner_data.append({
                'learner_id': learner.id,
                'username': learner.username,
                'email': learner.email,
                'mission_progress': {
                    'total_started': started_missions,
                    'total_completed': completed_missions,
                    'completed_steps': completed_steps
                },
                'quiz_summary': {
                    'total_attempts': quiz_records.count(),
                    'quiz_performance': quiz_performance
                }
            })

        return Response({
            'message': 'Welcome to Teacher Dashboard!',

            'overview': {
                'total_learners': total_learners,
                'total_missions': total_missions,
                'active_missions': active_missions,
                'total_quizzes': total_quizzes,
                'total_mission_started': total_mission_started,
                'total_mission_completed': total_mission_completed,
                'total_quiz_attempts': total_quiz_attempts
            },

            'learner_performance': learner_data
        })




# 5. User Profile API
class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Admin / Staff User
        if user.is_superuser or user.is_staff:
            return Response({
                "username": user.username,
                "email": user.email,
                "role": "admin",
                "is_approved": True
            })

        # Regular Learner / Teacher
        try:
            profile = user.userprofile

        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "username": user.username,
            "email": user.email,
            "role": profile.role,
            "is_approved": profile.is_approved
        })


# 6. Learner Dashboard Page
class LearnerDashboardPageView(TemplateView):
    template_name = 'learner_dashboard.html'


# 7. Admin Dashboard Page
class AdminDashboardPageView(TemplateView):
    template_name = 'admin_dashboard.html'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            from django.shortcuts import redirect
            return redirect('/login/')

        if not request.user.is_superuser:
            from django.http import HttpResponseForbidden
            return HttpResponseForbidden(
                "You are not authorized to access this page."
            )

        return super().dispatch(request, *args, **kwargs)


# ==========================================
# ADMIN: USER MANAGEMENT
# ==========================================

from rest_framework.permissions import IsAdminUser


class AdminUserListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.all().select_related(
            'userprofile'
        ).order_by('-date_joined')

        user_data = []

        for user in users:
            profile = getattr(user, 'userprofile', None)

            if user.is_superuser or user.is_staff:
                role = 'admin'
                is_approved = True
            elif profile:
                role = profile.role
                is_approved = profile.is_approved
            else:
                role = 'unknown'
                is_approved = False

            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': role,
                'is_approved': is_approved,
                'is_active': user.is_active,
                'date_joined': user.date_joined,
            })

        return Response({
            'total_users': len(user_data),
            'users': user_data
        })
