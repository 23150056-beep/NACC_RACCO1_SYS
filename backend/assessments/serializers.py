from rest_framework import serializers
from assessments.models import Questionnaire, Question


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.JSONField(required=False, default=list)

    class Meta:
        model = Question
        fields = ["id", "question_text", "question_type", "options", "order"]


class QuestionnaireSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)

    class Meta:
        model = Questionnaire
        fields = ["id", "title", "age_group", "description", "status", "questions"]

    def _write_questions(self, questionnaire, questions):
        for i, qd in enumerate(questions):
            qd = {**qd}
            qd.setdefault("order", i + 1)
            Question.objects.create(questionnaire=questionnaire, **qd)

    def create(self, validated_data):
        questions = validated_data.pop("questions", [])
        questionnaire = Questionnaire.objects.create(**validated_data)
        self._write_questions(questionnaire, questions)
        return questionnaire

    def update(self, instance, validated_data):
        questions = validated_data.pop("questions", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if questions is not None:
            instance.questions.all().delete()
            self._write_questions(instance, questions)
        return instance
