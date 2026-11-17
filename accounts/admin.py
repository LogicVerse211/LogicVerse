
from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'is_approved')
    list_filter = ('role', 'is_approved')
    search_fields = ('user__username', 'user__email')

    actions = ['approve_teachers']

    @admin.action(description='Approve selected teachers')
    def approve_teachers(self, request, queryset):
        teachers = queryset.filter(role='teacher')

        for profile in teachers:
            profile.is_approved = True
            profile.user.is_active = True
            profile.user.save()
            profile.save()
