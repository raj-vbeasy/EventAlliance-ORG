<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\ORM\TableRegistry;

class TeamsController extends ApiController
{

    public function initialize()
    {
        parent::initialize();
    }

    public function index()
    {
        error_reporting(0);
        $requestData = $this->request;
        $query       = $requestData->query;
        $length      = 0;
        $start       = 1;
        $pagination  = array_key_exists("pagination", $query) ? $query["pagination"] : null;

        if (!empty($pagination)) {
            $length = empty($pagination) ? 0 : $pagination["perpage"];
            $start  = empty($pagination) ? 1 : $pagination["page"];
        }

        $arrTeam = $this->getTeams($requestData, $length, $start);

        if ($length == 0) {
            $length = count($arrTeam["data"]);
        }

        $arrMeta['page']    = $start;
        $arrMeta['pages']   = ceil($arrTeam["total"] / $length);
        $arrMeta['perpage'] = $length;
        $arrMeta['total']   = $arrTeam["total"];

        $meta = $arrMeta;
        $data = $arrTeam["data"];

        $this->set(compact('meta', 'data'));
        $this->set('_serialize', ['meta', 'data']);
    }

    public function getTeams($requestData = null, $length = 0, $start = 1)
    {

        $tblUsers        = TableRegistry::get("Users");
        $checkSuperAdmin = $tblUsers->find('all')
            ->where(['id' => $requestData->query['user_id'],
                'user_type'   => 0])
            ->hydrate(false)->toArray();

        if (empty($checkSuperAdmin)) {
            $tblTeamMembers = TableRegistry::get("TeamMembers");
            $query          = $tblTeamMembers->find('all')
                ->where(['user_id' => $requestData->query['user_id']]);
            $teamAssociatedWithUser = $query->hydrate(false)->toArray();
            $arrTeamId              = [];

            for ($i = 0; $i < count($teamAssociatedWithUser); $i++) {
                array_push($arrTeamId, $teamAssociatedWithUser[$i]['team_id']);
            }
        }

        $tblTeams = TableRegistry::get("Teams");
        $arrWhere = ['Teams.is_deleted' => 0];
        if (empty($checkSuperAdmin)) {
            $arrWhere = ['Teams.id IN' => $arrTeamId];
        }
        if (!empty($requestData->query['query']['name'])) {

            $arrWhere["OR"] = ['Teams.name LIKE' => "%" . $requestData->query['query']['name'] . "%"];

        }
        // Prepare the paged query
        $arrTeamCount = $tblTeams->find('all')->where($arrWhere);

        $query = $tblTeams->find('all')
            ->contain(['Events', 'TeamMembers' => ['TeamRoles', 'Users' => function($q){
                return $q->where(["Users.is_deleted" => 0]);
            }]])
            ->where($arrWhere);

        if (!empty($length)) {
            $total = $query->count();
            $query->limit($length);
            $query->page($start);
        }

        $arrTeam = $query->hydrate(false)
            ->toArray();

        if (empty($length)) {
            $total = count($arrTeam);
        }

        return ["total" => $total, "data" => $arrTeam];
    }

    public function currentEvent()
    {

        $requestData = $this->request->params;
        $teamId      = $requestData["teamId"];
        $tblEvents   = TableRegistry::get("Events");
        $query       = $tblEvents->find();
        $query->where(['Events.team_id' => $teamId, 'Events.start_date >' => date('Y-m-d', time())]);
        $query->order(['start_date' => 'ASC']);
        $currentEvent = $query->hydrate(false)->first();
        echo "<pre/>";
        print_r($currentEvent);exit;

        $this->set('response', ["current_event" => $currentEvent['team_id']]);
        $this->set('_serialize', ['response']);
    }

    public function delete()
    {
        $requestData = $this->request->params;
        $tblTeams    = TableRegistry::get("Teams");
        $teamEntity  = $tblTeams->get($requestData['id']);
        $teamEntity->set('is_deleted', 1);
        $result = $tblTeams->save($teamEntity);
        if (!empty($result)) {
            $return  = true;
            $id      = $result;
            $message = 'Deleted successfully.';
        } else {
            $return  = false;
            $id      = 0;
            $message = 'There is a problem of deleting request data.';
        }
        $this->set([
            'response'   => ["status" => $return, "id" => $id, "message" => $message],
            '_serialize' => ['response'],
        ]);
    }

    public function create()
    {
        $requestData = $this->request->getData();
        $result      = $this->save($requestData);
        $message     = [];
        if (!empty($result)) {
            $return  = true;
            $id      = $result;
            $message = 'Successfully save request data.';
        } else {
            $return  = false;
            $id      = 0;
            $message = 'There is a problem of saving request data.';
        }
        $this->set([
            "status"     => $return,
            "id"         => $id,
            "message"    => $message,
            '_serialize' => ['status', 'id', 'message'],
        ]);
    }

    public function update()
    {
        $requestData = $this->request->getData();
        $result      = $this->save($requestData);
        $message     = [];

        $id = $requestData["id"];

        if (!empty($result)) {
            $return  = true;
            $message = 'Successfully save request data.';
        } else {
            $return  = false;
            $message = 'There is a problem of saving request data.';
        }
        $this->set([
            "status"     => $return,
            "id"         => $id,
            "message"    => $message,
            '_serialize' => ['status', 'id', 'message'],
        ]);
    }

    public function save($teamData)
    {
        $tblTeams       = TableRegistry::get("Teams");
        $tblTeamMembers = TableRegistry::get("TeamMembers");
        $id             = $teamData['id'];
        if (empty($id)) {
            $teamEntity = $tblTeams->newEntity();
        } else {
            $teamEntity = $tblTeams->get($id);
        }
        $teamEntity->set('name', $teamData['name']);

        if (!empty($teamData["photo_temp_id"])) {
            $tblTempUploads = TableRegistry::get("TempUploads");
            try {
                $tmpPhoto         = $tblTempUploads->get($teamData["photo_temp_id"]);
                $fileName         = $tmpPhoto->get("file_name");
                $tempFile         = WWW_ROOT . 'uploads' . DS . 'temp' . DS . $fileName;
                $finalDestination = WWW_ROOT . 'uploads' . DS . 'team' . DS . $fileName;
                if (copy($tempFile, $finalDestination)) {
                    $teamEntity->set('photo', $fileName);
                }
            } catch (Cake\Datasource\Exception\RecordNotFoundException $ex) {
                //DO nothing..
            }
            unset($tblTempUploads);
        }

        $tblTeams->save($teamEntity);

        $teamId = $teamEntity->id;

        if (empty($id)) {
            //Members will be added only during create team.
            if (!empty($teamData['members'])) {
                for ($i = 0; $i < count($teamData['members']); $i++) {
                    $teamMemberEntity = $tblTeamMembers->newEntity();
                    $teamMemberEntity->set('user_id', $teamData['members'][$i]['userId']);
                    $teamMemberEntity->set('team_id', $teamId);
                    $teamMemberEntity->set('team_role_id', $teamData['members'][$i]['roleId']);
                    $tblTeamMembers->save($teamMemberEntity);
                }
            }
        }

        if (empty($teamEntity->errors())) {
            return $teamEntity->id;
        } else {
            return false;
        }
    }

    public function roles()
    {

        error_reporting(0);
        $requestData  = $this->request;
        $tblTeamRoles = TableRegistry::get("TeamRoles");
        $arrWhere     = ['TeamRoles.is_deleted' => 0];

        // Prepare the paged query
        $arrTeamRoles = $tblTeamRoles->find('all')
            ->where($arrWhere)
            ->hydrate(false)
            ->toArray();

        $data = $arrTeamRoles;

        $this->set(compact('data'));
        $this->set('_serialize', ['data']);
    }

    public function addMemberToTeam()
    {
        $requestData      = $this->request->getData();
        $tblTeamMembers   = TableRegistry::get("TeamMembers");
        $teamMemberEntity = $tblTeamMembers->newEntity();

        $teamMemberEntity->set('user_id', $requestData['userId']);
        $teamMemberEntity->set('team_role_id', $requestData['roleId']);
        $teamMemberEntity->set('team_id', $this->request->params["teamId"]);

        $tblTeamMembers->save($teamMemberEntity);

        if (empty($teamMemberEntity->errors())) {
            $return  = true;
            $id      = $teamMemberEntity->id;
            $message = 'Successfully save request data.';
        } else {
            $return  = false;
            $id      = 0;
            $message = 'There is a problem of saving request data.';
        }
        $this->set([
            "status"     => $return,
            "id"         => $id,
            "message"    => $message,
            '_serialize' => ['status', 'id', 'message'],
        ]);
    }

    public function changeUserStatusForTeam() {
        $requestData      = $this->request->getData();
        $tblTeamMembers   = TableRegistry::get("TeamMembers");
        $teamMemberEntity = $tblTeamMembers->get($requestData["team_member_id"]);

        $teamMemberEntity->set('status', $requestData["status"]);

        $tblTeamMembers->save($teamMemberEntity);

        if (empty($teamMemberEntity->errors())) {
            $return  = true;
            $id      = $teamMemberEntity->id;
            $message = 'Successfully save request data.';
        } else {
            $return  = false;
            $id      = 0;
            $message = 'There is a problem of saving request data.';
        }
        $this->set([
            "status"     => $return,
            "id"         => $id,
            "message"    => $message,
            '_serialize' => ['status', 'id', 'message'],
        ]);

    }

    public function removeMemberFromTeam()
    {
        $requestData = $this->request->params;
        //echo "<pre/>";print_r($requestData);exit;
        $tblTeamMembers = TableRegistry::get("TeamMembers");
        $id             = $requestData['memberId'];
        $result         = $tblTeamMembers->deleteAll(['id' => $id]);
        if ($result > 0) {
            $return  = true;
            $message = 'Deleted successfully.';
        } else {
            $return  = false;
            $message = "Could not delete the record";
        }
        $this->set([
            "status"     => $return,
            "message"    => $message,
            "id"         => $id,
            '_serialize' => ['status', 'message', 'id'],
        ]);
    }

}
