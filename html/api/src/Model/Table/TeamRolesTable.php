<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * TeamRoles Model
 *
 * @property \App\Model\Table\TeamMembersTable|\Cake\ORM\Association\HasMany $TeamMembers
 *
 * @method \App\Model\Entity\TeamRole get($primaryKey, $options = [])
 * @method \App\Model\Entity\TeamRole newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\TeamRole[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\TeamRole|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\TeamRole patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\TeamRole[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\TeamRole findOrCreate($search, callable $callback = null, $options = [])
 */
class TeamRolesTable extends Table
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

        $this->setTable('team_roles');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->hasMany('TeamMembers', [
            'foreignKey' => 'team_role_id'
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
            ->allowEmpty('id', 'create');

        $validator
            ->scalar('role_name')
            ->maxLength('role_name', 60)
            ->requirePresence('role_name', 'create')
            ->notEmpty('role_name');

        $validator
            ->requirePresence('is_deleted', 'create')
            ->notEmpty('is_deleted');

        return $validator;
    }
}
