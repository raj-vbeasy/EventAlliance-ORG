<?php

namespace App\Controller;

use App\Controller\AppController;
use Cake\Event\Event;
use Cake\ORM\TableRegistry;
use Cake\Mailer\Email;
class CronJobsController extends AppController {

    public function captureYoutubeArtistData() {
        $this->autoRender = false;
        $tblArtist = TableRegistry::get('Artists');
        $tblChannel = TableRegistry::get('Channels');
        $tblChannelArchive = TableRegistry::get('ChannelArchives');
        
        /*Read the file from webstore*/
        $filePath = ROOT . "/webroot/uploads/update_artist_list.txt";
        $artistId = file_get_contents($filePath);

        $arrArtist = $tblArtist->find('all')
            ->contain(['ArtistChannels'])
            ->where(['Artists.id >' => $artistId])
            ->hydrate(false)
            ->limit(1400)
            ->order(['Artists.id' => 'ASC'])
            ->toArray();




        foreach ($arrArtist as $artist) {
            
            if (!empty($artist['artist_channels'])) {
                foreach ($artist['artist_channels'] as $artistChannel) {
                    if (empty($artistChannel['is_delete'])) {
                        $artistChanelId=$artistChannel['channel_id'];
                        $artist_name = $artist['name'] . "- Topic";
                        
                        //$url = "https://www.googleapis.com/youtube/v3/search?q=" . urlencode($artist_name) . "&RegionCode=US&topicId=/m/04rlf&type=channel&part=snippet&maxResults=1&key=AIzaSyACEKEUcMm47vUvIW2Ccaq1o8l4zJGq14o";
                        // $jsonCrulData = $this->getCurlData($url);
                        // This Youtube API key: AIzaSyACEKEUcMm47vUvIW2Ccaq1o8l4zJGq14o
                        // Using from sam@vibgyortechsolutions.com
                        // Project name is : Event Alliance data API
                        $arrChannel = $tblChannel->find('all')
                            ->where(['id' => $artistChanelId])
                            ->hydrate(false)
                            ->toArray();
                            
                        foreach($arrChannel as $channels){
                            //if (!empty($jsonCrulData)) {
                            if (!empty($channels)) {

                           /* $youtubeData = json_decode($jsonCrulData, true);
                            $arrChannel = $youtubeData["items"][0];
                            $channelId = $arrChannel["snippet"]["channelId"];*/
                            
                            $channelId = $channels['channel_ids'];

                            //$video_channel_id = $arrChannel["snippet"]["channelId"];
                            //$channelTitle = $arrChannel["snippet"]["channelTitle"];
                            //$artistProfilePic = $arrChannel["snippet"]["thumbnails"]["medium"]["url"];

                            if (!empty($channelId)) {
                                $channelAPIUrl = "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=" . $channelId . "&key=AIzaSyACEKEUcMm47vUvIW2Ccaq1o8l4zJGq14o";
                                echo $channelAPIUrl."<br>";
                                $jsonChannelDetails = $this->getCurlData($channelAPIUrl);
                                $arrChannelDetails = json_decode($jsonChannelDetails, true);

                               
                                $viewCount = !empty($arrChannelDetails['items'][0]['statistics']['viewCount'])?$arrChannelDetails['items'][0]['statistics']['viewCount']:0;
                                $commentCount = !empty($arrChannelDetails['items'][0]['statistics']['commentCount'])?$arrChannelDetails['items'][0]['statistics']['commentCount']:0;
                                $subscriberCount = !empty($arrChannelDetails['items'][0]['statistics']['subscriberCount'])?$arrChannelDetails['items'][0]['statistics']['subscriberCount']:0;
                                $videoCount = !empty($arrChannelDetails['items'][0]['statistics']['videoCount'])?$arrChannelDetails['items'][0]['statistics']['videoCount']:0;
                                

                                $today = date("Y-m-d H:i:s");

                                //update artist profile pic
                                $entityArtist = $tblArtist->get($artist['id']);
                                //$entityArtist->profile_picture = $artistProfilePic;
                                $entityArtist->updated_at = date('Y-m-d H:i:s');
                                //$tblArtist->save($entityArtist);
                                
                                $resultArtist = $tblArtist->save($entityArtist);
                                $getInsertId = $resultArtist->id;


                                //update channel table according to the new data
                                $entityChannel = $tblChannel->get($artistChannel['channel_id']);
                                $entityChannel->channel_view_count = $viewCount;
                                $entityChannel->channel_subscriber_count = $subscriberCount;
                                $entityChannel->channel_video_count = $videoCount;
                                $entityChannel->channel_comment_count = $commentCount;
                                $entityChannel->updated_at = date('Y-m-d H:i:s');
                                $tblChannel->save($entityChannel);

                                // channel archive
                                $newEntity = $tblChannelArchive->newEntity();
                                
                                $newEntity->channel_id = $artistChanelId;         
                                $newEntity->channel_view_count = $viewCount;
                                $newEntity->channel_subscriber_count = $subscriberCount;
                                $newEntity->channel_video_count = $videoCount;
                                $newEntity->channel_comment_count = $commentCount;
                                $newEntity->process_date = date('Y-m-d H:i:s');
                                $tblChannelArchive->save($newEntity);
                                
                               /* echo "Artist Id - ".$artist['id']."<br/>";
                               // echo "profile_picture - ".$artistProfilePic."<br/>";
                                echo "artistChanelId - ".$artistChanelId."<br/>";
                                echo "channel_view_count - ". $viewCount ."<br/>";
                                echo "channel_subscriber_count - ". $subscriberCount ."<br/>";
                                echo "channel_video_count - ". $videoCount ."<br/>";
                                echo "channel_comment_count - ".$commentCount ."<br/><br/><br/>";*/
                               
                            }
                            
                            // send email
                        }
                        }
                    }
                }
            }
        }
        
        $getInsertId = $artist['id'];
        file_put_contents($filePath, $getInsertId);  
        
        echo "Done"; exit;
    }

    private function getCurlData($url) {
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($curl);
        if (curl_error($curl)) {
            curl_close($curl);
            // $error = curl_error($curl);
            return false;
        }
        curl_close($curl);
        return $result;
    }

}

