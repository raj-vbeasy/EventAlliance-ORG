<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * PublicSurveyVote Entity
 *
 * @property int $id
 * @property int $public_survey_id
 * @property int $artist_id
 * @property int $vote
 *
 * @property \App\Model\Entity\PublicSurvey $public_survey
 * @property \App\Model\Entity\Artist $artist
 */
class PublicSurveyVote extends Entity
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
        'artist_id' => true,
        'vote' => true,
        'public_survey' => true,
        'artist' => true
    ];
}
