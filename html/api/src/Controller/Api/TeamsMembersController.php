<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\ORM\TableRegistry;

class TeamsMembersController extends ApiController {

    public function index() {
        $requestData = $this->request;
        $arrTeam = $this->getTeamsMembers($requestData);
        $this->set([
            'response' => $arrTeam,
            '_serialize' => ['response']
        ]);
      
    }

    public function getTeamsMembers($requestData) {

        $length = empty($requestData->param('records')) ? 10 : $requestData->param('records');
        $tblTeams = TableRegistry::get("Teams");

        $arrWhere = ['Teams.is_deleted'=>0];
        if (!empty($requestData['name'])) {
            $arrWhere = ['Teams.name' => $requestData['name']];
        }
        if (!empty($requestData['role_name'])) {
            $arrWhere = ['TeamRoles.role_name' => $requestData['role_name']];
        }
      

        // Prepare the paged query
        $arrTeamMembers = $tblTeams->find('all')
                ->contain(['TeamRoles'])
                ->where($arrWhere)
                ->hydrate(false)
                ->limit($length)
                ->page($requestData->param('page'))
                ->toArray();
        return $arrTeamMembers;
    }
}
