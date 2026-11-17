
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Frontend URLs
    path('', include('frontend.urls')),

    # Authentication URLs
    path('accounts/', include('accounts.urls')),

    # API URLs
    path('api/missions/', include('missions.urls')),
    path('api/quizzes/', include('quizzes.urls')),
    path('api/progress/', include('progress.urls')),
]
