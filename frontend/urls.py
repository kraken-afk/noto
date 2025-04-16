from django.urls import path
from frontend import views


urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.LoginPage.as_view(), name='login'),
    path('register/', views.RegisterPage.as_view(), name='register'),
]
