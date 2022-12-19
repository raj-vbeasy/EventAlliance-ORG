<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Artist Entity
 *
 * @property int $id
 * @property string $name
 * @property string $website
 * @property int $budget_id
 * @property string $video_description
 * @property int $video_view
 * @property int $video_like
 * @property int $video_dislike
 * @property int $video_favorite
 * @property int $video_comments
 * @property int $artist_status_id
 * @property string $profile_picture
 * @property string $channel_ids
 * @property \Cake\I18n\FrozenTime $created_at
 * @property \Cake\I18n\FrozenTime $updated_at
 * @property int $is_deleted
 *
 * @property \App\Model\Entity\Budget $budget
 * @property \App\Model\Entity\ArtistStatus $artist_status
 * @property \App\Model\Entity\ArtistChannel[] $artist_channels
 * @property \App\Model\Entity\ArtistGenre[] $artist_genres
 * @property \App\Model\Entity\ArtistTopTrack[] $artist_top_tracks
 * @property \App\Model\Entity\EventSurvey[] $event_surveys
 */
class Artist extends Entity
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
        'name' => true,
        'website' => true,
        'budget_id' => true,
        'video_description' => true,
        'video_view' => true,
        'video_like' => true,
        'video_dislike' => true,
        'video_favorite' => true,
        'video_comments' => true,
        'artist_status_id' => true,
        'profile_picture' => true,
        'channel_ids' => true,
        'created_at' => true,
        'updated_at' => true,
        'is_deleted' => true,
        'budget' => true,
        'artist_status' => true,
        'artist_channels' => true,
        'artist_genres' => true,
        'artist_top_tracks' => true,
        'event_surveys' => true
    ];
}
