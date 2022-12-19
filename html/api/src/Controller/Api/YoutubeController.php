<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\ORM\TableRegistry;
use Cake\Http\Client;

class YoutubeController extends ApiController {

	private $_apiKey;

	public function initialize(){
		parent::initialize();
		$this->_apiKey = "AIzaSyCDu3u8JpdHA88auUfZwk8PHmBQ0T59rGo";
	}

    public function live() {

        $request = $this->request;
        $artist_id = array_key_exists("artist_id", $request->params) ? $request->params["artist_id"] : 0;
        
        $channelVideosSearchResult = [];

        if($artist_id != 0){
        	//TODO: Get channel id for the given artist_id;
			
			$tblAritstChannels = TableRegistry::get("ArtistChannels");
			$query = $tblAritstChannels->find('all')
                ->contain(["Channels"])
                ->where(["ArtistChannels.artist_id" => $artist_id, "Channels.is_deleted" => 0]);
				
				
			$arrChannels = $query->hydrate(false)->toArray();
			
			$channelId = "";
			
			if(count($arrChannels) > 0){
				$channelId = $arrChannels[0]["channel"]["channel_ids"];

				$youtubeApiUrl = "https://www.googleapis.com/youtube/v3/search";

	        	$http = new Client();
	        	$response = $http->get($youtubeApiUrl, ["type" => "video", "channelId"=>$channelId, "part"=>"snippet,id", "order"=>"date", "maxResults"=>3, "key"=>$this->_apiKey]);

	        	$channelVideosSearchResult = json_decode($response->body(), true);
			}

        } else {
        	//TODO: return error
        }

        $this->set(compact('channelVideosSearchResult'));
        $this->set('_serialize', ['channelVideosSearchResult']);
    }
}
