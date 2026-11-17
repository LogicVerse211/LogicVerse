
from django.contrib import admin
from .models import Quiz, Question, Choice, QuizAttempt


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'mission',
        'total_marks',
        'is_active',
        'created_at'
    )
    list_filter = ('is_active', 'mission')
    search_fields = ('title',)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'quiz', 'marks')
    list_filter = ('quiz',)
    search_fields = ('question_text',)


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('choice_text', 'question', 'is_correct')
    list_filter = ('is_correct',)
    search_fields = ('choice_text',)


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'quiz',
        'score',
        'total_marks',
        'completed_at'
    )
    list_filter = ('quiz',)

