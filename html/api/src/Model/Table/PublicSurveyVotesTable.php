<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * PublicSurveyVotes Model
 *
 * @property \App\Model\Table\PublicSurveysTable|\Cake\ORM\Association\BelongsTo $PublicSurveys
 * @property \App\Model\Table\ArtistsTable|\Cake\ORM\Association\BelongsTo $Artists
 *
 * @method \App\Model\Entity\PublicSurveyVote get($primaryKey, $options = [])
 * @method \App\Model\Entity\PublicSurveyVote newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\PublicSurveyVote[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\PublicSurveyVote|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\PublicSurveyVote patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\PublicSurveyVote[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\PublicSurveyVote findOrCreate($search, callable $callback = null, $options = [])
 */
class PublicSurveyVotesTable extends Table
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

        $this->setTable('public_survey_votes');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('PublicSurveys', [
            'foreignKey' => 'public_survey_id',
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
            ->requirePresence('vote', 'create')
            ->notEmpty('vote');

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
        $rules->add($rules->existsIn(['artist_id'], 'Artists'));

        return $rules;
    }
}
