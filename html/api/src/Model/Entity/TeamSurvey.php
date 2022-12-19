<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * TeamSurvey Entity
 *
 * @property int $id
 * @property int $team_member_id
 * @property int $event_id
 * @property int $artist_id
 * @property \Cake\I18n\FrozenTime $vote_date
 *
 * @property \App\Model\Entity\TeamMember $team_member
 * @property \App\Model\Entity\Event $event
 * @property \App\Model\Entity\Artist $artist
 */
class TeamSurvey extends Entity
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
        'team_member_id' => true,
        'event_id' => true,
        'artist_id' => true,
        'vote_date' => true,
        'team_member' => true,
        'event' => true,
        'artist' => true
    ];
}
