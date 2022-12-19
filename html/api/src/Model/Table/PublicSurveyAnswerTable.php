<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * PublicSurveyAnswer Model
 *
 * @property \App\Model\Table\PublicSurveysTable|\Cake\ORM\Association\BelongsTo $PublicSurveys
 * @property \App\Model\Table\SurveyQuestionsTable|\Cake\ORM\Association\BelongsTo $SurveyQuestions
 * @property \App\Model\Table\AnswersTable|\Cake\ORM\Association\BelongsTo $Answers
 *
 * @method \App\Model\Entity\PublicSurveyAnswer get($primaryKey, $options = [])
 * @method \App\Model\Entity\PublicSurveyAnswer newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\PublicSurveyAnswer[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\PublicSurveyAnswer|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\PublicSurveyAnswer patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\PublicSurveyAnswer[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\PublicSurveyAnswer findOrCreate($search, callable $callback = null, $options = [])
 */
class PublicSurveyAnswerTable extends Table
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

        $this->setTable('public_survey_answer');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('PublicSurveys', [
            'foreignKey' => 'public_survey_id',
            'joinType' => 'INNER'
        ]);
        $this->belongsTo('SurveyQuestions', [
            'foreignKey' => 'survey_question_id',
            'joinType' => 'INNER'
        ]);
        $this->belongsTo('Answers', [
            'className' => 'SurveyQuestionOptions',
            'foreignKey' => 'answer_id',
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
        $rules->add($rules->existsIn(['public_survey_id'], 'PublicSurveys'));
        $rules->add($rules->existsIn(['survey_question_id'], 'SurveyQuestions'));
        $rules->add($rules->existsIn(['answer_id'], 'Answers'));

        return $rules;
    }
}
