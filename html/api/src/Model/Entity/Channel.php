<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Channel Entity
 *
 * @property int $id
 * @property string $channel_ids
 * @property string $channel_title
 * @property string $channel_description
 * @property int $channel_view_count
 * @property int $channel_subscriber_count
 * @property int $channel_video_count
 * @property int $channel_comment_count
 * @property \Cake\I18n\FrozenTime $created_at
 * @property \Cake\I18n\FrozenTime $updated_at
 * @property int $is_deleted
 *
 * @property \App\Model\Entity\ApiArtistsAll[] $api_artists_all
 * @property \App\Model\Entity\ArtistChannel[] $artist_channels
 */
class Channel extends Entity
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
        'channel_ids' => true,
        'channel_title' => true,
        'channel_description' => true,
        'channel_view_count' => true,
        'channel_subscriber_count' => true,
        'channel_video_count' => true,
        'channel_comment_count' => true,
        'created_at' => true,
        'updated_at' => true,
        'is_deleted' => true,
        'api_artists_all' => true,
        'artist_channels' => true
    ];
}
