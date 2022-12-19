<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\ORM\TableRegistry;
use Cake\Http\ServerRequest;

class UsersController extends ApiController {


    public function index() {
        $requestData = $this->request;
        $query = $requestData->query;
        $length = 0;
        $start = 1;
        $pagination = array_key_exists("pagination", $query) ? $query["pagination"] : null;
        if(!empty($pagination)) {
            $length = empty($pagination) ? 0 : $pagination["perpage"];
            $start = empty($pagination) ? 1 : $pagination["page"];
        }
        
        $arrUser = $this->getUsers($requestData, $length, $start);
        
        if($length == 0){
            $length = count($arrUser["data"]);
        }

        $arrMeta['page'] = $start;
        $arrMeta['pages'] = ceil($arrUser["total"] / $length);
        $arrMeta['perpage'] = $length;
        $arrMeta['total'] = $arrUser["total"];

        $meta = $arrMeta;
        $data = $arrUser["data"];

        $this->set(compact('meta', 'data'));
        $this->set('_serialize', ['meta', 'data']);
    }
    
    public function getUsers($requestData = null, $length=0, $start=1) {

        /*         * ** */
        $tblUsers = TableRegistry::get("Users");
        $requestParams = $requestData->params;
        
        $arrWhere = [];
        $arrWhere['Users.is_deleted'] = 0;
        $teamId = 0;
        if (!empty($requestData->query['query']['name'])) {
            list($keyWord,$teamId) = explode("^", $requestData->query['query']['name']);
            
            $arrWhere ['OR'] = [['Users.first_name LIKE' => "%" . $keyWord . "%"], ['Users.last_name LIKE' => "%" . $keyWord . "%"],['Users.email LIKE' => "%" . $keyWord . "%"],['Users.phone_no LIKE' => "%" . $keyWord . "%"]];
        }
        if(!empty($requestData['query'])) {
            $arrWhere['Users.last_name'] = $requestData['last_name'];
        }

        // Prepare the paged query
        $arrUserCount = $tblUsers->find('all')->where($arrWhere);

        $query = $tblUsers->find('all');
        $query->contain(["TeamMembers"=>["Teams","TeamRoles"]]);
        if(is_numeric($teamId) && $teamId > 0) {
           $query->matching('TeamMembers', function($q) use($teamId) {
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

    $arrUser=$query->hydrate(false)
    ->toArray();

    if(empty($length)){
        $total = count($arrUser);
    }

    return ["total" => $total, "data" => $arrUser];
}

public function getDetailsById() {
     /*         * ** */
        $tblUsers = TableRegistry::get("Users");
        $requestData = $this->request;
        $userId = $requestData->params["userId"];
                
        // Prepare the paged query
        
        $query = $tblUsers->find('all');
        $query->contain(["TeamMembers"=>["Teams","TeamRoles"]]);
        
        $query->where(["id" => $userId, "is_deleted" => 0]);
        $arrUser=$query->hydrate(false)->first();

        $this->set([
        'user' => $arrUser ? $arrUser : null,
        '_serialize' => ['user']
     ]);
}


public function delete() {
    $deleteId = $this->request->param('id');
    $tblUsers = TableRegistry::get("Users");
    $userEntity = $tblUsers->get($deleteId);
    $userEntity->set('is_deleted', 1);
    $result = $tblUsers->save($userEntity);
    if (!empty($result)) {
        $return = true;
        $id = $result;
        $message = 'Successfully deleted the data.';
    } else {
        $return = false;
        $id = 0;
        $message = 'There is a problem of deleting request data.';
    }
    $this->set([
        'response' => ["status" => $return, "id" => $id, "message" => $message],
        '_serialize' => ['response']
    ]);
}

public function create() {
    $requestData = $this->request->getData();

    $result = $this->save($requestData);
    if (!empty($result)) {
        $return = true;
        $id = $result;
        $message = 'Successfully save request data.';
    } else {
        $return = false;
        $id = 0;
        $message = 'There is a problem of saving request data.';
    }
    $this->set([
        "status" => $return,
        "id" => $id, 
        "message" => $message,
        '_serialize' => ['status', 'id', 'message']
    ]);
}

public function save($userData) {
    $tblUsers = TableRegistry::get("Users");
    $id = $userData['id'];
    if (empty($id)) {
        $userEntity = $tblUsers->newEntity();
        $userEntity->set('created_at', date('Y-m-d'));
    } else {
        $userEntity = $tblUsers->get($id);
        $userEntity->set('updated_at', date('Y-m-d'));
    }
	if(!empty($userData["temp_photo_id"])){
		$tblTempUploads = TableRegistry::get("TempUploads");
		try{
			$tmpPhoto = $tblTempUploads->get($userData["temp_photo_id"]);
			$fileName = $tmpPhoto->get("file_name");
			$tempFile = WWW_ROOT. 'uploads'.DS.'temp'.DS.$fileName;
			$finalDestination = WWW_ROOT. 'uploads'.DS.'users'.DS.$fileName;
			copy($tempFile, $finalDestination);
			$userEntity->set('profile_pic', $fileName);
		} catch (Cake\Datasource\Exception\RecordNotFoundException $ex){
			//DO nothing.. 
		}
	}
	
    $userEntity->set('email', $userData['email']);
    $userEntity->set('password', $userData['password']);
    $userEntity->set('first_name', $userData['first_name']);
    $userEntity->set('last_name', $userData['last_name']);
    $userEntity->set('phone_no', $userData['phone_no']);
    $userEntity->set('profile_pic', $userData['profile_pic']);
    $tblUsers->save($userEntity);

    if (empty($userEntity->errors())) {
        return $userEntity->id;
    } else {
        return false;
    }
}

public function update() {
    $requestData = $this->request->getData();

    $result = $this->save($requestData);
    $message = [];

    if (!empty($result)) {
        $return = true;
        $id = $result;
        $message = 'Successfully save request data.';
    } else {
        $return = false;
        $id = 0;
        $message = 'There is a problem of saving request data.';
    }
    $this->set([
        "status" => $return, 
        "id" => $id, 
        "message" => $message,
        '_serialize' => ['status', 'id', 'message']
    ]);
}

public function login() {
    $requestData = $this->request->getData();
    $tblUsers = TableRegistry::get("Users");
    $arrWhere = [];
    if (!empty($requestData['email'])) {
        $arrWhere['Users.email'] = $requestData['email'];
    }
    $arrWhere['Users.is_deleted'] = 0;

    $arrUser = $tblUsers->find()->contain(["TeamMembers"])->where($arrWhere)->hydrate(false)->first();

	if(empty($arrUser)){
		$this->set([
			"status" => false, 
			"data" => null, 
			"message" => "Invalid username or password.",
			'_serialize' => ['status', 'data', 'message']
		]);
	} else {
		if ($requestData['password'] == $arrUser["password"]) {
			$this->set([
				"status" => true, 
				"data" => $arrUser, 
				"message" => "Login successful",
				'_serialize' => ['status', 'data', 'message']
			]);
		} else {
			$this->set([
				"status" => false, 
				"data" => null, 
				"message" => "Invalid username or password.",
				'_serialize' => ['status', 'data', 'message']
			]);
		}
	}
}

}
