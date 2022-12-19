<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Budget Entity
 *
 * @property int $id
 * @property string $amount
 * @property int $is_deleted
 *
 * @property \App\Model\Entity\Artist[] $artists
 * @property \App\Model\Entity\Event[] $events
 */
class Budget extends Entity
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
        'amount' => true,
        'is_deleted' => true,
        'artists' => true,
        'events' => true
    ];
}
