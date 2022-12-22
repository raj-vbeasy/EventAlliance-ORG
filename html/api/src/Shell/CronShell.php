<?php

namespace App\Shell;

use Cake\Console\Shell;
use Cake\ORM\TableRegistry;
use Cake\Mailer\Email;

class CronShell extends Shell {

    public function main() {

        $tblArtist = TableRegistry::get('Artists');
        $tblChannel = TableRegistry::get('Channels');
        $tblChannelArchive = TableRegistry::get('ChannelArchives');
        $arrArtist = $tblArtist->find('all')
            ->contain(['ArtistChannels'])
            ->hydrate(false)
            ->toArray();
        foreach ($arrArtist as $artist) {

            if (!empty($artist['artist_channels'])) {
                foreach ($artist['artist_channels'] as $artistChannel) {
                    if (empty($artistChannel['is_delete'])) {
                        $artistChanelId = $artistChannel['channel_id'];
                        $artist_name = $artist['name'] . "- Topic";
                        $url = "https://www.googleapis.com/youtube/v3/search?q=" . urlencode($artist_name) . "&RegionCode=US&topicId=/m/04rlf&type=channel&part=snippet&maxResults=1&key=AIzaSyAiBTla0lc7ykFx-4GBewI993gTwHMDbT0";

                        $jsonCrulData = $this->getCurlData($url);

                        if (!empty($jsonCrulData)) {

                            $youtubeData = json_decode($jsonCrulData, true);
                            $arrChannel = $youtubeData["items"][0];
                            $channelId = $arrChannel["snippet"]["channelId"];

                            $video_channel_id = $arrChannel["snippet"]["channelId"];
                            //$channelTitle = $arrChannel["snippet"]["channelTitle"];
                            $artistProfilePic = $arrChannel["snippet"]["thumbnails"]["medium"]["url"];

                            if (!empty($channelId)) {
                                $channelAPIUrl = "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=" . $channelId . "&key=AIzaSyAiBTla0lc7ykFx-4GBewI993gTwHMDbT0";
                                $jsonChannelDetails = $this->getCurlData($channelAPIUrl);
                                $arrChannelDetails = json_decode($jsonChannelDetails, true);


                                $viewCount = $arrChannelDetails['items'][0]['statistics']['viewCount'];
                                $commentCount = $arrChannelDetails['items'][0]['statistics']['commentCount'];
                                $subscriberCount = $arrChannelDetails['items'][0]['statistics']['subscriberCount'];
                                $videoCount = $arrChannelDetails['items'][0]['statistics']['videoCount'];

                                $today = date("Y-m-d H:i:s");

                                //update artist profile pic
                                $entityArtist = $tblArtist->get($artist['id']);
                                $entityArtist->profile_picture = $artistProfilePic;
                                $entityArtist->updated_at = date('Y-m-d H:i:s');
                                $tblArtist->save($entityArtist);


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
                            }

                            // send email
                        }
                    }
                }
            }
        }
        $this->out('code executed successfully');
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
