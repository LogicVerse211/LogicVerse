
from rest_framework import serializers
from .models import Quiz, Question, Choice


# ==========================================
# LEARNER SERIALIZERS
# ==========================================

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = [
            'id',
            'choice_text',
        ]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            'id',
            'question_text',
            'marks',
            'choices',
        ]


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = [
            'id',
            'mission',
            'title',
            'description',
            'total_marks',
            'is_active',
        ]


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'mission',
            'title',
            'description',
            'total_marks',
            'questions',
        ]


# ==========================================
# TEACHER SERIALIZERS
# ==========================================

class QuizManageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'


class QuestionManageSerializer(serializers.ModelSerializer):
    quiz = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Question
        fields = '__all__'


class ChoiceManageSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Choice
        fields = '__all__'


# ==========================================
# ADMIN SERIALIZERS
# ==========================================

class AdminQuestionSerializer(serializers.ModelSerializer):
    quiz = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Question
        fields = [
            'id',
            'quiz',
            'question_text',
            'marks',
        ]


class AdminChoiceSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Choice
        fields = [
            'id',
            'question',
            'choice_text',
            'is_correct',
        ]


class AdminQuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'mission',
            'title',
            'description',
            'total_marks',
            'is_active',
            'questions',
            'created_at',
        ]
