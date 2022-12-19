<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * ArtistChannel Entity
 *
 * @property int $id
 * @property int $artist_id
 * @property int $channel_id
 * @property int $event_id
 * @property int $is_deleted
 *
 * @property \App\Model\Entity\Artist $artist
 * @property \App\Model\Entity\Channel $channel
 * @property \App\Model\Entity\Event $event
 */
class ArtistChannel extends Entity
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
        'artist_id' => true,
        'channel_id' => true,
        'event_id' => true,
        'is_deleted' => true,
        'artist' => true,
        'channel' => true,
        'event' => true
    ];
}
