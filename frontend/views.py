import json

from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.views import View
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate, login
from django.contrib import messages
from rest.models import User
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required

from frontend.scripts import ipc


@login_required  # type: ignore
def index(request: HttpRequest):
    props: dict[str, str | int] = {'name': 'Noveanre'}
    response = ipc.ssr('index', props)

    if response:
        return render(
            request,
            'index.html',
            {'json_props': json.dumps(props), 'html': response},
        )
    else:
        return HttpResponse('Failed to get IPC response', status=500)


class LoginPage(View):
    def get(self, request: HttpRequest):
        csrf_token = get_token(request)
        props: dict[str, str | int] = {
            'csrf_token': csrf_token,
            'action': '/login/',
        }

        response = ipc.ssr('login', props)

        if response:
            return render(
                request,
                'login.html',
                {'json_props': json.dumps(props), 'html': response},
            )
        else:
            return HttpResponse('Failed to get IPC response', status=500)

    def post(self, request: HttpRequest):
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('/')
        else:
            messages.error(request, 'Invalid username or password.')
            csrf_token = get_token(request)
            props = {
                'csrf_token': csrf_token,
                'action': '/login',
                'error': 'Invalid username or password',
            }

            response = ipc.ssr('login', props)

            if response:
                return render(
                    request,
                    'login.html',
                    {'json_props': json.dumps(props), 'html': response},
                )
            else:
                return HttpResponse('Failed to get IPC response', status=500)


class RegisterPage(View):
    def get(self, request: HttpRequest):
        csrf_token = get_token(request)
        props: dict[str, str | int] = {
            'csrf_token': csrf_token,
            'action': '/register/',
        }

        response = ipc.ssr('register', props)

        print(response)

        if response:
            return render(
                request,
                'register.html',
                {'json_props': json.dumps(props), 'html': response},
            )
        else:
            return HttpResponse('Failed to get IPC response', status=500)

    def post(self, request: HttpRequest):
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        error = None

        if not all([username, email, password, confirm_password]):
            error = 'All fields are required.'
        elif password != confirm_password:
            error = 'Passwords do not match.'
        elif User.objects.filter(username=username).exists():
            error = 'Username already exists.'
        elif User.objects.filter(email=email).exists():
            error = 'Email already registered.'

        if error:
            csrf_token = get_token(request)
            props = {
                'csrf_token': csrf_token,
                'action': '/register/',
                'error': error,
                'username': username,
                'email': email,
            }

            response = ipc.ssr('register', props)

            if response:
                return render(
                    request,
                    'register.html',
                    {'json_props': json.dumps(props), 'html': response},
                )
            else:
                return HttpResponse('Failed to get IPC response', status=500)
        else:
            user = User.objects.create_user(
                username=username or '', email=email, password=password
            )

            login(request, user)

            messages.success(request, 'Registration successful!')

            return redirect('/')
