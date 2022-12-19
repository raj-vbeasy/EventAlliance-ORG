<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * TeamSurveys Model
 *
 * @property \App\Model\Table\TeamMembersTable|\Cake\ORM\Association\BelongsTo $TeamMembers
 * @property \App\Model\Table\EventsTable|\Cake\ORM\Association\BelongsTo $Events
 * @property \App\Model\Table\ArtistsTable|\Cake\ORM\Association\BelongsTo $Artists
 *
 * @method \App\Model\Entity\TeamSurvey get($primaryKey, $options = [])
 * @method \App\Model\Entity\TeamSurvey newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\TeamSurvey[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\TeamSurvey|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\TeamSurvey patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\TeamSurvey[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\TeamSurvey findOrCreate($search, callable $callback = null, $options = [])
 */
class TeamSurveysTable extends Table
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

        $this->setTable('team_surveys');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('TeamMembers', [
            'foreignKey' => 'team_member_id',
            'joinType' => 'INNER'
        ]);
        $this->belongsTo('Events', [
            'foreignKey' => 'event_id',
            'joinType' => 'INNER'
        ]);
        $this->belongsTo('Artists', [
            'foreignKey' => 'artist_id',
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
            ->dateTime('vote_date')
            ->allowEmpty('vote_date');

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
        $rules->add($rules->existsIn(['team_member_id'], 'TeamMembers'));
        $rules->add($rules->existsIn(['event_id'], 'Events'));
        $rules->add($rules->existsIn(['artist_id'], 'Artists'));

        return $rules;
    }
}
