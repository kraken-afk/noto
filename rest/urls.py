from django.urls import include, path
from rest_framework import routers
from rest import views

router = routers.DefaultRouter()
router.register('users', views.UserViewSet)
router.register('notes', views.NoteViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
]
