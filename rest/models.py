from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Note(models.Model):
    title = models.TextField(max_length=255)
    body = models.TextField()
    is_public = models.BooleanField(default=False)
    author: models.ForeignKey[User] = models.ForeignKey(
        'User', on_delete=models.CASCADE, related_name='notes'
    )

    def __str__(self) -> str:
        return self.title
