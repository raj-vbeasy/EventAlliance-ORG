<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * PublicSurveys Model
 *
 * @property \App\Model\Table\EventsTable|\Cake\ORM\Association\BelongsTo $Events
 * @property \App\Model\Table\PublicSurveyAnswerTable|\Cake\ORM\Association\HasMany $PublicSurveyAnswer
 * @property \App\Model\Table\PublicSurveyVotesTable|\Cake\ORM\Association\HasMany $PublicSurveyVotes
 *
 * @method \App\Model\Entity\PublicSurvey get($primaryKey, $options = [])
 * @method \App\Model\Entity\PublicSurvey newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\PublicSurvey[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\PublicSurvey|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\PublicSurvey patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\PublicSurvey[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\PublicSurvey findOrCreate($search, callable $callback = null, $options = [])
 */
class PublicSurveysTable extends Table
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

        $this->setTable('public_surveys');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->belongsTo('Events', [
            'foreignKey' => 'event_id',
            'joinType' => 'INNER'
        ]);
        $this->hasMany('PublicSurveyAnswer', [
            'foreignKey' => 'public_survey_id'
        ]);
        $this->hasMany('PublicSurveyVotes', [
            'foreignKey' => 'public_survey_id'
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
            ->dateTime('survey_date')
            ->allowEmpty('survey_date');

        $validator
            ->scalar('user_ip')
            ->maxLength('user_ip', 15)
            ->allowEmpty('user_ip');

        $validator
            ->email('email')
            ->allowEmpty('email');

        $validator
            ->scalar('name')
            ->maxLength('name', 255)
            ->allowEmpty('name');

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
        $rules->add($rules->existsIn(['event_id'], 'Events'));

        return $rules;
    }
}
