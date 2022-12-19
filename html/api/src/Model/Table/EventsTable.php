<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Events Model
 *
 * @property \App\Model\Table\BudgetsTable|\Cake\ORM\Association\BelongsTo $Budgets
 * @property \App\Model\Table\ArtistGenresTable|\Cake\ORM\Association\HasMany $ArtistGenres
 * @property \App\Model\Table\EventDemographicsTable|\Cake\ORM\Association\HasMany $EventDemographics
 * @property \App\Model\Table\EventGenresTable|\Cake\ORM\Association\HasMany $EventGenres
 * @property \App\Model\Table\EventSurveysTable|\Cake\ORM\Association\HasMany $EventSurveys
 * @property \App\Model\Table\TeamEventsTable|\Cake\ORM\Association\HasMany $TeamEvents
 *
 * @method \App\Model\Entity\Event get($primaryKey, $options = [])
 * @method \App\Model\Entity\Event newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Event[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Event|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Event patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Event[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Event findOrCreate($search, callable $callback = null, $options = [])
 */
class EventsTable extends Table
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

        $this->setTable('events');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->belongsTo('Budgets', [
            'foreignKey' => 'budget_id',
            'joinType' => 'INNER'
        ]);
        $this->belongsTo('Teams', [
            'foreignKey' => 'team_id',
            'joinType' => 'INNER'
        ]);
        $this->hasMany('ArtistGenres', [
            'foreignKey' => 'event_id'
        ]);
        $this->hasMany('EventDemographics', [
            'foreignKey' => 'event_id'
        ]);
        $this->hasMany('EventGenres', [
            'foreignKey' => 'event_id'
        ]);
        $this->hasMany('EventSurveys', [
            'foreignKey' => 'event_id'
        ]);
        $this->hasMany('EventArtists', [
            'foreignKey' => 'event_id'
        ]);
        $this->hasMany('EventTeamMembers', [
            'foreignKey' => 'event_id'
        ]);
        $this->hasMany('PublicSurveys', [
            'foreignKey' => 'event_id'
        ]);
        $this->hasMany('SurveyQuestions', [
            'foreignKey' => 'event_id'
        ]);
        $this->hasMany('TeamSurveys', [
            'foreignKey' => 'event_id'
        ]);
        $this->hasMany('TeamEvents', [
            'foreignKey' => 'event_id'
        ]);
		$this->belongsTo('ArtistNumbers', [
			'foreignKey' => 'number_of_artist',
			'joinType' => 'INNER'
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
            ->maxLength('name', 150)
            ->requirePresence('name', 'create')
            ->notEmpty('name');

        $validator
            ->scalar('status')
            ->maxLength('status', 50)
            ->requirePresence('status', 'create')
            ->notEmpty('status');

        $validator
            ->date('start_date')
            ->requirePresence('start_date', 'create')
            ->notEmpty('start_date');

        $validator
            ->date('end_date')
            ->requirePresence('end_date', 'create')
            ->notEmpty('end_date');

        $validator
            ->scalar('profile_picture')
            ->maxLength('profile_picture', 200)
            ->allowEmpty('profile_picture');

        $validator
            ->scalar('description')
            ->allowEmpty('description');

        $validator
            ->scalar('venue_name')
            ->maxLength('venue_name', 255)
            ->allowEmpty('venue_name');

        $validator
            ->scalar('address_line_1')
            ->maxLength('address_line_1', 255)
            ->allowEmpty('address_line_1');

        $validator
            ->scalar('address_line_2')
            ->maxLength('address_line_2', 200)
            ->requirePresence('address_line_2', 'create')
            ->notEmpty('address_line_2');

        $validator
            ->scalar('city')
            ->maxLength('city', 150)
            ->requirePresence('city', 'create')
            ->notEmpty('city');

        $validator
            ->scalar('state')
            ->maxLength('state', 150)
            ->requirePresence('state', 'create')
            ->notEmpty('state');

        $validator
            ->scalar('zip')
            ->maxLength('zip', 6)
            ->requirePresence('zip', 'create')
            ->notEmpty('zip');

        $validator
            ->requirePresence('number_of_artist', 'create')
            ->notEmpty('number_of_artist');

        $validator
            ->scalar('audience_demographics')
            ->maxLength('audience_demographics', 50)
            ->requirePresence('audience_demographics', 'create')
            ->notEmpty('audience_demographics');

        $validator
            ->scalar('mode')
            ->maxLength('mode', 20)
            ->requirePresence('mode', 'create')
            ->notEmpty('mode');

        $validator
            ->scalar('url')
            ->maxLength('url', 255)
            ->allowEmpty('url');

        $validator
            ->scalar('welcome_message')
            ->requirePresence('welcome_message', 'create')
            ->notEmpty('welcome_message');

        $validator
            ->scalar('legal_disclaimer')
            ->requirePresence('legal_disclaimer', 'create')
            ->notEmpty('legal_disclaimer');

        $validator
            ->scalar('event_description')
            ->requirePresence('event_description', 'create')
            ->notEmpty('event_description');

        $validator
            ->requirePresence('opt_in', 'create')
            ->notEmpty('opt_in');

        $validator
            ->scalar('opt_in_message')
            ->requirePresence('opt_in_message', 'create')
            ->notEmpty('opt_in_message');

        $validator
            ->scalar('thanks_message')
            ->requirePresence('thanks_message', 'create')
            ->notEmpty('thanks_message');

        $validator
            ->allowEmpty('review_enable');

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

        return $rules;
    }
}
