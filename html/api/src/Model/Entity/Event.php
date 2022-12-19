<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Event Entity
 *
 * @property int $id
 * @property string $name
 * @property string $status
 * @property \Cake\I18n\FrozenDate $start_date
 * @property \Cake\I18n\FrozenDate $end_date
 * @property string $profile_picture
 * @property string $description
 * @property string $venue_name
 * @property string $address_line_1
 * @property string $address_line_2
 * @property string $city
 * @property string $state
 * @property string $zip
 * @property int $budget_id
 * @property int $number_of_artist
 * @property string $audience_demographics
 * @property string $mode
 * @property string $url
 * @property string $welcome_message
 * @property string $legal_disclaimer
 * @property string $event_description
 * @property int $opt_in
 * @property string $opt_in_message
 * @property string $thanks_message
 * @property int $review_enable
 * @property \Cake\I18n\FrozenTime $created_at
 * @property \Cake\I18n\FrozenTime $updated_at
 * @property int $is_deleted
 *
 * @property \App\Model\Entity\Budget $budget
 * @property \App\Model\Entity\ArtistGenre[] $artist_genres
 * @property \App\Model\Entity\EventDemographic[] $event_demographics
 * @property \App\Model\Entity\EventGenre[] $event_genres
 * @property \App\Model\Entity\EventSurvey[] $event_surveys
 * @property \App\Model\Entity\TeamEvent[] $team_events
 */
class Event extends Entity
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
        'status' => true,
        'start_date' => true,
        'end_date' => true,
        'profile_picture' => true,
        'description' => true,
        'venue_name' => true,
        'address_line_1' => true,
        'address_line_2' => true,
        'city' => true,
        'state' => true,
        'zip' => true,
        'budget_id' => true,
        'number_of_artist' => true,
        'audience_demographics' => true,
        'mode' => true,
        'url' => true,
        'welcome_message' => true,
        'legal_disclaimer' => true,
        'event_description' => true,
        'opt_in' => true,
        'opt_in_message' => true,
        'thanks_message' => true,
        'review_enable' => true,
        'created_at' => true,
        'updated_at' => true,
        'is_deleted' => true,
        'budget' => true,
        'artist_genres' => true,
        'event_demographics' => true,
        'event_genres' => true,
        'event_surveys' => true,
        'team_events' => true
    ];
}
