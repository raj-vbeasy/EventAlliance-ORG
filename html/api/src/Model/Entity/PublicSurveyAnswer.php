<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * PublicSurveyAnswer Entity
 *
 * @property int $id
 * @property int $public_survey_id
 * @property int $survey_question_id
 * @property int $answer_id
 *
 * @property \App\Model\Entity\PublicSurvey $public_survey
 * @property \App\Model\Entity\SurveyQuestion $survey_question
 * @property \App\Model\Entity\Answer $answer
 */
class PublicSurveyAnswer extends Entity
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
        'public_survey_id' => true,
        'survey_question_id' => true,
        'answer_id' => true,
        'public_survey' => true,
        'survey_question' => true,
        'answer' => true
    ];
}
