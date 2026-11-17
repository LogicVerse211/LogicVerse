from django.contrib import admin
from .models import Mission, MissionStep, MissionDecision


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ('title', 'algorithm', 'difficulty', 'is_active', 'created_at')
    list_filter = ('algorithm', 'difficulty', 'is_active')
    search_fields = ('title', 'algorithm')


@admin.register(MissionStep)
class MissionStepAdmin(admin.ModelAdmin):
    list_display = ('mission', 'step_number', 'title')
    list_filter = ('mission',)
    search_fields = ('title', 'description')
    ordering = ('mission', 'step_number')


@admin.register(MissionDecision)
class MissionDecisionAdmin(admin.ModelAdmin):
    list_display = ('step', 'option_text', 'is_correct')
    list_filter = ('is_correct',)
    search_fields = ('option_text', 'feedback')