<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * TeamMember Entity
 *
 * @property int $id
 * @property int $user_id
 * @property int $team_id
 * @property int $team_role_id
 * @property int $is_deleted
 *
 * @property \App\Model\Entity\User $user
 * @property \App\Model\Entity\Team $team
 * @property \App\Model\Entity\TeamRole $team_role
 */
class TeamMember extends Entity
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
        'user_id' => true,
        'team_id' => true,
        'team_role_id' => true,
        'is_deleted' => true,
        'user' => true,
        'team' => true,
        'team_role' => true
    ];
}
