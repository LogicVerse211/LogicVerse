
from django.db import transaction

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import Quiz, Question, Choice, QuizAttempt

from .serializers import (
    QuizSerializer,
    QuizDetailSerializer,
    QuizManageSerializer,
    QuestionManageSerializer,
    ChoiceManageSerializer,
    AdminQuestionSerializer,
    AdminChoiceSerializer,
    AdminQuizDetailSerializer,
)

from accounts.permissions import IsLearner, IsTeacher
from progress.models import QuizProgress


# ==========================================
# LEARNER: QUIZ LIST
# ==========================================

class QuizListAPIView(generics.ListAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated, IsLearner]

    def get_queryset(self):
        return Quiz.objects.filter(
            is_active=True,
            mission__is_active=True
        ).order_by('id')


# ==========================================
# LEARNER: QUIZ DETAILS
# ==========================================

class QuizDetailAPIView(generics.RetrieveAPIView):
    serializer_class = QuizDetailSerializer
    permission_classes = [IsAuthenticated, IsLearner]

    def get_queryset(self):
        return Quiz.objects.filter(
            is_active=True,
            mission__is_active=True
        ).prefetch_related('questions__choices')


# ==========================================
# LEARNER: SUBMIT QUIZ
# ==========================================

class QuizSubmitAPIView(APIView):
    permission_classes = [IsAuthenticated, IsLearner]

    @transaction.atomic
    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(
                id=quiz_id,
                is_active=True,
                mission__is_active=True
            )
        except Quiz.DoesNotExist:
            return Response(
                {'error': 'Quiz not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        answers = request.data.get('answers')

        if not isinstance(answers, list):
            return Response(
                {'error': 'Answers must be provided as a list.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        questions = {
            question.id: question
            for question in Question.objects.filter(quiz=quiz)
        }

        if not questions:
            return Response(
                {'error': 'This quiz has no questions.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(answers) != len(questions):
            return Response(
                {'error': 'Please answer all questions.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        score = 0
        total_marks = sum(
            question.marks for question in questions.values()
        )

        results = []
        answered_questions = set()

        for answer in answers:
            if not isinstance(answer, dict):
                return Response(
                    {
                        'error': (
                            'Each answer must contain '
                            'question_id and choice_id.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                question_id = int(answer.get('question_id'))
                choice_id = int(answer.get('choice_id'))
            except (TypeError, ValueError):
                return Response(
                    {'error': 'Invalid question_id or choice_id.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if question_id not in questions:
                return Response(
                    {'error': 'Invalid question.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if question_id in answered_questions:
                return Response(
                    {'error': 'Duplicate question answer.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                choice = Choice.objects.get(
                    id=choice_id,
                    question_id=question_id
                )
            except Choice.DoesNotExist:
                return Response(
                    {'error': 'Invalid choice for this question.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            question = questions[question_id]
            is_correct = choice.is_correct

            if is_correct:
                score += question.marks

            answered_questions.add(question_id)

            correct_choice = Choice.objects.filter(
                question=question,
                is_correct=True
            ).first()

            results.append({
                'question_id': question_id,
                'question_text': question.question_text,
                'selected_choice': choice.choice_text,
                'correct_choice': (
                    correct_choice.choice_text
                    if correct_choice else None
                ),
                'is_correct': is_correct
            })

        if len(answered_questions) != len(questions):
            return Response(
                {'error': 'Please answer all questions.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            total_marks=total_marks
        )

        QuizProgress.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            total_marks=total_marks
        )

        return Response({
            'message': 'Quiz submitted successfully.',
            'attempt_id': attempt.id,
            'score': score,
            'total_marks': total_marks,
            'results': results
        }, status=status.HTTP_200_OK)


# ==========================================
# TEACHER: QUIZ MANAGEMENT
# ==========================================

class TeacherQuizListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = QuizManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Quiz.objects.all().order_by('id')


class TeacherQuizDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# ==========================================
# TEACHER: QUESTION MANAGEMENT
# ==========================================

class TeacherQuestionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = QuestionManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        quiz_id = self.kwargs.get('quiz_id')
        return Question.objects.filter(
            quiz_id=quiz_id
        ).order_by('id')


class TeacherQuestionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# ==========================================
# TEACHER: CHOICE MANAGEMENT
# ==========================================

class TeacherChoiceListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ChoiceManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        question_id = self.kwargs.get('question_id')
        return Choice.objects.filter(
            question_id=question_id
        ).order_by('id')


class TeacherChoiceDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Choice.objects.all()
    serializer_class = ChoiceManageSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# ==========================================
# ADMIN: QUIZ MANAGEMENT
# ==========================================

class AdminQuizListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AdminQuizDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    queryset = Quiz.objects.all().order_by('-created_at')


class AdminQuizDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminQuizDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    queryset = Quiz.objects.all().prefetch_related(
        'questions__choices'
    )


# ==========================================
# ADMIN: QUESTION MANAGEMENT
# ==========================================

class AdminQuestionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AdminQuestionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return Question.objects.filter(
            quiz_id=self.kwargs['quiz_id']
        ).order_by('id')

    def perform_create(self, serializer):
        serializer.save(
            quiz_id=self.kwargs['quiz_id']
        )


class AdminQuestionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminQuestionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    queryset = Question.objects.all()


# ==========================================
# ADMIN: CHOICE MANAGEMENT
# ==========================================

class AdminChoiceListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AdminChoiceSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return Choice.objects.filter(
            question_id=self.kwargs['question_id']
        ).order_by('id')

    def perform_create(self, serializer):
        serializer.save(
            question_id=self.kwargs['question_id']
        )


class AdminChoiceDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminChoiceSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    queryset = Choice.objects.all()
