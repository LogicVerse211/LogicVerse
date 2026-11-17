from django.contrib import admin
from .models import MissionProgress, QuizProgress


@admin.register(MissionProgress)
class MissionProgressAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'mission',
        'status',
        'started_at',
        'completed_at'
    )
    list_filter = ('status', 'mission')
    search_fields = ('user__username', 'mission__title')


@admin.register(QuizProgress)
class QuizProgressAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'quiz',
        'score',
        'total_marks',
        'completed_at'
    )
    list_filter = ('quiz',)
    search_fields = ('user__username', 'quiz__title')