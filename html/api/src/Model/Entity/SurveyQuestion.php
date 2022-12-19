<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * SurveyQuestion Entity
 *
 * @property int $id
 * @property int $event_id
 * @property string $question
 *
 * @property \App\Model\Entity\Event $event
 * @property \App\Model\Entity\PublicSurveyAnswer[] $public_survey_answer
 * @property \App\Model\Entity\SurveyQuestionOption[] $survey_question_options
 */
class SurveyQuestion extends Entity
{

    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array
     */
    protected $_accessible = [
        'event_id' => true,
        'question' => true,
        'event' => true,
        'public_survey_answer' => true,
        'survey_question_options' => true
    ];
}
