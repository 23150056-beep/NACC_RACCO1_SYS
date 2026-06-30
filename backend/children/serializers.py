from rest_framework import serializers
from django.contrib.auth import get_user_model
from children.models import Guardian, Child

User = get_user_model()


class GuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guardian
        fields = [
            "id", "fullname", "birth_date", "gender", "address",
            "case_type", "status",
        ]


class ChildSerializer(serializers.ModelSerializer):
    guardian_name = serializers.CharField(source="guardian.fullname", read_only=True, default=None)
    # Frontend uses `psychologist`; map it to the assigned_psychologist FK.
    psychologist = serializers.PrimaryKeyRelatedField(
        source="assigned_psychologist", queryset=User.objects.all(),
        required=False, allow_null=True,
    )
    psychologist_name = serializers.CharField(
        source="assigned_psychologist.fullname", read_only=True, default=None,
    )

    class Meta:
        model = Child
        fields = [
            "id", "fullname", "birth_date", "gender",
            "province", "municipality", "barangay", "address",
            "case_type", "surrendered_by", "status", "assignee_sees_history",
            "psychologist", "psychologist_name",
            "guardian", "guardian_name",
        ]
