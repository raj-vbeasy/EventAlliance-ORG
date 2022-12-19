<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\ORM\TableRegistry;

class EventsController extends ApiController
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

        $arrEvent = $this->getEvents($requestData, $length, $start);

        if ($length == 0) {
            $length = count($arrEvent["data"]);
        }

        $arrMeta['page']    = $start;
        $arrMeta['pages']   = ceil($arrEvent["count"] / $length);
        $arrMeta['perpage'] = $length;
        $arrMeta['total']   = $arrEvent["count"];

        $meta = $arrMeta;
        $data = $arrEvent["data"];

        $this->set(compact('meta', 'data'));
        $this->set('_serialize', ['meta', 'data']);
    }

    private function _getUsersTeamsEvents($userId)
    {

        $requestData     = $this->request->params;
        $tblUsers        = TableRegistry::get("Users");
        $checkSuperAdmin = $tblUsers->find('all')->where([
            'id'        => $userId,
            'user_type' => 0,
        ])->hydrate(false)->toArray();

        $arrEventId = [];

        $eventsWhere = [];
        $eventsWhere['start_date > '] = date("Y-m-d");

        if (empty($checkSuperAdmin)) {
            $tblTeamMembers         = TableRegistry::get("TeamMembers");
            $query                  = $tblTeamMembers->find('all')->where(['user_id' => $userId]);
            $teamAssociatedWithUser = $query->hydrate(false)->toArray();
            $arrTeamId              = [];

            for ($i = 0; $i < count($teamAssociatedWithUser); $i++) {
                array_push($arrTeamId, $teamAssociatedWithUser[$i]['team_id']);
            }

            if(!empty($arrTeamId)){
                $eventsWhere['team_id IN'] = $arrTeamId;
            } else {
                $eventsWhere['team_id'] = 0;
            }
        }

        $tblEvents = TableRegistry::get("Events");

        $query                   = $tblEvents->find('all')->where($eventsWhere);
        $eventAssociatedWithTeam = $query->hydrate(false)->toArray();

        for ($i = 0; $i < count($eventAssociatedWithTeam); $i++) {
            array_push($arrEventId, $eventAssociatedWithTeam[$i]['id']);
        }

        return $arrEventId;
    }

    public function addArtist()
    {
        $requestData = $this->request->data();
        $userId      = $requestData["userId"];

        $arrEvent = [];
        if (empty($requestData["eventId"])) {
            $arrEvent = $this->_getUsersTeamsEvents($userId);
        }
        if (!empty($arrEvent) || !empty($requestData["eventId"])) {
            if (count($arrEvent) > 1 && empty($requestData["eventId"])) {
                $this->set([
                    "status"     => false,
                    "id"         => 0,
                    "message"    => "MULTIEVENT",
                    '_serialize' => ['status', 'id', 'message'],
                ]);

            } else {
                $artistId = $requestData["artistId"];

                $tblEventArtists = TableRegistry::get("EventArtists");

                $existingRecord = $tblEventArtists->find()->where(["artist_id" => $artistId, "event_id" => $requestData["eventId"]])->first();

                if (empty($existingRecord)) {
                    $eventArtistEntity = $tblEventArtists->newEntity();
                    $eventArtistEntity->set("artist_id", $artistId);
                    $eventArtistEntity->set("event_id", $requestData["eventId"]);
                    $tblEventArtists->save($eventArtistEntity);

                    if (empty($eventArtistEntity->errors())) {
                        $this->set([
                            "status"     => true,
                            "id"         => $eventArtistEntity->id,
                            "message"    => "Record has been creaated Successfully",
                            '_serialize' => ['status', 'id', 'message'],
                        ]);
                    } else {
                        $this->set([
                            "status"     => false,
                            "id"         => 0,
                            "message"    => "There was an error during database transaction",
                            '_serialize' => ['status', 'id', 'message'],
                        ]);
                    }
                } else {
                    $this->set([
                        "status"     => false,
                        "id"         => 0,
                        "message"    => "This artist already exists in the event",
                        '_serialize' => ['status', 'id', 'message'],
                    ]);
                }
            }

        } else {
            $this->set([
                "status"     => false,
                "id"         => 0,
                "message"    => "Could not find any active event",
                '_serialize' => ['status', 'id', 'message'],
            ]);
        }
    }

    public function addTeamMemberVote()
    {
        $requestData = $this->request->getData();

        $eventId        = $requestData["eventId"];
        $tblEvents      = TableRegistry::get("Events");
        $tblTeamMembers = TableRegistry::get("TeamMembers");
        $tblTeamSurveys = TableRegistry::get("TeamSurveys");

        $query       = $tblEvents->find()->where(["id" => (int) $eventId]);
        $eventEntity = $query->first();

        $rsTeamMembers = $tblTeamMembers->find()
            ->where(["team_id" => $eventEntity->get("team_id"),
                "user_id"          => $requestData["userId"]])
            ->hydrate(false)->first();

        if (!empty($rsTeamMembers)) {
            $teamSurveysEntity = $tblTeamSurveys->find()->where([
                "event_id"       => $eventId,
                "team_member_id" => $rsTeamMembers["id"],
                "artist_id"      => $requestData["artistId"],
            ])->first();
            if (empty($teamSurveysEntity)) {
                $teamSurveysEntity = $tblTeamSurveys->newEntity();
            }
            $teamSurveysEntity->set("event_id", $eventId);
            $teamSurveysEntity->set("vote", $requestData["vote"]);
            $teamSurveysEntity->set("artist_id", $requestData["artistId"]);
            $teamSurveysEntity->set("team_member_id", $rsTeamMembers["id"]);
            $teamSurveysEntity->set("vote_date", date('Y-m-d'));
            $tblTeamSurveys->save($teamSurveysEntity);

            if (empty($teamSurveysEntity->errors())) {
                $this->set([
                    "status"     => true,
                    "id"         => $teamSurveysEntity->id,
                    "message"    => "Record has been save Successfully",
                    '_serialize' => ['status', 'id', 'message'],
                ]);
            } else {
                $this->set([
                    "status"     => false,
                    "id"         => 0,
                    "message"    => "There was an error during database transaction",
                    '_serialize' => ['status', 'id', 'message'],
                ]);
            }

        } else {
            $this->set([
                "status"     => false,
                "id"         => 0,
                "message"    => "Couuld not find any active team for the specified event [" . $eventId . "]",
                '_serialize' => ['status', 'id', 'message'],
            ]);

        }

    }

    public function getOne()
    {
        $tblEvents = TableRegistry::get("Events");
        $query     = $tblEvents->find()
            ->contain([
                "EventDemographics" => ["Demographics"],
                "Budgets",
                "ArtistNumbers",
                "EventGenres"       => ["Genres"],
                "Teams",
                "EventArtists"      => ["Artists"],
            ])
            ->where(["Events.id" => $this->request->params["id"], "Events.is_deleted" => 0]);

        $eventEntity = $query->first();

        $this->set([
            'event'      => $eventEntity ? $eventEntity->toArray() : null,
            '_serialize' => ['event'],
        ]);
    }

    public function getEvents($requestData = null, $length = 0, $start = 1)
    {
        $arrTeamId                     = [];
        
        $tblUsers        = TableRegistry::get("Users");
        $checkSuperAdmin = $tblUsers->find('all')
            ->where(['id' => $requestData->query['user_id'], 'user_type' => 0])
            ->hydrate(false)->toArray();

        if (empty($checkSuperAdmin)) {
            $tblTeamMembers         = TableRegistry::get("TeamMembers");
            $query                  = $tblTeamMembers->find('all')->where(['user_id' => $requestData->query['user_id']]);
            $teamAssociatedWithUser = $query->hydrate(false)->toArray();
            for ($i = 0; $i < count($teamAssociatedWithUser); $i++) {
                array_push($arrTeamId, $teamAssociatedWithUser[$i]['team_id']);
            }
        }

        $tblEvents = TableRegistry::get("Events");

        $arrWhere['Events.is_deleted'] = 0;
        if (empty($checkSuperAdmin)) {
            if (empty($arrTeamId)) {
                $arrTeamId[] = 0;
            }
            $arrWhere['Events.team_id IN'] = $arrTeamId;
        }

        $rsUser = $tblUsers->find('all')
            ->where(['id' => $requestData->query['user_id']])
            ->hydrate(false)->first();

        if ($rsUser['user_type'] == 2) {
            $tblEventTeamMembers = TableRegistry::get("EventTeamMembers");
            $rsEventTeamMember   = $tblEventTeamMembers->find('all')
                ->where(['user_id' => $requestData->query['user_id']])
                ->hydrate(false)->toArray();
            $arrEvent = [];
            for ($i = 0; $i < count($rsEventTeamMember); $i++) {
                array_push($arrEvent, $rsEventTeamMember[$i]['event_id']);
            }
            if (!empty($arrEvent)) {
                $arrWhere['Events.id IN'] = $arrEvent;
            } else {
                //If there is no access than select no event(event Id =0)
                $arrWhere['Events.id'] = 0;
            }

        }

        if (!empty($requestData->query['query']['name'])) {

            list($keyWord, $eventStatus, $teamId) = explode("^", $requestData->query['query']['name']);
            if (is_numeric($eventStatus) && $eventStatus > 0) {
                $arrWhere['Events.status'] = $eventStatus;
            }
            if (is_numeric($teamId) && $teamId > 0) {
                $arrWhere['Events.team_id'] = $teamId;
            }
            if (!empty($keyWord)) {
                $arrWhere["OR"] = ['Events.name LIKE' => "%" . $keyWord . "%", 'Events.description LIKE' => "%" . $keyWord . "%"];
            }

        }

        $total = 0;

        // Prepare the paged query
        $arrEventCount = $tblEvents->find('all')->where($arrWhere);

        $query = $tblEvents->find('all')
            ->contain(["SurveyQuestions" => ["SurveyQuestionOptions"], "EventDemographics", "EventGenres", "Budgets", "EventTeamMembers" => ["Users"], "Teams" => ["TeamMembers" => ["Users"]]])
            ->order(["Events.id" => "DESC"])
            ->where($arrWhere);

        if (!empty($length)) {
            $total = $query->count();
            $query->limit($length);
            $query->page($start);
        }

        $arrEvent = $query->hydrate(false)->toArray();

        

        if (empty($length)) {
            $total = count($arrEvent);
        }

        return ["count" => $total, "data" => $arrEvent];
    }

    public function delete()
    {
        $requestData = $this->request->params;
        $tblEvents   = TableRegistry::get("Events");
        $eventEntity = $tblEvents->get($requestData['id']);
        $eventEntity->set('is_deleted', 1);
        $result = $tblEvents->save($eventEntity);

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

    public function saveEventSurveys()
    {
        $requestData = $this->request->getData();

        $tblPublicSurveys = TableRegistry::get("PublicSurveys");

        $publicSurveysEntity = $tblPublicSurveys->newEntity();
        $publicSurveysEntity->set('survey_date', date('Y-m-d'));

        $publicSurveysEntity->set('user_ip', $_SERVER['REMOTE_ADDR']);
        $publicSurveysEntity->set('event_id', $requestData['event_id']);
        $publicSurveysEntity->set('name', $requestData['name']);
        $publicSurveysEntity->set('email', $requestData['email']);

        $tblPublicSurveys->save($publicSurveysEntity);
        $tblPublicSurveyVotes = TableRegistry::get("PublicSurveyVotes");

        if (!empty($requestData['artists'])) {
            for ($i = 0; $i < count($requestData['artists']); $i++) {
                $publicSurveyVotesEntity = $tblPublicSurveyVotes->newEntity();
                $publicSurveyVotesEntity->set('public_survey_id', $publicSurveysEntity->id);
                $publicSurveyVotesEntity->set('artist_id', $requestData['artists'][$i]['artist_id']);
                $publicSurveyVotesEntity->set('vote', $requestData['artists'][$i]['vote']);

                $tblPublicSurveyVotes->save($publicSurveyVotesEntity);
            }
        }

        $tblPublicSurveyAnswer = TableRegistry::get("PublicSurveyAnswer");
        if (!empty($requestData['questions'])) {
            for ($i = 0; $i < count($requestData['questions']); $i++) {
                $publicSurveyAnswerEntity = $tblPublicSurveyAnswer->newEntity();
                $publicSurveyAnswerEntity->set('public_survey_id', $publicSurveysEntity->id);
                $publicSurveyAnswerEntity->set('survey_question_id', $requestData['questions'][$i]['question_id']);
                $publicSurveyAnswerEntity->set('answer_id', $requestData['questions'][$i]['option_id']);

                $tblPublicSurveyAnswer->save($publicSurveyAnswerEntity);
            }
        }

        if (!empty($publicSurveysEntity->id)) {
            $return  = true;
            $id      = $publicSurveysEntity->id;
            $message = 'Successfully saved requested data.';
        } else {
            $return  = false;
            $id      = 0;
            $message = 'There was a problem saving requested data.';
        }

        $this->set([
            "status"     => $return,
            "id"         => $id,
            "message"    => $message,
            '_serialize' => ['status', 'id', 'message'],
        ]);
    }

    public function save($eventData)
    {
        $tblEvents = TableRegistry::get("Events");
        $id        = $eventData['id'];
        if (empty($id)) {
            $eventEntity = $tblEvents->newEntity();
            $eventEntity->set('created_at', date('Y-m-d'));
        } else {
            $eventEntity = $tblEvents->get($id);
            $eventEntity->set('updated_at', date('Y-m-d'));
        }

        $start_date = explode("T", $eventData['start_date']);
        $end_date   = explode("T", $eventData['end_date']);

        $eventEntity->set('team_id', $eventData["team_id"]);
        $eventEntity->set('status', 1);
        $eventEntity->set('is_deleted', 0);
        $eventEntity->set('name', $eventData['name']);
        $eventEntity->set('start_date', $start_date[0]);
        $eventEntity->set('end_date', $end_date[0]);
        $eventEntity->set('description', $eventData['description']);
        $eventEntity->set('venue_name', $eventData['venue_name']);
        $eventEntity->set('address_line_1', $eventData['address_line_1']);
        $eventEntity->set('address_line_2', $eventData['address_line_2']);
        $eventEntity->set('public_survey_status', $eventData['public_survey_status']);
        $eventEntity->set('public_survey_title', $eventData['public_survey_title']);
        $eventEntity->set('city', $eventData['city']);
        $eventEntity->set('state', $eventData['state']);
        $eventEntity->set('zip', $eventData['zip']);
        $eventEntity->set('budget_id', $eventData['budget_id']);
        $eventEntity->set('number_of_artist', $eventData['number_of_artist']);
        $eventEntity->set('mode', $eventData['mode']);
        $eventEntity->set('url', $eventData['url']);
        $eventEntity->set('welcome_message', $eventData['welcome_message']);
        $eventEntity->set('legal_disclaimer', $eventData['legal_disclaimer']);
        $eventEntity->set('event_description', $eventData['event_description']);
        $eventEntity->set('opt_in', $eventData['opt_in']);
        $eventEntity->set('opt_in_message', $eventData['opt_in_message']);
        $eventEntity->set('thanks_message', $eventData['thanks_message']);
        $eventEntity->set('review_enable', $eventData['review_enable']);

        if (!empty($eventData["event_picture_temp_id"])) {
            $tblTempUploads = TableRegistry::get("TempUploads");
            try {
                $tmpPhoto         = $tblTempUploads->get($eventData["event_picture_temp_id"]);
                $fileName         = $tmpPhoto->get("file_name");
                $tempFile         = WWW_ROOT . 'uploads' . DS . 'temp' . DS . $fileName;
                $finalDestination = WWW_ROOT . 'uploads' . DS . 'event' . DS . $fileName;
                if (copy($tempFile, $finalDestination)) {
                    $eventEntity->set('profile_picture', $fileName);
                }
            } catch (Cake\Datasource\Exception\RecordNotFoundException $ex) {
                //DO nothing..
            }
            unset($tblTempUploads);
        }

        if (!empty($eventData["survey_main_picture_temp_id"])) {
            $tblTempUploads = TableRegistry::get("TempUploads");
            try {
                $tmpPhoto         = $tblTempUploads->get($eventData["survey_main_picture_temp_id"]);
                $fileName         = $tmpPhoto->get("file_name");
                $tempFile         = WWW_ROOT . 'uploads' . DS . 'temp' . DS . $fileName;
                $finalDestination = WWW_ROOT . 'uploads' . DS . 'event' . DS . $fileName;
                if (copy($tempFile, $finalDestination)) {
                    $eventEntity->set('public_survey_main_picture', $fileName);
                }
            } catch (Cake\Datasource\Exception\RecordNotFoundException $ex) {
                //DO nothing..
            }
            unset($tblTempUploads);
        }

        $tblEvents->save($eventEntity);

        if (!empty($eventEntity->id)) {

            $tblSurveyQuestions       = TableRegistry::get("SurveyQuestions");
            $tblSurveyQuestionOptions = TableRegistry::get("SurveyQuestionOptions");

            foreach ($eventData["survey_questions"] as $question) {
                if (empty($question["question"])) {
                    //continue;
                }
                if (empty($question["id"])) {
                    $surveyQuestionEntity = $tblSurveyQuestions->newEntity();
                } else {
                    try {
                        $surveyQuestionEntity = $tblSurveyQuestions->get($question["id"]);
                    } catch (Cake\Datasource\Exception\RecordNotFoundException $ex) {
                        //escape this question
                        continue;
                    }
                }
                $surveyQuestionEntity->set("event_id", $eventEntity->id);
                $surveyQuestionEntity->set("question", $question["question"]);
                $tblSurveyQuestions->save($surveyQuestionEntity);
                if (!empty($surveyQuestionEntity->errors())) {
                    //TODO: Need to do handle the error and respond with better elaborated message;
                    //For now, just skip the question
                    continue;
                }

                foreach ($question["options"] as $option) {
                    if (empty($option["option"])) {
                        continue;
                    }
                    if (empty($option["id"])) {
                        $questionOptionEntity = $tblSurveyQuestionOptions->newEntity();
                    } else {
                        try {
                            $questionOptionEntity = $tblSurveyQuestionOptions->get($option["id"]);
                        } catch (Cake\Datasource\Exception\RecordNotFoundException $ex) {
                            //escape this question
                            continue;
                        }
                    }
                    $questionOptionEntity->set("survey_question_id", $surveyQuestionEntity->id);
                    $questionOptionEntity->set("options", $option["option"]);
                    $tblSurveyQuestionOptions->save($questionOptionEntity);
                    if (!empty($questionOptionEntity->errors())) {
                        //TODO: Need to do handle the error and respond with better elaborated message;
                    }
                }
            }

            $tblEventTeamMembers = TableRegistry::get("EventTeamMembers");
            $tblEventTeamMembers->deleteAll(['event_id' => $eventEntity->id]);
            if (!empty($eventData['event_team_members'])) {
                for ($i = 0; $i < count($eventData['event_team_members']); $i++) {
                    $eventTeamMemberEntity = $tblEventTeamMembers->newEntity();
                    $eventTeamMemberEntity->set('event_id', $eventEntity->id);
                    $eventTeamMemberEntity->set('team_member_id', $eventData['event_team_members'][$i]['team_member_id']);
                    $eventTeamMemberEntity->set('user_id', $eventData['event_team_members'][$i]['user_id']);

                    $tblEventTeamMembers->save($eventTeamMemberEntity);
                }
            }

            $tblEventGenres       = TableRegistry::get("EventGenres");
            $tblEventDemographics = TableRegistry::get("EventDemographics");
            if (!empty($id)) {
                $getEventGenres = $tblEventGenres->find('all')
                    ->where(['EventGenres.event_id' => $id])
                    ->hydrate(false)
                    ->toArray();
                if (!empty($getEventGenres)) {
                    $tblEventGenres->deleteAll(['event_id' => $id]);
                }
                $getEventDemographics = $tblEventDemographics->find('all')
                    ->where(['EventDemographics.event_id' => $id])
                    ->hydrate(false)
                    ->toArray();
                if (!empty($getEventDemographics)) {
                    $tblEventDemographics->deleteAll(['event_id' => $id]);
                }
            }

            if (!empty($eventData['event_genres'])) {
                for ($i = 0; $i < count($eventData['event_genres']); $i++) {
                    $eventGenresEntity = $tblEventGenres->newEntity();
                    $eventGenresEntity->set('genre_id', $eventData['event_genres'][$i]);
                    $eventGenresEntity->set('event_id', $eventEntity->id);
                    $tblEventGenres->save($eventGenresEntity);
                }
            }

            if (!empty($eventData['event_demographics'])) {
                for ($i = 0; $i < count($eventData['event_demographics']); $i++) {
                    $eventDemographicsEntity = $tblEventDemographics->newEntity();
                    $eventDemographicsEntity->set('demographic_id', $eventData['event_demographics'][$i]);
                    $eventDemographicsEntity->set('event_id', $eventEntity->id);
                    $tblEventDemographics->save($eventDemographicsEntity);
                }
            }

        }

        if (empty($eventEntity->errors())) {
            return $eventEntity->id;
        } else {
            return false;
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

    public function budget()
    {

        error_reporting(0);
        $requestData = $this->request;
        $tblBudget   = TableRegistry::get("Budgets");
        $arrWhere    = ['Budgets.is_deleted' => 0];

        // Prepare the paged query
        $arrBudget = $tblBudget->find('all')

            ->where($arrWhere)
            ->hydrate(false)
            ->toArray();

        $data = $arrBudget;

        $this->set(compact('data'));
        $this->set('_serialize', ['data']);

    }

    public function artistNumber()
    {

        error_reporting(0);
        $requestData      = $this->request;
        $tblArtistNumbers = TableRegistry::get("ArtistNumbers");
        $arrWhere         = ['ArtistNumbers.is_deleted' => 0];

        // Prepare the paged query
        $arrArtistNumbers = $tblArtistNumbers->find('all')

            ->where($arrWhere)
            ->order(['number_of_artist' => 'ASC'])
            ->hydrate(false)
            ->toArray();

        $data = $arrArtistNumbers;

        $this->set(compact('data'));
        $this->set('_serialize', ['data']);

    }

    public function updateEventArtistPick()
    {

        $requestData     = $this->request->getData();
        $tblEventArtists = TableRegistry::get("EventArtists");

        $result = $tblEventArtists->updateAll(['is_picked' => $requestData['status']], ['event_id' => $requestData['eventId'], 'artist_id' => $requestData['artistId']]);

        if (!empty($result)) {
            $return  = true;
            $message = 'Successfully save request data.';
        } else {
            $return  = false;
            $message = 'There is a problem of saving request data.';
        }
        $this->set([
            "status"     => $return,
            "message"    => $message,
            '_serialize' => ['status', 'message'],
        ]);

    }

    public function getTotalPublicSurvey()
    {
        $requestData      = $this->request->params;
        $eventId          = $requestData["eventId"];
        $tblPublicSurveys = TableRegistry::get("PublicSurveys");
        $query            = $tblPublicSurveys->find();
        $query->select(['count' => $query->func()->count('PublicSurveys.email')]);
        $query->where(['PublicSurveys.event_id' => $eventId]);
        $optInsCount       = $query->hydrate(false)->first();
        $publicSurveyCount = $tblPublicSurveys->find()->count();

        $this->set('response', ["opt_ins_count" => $optInsCount['count'], "public_survey_count" => $publicSurveyCount]);
        $this->set('_serialize', ['response']);
    }

    public function getPublicSurveyQuestionAnswerdetails()
    {
        $requestData           = $this->request->params;
        $eventId               = $requestData["eventId"];
        $tblPublicSurveyAnswer = TableRegistry::get("PublicSurveyAnswer");
        $query                 = $tblPublicSurveyAnswer->find()
            ->contain(['PublicSurveys']);
        $query->select([
            'PublicSurveyAnswer.answer_id',
            'count' => $query->func()->count('PublicSurveyAnswer.answer_id'),
        ])
            ->group(["PublicSurveyAnswer.answer_id"])
            ->where(['PublicSurveys.event_id' => $eventId]);

        $rsPublicSurveyAnswer = $query->hydrate(false)
            ->toArray();
        unset($query);

        // Get the total number of vote for that event //
        $tblPublicSurveys = TableRegistry::get("PublicSurveys");
        $query            = $tblPublicSurveys->find()
            ->where(['PublicSurveys.event_id' => $eventId]);
        $publicSurveyCount = $query->count();

        unset($query);

        $tblSurveyQuestions = TableRegistry::get("SurveyQuestions");
        $query              = $tblSurveyQuestions->find()
            ->contain(["SurveyQuestionOptions"])
            ->where(["SurveyQuestions.event_id" => $eventId]);
        $rsSurveyQuestionOption = $query->hydrate(false)->toArray();

        $data = [];
        for ($i = 0; $i < count($rsSurveyQuestionOption); $i++) {
            $row = [];
            for ($j = 0; $j < count($rsSurveyQuestionOption[$i]["survey_question_options"]); $j++) {
                $row[$rsSurveyQuestionOption[$i]["survey_question_options"][$j]["options"]] = 0;
                for ($k = 0; $k < count($rsPublicSurveyAnswer); $k++) {
                    if ($rsPublicSurveyAnswer[$k]["answer_id"] == $rsSurveyQuestionOption[$i]["survey_question_options"][$j]["id"]) {
                        $row[$rsSurveyQuestionOption[$i]["survey_question_options"][$j]["options"]] = $rsPublicSurveyAnswer[$k]["count"] == 0 ? 0 : round(($rsPublicSurveyAnswer[$k]["count"] / $publicSurveyCount) * 100);
                        break;
                    }
                }
            }

            $data[$rsSurveyQuestionOption[$i]["question"]] = $row;
        }

        $this->set('response', ["data" => $data]);
        $this->set('_serialize', ['response']);
    }

    public function getTeamMemberVote()
    {
        $requestData = $this->request->params;
        $eventId     = $requestData["eventId"];

        //Get Event details with associated event team and event artist //
        $tblEvents = TableRegistry::get("Events");
        $query     = $tblEvents->find()->contain([
            "Teams" => [
                "fields" => ["id"],
            ],
            "EventArtists",
        ])->select(["Events.id"])->where(["Events.id" => $eventId]);
        $rsEventDetails = $query->hydrate(false)->first();
        unset($qurey);

        //Get TeamId from  rsEventdetails
        $teamId = $rsEventDetails["team"]["id"];

        $tblTeamSurveys = TableRegistry::get("TeamSurveys");
        $query          = $tblTeamSurveys->find();
        $query->where(['TeamSurveys.event_id' => $eventId]);

        $rsTeamSurveyAtistVotes = $query->hydrate(false)->toArray();
        unset($query);

        $tblTeamMembers = TableRegistry::get("TeamMembers");
        $query          = $tblTeamMembers->find()
            ->contain(["Users"])
            ->select(["TeamMembers.id", "TeamMembers.user_id", "Users.first_name", "Users.last_name", "Users.profile_pic"])
            ->where(["TeamMembers.team_id" => $teamId]);

        $rsTeamMembers = $query->hydrate(false)->toArray();
        unset($qurey);

        $response = ["data" => []];

        for ($p = 0; $p < count($rsEventDetails["event_artists"]); $p++) {
            $artistId                    = $rsEventDetails["event_artists"][$p]["artist_id"];
            $response["data"][$artistId] = [];
            for ($i = 0; $i < count($rsTeamMembers); $i++) {
                $teamMemberId = $rsTeamMembers[$i]["id"];
                $vote         = $this->_checkIfMemberVoteExists($artistId, $teamMemberId, $rsTeamSurveyAtistVotes, $rsTeamMembers);
                array_push($response["data"][$artistId], $vote);
            }
        }

        $this->set('response', $response);
        $this->set('_serialize', ['response']);
    }

    private function _checkIfMemberVoteExists($artist_id, $member_id, &$votes, &$rsTeamMembers)
    {
        $result = ["team_member_id" => $member_id, "vote" => null, "photo" => null];
        foreach ($votes as $vote) {
            if ($vote["team_member_id"] == $member_id && $vote["artist_id"] == $artist_id) {
                $result["vote"] = $vote["vote"];
                for ($i = 0; $i < count($rsTeamMembers); $i++) {
                    if ($rsTeamMembers[$i]["id"] == $member_id) {
                        $result["photo"] = $rsTeamMembers[$i]["user"]["profile_pic"];
                    }
                }
            }
        }
        return $result;
    }

    public function getEventServeyResults()
    {
        $this->_getEventServeyResults(false);
    }

    public function getEventPickedArtists()
    {
        $this->_getEventServeyResults(true);
    }

    private function _getEventServeyResults($isPickedOnly)
    {
        $requestData = $this->request->params;
        $eventId     = $requestData["eventId"];

        // Get Event details with associated event team and event artist //
        $tblEvents = TableRegistry::get("Events");
        $query     = $tblEvents->find()->contain([
            "Teams"        => [
                "fields" => ["id"],
            ],
            "EventArtists" => function ($q) use ($isPickedOnly) {
                $q->contain([
                    "Artists" => [
                        "fields"         => ["name", "id", "profile_picture"], "Budgets",
                        "ArtistChannels" => function ($q) {
                            $q->contain(["Channels" => ["fields" => ["id", "channel_view_count", "channel_subscriber_count"]]]);
                            $q->where(["ArtistChannels.is_primary" => 1]);
                            return $q;
                        },
                    ],
                ]);

                if ($isPickedOnly) {
                    $q->where(["is_picked" => 1]);
                }

                return $q;
            },
        ])->select(["Events.id"])->where(["Events.id" => $eventId]);
        $rsEventDetails = $query->hydrate(false)->first();
        unset($qurey);

        // Get TeamId from  rsEventdetails
        $teamId = $rsEventDetails["team"]["id"];

        //Get the Public Servey votes for the requested event and get the sum of the positive vote//
        $tblPublicSurveyVotes = TableRegistry::get("PublicSurveyVotes");
        $query                = $tblPublicSurveyVotes->find()
            ->contain(['PublicSurveys']);

        $query->select(['PublicSurveyVotes.artist_id', 'count' => $query->func()->sum('PublicSurveyVotes.vote')])
            ->group(['PublicSurveyVotes.artist_id'])
            ->where(['PublicSurveys.event_id' => $eventId]);

        $rsPublicSurveyAtistVotes = $query->hydrate(false)
            ->toArray();

        unset($query);

        // Get the total number of vote for that event //
        $tblPublicSurveys = TableRegistry::get("PublicSurveys");
        $query            = $tblPublicSurveys->find()
            ->where(['PublicSurveys.event_id' => $eventId]);
        $publicSurveyCount = $query->count();

        unset($query);

        $tblTeamSurveys = TableRegistry::get("TeamSurveys");
        $query          = $tblTeamSurveys->find();

        $query->select(['TeamSurveys.artist_id', 'count' => $query->func()->sum('TeamSurveys.vote'), 'total' => $query->func()->count('TeamSurveys.vote')])
            ->group(['TeamSurveys.artist_id'])
            ->where(['TeamSurveys.event_id' => $eventId]);

        $rsTeamSurveyAtistVotes = $query->hydrate(false)->toArray();
        unset($query);

        $tblTeamMembers = TableRegistry::get("TeamMembers");
        $query          = $tblTeamMembers->find()
            ->contain(["Users", "TeamSurveys" => function ($q) use ($eventId) {
                $q->select(["artist_id", "vote", "team_member_id"]);
                $q->where(['TeamSurveys.event_id' => $eventId]);
                return $q;
            }])
            ->select(["TeamMembers.id", "TeamMembers.user_id", "Users.first_name", "Users.last_name", "Users.profile_pic"])
            ->where(["TeamMembers.team_id" => $teamId]);

        $rsTeamMemberSurveyVotes = $query->hydrate(false)->toArray();
        unset($qurey);

        $matrix           = [];
        $membersVoteCount = 0;

        for ($i = 0; $i < count($rsEventDetails["event_artists"]); $i++) {
            $row = [
                "channel_subscriber_count" => $rsEventDetails["event_artists"][$i]["artist"]["artist_channels"][0]["channel"]["channel_subscriber_count"],
                "channel_view_count"       => $rsEventDetails["event_artists"][$i]["artist"]["artist_channels"][0]["channel"]["channel_view_count"],
                "budget"                   => $rsEventDetails["event_artists"][$i]["artist"]["budget"]["amount"],
                "artistId"                 => $rsEventDetails["event_artists"][$i]["artist"]["id"],
                "isPicked"                 => $rsEventDetails["event_artists"][$i]["is_picked"],
                "quoteStatus"              => $rsEventDetails["event_artists"][$i]["quote_status"],
                "artistProfilePicture"     => $rsEventDetails["event_artists"][$i]["artist"]["profile_picture"],
                "public"                   => 0,
                "team"                     => 0,
                "team_progress"            => 0,
                "members"                  => array_fill(0, count($rsTeamMemberSurveyVotes), null),
            ];
            $teamProgress = 0;

            for ($j = 0; $j < count($rsPublicSurveyAtistVotes); $j++) {
                if ($rsPublicSurveyAtistVotes[$j]["artist_id"] == $rsEventDetails["event_artists"][$i]["artist_id"]) {
                    $row["public"] = round($publicSurveyCount == 0 ? 0 : (($rsPublicSurveyAtistVotes[$j]["count"] / $publicSurveyCount) * 100));
                    break;
                }
            }

            $teamSurveyArtistVotesCounter = 0;
            for ($teamSurveyArtistVotesCounter = 0; $teamSurveyArtistVotesCounter < count($rsTeamSurveyAtistVotes); $teamSurveyArtistVotesCounter++) {
                if ($rsTeamSurveyAtistVotes[$teamSurveyArtistVotesCounter]["artist_id"] == $rsEventDetails["event_artists"][$i]["artist_id"]) {
                    $row["team"] = count($rsTeamSurveyAtistVotes) == 0 ? 0 : round((100 / $rsTeamSurveyAtistVotes[$teamSurveyArtistVotesCounter]["total"]) * $rsTeamSurveyAtistVotes[$teamSurveyArtistVotesCounter]["count"]);
                    break;
                }
            }

            for ($j = 0; $j < count($rsTeamMemberSurveyVotes); $j++) {
                for ($k = 0; $k < count($rsTeamMemberSurveyVotes[$j]["team_surveys"]); $k++) {
                    if ($rsTeamMemberSurveyVotes[$j]["team_surveys"][$k]["artist_id"] == $rsEventDetails["event_artists"][$i]["artist_id"]) {
                        $row["members"][$j] = $rsTeamMemberSurveyVotes[$j]["team_surveys"][$k]["vote"];
                        $membersVoteCount++;
                        break;
                    }
                }
            }

            $teamTotalVotes       = !empty($rsTeamSurveyAtistVotes) ? $rsTeamSurveyAtistVotes[$teamSurveyArtistVotesCounter]["total"] : 0;
            $teamProgress         = $teamTotalVotes == 0 ? 0 : round((100 / count($rsTeamMemberSurveyVotes)) * $teamTotalVotes);
            $row["team_progress"] = $teamProgress;

            $matrix[$rsEventDetails["event_artists"][$i]["artist"]["name"]] = $row;
        }

        $members = [];
        for ($i = 0; $i < count($rsTeamMemberSurveyVotes); $i++) {
            array_push($members, $rsTeamMemberSurveyVotes[$i]["user"]);
        }

        $teamProgress = count($rsEventDetails["event_artists"]) == 0 ? 0 : number_format(($membersVoteCount / (count($members) * count($rsEventDetails["event_artists"])) * 100), 0);

        $this->set('response', ["members" => $members, "data" => $matrix, "team_progress" => $teamProgress]);
        $this->set('_serialize', ['response']);
    }

}
