<?php

 namespace App\Controller;
 
 use App\Controller\AppController;
 use Cake\Event\Event;
 use Cake\ORM\TableRegistry;
 
 class DownloadEventSurveysController extends AppController{
    public function index($eventId) {
    	$this->autoRender = false;

		$tblPublicSurveyVotes = TableRegistry::get("PublicSurveyVotes");        
        $query = $tblPublicSurveyVotes->find()
					->contain(['PublicSurveys']);
					
		$tblPublicSurveys = TableRegistry::get("PublicSurveys");
		$query = 	$tblPublicSurveys->find()
		            ->contain([
		            	"PublicSurveyVotes" =>["Artists"],
		            	"PublicSurveyAnswer" => ["SurveyQuestions","Answers"]
		            	])
					->where(['PublicSurveys.event_id' => $eventId]);
		$rsPublicSurvey = $query->hydrate(false)->toArray();

		//echo "<pre/>";print_r($rsPublicSurvey);exit;

		$csv = [];
		$csv[0] = [];

		//Prepare Header//
		array_push($csv[0], "Date");
		array_push($csv[0], "Name");
		array_push($csv[0], "Email");
		for($i=0;$i<count($rsPublicSurvey[0]["public_survey_votes"]);$i++) {
			array_push($csv[0], $rsPublicSurvey[0]["public_survey_votes"][$i]["artist"]["name"]);
		}
		for($i=0;$i<count($rsPublicSurvey[0]["public_survey_answer"]);$i++) {
			array_push($csv[0], $rsPublicSurvey[0]["public_survey_answer"][$i]["survey_question"]["question"]);
		}

		for($j=0;$j<count($rsPublicSurvey);$j++) {
			$csv[$j+1] = [];
            array_push($csv[$j+1], $rsPublicSurvey[$j]["survey_date"]->format("m-d-Y"));
            array_push($csv[$j+1], $rsPublicSurvey[$j]["name"]);
            array_push($csv[$j+1], $rsPublicSurvey[$j]["email"]);

            for($i=0;$i<count($rsPublicSurvey[$j]["public_survey_votes"]);$i++) {
				array_push($csv[$j+1], $rsPublicSurvey[$j]["public_survey_votes"][$i]["vote"] ? "Yes" : "No");
			}

			for($i=0;$i<count($rsPublicSurvey[$j]["public_survey_answer"]);$i++) {
				array_push($csv[$j+1], $rsPublicSurvey[$j]["public_survey_answer"][$i]["answer"]["options"]);
			}
		}

		$str_csv = "";
		foreach($csv as $row){
			$str_csv .= "\"" . implode("\",\"", $row) . "\"\n";
		}

		$mime = 'application/octet-stream';
		header('Content-Type: ' . $mime);
		header('Content-Disposition: attachment; filename="survey-data.csv"');
		header('Content-Transfer-Encoding: binary');
		header('Content-Length: ' . sprintf('%d', strlen($str_csv)));
		header('Expires: 0');        // check for IE only headers
		if (isset($_SERVER['HTTP_USER_AGENT']) && (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false)) {
		   header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		   header('Pragma: public');
		} else {
		   header('Pragma: no-cache');
		}
	
		echo $str_csv;	
    }
    
   
 }
