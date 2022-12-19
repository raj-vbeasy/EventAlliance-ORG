<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * SurveyQuestions Model
 *
 * @property \App\Model\Table\EventsTable|\Cake\ORM\Association\BelongsTo $Events
 * @property \App\Model\Table\PublicSurveyAnswerTable|\Cake\ORM\Association\HasMany $PublicSurveyAnswer
 * @property \App\Model\Table\SurveyQuestionOptionsTable|\Cake\ORM\Association\HasMany $SurveyQuestionOptions
 *
 * @method \App\Model\Entity\SurveyQuestion get($primaryKey, $options = [])
 * @method \App\Model\Entity\SurveyQuestion newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\SurveyQuestion[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\SurveyQuestion|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\SurveyQuestion patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\SurveyQuestion[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\SurveyQuestion findOrCreate($search, callable $callback = null, $options = [])
 */
class SurveyQuestionsTable extends Table
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

        $this->setTable('survey_questions');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Events', [
            'foreignKey' => 'event_id',
            'joinType' => 'INNER'
        ]);
        $this->hasMany('PublicSurveyAnswer', [
            'foreignKey' => 'survey_question_id'
        ]);
        $this->hasMany('SurveyQuestionOptions', [
            'foreignKey' => 'survey_question_id'
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
            ->scalar('question')
            ->allowEmpty('question');

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
