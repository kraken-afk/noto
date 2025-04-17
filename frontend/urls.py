from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from frontend import views


urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.LoginPage.as_view(), name='login'),
    path('register/', views.RegisterPage.as_view(), name='register'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
