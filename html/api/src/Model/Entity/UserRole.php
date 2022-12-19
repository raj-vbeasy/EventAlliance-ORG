<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * UserRole Entity
 *
 * @property int $id
 * @property string $role
 * @property \Cake\I18n\FrozenTime $created_at
 * @property int $is_deleted
 */
class UserRole extends Entity
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
        'role' => true,
        'created_at' => true,
        'is_deleted' => true
    ];
}
