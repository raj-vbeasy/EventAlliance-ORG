<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Artists Model
 *
 * @property \App\Model\Table\BudgetsTable|\Cake\ORM\Association\BelongsTo $Budgets
 * @property \App\Model\Table\ArtistStatusesTable|\Cake\ORM\Association\BelongsTo $ArtistStatuses
 * @property \App\Model\Table\ArtistChannelsTable|\Cake\ORM\Association\HasMany $ArtistChannels
 * @property \App\Model\Table\ArtistGenresTable|\Cake\ORM\Association\HasMany $ArtistGenres
 * @property \App\Model\Table\ArtistTopTracksTable|\Cake\ORM\Association\HasMany $ArtistTopTracks
 * @property \App\Model\Table\EventSurveysTable|\Cake\ORM\Association\HasMany $EventSurveys
 *
 * @method \App\Model\Entity\Artist get($primaryKey, $options = [])
 * @method \App\Model\Entity\Artist newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Artist[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Artist|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Artist patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Artist[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Artist findOrCreate($search, callable $callback = null, $options = [])
 */
class ArtistsTable extends Table
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

        $this->setTable('artists');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->belongsTo('Budgets', [
            'foreignKey' => 'budget_id'
        ]);
        $this->belongsTo('ArtistStatuses', [
            'foreignKey' => 'artist_status_id'
        ]);
        $this->hasMany('ArtistChannels', [
            'foreignKey' => 'artist_id'
        ]);
        $this->hasMany('ArtistGenres', [
            'foreignKey' => 'artist_id'
        ]);
        $this->hasMany('ArtistTopTracks', [
            'foreignKey' => 'artist_id'
        ]);
        $this->hasMany('EventSurveys', [
            'foreignKey' => 'artist_id'
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
            ->scalar('name')
            ->maxLength('name', 200)
            ->requirePresence('name', 'create')
            ->notEmpty('name');

        $validator
            ->scalar('website')
            ->maxLength('website', 200)
            ->allowEmpty('website');

        $validator
            ->scalar('video_description')
            ->allowEmpty('video_description');

        $validator
            ->integer('video_view')
            ->allowEmpty('video_view');

        $validator
            ->integer('video_like')
            ->allowEmpty('video_like');

        $validator
            ->integer('video_dislike')
            ->allowEmpty('video_dislike');

        $validator
            ->integer('video_favorite')
            ->allowEmpty('video_favorite');

        $validator
            ->integer('video_comments')
            ->allowEmpty('video_comments');

        $validator
            ->scalar('profile_picture')
            ->maxLength('profile_picture', 150)
            ->allowEmpty('profile_picture');

        $validator
            ->scalar('channel_ids')
            ->maxLength('channel_ids', 255)
            ->allowEmpty('channel_ids');

        $validator
            ->dateTime('created_at')
            ->allowEmpty('created_at');

        $validator
            ->dateTime('updated_at')
            ->allowEmpty('updated_at');

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
        $rules->add($rules->existsIn(['budget_id'], 'Budgets'));
       // $rules->add($rules->existsIn(['artist_status_id'], 'ArtistStatuses'));

        return $rules;
    }
}
