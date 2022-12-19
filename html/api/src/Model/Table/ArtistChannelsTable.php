<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * ArtistChannels Model
 *
 * @property \App\Model\Table\ArtistsTable|\Cake\ORM\Association\BelongsTo $Artists
 * @property \App\Model\Table\ChannelsTable|\Cake\ORM\Association\BelongsTo $Channels
 * @property \App\Model\Table\EventsTable|\Cake\ORM\Association\BelongsTo $Events
 *
 * @method \App\Model\Entity\ArtistChannel get($primaryKey, $options = [])
 * @method \App\Model\Entity\ArtistChannel newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\ArtistChannel[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\ArtistChannel|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\ArtistChannel patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\ArtistChannel[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\ArtistChannel findOrCreate($search, callable $callback = null, $options = [])
 */
class ArtistChannelsTable extends Table
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

        $this->setTable('artist_channels');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Artists', [
            'foreignKey' => 'artist_id',
            'joinType' => 'INNER'
        ]);
        $this->belongsTo('Channels', [
            'foreignKey' => 'channel_id'
        ]);
        $this->belongsTo('Events', [
            'foreignKey' => 'event_id'
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
            ->requirePresence('is_deleted', 'create')
            ->notEmpty('is_deleted');

        return $validator;
    }

    /**
     * Returns a rules checker object that will be used for validating
     * application integrity.
     *
     * @param \Cake\ORM\RulesChecker $rules The rules object to be modified.
     * @return \Cake\ORM\RulesChecker
     */
    public function buildRules(RulesChecker $rules)
    {
        $rules->add($rules->existsIn(['artist_id'], 'Artists'));
        $rules->add($rules->existsIn(['channel_id'], 'Channels'));
        $rules->add($rules->existsIn(['event_id'], 'Events'));

        return $rules;
    }
}
