
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from .models import UserProfile


class RegistrationSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(required=True)

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    role = serializers.ChoiceField(
        choices=UserProfile.ROLE_CHOICES
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'role'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):

        role = validated_data.pop('role')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)

        # Both Learner and Teacher can login immediately
        user.is_active = True
        user.save()

        UserProfile.objects.create(
            user=user,
            role=role,
            is_approved=True
        )

        return user
