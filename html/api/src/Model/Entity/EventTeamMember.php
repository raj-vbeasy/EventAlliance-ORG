<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * EventTeamMember Entity
 *
 * @property int $id
 * @property int $event_id
 * @property int $team_menber_id
 * @property int $user_id
 *
 * @property \App\Model\Entity\Event $event
 * @property \App\Model\Entity\TeamMenber $team_menber
 * @property \App\Model\Entity\User $user
 */
class EventTeamMember extends Entity
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
        'team_member_id' => true,
        'user_id' => true,
        'event' => true,
        'team_menber' => true,
        'user' => true
    ];
}
