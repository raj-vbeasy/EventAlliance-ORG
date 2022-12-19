<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * PublicSurvey Entity
 *
 * @property int $id
 * @property \Cake\I18n\FrozenTime $survey_date
 * @property string $user_ip
 * @property int $event_id
 * @property string $email
 * @property string $name
 *
 * @property \App\Model\Entity\Event $event
 * @property \App\Model\Entity\PublicSurveyAnswer[] $public_survey_answer
 * @property \App\Model\Entity\PublicSurveyVote[] $public_survey_votes
 */
class PublicSurvey extends Entity
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
        'survey_date' => true,
        'user_ip' => true,
        'event_id' => true,
        'email' => true,
        'name' => true,
        'event' => true,
        'public_survey_answer' => true,
        'public_survey_votes' => true
    ];
}
