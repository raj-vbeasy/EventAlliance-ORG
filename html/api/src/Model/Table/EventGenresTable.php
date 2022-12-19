<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * EventDemographics Model
 *
 * @property \App\Model\Table\EventsTable|\Cake\ORM\Association\BelongsTo $Events
 * @property \App\Model\Table\DemographicsTable|\Cake\ORM\Association\BelongsTo $Demographics
 *
 * @method \App\Model\Entity\EventDemographic get($primaryKey, $options = [])
 * @method \App\Model\Entity\EventDemographic newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\EventDemographic[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\EventDemographic|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\EventDemographic patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\EventDemographic[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\EventDemographic findOrCreate($search, callable $callback = null, $options = [])
 */
class EventGenresTable extends Table
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

        $this->setTable('event_genres');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Events', [
            'joinType' => 'INNER'
        ]);
        $this->belongsTo('Genres', [
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
        $rules->add($rules->existsIn(['event_id'], 'Events'));
        $rules->add($rules->existsIn(['genre_id'], 'Genres'));

        return $rules;
    }
}
