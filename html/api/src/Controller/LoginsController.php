<?php

namespace App\Controller;

use App\Controller\AppController;
use Cake\Event\Event;
use Cake\ORM\TableRegistry;

class LoginsController extends AppController
{
    public function index($requestData = null)
    {
        $tblUsers = TableRegistry::get("Users");
        $tblTeamMember = TableRegistry::get("TeamMembers");
        $requestParams = $requestData->params;
        echo "<pre>";print_r($requestParams);exit;
        $query = $tblUsers->find('all')
            ->contain([
                "TeamMembers"
            ])
            ->where(["Users.email" => $this->request->params["email"], "Users.password" => $this->request->params["password"],  "Users.is_deleted" => 0])
            ->hydrate(false)
            ->toArray();
        echo "<pre>";print_r($query);
        echo "EventAlliance Api";exit;
    }


}
