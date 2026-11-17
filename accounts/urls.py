
from django.urls import path
from .views import (
    RegistrationAPIView,
    LogoutAPIView,
    LearnerDashboardAPIView,
    TeacherDashboardAPIView,
    UserProfileAPIView,
    LearnerDashboardPageView,
    AdminDashboardPageView,
    AdminUserListAPIView
)
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register/', RegistrationAPIView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),

    # Dashboard APIs
    path('learner/dashboard/', LearnerDashboardAPIView.as_view(), name='learner-dashboard'),
    path('teacher/dashboard/', TeacherDashboardAPIView.as_view(), name='teacher-dashboard'),

    # Learner Dashboard HTML Page
    path('learner-dashboard/', LearnerDashboardPageView.as_view(), name='learner-dashboard-page'),

    # User Profile
    path('profile/', UserProfileAPIView.as_view(), name='profile'),
    path(
    'admin-dashboard/',
    AdminDashboardPageView.as_view(),
    name='admin-dashboard'
),
path(
    'admin/users/',
    AdminUserListAPIView.as_view(),
    name='admin-user-list'
),
]
