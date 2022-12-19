<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\ORM\TableRegistry;

class UsersController extends ApiController
{

    public function index()
    {
        $requestData = $this->request;
        $query       = $requestData->query;
        $length      = 0;
        $start       = 1;
        $pagination  = array_key_exists("pagination", $query) ? $query["pagination"] : null;
        if (!empty($pagination)) {
            $length = empty($pagination) ? 0 : $pagination["perpage"];
            $start  = empty($pagination) ? 1 : $pagination["page"];
        }

        $arrUser = $this->getUsers($requestData, $length, $start);

        if ($length == 0) {
            $length = count($arrUser["data"]);
        }

        $arrMeta['page']    = $start;
        $arrMeta['pages']   = ceil($arrUser["total"] / $length);
        $arrMeta['perpage'] = $length;
        $arrMeta['total']   = $arrUser["total"];

        $meta = $arrMeta;
        $data = $arrUser["data"];

        $this->set(compact('meta', 'data'));
        $this->set('_serialize', ['meta', 'data']);
    }

    public function getUsers($requestData = null, $length = 0, $start = 1)
    {

        /*         * ** */
        $tblUsers        = TableRegistry::get("Users");
        $checkSuperAdmin = $tblUsers->find('all')
            ->where(['id' => $requestData->query['user_id'], 'user_type' => 0])
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

            $userAssociatedWithTeam = $tblTeamMembers->find('all')
                ->where(['team_id IN' => $arrTeamId])
                ->hydrate(false)->toArray();

            $arrUserId = [];
            for ($i = 0; $i < count($userAssociatedWithTeam); $i++) {
                array_push($arrUserId, $userAssociatedWithTeam[$i]['user_id']);
            }
        }

        $tblUsers      = TableRegistry::get("Users");
        $requestParams = $requestData->params;

        $arrWhere = [];
        $arrWhere = ['Users.is_deleted' => 0];
        if (empty($checkSuperAdmin)) {
            $arrWhere = ['Users.id IN' => $arrUserId];
        }
        if (!empty($requestData->query['role_id'])) {
            $arrWhere = ['Users.user_type IN' => $requestData->query['role_id']];
        }
        $teamId = 0;
        if (!empty($requestData->query['query']['name'])) {
            list($keyWord, $teamId) = explode("^", $requestData->query['query']['name']);

            $arrWhere['OR'] = [['Users.first_name LIKE' => "%" . $keyWord . "%"], ['Users.last_name LIKE' => "%" . $keyWord . "%"], ['Users.email LIKE' => "%" . $keyWord . "%"], ['Users.phone_no LIKE' => "%" . $keyWord . "%"]];
        }
        if (!empty($requestData['query'])) {
            $arrWhere['Users.last_name'] = $requestData['last_name'];
        }

        // Prepare the paged query
        $arrUserCount = $tblUsers->find('all')->where($arrWhere);

        $query = $tblUsers->find('all');
        $query->contain(["TeamMembers" => ["Teams", "TeamRoles"]]);
        if (is_numeric($teamId) && $teamId > 0) {
            $query->matching('TeamMembers', function ($q) use ($teamId) {
                return $q->where(['TeamMembers.team_id' => $teamId]);
            });
        }
        $query->order(["Users.id" => "ASC"]);
        $query->where($arrWhere);

        if (!empty($length)) {
            $total = $query->count();
            $query->limit($length);
            $query->page($start);
        }

        $arrUser = $query->hydrate(false)
            ->toArray();

        if (empty($length)) {
            $total = count($arrUser);
        }

        return ["total" => $total, "data" => $arrUser];
    }

    public function getDetailsById()
    {
        /*         * ** */
        $tblUsers    = TableRegistry::get("Users");
        $requestData = $this->request;
        $userId      = $requestData->params["userId"];

        // Prepare the paged query

        $query = $tblUsers->find('all');
        $query->contain(["TeamMembers" => ["Teams", "TeamRoles"]]);

        $query->where(["id" => $userId, "is_deleted" => 0]);
        $arrUser = $query->hydrate(false)->first();

        $this->set([
            'user'       => $arrUser ? $arrUser : null,
            '_serialize' => ['user'],
        ]);
    }

    public function delete()
    {
        $deleteId   = $this->request->param('id');
        $tblUsers   = TableRegistry::get("Users");
        $userEntity = $tblUsers->get($deleteId);
        $userEntity->set('is_deleted', 1);
        $result = $tblUsers->save($userEntity);
        if (!empty($result)) {
            $return  = true;
            $id      = $result;
            $message = 'Successfully deleted the data.';
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

        $result = $this->save($requestData);
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

    public function save($userData)
    {
        $tblUsers = TableRegistry::get("Users");
        $id       = $userData['id'];
        if (empty($id)) {
            $userEntity = $tblUsers->newEntity();
            $userEntity->set('created_at', date('Y-m-d'));
        } else {
            $userEntity = $tblUsers->get($id);
            $userEntity->set('updated_at', date('Y-m-d'));
        }
        if (!empty($userData["temp_photo_id"])) {
            $tblTempUploads = TableRegistry::get("TempUploads");
            try {
                $tmpPhoto         = $tblTempUploads->get($userData["temp_photo_id"]);
                $fileName         = $tmpPhoto->get("file_name");
                $tempFile         = WWW_ROOT . 'uploads' . DS . 'temp' . DS . $fileName;
                $finalDestination = WWW_ROOT . 'uploads' . DS . 'user' . DS . $fileName;
                if (copy($tempFile, $finalDestination)) {
                    $userEntity->set('profile_pic', $fileName);
                }
            } catch (Cake\Datasource\Exception\RecordNotFoundException $ex) {
                //DO nothing..
            }
        }

        $userEntity->set('email', $userData['email']);
        if(!empty($userData['password'])){
            $userEntity->set('password', $userData['password']);
        }
        $userEntity->set('first_name', $userData['first_name']);
        $userEntity->set('last_name', $userData['last_name']);
        $userEntity->set('user_type', $userData['user_type']);
        $userEntity->set('phone_no', $userData['phone_no']);
        $tblUsers->save($userEntity);

        if (!empty($userEntity->id)) {
            $tblTeamMembers = TableRegistry::get("TeamMembers");
            for ($j = 0; $j < count($userData['team_ids']); $j++) {

                if ($userData['user_type'] == 1 || $userData['user_type'] == 3) {
                    $checkTeamAdmin = $this->_checkTeamAdminAndEaRepresentative($userData['team_ids'][$j], $userData['user_type']);

                    if ($checkTeamAdmin == true) {
                        $teamMemberEntity = $tblTeamMembers->newEntity();
                        $teamMemberEntity->set('user_id', $userEntity->id);
                        $teamMemberEntity->set('team_role_id', $userData['user_type']);
                        $teamMemberEntity->set('team_id', $userData['team_ids'][$j]);
                        $tblTeamMembers->save($teamMemberEntity);
                    }

                } else {
                    $teamMemberEntity = $tblTeamMembers->newEntity();
                    $teamMemberEntity->set('user_id', $userEntity->id);
                    $teamMemberEntity->set('team_role_id', $userData['user_type']);
                    $teamMemberEntity->set('team_id', $userData['team_ids'][$j]);
                    $tblTeamMembers->save($teamMemberEntity);
                }
            }

        }

        if (empty($userEntity->errors())) {
            return $userEntity->id;
        } else {
            return false;
        }
    }

    private function _checkTeamAdminAndEaRepresentative($teamId, $userType)
    {
        $tblTeamMembers = TableRegistry::get("TeamMembers");
        $checkTeamRole  = $tblTeamMembers->find()
            ->where(['team_id' => $teamId,
                'team_role_id'     => $userType])
            ->hydrate(false)
            ->toArray();

        if (!empty($checkTeamRole)) {
            return false;
        } else {
            return true;
        }

    }

    public function update()
    {
        $requestData = $this->request->getData();

        $result  = $this->save($requestData);
        $message = [];

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

    public function login()
    {
        $requestData = $this->request->getData();
        $tblUsers    = TableRegistry::get("Users");
        $arrWhere    = [];
        if (!empty($requestData['email'])) {
            $arrWhere['Users.email'] = $requestData['email'];
        }
        $arrWhere['Users.is_deleted'] = 0;

        $arrUser             = $tblUsers->find()->contain(["TeamMembers" => ["Teams"]])->where($arrWhere)->hydrate(false)->first();
        $tblTeamMembers      = TableRegistry::get("TeamMembers");
        $checkUserTeamStatus = $tblTeamMembers->find()
            ->where(['user_id' => $arrUser['id'], 'status' => 1])
            ->hydrate(false)
            ->toArray();

        if (empty($arrUser) && empty($checkUserTeamStatus)) {
            $this->set([
                "status"     => false,
                "data"       => null,
                "message"    => "Invalid username or password.",
                '_serialize' => ['status', 'data', 'message'],
            ]);
        } else {
            if ($requestData['password'] == $arrUser["password"]) {
                $this->set([
                    "status"     => true,
                    "data"       => $arrUser,
                    "message"    => "Login successful",
                    '_serialize' => ['status', 'data', 'message'],
                ]);
            } else {
                $this->set([
                    "status"     => false,
                    "data"       => null,
                    "message"    => "Invalid username or password.",
                    '_serialize' => ['status', 'data', 'message'],
                ]);
            }
        }
    }

}
