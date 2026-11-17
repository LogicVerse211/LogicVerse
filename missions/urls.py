
from django.urls import path

from .views import (
    MissionListAPIView,
    MissionDetailAPIView,
    MissionStepListAPIView,
    MissionDecisionListAPIView,
    MissionDecisionAnswerAPIView,
    MissionStartAPIView,
    MissionCompleteAPIView,

    TeacherMissionListCreateAPIView,
    TeacherMissionDetailAPIView,
    TeacherMissionStepListCreateAPIView,
    TeacherMissionStepDetailAPIView,
    TeacherDecisionListCreateAPIView,
    TeacherDecisionDetailAPIView,

    AdminMissionListCreateAPIView,
    AdminMissionDetailAPIView,
)

urlpatterns = [

    # Learner APIs
    path('', MissionListAPIView.as_view(), name='mission-list'),

    path('<int:pk>/', MissionDetailAPIView.as_view(), name='mission-detail'),

    path(
        '<int:mission_id>/steps/',
        MissionStepListAPIView.as_view(),
        name='mission-steps'
    ),

    path(
        'steps/<int:step_id>/decisions/',
        MissionDecisionListAPIView.as_view(),
        name='mission-decisions'
    ),

    path(
        'decisions/<int:decision_id>/answer/',
        MissionDecisionAnswerAPIView.as_view(),
        name='mission-decision-answer'
    ),

    path(
        '<int:mission_id>/start/',
        MissionStartAPIView.as_view(),
        name='mission-start'
    ),

    path(
        '<int:mission_id>/complete/',
        MissionCompleteAPIView.as_view(),
        name='mission-complete'
    ),

    # Teacher Mission Management
    path(
        'teacher/missions/',
        TeacherMissionListCreateAPIView.as_view(),
        name='teacher-mission-list-create'
    ),

    path(
        'teacher/missions/<int:pk>/',
        TeacherMissionDetailAPIView.as_view(),
        name='teacher-mission-detail'
    ),

    # Teacher Step Management
    path(
        'teacher/missions/<int:mission_id>/steps/',
        TeacherMissionStepListCreateAPIView.as_view(),
        name='teacher-step-list-create'
    ),

    path(
        'teacher/steps/<int:pk>/',
        TeacherMissionStepDetailAPIView.as_view(),
        name='teacher-step-detail'
    ),

    # Teacher Decision Management
    path(
        'teacher/steps/<int:step_id>/decisions/',
        TeacherDecisionListCreateAPIView.as_view(),
        name='teacher-decision-list-create'
    ),

    path(
        'teacher/decisions/<int:pk>/',
        TeacherDecisionDetailAPIView.as_view(),
        name='teacher-decision-detail'
    ),

    # Admin Mission Management
    path(
        'admin/missions/',
        AdminMissionListCreateAPIView.as_view(),
        name='admin-mission-list-create'
    ),

    path(
        'admin/missions/<int:pk>/',
        AdminMissionDetailAPIView.as_view(),
        name='admin-mission-detail'
    ),
]
