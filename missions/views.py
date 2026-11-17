
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone

from .models import Mission, MissionStep, MissionDecision
from .serializers import (
    MissionSerializer,
    MissionStepSerializer,
    MissionDecisionOptionSerializer,
    MissionManageSerializer,
    MissionStepManageSerializer,
    MissionDecisionManageSerializer
)

from accounts.permissions import IsLearner, IsTeacher
from progress.models import MissionProgress, StepProgress


# ==============================
# LEARNER VIEWS
# ==============================

# 1. Display all active missions (Public Access)
class MissionListAPIView(generics.ListAPIView):
    serializer_class = MissionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Mission.objects.filter(
            is_active=True
        ).order_by('id')


# 2. Display details of a specific mission (Public Access)
class MissionDetailAPIView(generics.RetrieveAPIView):
    serializer_class = MissionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Mission.objects.filter(is_active=True)


# 3. Display all steps of a specific mission
class MissionStepListAPIView(generics.ListAPIView):
    serializer_class = MissionStepSerializer
    permission_classes = [IsAuthenticated, IsLearner]

    def get_queryset(self):
        mission_id = self.kwargs['mission_id']

        return MissionStep.objects.filter(
            mission_id=mission_id,
            mission__is_active=True
        ).order_by('step_number')


# 4. Display available choices for a mission step
class MissionDecisionListAPIView(generics.ListAPIView):
    serializer_class = MissionDecisionOptionSerializer
    permission_classes = [IsAuthenticated, IsLearner]

    def get_queryset(self):
        step_id = self.kwargs['step_id']

        return MissionDecision.objects.filter(
            step_id=step_id,
            step__mission__is_active=True
        ).order_by('id')


# 5. Check learner's selected answer and save step progress
class MissionDecisionAnswerAPIView(APIView):
    permission_classes = [IsAuthenticated, IsLearner]

    def post(self, request, decision_id):
        try:
            decision = MissionDecision.objects.get(
                id=decision_id,
                step__mission__is_active=True
            )
        except MissionDecision.DoesNotExist:
            return Response(
                {'error': 'Invalid decision.'},
                status=status.HTTP_404_NOT_FOUND
            )

        step_completed = False

        if decision.is_correct:
            step_progress, created = StepProgress.objects.get_or_create(
                user=request.user,
                step=decision.step,
                defaults={
                    'is_completed': True,
                    'completed_at': timezone.now()
                }
            )

            if not created and not step_progress.is_completed:
                step_progress.is_completed = True
                step_progress.completed_at = timezone.now()
                step_progress.save()

            step_completed = True

        return Response({
            'is_correct': decision.is_correct,
            'feedback': decision.feedback,
            'next_step_id': decision.next_step_id,
            'step_completed': step_completed
        }, status=status.HTTP_200_OK)


# 6. Start a mission and save progress
class MissionStartAPIView(APIView):
    permission_classes = [IsAuthenticated, IsLearner]

    def post(self, request, mission_id):
        try:
            mission = Mission.objects.get(
                id=mission_id,
                is_active=True
            )
        except Mission.DoesNotExist:
            return Response(
                {'error': 'Mission not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        progress, created = MissionProgress.objects.get_or_create(
            user=request.user,
            mission=mission,
            defaults={'status': 'started'}
        )

        return Response({
            'message': 'Mission started successfully.',
            'mission_id': mission.id,
            'status': progress.status
        }, status=status.HTTP_200_OK)


# 7. Complete a mission and save progress
class MissionCompleteAPIView(APIView):
    permission_classes = [IsAuthenticated, IsLearner]

    def post(self, request, mission_id):
        try:
            progress = MissionProgress.objects.get(
                user=request.user,
                mission_id=mission_id,
                mission__is_active=True
            )
        except MissionProgress.DoesNotExist:
            return Response(
                {'error': 'Please start the mission first.'},
                status=status.HTTP_404_NOT_FOUND
            )

        progress.status = 'completed'
        progress.completed_at = timezone.now()
        progress.save()

        return Response({
            'message': 'Mission completed successfully.',
            'mission_id': progress.mission_id,
            'status': progress.status,
            'completed_at': progress.completed_at
        }, status=status.HTTP_200_OK)


# ==============================
# TEACHER MISSION MANAGEMENT
# ==============================

# 8. Create and view missions
class TeacherMissionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MissionManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    queryset = Mission.objects.all().order_by('-created_at')


# 9. Update and delete a mission
class TeacherMissionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MissionManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    queryset = Mission.objects.all()


# ==============================
# TEACHER STEP MANAGEMENT
# ==============================

# 10. Create and view mission steps
class TeacherMissionStepListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MissionStepManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return MissionStep.objects.filter(
            mission_id=self.kwargs['mission_id']
        ).order_by('step_number')

    def perform_create(self, serializer):
        serializer.save(mission_id=self.kwargs['mission_id'])


# 11. Update and delete a mission step
class TeacherMissionStepDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MissionStepManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    queryset = MissionStep.objects.all()


# ==============================
# TEACHER DECISION MANAGEMENT
# ==============================

# 12. Create and view step decisions
class TeacherDecisionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MissionDecisionManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return MissionDecision.objects.filter(
            step_id=self.kwargs['step_id']
        ).order_by('id')

    def perform_create(self, serializer):
        serializer.save(step_id=self.kwargs['step_id'])


# 13. Update and delete a decision
class TeacherDecisionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MissionDecisionManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    queryset = MissionDecision.objects.all()

# ==============================
# ADMIN MISSION MANAGEMENT
# ==============================

from rest_framework.permissions import BasePermission


class IsLogicVerseAdmin(BasePermission):
    """
    Only Django staff or superuser can manage missions.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.is_staff
            )
        )


class AdminMissionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MissionManageSerializer
    permission_classes = [IsAuthenticated, IsLogicVerseAdmin]

    queryset = Mission.objects.all().order_by('-created_at')


class AdminMissionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MissionManageSerializer
    permission_classes = [IsAuthenticated, IsLogicVerseAdmin]

    queryset = Mission.objects.all()
