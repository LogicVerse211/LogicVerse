
from django.shortcuts import render


def home(request):
    return render(request, 'home.html')


def catalogue(request):
    return render(request, 'catalogue.html')


def mission(request):
    return render(request, 'mission.html')


def login_page(request):
    return render(request, 'login.html')


def register_page(request):
    return render(request, 'register.html')


def teacher_dashboard(request):
    return render(request, 'teacher_dashboard.html')


# Learner Quiz Catalogue
def quiz_catalogue(request):
    return render(request, 'quiz_catalogue.html')


def quiz_page(request):
    return render(request, 'quiz.html')


# Algorithm Visualization
def visualization(request):
    return render(request, 'visualization.html')
