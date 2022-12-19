<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * SurveyQuestionOption Entity
 *
 * @property int $id
 * @property int $survey_question_id
 * @property string $options
 *
 * @property \App\Model\Entity\SurveyQuestion $survey_question
 */
class SurveyQuestionOption extends Entity
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
        'survey_question_id' => true,
        'options' => true,
        'survey_question' => true
    ];
}
