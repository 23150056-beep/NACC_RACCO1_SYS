from rest_framework import serializers
from children.models import Guardian, Child


class GuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guardian
        fields = [
            "id", "fullname", "birth_date", "gender", "address",
            "case_type", "status",
        ]


class ChildSerializer(serializers.ModelSerializer):
    guardian_name = serializers.CharField(source="guardian.fullname", read_only=True, default=None)

    class Meta:
        model = Child
        fields = [
            "id", "fullname", "birth_date", "gender", "address",
            "case_type", "status", "guardian", "guardian_name",
        ]
