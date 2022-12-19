<?php

namespace App\Controller\Api;

use App\Controller\ApiController;
use Cake\ORM\TableRegistry;

class MastersController extends ApiController {

    public function initialize() {
        parent::initialize();
    }

    
    public function getGenres() {
 
        $tblGenres = TableRegistry::get("genres");
        $arrGenres = $tblGenres->find()->hydrate(false)->toArray();

        $this->set([
            'response' => $arrGenres,
            '_serialize' => ['response']
        ]);
    }
    
    public function getGenreById() {
        $arr_genres = explode(",", $this->request->query["GenreIds"]);
        $tblGenres = TableRegistry::get("genres");
        $arrGenres = $tblGenres->find()->where(["genres.id IN " =>$arr_genres])->hydrate(false)->toArray();
        $this->set([
            'response' => $arrGenres,
            '_serialize' => ['response']
        ]);
    }

    public function budget() {
       
        error_reporting(0);
        $requestData = $this->request;
        $tblBudget = TableRegistry::get("Budgets");
        $arrWhere = ['Budgets.is_deleted' => 0];
        
        // Prepare the paged query
        $arrBudget = $tblBudget->find('all')
                
               ->where($arrWhere)
                ->hydrate(false)
                ->toArray();
      
        $data = $arrBudget;        
        
        $this->set(compact('data'));
        $this->set('_serialize', ['data']);
        
    }

    public function genres() {
        $get_data = $this->request->query('q');
        error_reporting(0);
        $arrWhere=[];
        if(!empty($get_data)) {
            $arrWhere = ['Genres.name LIKE' => '%'.$get_data.'%'];
        }
       $arrWhere['Genres.is_deleted']=0;
      
        
        $tblGenres = TableRegistry::get("Genres");
        $arrGenres = $tblGenres->find('all')
                
               ->where($arrWhere)
                ->hydrate(false)
                ->toArray();
        
        $data = $arrGenres;        
        
        $this->set(compact('data'));
        $this->set('_serialize', ['data']);
        
    }

    public function roles() {

        error_reporting(0);
        $requestData = $this->request;
        $tblTeamRoles = TableRegistry::get("TeamRoles");
        $arrWhere = ['TeamRoles.is_deleted' => 0];

        // Prepare the paged query
        $arrTeamRoles = $tblTeamRoles->find('all')
                ->where($arrWhere)
                ->hydrate(false)
                ->toArray();

        $data = $arrTeamRoles;

        $this->set(compact('data'));
        $this->set('_serialize', ['data']);
    }

    public function getEventSurveyQueries() {

        $requestData = $this->request;
        $tblSurveyQueries = TableRegistry::get("SurveyQuestions");
        $eventId = $requestData["eventId"];
        // Prepare the paged query
        $arrSurveyQueries = $tblSurveyQueries->find('all')
                ->contain(["SurveyQuestionOptions"])
                ->where(["event_id" => $eventId])
                ->hydrate(false)
                ->toArray();

        $data = $arrSurveyQueries;

        $this->set(compact('data'));
        $this->set('_serialize', ['data']);
    }



    public function getDemographics() {

        $tblDemographics = TableRegistry::get("demographics");
        $arrDemographics = $tblDemographics->find()->hydrate(false)->toArray();

        $this->set([
            'response' => $arrDemographics,
            '_serialize' => ['response']
        ]);
    }

    
}