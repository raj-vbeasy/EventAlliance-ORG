<?php

 namespace App\Controller;
 
 use App\Controller\AppController;
 use Cake\Event\Event;
 use Cake\ORM\TableRegistry;
 use Cake\Routing\Router;
 use Cake\Utility\Text;
 
 class UploaderController extends AppController{
    public function index(){
		if ($this->request->is('post')) {
			$this->response->type('json');  // this will convert your response to json
			$uuid = Text::uuid();
			$originalFileName = $this->request->data["files"]["name"];
			$fileNameParts = explode(".", $originalFileName);
			$extension = $fileNameParts[count($fileNameParts)-1];
			$tempFileName = $uuid.'.'.$extension; 
			$uploadPath = WWW_ROOT. 'uploads'.DS.'user'.DS.$tempFileName;
			$result = copy($this->request->data["files"]["tmp_name"], $uploadPath);
			if($result === true){
				$tblTempUploads = TableRegistry::get("TempUploads"); 
				$tempUploadEntity = $tblTempUploads->newEntity();
				$tempUploadEntity->set("file_name", $tempFileName);
				$tblTempUploads->save($tempUploadEntity);
				if(empty($tempUploadEntity->errors())){
					$uploadedFileUrl = Router::url('/', true) . "uploads/user/" . $tempFileName;
					$this->response->body(json_encode(["status" => true, "message" => "File uploaded successfully", "data" => ["id" => $tempUploadEntity->id, "fileName" => $tempFileName , "fileUrl" => $uploadedFileUrl]]));
				} else {
					$this->response->body(json_encode(["status" => false, "message" => "There was an error uploading the requested file.", "error"=>1]));
				}
            } else {
				$this->response->body(json_encode(["status" => false, "message" => "There was an error uploading the requested file.", "error"=>2]));
			}
		} else {
			$this->response->body(json_encode(["status" => false, "message" => "Invalid request. Only POST request is accepted", "error"=>3]));
		}
		
		return $this->response;
    }   
 }
