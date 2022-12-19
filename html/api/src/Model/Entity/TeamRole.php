<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * TeamRole Entity
 *
 * @property int $id
 * @property string $role_name
 * @property int $is_deleted
 *
 * @property \App\Model\Entity\TeamMember[] $team_members
 */
class TeamRole extends Entity
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
        'role_name' => true,
        'is_deleted' => true,
        'team_members' => true
    ];
}
