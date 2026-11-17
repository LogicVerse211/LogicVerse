
from rest_framework import serializers
from .models import Mission, MissionStep, MissionDecision


# =====================================
# LEARNER SERIALIZERS
# =====================================

class MissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Mission
        fields = [
            'id',
            'title',
            'algorithm',
            'difficulty',
            'description',
            'story',
            'learning_goal',
            'instructions',
            'is_active',
            'created_at',
        ]


class MissionDecisionOptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = MissionDecision
        fields = [
            'id',
            'option_text',
        ]


class MissionStepSerializer(serializers.ModelSerializer):

    decisions = MissionDecisionOptionSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = MissionStep
        fields = [
            'id',
            'mission',
            'step_number',
            'title',
            'description',
            'explanation',
            'visual_data',
            'hint',
            'decisions',
        ]


# =====================================
# TEACHER SERIALIZERS
# =====================================

class MissionManageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Mission
        fields = '__all__'


class MissionStepManageSerializer(serializers.ModelSerializer):

    class Meta:
        model = MissionStep
        fields = '__all__'


class MissionDecisionManageSerializer(serializers.ModelSerializer):

    class Meta:
        model = MissionDecision
        fields = '__all__'

    def validate(self, attrs):

        step = attrs.get(
            'step',
            self.instance.step if self.instance else None
        )

        next_step = attrs.get('next_step')

        if next_step and step:

            if next_step.mission_id != step.mission_id:

                raise serializers.ValidationError({
                    'next_step': 'Next step must belong to the same mission.'
                })

        return attrs
