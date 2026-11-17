
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('catalogue/', views.catalogue, name='catalogue'),
    path('mission/', views.mission, name='mission'),

    path('login/', views.login_page, name='login'),
    path('signup/', views.register_page, name='signup'),

    path(
        'teacher-dashboard/',
        views.teacher_dashboard,
        name='teacher-dashboard'
    ),

    # Learner Quiz Catalogue
    path('quiz-catalogue/', views.quiz_catalogue, name='quiz-catalogue'),
    path('quiz/', views.quiz_page, name='quiz'),

    # Algorithm Visualization
    path(
        'visualization/',
        views.visualization,
        name='visualization'
    ),
]
