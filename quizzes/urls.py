
from django.urls import path

from .views import (
    # Learner APIs
    QuizListAPIView,
    QuizDetailAPIView,
    QuizSubmitAPIView,

    # Teacher APIs
    TeacherQuizListCreateAPIView,
    TeacherQuizDetailAPIView,
    TeacherQuestionListCreateAPIView,
    TeacherQuestionDetailAPIView,
    TeacherChoiceListCreateAPIView,
    TeacherChoiceDetailAPIView,

    # Admin APIs
    AdminQuizListCreateAPIView,
    AdminQuizDetailAPIView,
    AdminQuestionListCreateAPIView,
    AdminQuestionDetailAPIView,
    AdminChoiceListCreateAPIView,
    AdminChoiceDetailAPIView,
)


urlpatterns = [

    # ==========================================
    # LEARNER APIs
    # ==========================================

    path('', QuizListAPIView.as_view(), name='quiz-list'),

    path(
        '<int:pk>/',
        QuizDetailAPIView.as_view(),
        name='quiz-detail'
    ),

    path(
        '<int:quiz_id>/submit/',
        QuizSubmitAPIView.as_view(),
        name='quiz-submit'
    ),


    # ==========================================
    # TEACHER APIs
    # ==========================================

    path(
        'teacher/quizzes/',
        TeacherQuizListCreateAPIView.as_view(),
        name='teacher-quiz-list-create'
    ),

    path(
        'teacher/quizzes/<int:pk>/',
        TeacherQuizDetailAPIView.as_view(),
        name='teacher-quiz-detail'
    ),

    path(
        'teacher/quizzes/<int:quiz_id>/questions/',
        TeacherQuestionListCreateAPIView.as_view(),
        name='teacher-question-list-create'
    ),

    path(
        'teacher/questions/<int:pk>/',
        TeacherQuestionDetailAPIView.as_view(),
        name='teacher-question-detail'
    ),

    path(
        'teacher/questions/<int:question_id>/choices/',
        TeacherChoiceListCreateAPIView.as_view(),
        name='teacher-choice-list-create'
    ),

    path(
        'teacher/choices/<int:pk>/',
        TeacherChoiceDetailAPIView.as_view(),
        name='teacher-choice-detail'
    ),


    # ==========================================
    # ADMIN APIs
    # ==========================================

    path(
        'admin/quizzes/',
        AdminQuizListCreateAPIView.as_view(),
        name='admin-quiz-list-create'
    ),

    path(
        'admin/quizzes/<int:pk>/',
        AdminQuizDetailAPIView.as_view(),
        name='admin-quiz-detail'
    ),

    path(
        'admin/quizzes/<int:quiz_id>/questions/',
        AdminQuestionListCreateAPIView.as_view(),
        name='admin-question-list-create'
    ),

    path(
        'admin/questions/<int:pk>/',
        AdminQuestionDetailAPIView.as_view(),
        name='admin-question-detail'
    ),

    path(
        'admin/questions/<int:question_id>/choices/',
        AdminChoiceListCreateAPIView.as_view(),
        name='admin-choice-list-create'
    ),

    path(
        'admin/choices/<int:pk>/',
        AdminChoiceDetailAPIView.as_view(),
        name='admin-choice-detail'
    ),

]
