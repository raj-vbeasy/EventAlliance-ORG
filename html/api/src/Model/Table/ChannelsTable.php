<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Channels Model
 *
 * @property \App\Model\Table\ApiArtistsAllTable|\Cake\ORM\Association\HasMany $ApiArtistsAll
 * @property \App\Model\Table\ArtistChannelsTable|\Cake\ORM\Association\HasMany $ArtistChannels
 *
 * @method \App\Model\Entity\Channel get($primaryKey, $options = [])
 * @method \App\Model\Entity\Channel newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Channel[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Channel|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Channel patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Channel[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Channel findOrCreate($search, callable $callback = null, $options = [])
 */
class ChannelsTable extends Table
{

    /**
     * Initialize method
     *
     * @param array $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config)
    {
        parent::initialize($config);

        $this->setTable('channels');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->hasMany('ApiArtistsAll', [
            'foreignKey' => 'channel_id'
        ]);
        $this->hasMany('ArtistChannels', [
            'foreignKey' => 'channel_id'
        ]);
        $this->belongsToMany('Artists', [
            'through' => 'artist_channels',
            
        ]);   
    }

    /**
     * Default validation rules.
     *
     * @param \Cake\Validation\Validator $validator Validator instance.
     * @return \Cake\Validation\Validator
     */
    public function validationDefault(Validator $validator)
    {
        $validator
            ->integer('id')
            ->allowEmpty('id', 'create');

        $validator
            ->scalar('channel_ids')
            ->maxLength('channel_ids', 70)
            ->requirePresence('channel_ids', 'create')
            ->notEmpty('channel_ids');

        $validator
            ->scalar('channel_title')
            ->maxLength('channel_title', 255)
            ->allowEmpty('channel_title');

        $validator
            ->scalar('channel_description')
            ->requirePresence('channel_description', 'create')
            ->notEmpty('channel_description');

        $validator
            ->integer('channel_view_count')
            ->requirePresence('channel_view_count', 'create')
            ->notEmpty('channel_view_count');

        $validator
            ->integer('channel_subscriber_count')
            ->requirePresence('channel_subscriber_count', 'create')
            ->notEmpty('channel_subscriber_count');

        $validator
            ->integer('channel_video_count')
            ->requirePresence('channel_video_count', 'create')
            ->notEmpty('channel_video_count');

        $validator
            ->integer('channel_comment_count')
            ->requirePresence('channel_comment_count', 'create')
            ->notEmpty('channel_comment_count');

        $validator
            ->dateTime('created_at')
            ->requirePresence('created_at', 'create')
            ->notEmpty('created_at');

        $validator
            ->dateTime('updated_at')
            ->requirePresence('updated_at', 'create')
            ->notEmpty('updated_at');

        $validator
            ->requirePresence('is_deleted', 'create')
            ->notEmpty('is_deleted');

        return $validator;
    }
}
