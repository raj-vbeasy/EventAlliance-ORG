<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\ORM\TableRegistry;

class ArtistsController extends ApiController
{

    public function initialize()
    {
        parent::initialize();
    }

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

        $arrArtist = $this->getArtists($requestData, $length, $start);

        if ($length == 0) {
            $length = count($arrArtist["data"]);
        }

        $arrMeta['page']    = $start;
        $arrMeta['pages']   = ceil($arrArtist["total"] / $length);
        $arrMeta['perpage'] = $length;
        $arrMeta['total']   = $arrArtist["total"];

        $meta = $arrMeta;
        $data = $arrArtist["data"];

        $this->set(compact('meta', 'data'));
        $this->set('_serialize', ['meta', 'data']);
    }

    public function getDetails()
    {
        $requestData = $this->request->params;
        $tblArtists  = TableRegistry::get("Artists");
        $data        = $tblArtists->find('all')
            ->contain(['ArtistGenres' => ['Genres'], 'Budgets', 'ArtistChannels' => function ($q) {
                $q->contain("Channels");
                $q->where(["Channels.is_deleted" => 0]);
                return $q;
            }])
            ->hydrate(false)
            ->where(['Artists.id' => $requestData['id']])
            ->first();

        $tblArtistChannels = TableRegistry::get("ArtistChannels");
        $rsArtisstChannels = $tblArtistChannels->find()
            ->where(["artist_id" => $requestData['id']])
            ->hydrate(false)
            ->toArray();

        $tblChannelArchives = TableRegistry::get("ChannelArchives");
        $rsChanelData       = $tblChannelArchives->find()
            ->where(["channel_id" => $rsArtisstChannels[0]["channel_id"]])
            ->hydrate(false)
            ->toArray();

        $data["channel_data"] = $rsChanelData;

        $this->set(compact('data'));

        $this->set('_serialize', ['data']);
    }

    public function getRelatedArtists()
    {
        $random = mt_rand(1,600000);
        $requestData     = $this->request->params;
        $artistId        = $requestData["artistId"];
        $tblArtists      = TableRegistry::get("Artists");
        $tblArtistGenres = TableRegistry::get("ArtistGenres");
        $rsArtistGenres  = $tblArtistGenres->find('all')->select(['artist_id', 'genre_id'])->distinct(['genre_id'])
            ->where(['artist_id' => $artistId])
            ->hydrate(false)
            ->toArray();
        $artistGenres = [];

        for ($i = 0; $i < count($rsArtistGenres); $i++) {          
              if(count($rsArtistGenres) > 1) {
                if($rsArtistGenres[$i]['genre_id'] != 1) {
                    array_push($artistGenres, $rsArtistGenres[$i]['genre_id']);
                }
            }else{
                array_push($artistGenres, $rsArtistGenres[$i]['genre_id']);
               }     
        }

        $data = $tblArtistGenres->find('all')
            ->contain(["Genres", "Artists" => ['ArtistChannels' => ['Channels']]])
            ->where(["ArtistGenres.genre_id IN" => $artistGenres,"ArtistGenres.artist_id !=" => $artistId])
            ->hydrate(false)
            ->order('rand()')
            ->limit(3)
            ->toArray();

        $this->set(compact('data'));
        $this->set('_serialize', ['data']);
    }

    public function getArtists($requestData = null, $length = 0, $start = 1)
    {

        $tblArtists = TableRegistry::get("Artists");
        $arrWhere   = ['Artists.is_deleted' => 0];

        $genreId = 0;
        if (!empty($requestData->query['query']['name'])) {
            list($keyWord, $genreId, $budgetId) = explode("^", $requestData->query['query']['name']);

            if (is_numeric($budgetId) && $budgetId > 0) {
                $arrWhere['Artists.budget_id'] = $budgetId;
            }
            if (!empty($keyWord)) {
                $arrWhere["OR"] = ['Artists.name LIKE' => "%" . $keyWord . "%"];
            }
        }

        // Prepare the paged query
        $arrArtistCount = $tblArtists->find('all')->where($arrWhere);

        $query = $tblArtists->find('all');
        $query->contain(['ArtistGenres' => ['Genres'], 'Budgets', 'ArtistChannels' => function ($q) {
            $q->contain("Channels");
            $q->where(["Channels.is_deleted" => 0]);
            
            return $q;
        }]);
        $query->order(["Artists.name" => "ASC"]);
        if (is_numeric($genreId) && $genreId > 0) {
            $query->matching('ArtistGenres', function ($q) use ($genreId) {
                return $q->where(['ArtistGenres.genre_id' => $genreId]);
            });
        }

        $query->where($arrWhere);
        /*echo "<pre/>";
        print_r($query->sql()); exit();*/
        if (!empty($length)) {
            $total = $query->count();
            $query->limit($length);
            $query->page($start);
        }

        $arrArtist = $query->hydrate(false)
            ->toArray();

        if (empty($length)) {
            $total = count($arrArtist);
        }

        return ["total" => $total, "data" => $arrArtist];
    }

    public function delete()
    {
        $requestData  = $this->request->params;
        $tblArtists   = TableRegistry::get("Artists");
        $artistEntity = $tblArtists->get($requestData["id"]);
        $artistEntity->set('is_deleted', 1);
        $result = $tblArtists->save($artistEntity);
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
            'response'   => ["status" => $return, "id" => $id, "message" => $message],
            '_serialize' => ['response'],
        ]);
    }
    
     public function deleteAllArtists()
        {
             $requestData = $this->request->getData();
             $tblArtists   = TableRegistry::get("Artists");
             $get_artist_ids=explode(',',$this->request->data['params']);
            // echo "hello";
            // echo "<pre/>";print_r($get_artist_ids);exit;
             $result = $tblArtists->updateAll(['is_deleted'=>1],['id IN' => $get_artist_ids]);
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
                 'response'   => ["status" => $return, "id" => $id, "message" => $message],
                 '_serialize' => ['response'],
             ]);
        }

    public function create()
    {
        $requestData = $this->request->getData();

        $result  = $this->save($requestData);
        $message = [];
        $status  = false;
        $id      = 0;

        if (!empty($result)) {
            $status  = true;
            $id      = $result;
            $message = 'Artist has been created Successfully';
        } else {
            $message = 'There was an error processing your request.';
        }

        $this->set([
            "status"     => $status,
            "message"    => $message,
            "id"         => $id,
            '_serialize' => ["status", "message", "id"],
        ]);
    }

    public function update()
    {

        $requestData = $this->request->data();
        if (isset($this->request->params["id"])) {
            $requestData["id"] = $this->request->params["id"];
        }

        $result = $this->save($requestData);

        $status  = false;
        $id      = null;
        $message = "";        
        if (!empty($result)) {
            $status  = true;
            $id      = $result;
            $message = "Artist's data has been saved Successfully";
        } else {
            $message['message'] = 'There was a problem saving requested data.';
        }
        $this->set([
            "status"     => $status,
            "message"    => $message,
            "id"         => $id,
            '_serialize' => ["status", "message", "id"],
        ]);
    }

    private function _getYouTubeData($url, &$error)
    {
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($curl);
        if (curl_error($curl)) {
            curl_close($curl);
            $error = curl_error($curl);
            return false;
        }
        curl_close($curl);
        return $result;
    }

    private function _getChannelData($channel_id) {
        $channel_api_url = "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=" . $channel_id . "&key=AIzaSyASh10o0PBeno9_Rhoz9_CGxkZPXXZeu5A";
        $channelResult    = $this->_getYouTubeData($channel_api_url, $error);
        $arrChannelResult = json_decode($channelResult, true);

        
        return $arrChannelResult;
    }

    public function save($artistData)
    {
        
        
        $tblArtists        = TableRegistry::get("Artists");
        $id                = $artistData['id'];
        $tblArtistChannels = TableRegistry::get("ArtistChannels");
        $channelResult    = $this->_getChannelData($artistData["channelIds"]);
        $youTubeChannelData = $channelResult["items"][0]["statistics"];        

        if (empty($id)) {
            $artistEntity = $tblArtists->newEntity();            

        } else {
            $artistEntity = $tblArtists->get($id);
            

            $rsExistingChannels = $tblArtistChannels->find()->contain(["Channels"])->where(["ArtistChannels.artist_id" => $id, "Channels.is_deleted" => 0])->hydrate(false)->toArray();
            
          

            if (!empty($artistData["channelIds"])) {

                if (count($rsExistingChannels) >= 1) {                               
                    
                   
                    if ($rsExistingChannels[0]["channel"]["channel_ids"] != $artistData["channelIds"]) {   

                        $tbtlChannels  = TableRegistry::get("Channels");
                        $channelEntity = $tbtlChannels->newEntity();
                        $channelEntity->set("channel_ids", $artistData["channelIds"]);
                        $channelEntity->set("created_at", date("Y-m-d H:i:s"));
                        $channelEntity->set("updated_at", date("Y-m-d H:i:s"));
                        $channelEntity->set("is_deleted", 0);
                        // Get data form youtube and update channel table 
                        if(!empty($youTubeChannelData)) {
                            $channelEntity->set("channel_title", $channelResult["items"][0]["snippet"]["title"]);
                            $channelEntity->set("channel_description", $channelResult["items"][0]["snippet"]["description"]);
                            $channelEntity->set("channel_view_count", $youTubeChannelData["viewCount"]);
                            $channelEntity->set("channel_subscriber_count", $youTubeChannelData["subscriberCount"]);
                            $channelEntity->set("channel_video_count", $youTubeChannelData["videoCount"]);
                            $channelEntity->set("channel_comment_count", $youTubeChannelData["commentCount"]);
                        }

                        $tbtlChannels->save($channelEntity);

                        $tblChannelArchives = TableRegistry::get("ChannelArchives");
                        $channelArchiveEntity = $tblChannelArchives->newEntity();
                        $channelArchiveEntity->set("channel_view_count", $youTubeChannelData["viewCount"]);
                        $channelArchiveEntity->set("channel_subscriber_count", $youTubeChannelData["subscriberCount"]);
                        $channelArchiveEntity->set("channel_video_count", $youTubeChannelData["videoCount"]);
                        $channelArchiveEntity->set("channel_comment_count", $youTubeChannelData["commentCount"]);
                        $channelArchiveEntity->set("process_date", date("Y-m-d"));
                        $channelArchiveEntity->set("channel_id", $channelEntity->id);
                        $tblChannelArchives->save($channelArchiveEntity);


                        $channelEntity = $tbtlChannels->get($rsExistingChannels[0]["channel"]["id"]);
                        $channelEntity->set("is_deleted", 1);
                        $tbtlChannels->save($channelEntity);

                        $artistChannelEntity = $tblArtistChannels->newEntity();
                        $artistChannelEntity->set("artist_id", $id);
                        $artistChannelEntity->set("channel_id", $channelEntity->id);
                        $artistChannelEntity->set("is_deleted", 0);
                        $tblArtistChannels->save($artistChannelEntity);
                    }
                    
                } else {                    
                    
                    $tbtlChannels  = TableRegistry::get("Channels");
                    $channelEntity = $tbtlChannels->newEntity();
                    $channelEntity->set("channel_ids", $artistData["channelIds"]);
                    $channelEntity->set("created_at", date("Y-m-d H:i:s"));
                    $channelEntity->set("updated_at", date("Y-m-d H:i:s"));
                    $channelEntity->set("is_deleted", 0);
                    // Get data form youtube and update channel table 
                    if(!empty($youTubeChannelData)) {
                        $channelEntity->set("channel_title", $channelResult["items"][0]["snippet"]["title"]);
                        $channelEntity->set("channel_description", $channelResult["items"][0]["snippet"]["description"]);
                        $channelEntity->set("channel_view_count", $youTubeChannelData["viewCount"]);
                        $channelEntity->set("channel_subscriber_count", $youTubeChannelData["subscriberCount"]);
                        $channelEntity->set("channel_video_count", $youTubeChannelData["videoCount"]);
                        $channelEntity->set("channel_comment_count", $youTubeChannelData["commentCount"]);
                    }
                    $tbtlChannels->save($channelEntity);

                    $tblChannelArchives = TableRegistry::get("ChannelArchives");
                    $channelArchiveEntity = $tblChannelArchives->newEntity();
                    $channelArchiveEntity->set("channel_view_count", $youTubeChannelData["viewCount"]);
                    $channelArchiveEntity->set("channel_subscriber_count", $youTubeChannelData["subscriberCount"]);
                    $channelArchiveEntity->set("channel_video_count", $youTubeChannelData["videoCount"]);
                    $channelArchiveEntity->set("channel_comment_count", $youTubeChannelData["commentCount"]);
                    $channelArchiveEntity->set("process_date", date("Y-m-d"));
                    $channelArchiveEntity->set("channel_id", $channelEntity->id);
                    $tblChannelArchives->save($channelArchiveEntity);

                    $artistChannelEntity = $tblArtistChannels->newEntity();
                    $artistChannelEntity->set("artist_id", $id);
                    $artistChannelEntity->set("channel_id", $channelEntity->id);
                    $artistChannelEntity->set("is_deleted", 0);
                    $tblArtistChannels->save($artistChannelEntity);
                }
            }
        }
        
        if (!empty($youTubeChannelData)) {
            
            $artistEntity->set('name', $artistData['name']);
            $artistEntity->set('budget_id', $artistData['budgetId']);
            $artistEntity->set("created_at", date("Y-m-d H:i:s"));
            $artistEntity->set("updated_at", date("Y-m-d H:i:s"));
            $artistEntity->set("profile_picture", $channelResult["items"][0]["snippet"]["thumbnails"]["medium"]["url"]);
            $artistEntity->set('is_deleted', 0);

            $tblArtists->save($artistEntity);
            

            if (empty($artistEntity->errors())) {

                $tblArtistGenres = TableRegistry::get("ArtistGenres");
                $tblArtistGenres->deleteAll(["artist_id" => $artistEntity->id]);

                $genres = $artistData["genres"];
                foreach ($genres as $genre) {
                    $artistGenreEntity            = $tblArtistGenres->newEntity();
                    $artistGenreEntity->artist_id = $artistEntity->id;
                    $artistGenreEntity->genre_id  = $genre["id"];
                    $tblArtistGenres->save($artistGenreEntity);
                }

                //If creating a new artist, create the channel as well
                if (empty($id)) {
                    if (!empty($artistData["channelIds"])) {

                        $tbtlChannels  = TableRegistry::get("Channels");
                        $channelEntity = $tbtlChannels->newEntity();
                        $channelEntity->set("channel_ids", $artistData["channelIds"]);
                        $channelEntity->set("artist_id", $artistEntity->id);
                        $channelEntity->set("created_at", date("Y-m-d H:i:s"));
                        $channelEntity->set("updated_at", date("Y-m-d H:i:s"));
                        $channelEntity->set("channel_title", $channelResult["items"][0]["snippet"]["title"]);
                        $channelEntity->set("channel_description", $channelResult["items"][0]["snippet"]["description"]);
                        $channelEntity->set("channel_view_count", $youTubeChannelData["viewCount"]);
                        $channelEntity->set("channel_subscriber_count", $youTubeChannelData["subscriberCount"]);
                        $channelEntity->set("channel_video_count", $youTubeChannelData["videoCount"]);
                        $channelEntity->set("channel_comment_count", $youTubeChannelData["commentCount"]);

                        $tbtlChannels->save($channelEntity);

                        $tblChannelArchives = TableRegistry::get("ChannelArchives");
                        $channelArchiveEntity = $tblChannelArchives->newEntity();
                        $channelArchiveEntity->set("channel_view_count", $youTubeChannelData["viewCount"]);
                        $channelArchiveEntity->set("channel_subscriber_count", $youTubeChannelData["subscriberCount"]);
                        $channelArchiveEntity->set("channel_video_count", $youTubeChannelData["videoCount"]);
                        $channelArchiveEntity->set("channel_comment_count", $youTubeChannelData["commentCount"]);
                        $channelArchiveEntity->set("process_date", date("Y-m-d"));
                        $channelArchiveEntity->set("channel_id", $channelEntity->id);
                        $tblChannelArchives->save($channelArchiveEntity);

                        $artistChannelEntity = $tblArtistChannels->newEntity();
                        $artistChannelEntity->set("artist_id", $artistEntity->id);
                        $artistChannelEntity->set("channel_id", $channelEntity->id);
                        $artistChannelEntity->set("is_deleted", 0);
                        $tblArtistChannels->save($artistChannelEntity);
                    }
                }

                return $artistEntity->id;
            } else {
                return false;
            }

        } else {
            return false;

        }

    }

}
