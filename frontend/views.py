import json
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render

from frontend.scripts import ipc
# from django.contrib.auth.decorators import login_required


# @login_required  # type: ignore
def index(request: HttpRequest):
    props: dict[str, str | int] = {'name': 'devscale'}
    response = ipc.ssr('index', props)

    if response:
        return render(
            request,
            'index.html',
            {'json_props': json.dumps(props), 'html': response},
        )
    else:
        return HttpResponse('Failed to get IPC response', status=500)


def login(request: HttpRequest):
    return render(request, 'login.html')


def register(request: HttpRequest):
    return render(request, 'register.html')
