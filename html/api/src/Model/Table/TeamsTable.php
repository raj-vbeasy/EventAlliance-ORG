<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Teams Model
 *
 * @property \App\Model\Table\TeamEventsTable|\Cake\ORM\Association\HasMany $TeamEvents
 * @property \App\Model\Table\TeamUsersTable|\Cake\ORM\Association\HasMany $TeamUsers
 *
 * @method \App\Model\Entity\Team get($primaryKey, $options = [])
 * @method \App\Model\Entity\Team newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Team[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Team|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Team patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Team[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Team findOrCreate($search, callable $callback = null, $options = [])
 */
class TeamsTable extends Table
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

        $this->setTable('teams');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->hasMany('TeamEvents', [
            'foreignKey' => 'team_id'
        ]);
        $this->hasMany('TeamMembers', [
            'foreignKey' => 'team_id'
        ]);
        $this->hasMany('TeamUsers', [
            'foreignKey' => 'team_id'
        ]);
        $this->hasMany('Events', [
            'foreignKey' => 'team_id'
        ]);
        $this->belongsToMany('Users', [
            'through' => 'team_members',
            
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
            ->scalar('photo')
            ->maxLength('photo', 150)
            ->allowEmpty('photo');

        $validator
            ->scalar('name')
            ->maxLength('name', 150)
            ->requirePresence('name', 'create')
            ->notEmpty('name');

        $validator
            ->allowEmpty('is_deleted');

        return $validator;
    }
}
