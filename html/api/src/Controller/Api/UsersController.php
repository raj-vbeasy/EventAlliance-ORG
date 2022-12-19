<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\Mailer\Email;
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
            $arrWhere['Users.id IN'] = $arrUserId;
        }
        if (!empty($requestData->query['role_id'])) {
            $arrWhere['Users.user_type IN'] = $requestData->query['role_id'];
        }
        $teamId = 0;
        if (!empty($requestData->query['query']['name'])) {
            list($keyWord, $teamId) = explode("^", $requestData->query['query']['name']);

            $arrWhere['OR'] = [['Users.first_name LIKE' => "%" . $keyWord . "%"], ['Users.last_name LIKE' => "%" . $keyWord . "%"], ['Users.email LIKE' => "%" . $keyWord . "%"], ['Users.phone_no LIKE' => "%" . $keyWord . "%"]];
        }
        if (!empty($requestData['query'])) {
            $arrWhere['Users.last_name'] = $requestData['last_name'];
        }

        if (isset($requestData->query["request_for"]) && $requestData->query["request_for"] == "teammember") {
            /*
            If the query is for retreiving users to add to a team
            then exclude the users who are alreadyd a member or team admin in other teams
             */
            if ($requestData->query['role_id'] == 1 || $requestData->query['role_id'] == 2) {
                $tblTeamMembers        = TableRegistry::get("TeamMembers");
                $rsExistingTeamMembers = $tblTeamMembers->find()->where(["team_role_id IN" => [1, 2]])->hydrate(false)->toArray();
                $arrExcludeUserIds     = [];
                foreach ($rsExistingTeamMembers as $teamMember) {
                    array_push($arrExcludeUserIds, $teamMember["user_id"]);
                }
                $arrWhere["Users.id NOT IN"] = $arrExcludeUserIds;
            }
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

    /* User Verify function*/
    public function verifyUser()
    {

        $requestData = $this->request->getData();
        $userId      = $requestData["userId"];
        $userToken   = $requestData["userToken"];

        // Prepare the paged query
        $tblUsers = TableRegistry::get("Users");
        $query    = $tblUsers->find('all');
        $query->where(["id" => $userId, "is_deleted" => 0, "token" => $userToken]);
        $arrUser = $query->hydrate(false)->first();

        $isValid = true;
        $message = "OK";

        if (empty($arrUser)) {
            $isValid = false;
            $message = "Invalid user-id and token";
        }
        $this->set([
            "status"     => $isValid,
            "message"    => $message,
            '_serialize' => ['status', 'message'],
        ]);

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

    private function _checkExsistingUserEmail($userEmail)
    {
        $tblUsers = TableRegistry::get("Users");
        $query    = $tblUsers->find('all');
        $query->where(["is_deleted" => 0, "email" => $userEmail]);
        $arrUser = $query->hydrate(false)->first();
        if (!empty($arrUser)) {
            return false;
        } else {
            return true;
        }
    }

    public function save($userData)
    {
        $tblUsers = TableRegistry::get("Users");
        $id       = $userData['id'];
        $isNew    = false;

        if (empty($id)) {
            $checkUserEmail = $this->_checkExsistingUserEmail($userData['email']);
            $userEntity     = $tblUsers->newEntity();
            $userEntity->set('created_at', date('Y-m-d'));
            $isNew = true;
        } else {
            $userEntity = $tblUsers->get($id);
            $userEntity->set('updated_at', date('Y-m-d'));
            if ($userEntity->email != $userData['email']) {
                $checkUserEmail = $this->_checkExsistingUserEmail($userData['email']);
            } else {
                $checkUserEmail = true;
            }
        }
        

        if ($checkUserEmail == true) {
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
            if (!empty($userData['password'])) {
                $userEntity->set('password', $userData['password']);
            }
            $userEntity->set('first_name', $userData['first_name']);
            $userEntity->set('last_name', $userData['last_name']);
            $userEntity->set('user_type', $userData['user_type']);
            $userEntity->set('phone_no', $userData['phone_no']);
            $tblUsers->save($userEntity);
            //$userEntity->id = 64;
            
            if ($isNew == true && !empty($userEntity->id)) {
                /*   send password to the register email  */
                $email = new Email();
                $email->transport('smtp');
                $email->to($userEntity->email)
                    ->viewVars(['userId' => $userEntity->id,
                        'name'               => $userEntity->first_name,
                        'password'           => $userEntity->password,
                        'email'              => $userEntity->email,

                    ])
                    ->emailFormat('html')
                    ->subject('Event Alliance user registration')
                    ->template('user_password', 'default')
                    ->send();

            }

            if (!empty($userEntity->id)) {
                $tblTeamMembers = TableRegistry::get("TeamMembers");
                for ($j = 0; $j < count($userData['team_ids']); $j++) {

                    if (!empty($userData['id'])) {

                        $getTeamAssoUser = $tblTeamMembers->find()
                            ->where(['user_id' => $userData['id']])
                            ->hydrate(false)->toArray();

                        $arrTeamIds = [];
                        for ($p = 0; $p < count($getTeamAssoUser); $p++) {

                            if ($getTeamAssoUser[$p]['team_role_id'] != $userData['user_type']) {
                                $tblTeamSurveys = TableRegistry::get("TeamSurveys");
                                $tblTeamSurveys->deleteAll(['team_member_id' => $getTeamAssoUser[$p]['id']]);
                            }
                            array_push($arrTeamIds, $getTeamAssoUser[$p]['team_id']);
                        }

                        $getDeleteTeamId = $tblTeamMembers->find()
                            ->where(['user_id' => $userData['id'],
                                'team_id NOT IN'   => $userData['team_ids']])
                            ->hydrate(false)->toArray();

                        for ($k = 0; $k < count($getDeleteTeamId); $k++) {
                            $tblTeamMembers->deleteAll(['team_id' => $getDeleteTeamId[$k]['team_id'],
                                'user_id'                             => $userEntity->id]);
                        }
                        if (in_array($userData['team_ids'][$j], $arrTeamIds)) {

                            if ($userData['user_type'] == 1 || $userData['user_type'] == 3) {
                                $checkTeamAdmin = $this->_checkTeamAdminAndEaRepresentative($userData['team_ids'][$j], $userData['user_type']);
                                if ($checkTeamAdmin == true) {
                                    $tblTeamMembers->updateAll(['team_role_id' => $userData['user_type']],
                                        ['user_id' => $userEntity->id,
                                            'team_id'  => $userData['team_ids'][$j]]);
                                }
                            } else {
                                $tblTeamMembers->updateAll(['team_role_id' => $userData['user_type']],
                                    ['user_id' => $userEntity->id,
                                        'team_id'  => $userData['team_ids'][$j]]);
                            }
                        } else {

                            $addTeamMember = $this->_addUserAsTeamMember($userEntity->id, $userData['team_ids'][$j], $userData['user_type']);

                        }

                    } else {
                        $addTeamMember = $this->_addUserAsTeamMember($userEntity->id, $userData['team_ids'][$j], $userData['user_type']);

                    }

                }

            }

            if (empty($userEntity->errors())) {
                return $userEntity->id;
            } else {
                return false;
            }

        } else {
            return false;
        }

    }

    private function _addUserAsTeamMember($userId, $teamId, $userType)
    {
        $tblTeamMembers = TableRegistry::get("TeamMembers");
        if ($userType == 1 || $userType == 3) {

            $checkTeamAdmin = $this->_checkTeamAdminAndEaRepresentative($teamId, $userType);

            if ($checkTeamAdmin == true) {
                $teamMemberEntity = $tblTeamMembers->newEntity();
                $teamMemberEntity->set('user_id', $userId);
                $teamMemberEntity->set('team_role_id', $userType);
                $teamMemberEntity->set('team_id', $teamId);
                $tblTeamMembers->save($teamMemberEntity);
                if (!empty($teamMemberEntity->errors())) {
                    return false;
                } else {
                    return true;
                }
            }

        } else {
            $teamMemberEntity = $tblTeamMembers->newEntity();
            $teamMemberEntity->set('user_id', $userId);
            $teamMemberEntity->set('team_role_id', $userType);
            $teamMemberEntity->set('team_id', $teamId);
            $tblTeamMembers->save($teamMemberEntity);
            if (!empty($teamMemberEntity->errors())) {
                return false;
            } else {
                return true;
            }
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

    public function resetPassword()
    {
        $requestData = $this->request->getData();
        //    $userId      = $requestData["user_id"];
        $userEmail = $requestData["email"];
        $tblUsers  = TableRegistry::get("Users");

        $tblUsers = TableRegistry::get("Users");
        $query    = $tblUsers->find('all');
        $query->where(["is_deleted" => 0, "email" => $userEmail]);
        $arrUser = $query->hydrate(false)->first();

        if (!empty($arrUser)) {
            $resetPasswordKey = substr(md5(microtime()), 2, 8);
            if (!empty($resetPasswordKey)) {
                $userEntity = $tblUsers->get($arrUser["id"]);
                $userEntity->set("reset_password_key", $resetPasswordKey);
                $tblUsers->save($userEntity);

                if (empty($userEntity->errors())) {
                    /*   send password to the register email  */
                    $email = new Email();
                    $email->transport('smtp');
                    $email->to($userEmail)
                        ->viewVars(['userId' => $arrUser['id'],
                            'name'               => $arrUser['first_name'],
                            'email'              => $arrUser['email'],
                            'key'                => $resetPasswordKey,
                        ])
                        ->emailFormat('html')
                        ->subject('Event Alliance password reset request')
                        ->template('reset_password', 'default')
                        ->send();
                }
            }
            $this->set([
                "status"     => true,
                "message"    => "Password reset link has been sent to your email.",
                '_serialize' => ['status', 'message'],
            ]);
        } else {
            $this->set([
                "status"     => false,
                "message"    => "Invalid email.",
                '_serialize' => ['status', 'message'],
            ]);
        }

    }

    public function changePassword()
    {
        $requestData = $this->request->getData();
        $tblUsers    = TableRegistry::get("Users");
        $query       = $tblUsers->find('all');
        $query->where(["id" => $requestData['user_id'], "is_deleted" => 0, "reset_password_key" => $requestData["security_key"]]);
        $arrUser = $query->hydrate(false)->first();
        $return  = false;
        $id      = 0;
        $message = "Invalid request";
        if (!empty($arrUser)) {
            $userEntity = $tblUsers->get($requestData['user_id']);
            $userEntity->set('password', $requestData['password']);
            $result = $tblUsers->save($userEntity);
            if (!empty($result)) {
                $return  = true;
                $id      = $result;
                $message = 'Your password has been change.';
            } else {
                $return  = false;
                $id      = 0;
                $message = 'There is a problem of saving request data.';
            }
        }
        $this->set([
            'response'   => ["status" => $return, "id" => $id, "message" => $message],
            '_serialize' => ['response'],
        ]);
    }

    public function login()
    {
        $requestData = $this->request->getData();
        $tblUsers    = TableRegistry::get("Users");

        $arrWhere = [];
        if (!empty($requestData['email'])) {
            $arrWhere['Users.email'] = $requestData['email'];
        }
        $arrWhere['Users.is_deleted'] = 0;

        $arrUser = $tblUsers->find()->contain(["TeamMembers" => ["Teams"]])->where($arrWhere)->hydrate(false)->first();

        //print_r($arrUser);die();
        $tblTeamMembers  = TableRegistry::get("TeamMembers");
        $teamMemberships = $tblTeamMembers->find()
            ->where(['user_id' => $arrUser['id'], 'status' => 1])
            ->hydrate(false)
            ->toArray();

        if (empty($arrUser)) {
            $this->set([
                "status"     => false,
                "data"       => null,
                "message"    => "Invalid username or password.",
                '_serialize' => ['status', 'data', 'message'],
            ]);
        } else {
            $status           = true;
            $msg              = "Login Successfully";
            $arrUser['token'] = $arrUser['id'] . time();
            if ($requestData['password'] == $arrUser["password"] && !empty($teamMemberships)) {
                $status = true;
            } else if ($requestData['password'] == $arrUser["password"] && in_array($arrUser["user_type"], [0, 1, 3])) {
                $status = true;

            } else {
                $status  = false;
                $arrUser = null;
                $msg     = "Invalid username or password.";
            }
            if ($status == true) {
                $tblUsers->updateAll(['token' => $arrUser['token']], ['id' => $arrUser['id']]);
            }
            $this->set([
                "status"     => $status,
                "data"       => $arrUser,
                "message"    => $msg,
                '_serialize' => ['status', 'data', 'message'],
            ]);
            //============== Suman Code ==================
            /* if ($requestData['password'] == $arrUser["password"] && !empty($teamMemberships)) {
            $this->set([
            "status"     => true,
            "data"       => $arrUser,
            "message"    => "Login successful",
            '_serialize' => ['status', 'data', 'message'],
            ]);
            }else if ($requestData['password'] == $arrUser["password"] && in_array($arrUser["user_type"],[0,1,3] )) {
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
            }*/
            // =================== Suman Code ==============
        }
    }

}
