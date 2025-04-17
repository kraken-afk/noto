from rest_framework import serializers
from rest.models import Note, User


class UserSerializer(serializers.ModelSerializer):
    notes = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:  # type: ignore
        model = User
        fields = ['id', 'username', 'email', 'notes']


class NoteSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:  # type: ignore
        model = Note
        fields = ['id', 'title', 'body', 'is_public', 'author']
