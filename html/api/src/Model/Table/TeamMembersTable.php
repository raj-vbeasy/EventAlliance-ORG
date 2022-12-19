<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * TeamMembers Model
 *
 * @property \App\Model\Table\UsersTable|\Cake\ORM\Association\BelongsTo $Users
 * @property \App\Model\Table\TeamsTable|\Cake\ORM\Association\BelongsTo $Teams
 * @property \App\Model\Table\TeamRolesTable|\Cake\ORM\Association\BelongsTo $TeamRoles
 *
 * @method \App\Model\Entity\TeamMember get($primaryKey, $options = [])
 * @method \App\Model\Entity\TeamMember newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\TeamMember[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\TeamMember|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\TeamMember patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\TeamMember[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\TeamMember findOrCreate($search, callable $callback = null, $options = [])
 */
class TeamMembersTable extends Table
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

        $this->setTable('team_members');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Users', [
            'foreignKey' => 'user_id',
            'joinType' => 'INNER'
        ]);
        $this->belongsTo('Teams', [
            'foreignKey' => 'team_id',
            'joinType' => 'INNER'
        ]);
        $this->belongsTo('TeamRoles', [
            'foreignKey' => 'team_role_id'
        ]);
		
		$this->hasMany("TeamSurveys");
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
        $rules->add($rules->existsIn(['user_id'], 'Users'));
        $rules->add($rules->existsIn(['team_id'], 'Teams'));
        $rules->add($rules->existsIn(['team_role_id'], 'TeamRoles'));

        return $rules;
    }
    
    public function getTeamMembers() {
        $query = $this->find()->hydrate(false)->contain(['Users', 'Teams']);
        $arrWhere = [];

        if ($isMandatory == true) {
            $query->where(['Fines.is_mandatory' => 1]);
        }
        return $query->where(['StudentFines.student_id' => $studentId, 'StudentFines.is_paid' => 0, 'Fines.status' => 1])->toArray();
    }
}
