<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Team Entity
 *
 * @property int $id
 * @property string $photo
 * @property string $name
 * @property int $is_deleted
 *
 * @property \App\Model\Entity\TeamEvent[] $team_events
 * @property \App\Model\Entity\TeamUser[] $team_users
 * @property \App\Model\Entity\XTeamMember[] $x_team_members
 */
class Team extends Entity
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
        'photo' => true,
        'name' => true,
        'is_deleted' => true,
        'team_events' => true,
        'team_users' => true
    ];
}
