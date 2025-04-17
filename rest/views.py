import os
from django.http import FileResponse
from django.conf import settings
from django.http.request import HttpRequest
from rest_framework.serializers import BaseSerializer
from rest.models import Note, User
from rest_framework import permissions, viewsets, status
from core.tasks import generate_pdf_from_markdown
from rest_framework.decorators import action
from rest_framework.response import Response
from core.http.serializers import UserSerializer, NoteSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer: BaseSerializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])  # type: ignore
    def generate_pdf(self, request: HttpRequest, pk=None):
        note = self.get_object()
        user_id = str(request.user.id)  # type: ignore

        task_id = generate_pdf_from_markdown(
            str.join('', ('# ', note.title, '\n', note.body)),
            user_id,
            note.id,  # type: ignore
        )

        return Response(
            {'task_id': task_id.id, 'status': 'processing'},
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=['get'])
    def pdf_status(self, request: HttpRequest, pk=None):
        task_id = str(request.query_params.get('task_id'))  # type: ignore

        if not task_id:
            return Response(
                {'error': 'task_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from huey.contrib.djhuey import HUEY  # type: ignore

        try:
            result = HUEY.result(task_id, preserve=True)
            if result is None:
                return Response(
                    {'status': 'processing'}, status=status.HTTP_202_ACCEPTED
                )

            return Response(
                {'status': 'complete', 'pdf_path': result},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {'status': 'error', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=['get'])
    def download_pdf(self, request: HttpRequest, pk=None):
        note = self.get_object()
        user_id = str(request.user.id)  # type: ignore

        pdf_dir = os.path.join(
            settings.MEDIA_ROOT, 'pdfs', str(user_id), str(note.id)
        )

        try:
            if not os.path.exists(pdf_dir):
                return Response(
                    {'error': 'No PDF has been generated for this note'},
                    status=status.HTTP_404_NOT_FOUND,
                )

            pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]
            if not pdf_files:
                return Response(
                    {'error': 'No PDF has been generated for this note'},
                    status=status.HTTP_404_NOT_FOUND,
                )

            latest_pdf = max(
                pdf_files,
                key=lambda f: os.path.getmtime(os.path.join(pdf_dir, f)),
            )
            pdf_path = os.path.join(pdf_dir, latest_pdf)

            response = FileResponse(
                open(pdf_path, 'rb'), content_type='application/pdf'
            )
            response['Content-Disposition'] = (
                f'attachment; filename="{note.title}.pdf"'
            )
            return response

        except Exception as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
