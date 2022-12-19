<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\ORM\TableRegistry;


class ArtistsController extends ApiController {

    public function initialize() {
        parent::initialize();
    }

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
        
        $arrArtist = $this->getArtists($requestData,$length,$start);
        
        if($length == 0){
            $length = count($arrArtist["data"]);
        }
        
        $arrMeta['page'] = $start;
        $arrMeta['pages'] = ceil($arrArtist["total"] / $length);
        $arrMeta['perpage'] = $length;
        $arrMeta['total'] = $arrArtist["total"];
        
        $meta = $arrMeta;
        $data = $arrArtist["data"];        
        
        $this->set(compact('meta', 'data'));
        $this->set('_serialize', ['meta', 'data']);
    }
    
    
    public function getDetails () { 
    $requestData = $this->request->params; 
    $tblArtists = TableRegistry::get("Artists");
    $data  = $tblArtists->find('all')
              ->contain(['ArtistGenres'=>['Genres'],'Budgets','ArtistChannels'=>['Channels']])
              ->hydrate(false)
              ->where(['Artists.id'=>$requestData['id']])
              ->first();
        $this->set(compact('data'));
        $this->set('_serialize', ['data']);
    
    }
    
    public function getArtists($requestData = null, $length=0, $start=1) {
        
        $tblArtists = TableRegistry::get("Artists");
        $arrWhere = ['Artists.is_deleted' => 0];
        if (!empty($requestData['name'])) {
            $arrWhere = ['Artists.name' => $requestData['name']];
        }
          
        // Prepare the paged query
        $arrArtistCount = $tblArtists->find('all')->where($arrWhere);
        
        $query = $tblArtists->find('all')
                ->contain(['ArtistGenres'=>['Genres'],'Budgets','ArtistChannels'=>['Channels']])
                ->where($arrWhere);
        
        if (!empty($length)) {
            $total = $query->count();
            $query->limit($length);
            $query->page($start);
        }
        
        $arrArtist = $query->hydrate(false)
                ->toArray();
        
        if(empty($length)){
            $total = count($arrArtist);
        }
        
        return ["total" => $total, "data" => $arrArtist];
        
    }

    public function delete() {
        $return = 'ERROR';
        $message = 'There is a problem of deleting request data.';
        $requestData = $this->request->params;
        $tblArtists = TableRegistry::get("Artists");
        $artistEntity = $tblArtists->get($requestData["id"]);
        $artistEntity->set('is_deleted', 1);
        $result = $tblArtists->save($artistEntity);
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
            'response' => ["status" => $return, "id" => $id, "message" => $message],
            '_serialize' => ['response']
        ]);
    }

    public function create() {
        $requestData = $this->request->getData();
                
        $result = $this->save($requestData);
        $message = [];
        if (!empty($result)) {
            $return = 'SUCCESS';
            $message['id'] = $result;
            $message['message'] = 'Successfully save request data.';
        } else {
            $return = 'ERROR';
            $message['message'] = 'There is a problem of saving request data.';
        }

        $this->set([
            'response' => ["status" => $return, "message" => $message],
            '_serialize' => ['response']
        ]);
    }

    
    public function update() {
        
        $requestData = $this->request->data();
        if(isset($this->request->params["id"])){
            $requestData["id"] = $this->request->params["id"];
        } 
        print_r($requestData);
        exit;
        $result = $this->save($requestData);
        $message = [];

        if (!empty($result)) {
            $return = 'SUCCESS';
            $message['id'] = $result;
            $message['message'] = 'Successfully save request data.';
        } else {
            $return = 'ERROR';
            $message['message'] = 'There is a problem of saving request data.';
        }
        $this->set([
            'response' => ["status" => $return, "message" => $message],
            '_serialize' => ['response']
        ]);
    }
    
    
    public function save($artistData) {
        $tblArtists = TableRegistry::get("Artists");
        $id = $artistData['id'];
        if (empty($id)) {
            $artistEntity = $tblArtists->newEntity();
        } else {
            $artistEntity = $tblArtists->get($id);
        }
        $artistEntity->set('name', $artistData['name']);
        $artistEntity->set('website', $artistData['website']);
        $artistEntity->set('budget_id', $artistData['budget_id']);
        $artistEntity->set('video_description', $artistData['video_description']);
        $artistEntity->set('video_view', $artistData['video_view']);
        $artistEntity->set('video_like', $artistData['video_like']);
        $artistEntity->set('video_dislike', $artistData['video_dislike']);
        $artistEntity->set('video_favorite', $artistData['video_favorite']);
        $artistEntity->set('video_comments', $artistData['video_comments']);
        $artistEntity->set('artist_status_id', $artistData['artist_status_id']);
        $artistEntity->set('profile_picture', $artistData['profile_picture']);
        $artistEntity->set('budget_id', $artistData['budget_id']);
        $artistEntity->set('channel_ids', $artistData['number_of_artist']);
        $artistEntity->set('created_at', $artistData['created_at']);
        $artistEntity->set('updated_at', $artistData['updated_at']);
               

        $tblArtists->save($artistEntity);

        if (empty($artistEntity->errors())) {
            return $artistEntity->id;
        } else {
            return false;
        }
        
    }    

}
