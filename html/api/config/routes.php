<?php

use Cake\Core\Plugin;
use Cake\Routing\RouteBuilder;
use Cake\Routing\Router;
use Cake\Routing\Route\DashedRoute;

Router::defaultRouteClass(DashedRoute::class);

Router::scope('/', function (RouteBuilder $routes) {
    $routes->connect('/', ['controller' => 'Logins', 'action' => 'index']);
    $routes->fallbacks(DashedRoute::class);
});

Router::prefix('api', function ($routes) {
    $routes->extensions(['json']);

    $routes->resources('Masters', [
        'map' => [
            '/genres' => [
                'action' => 'getGenres',
                'method' => 'GET'
            ],
            '/demographics' => [
                'action' => 'getDemographics',
                'method' => 'GET'
            ],
            '/surveyQueries' => [
                'action'  => 'getSurveyQueries',
                'methode' => 'GET'
            ],
            '/budgets' => [
                'action' => 'budget',
                'method' => 'GET' 
            ],
            '/getGenres' => [
                'action' => 'genres',
                'method' => 'GET' 
            ],
            '/roles' => [
                'action' => 'roles',
                'method' => 'GET' 
            ],
            '/:eventId/getEventSurveyQueries' => [
                'action' => 'getEventSurveyQueries',
                'method' => 'GET'
            ],

        ]
    ]);
    
    // User api route do below
    $routes->resources('Users', [
        'map' => [
            '/list' => [
                'action' => 'index',
                'method' => 'GET'
            ],
            '/:userId/getDetailsById' => [
                'action' => 'getDetailsById',
                'method' => 'GET'
            ],
            '/delete/:id' => [
                'action' => 'delete',
                'method' => 'DELETE'
            ],
            '/create' => [
                'action' => 'create',
                'method' => 'POST'
            ],
            '/update' => [
                'action' => 'update',
                'method' => 'PUT' 
            ],
            '/userLogin' => [
                'action' => 'login',
                'method' => 'POST' 
            ],
             '/verify' => [
                'action' => 'verifyUser',
                'method' => 'POST' 
            ],
            '/resetPassword' => [
                'action' => 'resetPassword',
                'method' => 'POST' 
            ],
            '/changePassword' => [
                'action' => 'changePassword',
                'method' => 'POST' 
            ],
        ]
    ]);
    // Teams  api route do below
    $routes->resources('Teams', [
        'map' => [
            '/list' => [
                'action' => 'index',
                'method' => 'GET'
            ],
            '/delete/:id' => [
                'action' => 'delete',
                'method' => 'DELETE'
            ],
            '/create' => [
                'action' => 'create',
                'method' => 'POST'
            ],
            '/update' => [
                'action' => 'update',
                'method' => 'PUT' 
            ],
            '/roles' => [
                'action' => 'roles',
                'method' => 'GET' 
            ],
            '/:teamId/members' => [
                'action' => 'addMemberToTeam',
                'method' => 'POST' 
            ],
            '/:teamId/members/:memberId' => [
                'action' => 'removeMemberFromTeam',
                'method' => 'DELETE' 
            ],
            '/changeUserStatusForTeam' => [
                'action' => 'changeUserStatusForTeam',
                'method' => 'POST' 
            ],
            
        ]
    ]);

    // Team Member api route do below
    $routes->resources('Teams/Members', [
        'map' => [
            '/search/:page/:records/*' => [
                'action' => 'index',
                'method' => 'GET'
            ],
            '/delete/:id' => [
                'action' => 'delete',
                'method' => 'DELETE'
            ],
            '/create' => [
                'action' => 'create',
                'method' => 'POST'
            ],
            '/update/:id' => [
                'action' => 'update',
                'method' => 'PUT' 
            ],
            '/team/:teamId/members' => [
                'action' => 'addMemberToTeam',
                'method' => 'POST' 
            ],
            '/:teamId/members/:membersId' => [
                'action' => 'removeMemberFromTeam',
                'method' => 'DELETE' 
            ],
        ]
    ]);


    // Event api route do below
    $routes->resources('Events', [
        'map' => [
            '/list' => [
                'action' => 'index',
                'method' => 'GET'
            ],
            '/add-artist' => [
                'action' => 'addArtist',
                'method' => 'POST'
            ],
            '/:eventId/artist/:artistId' => [
                'action' => 'removeArtist',
                'method' => 'DELETE'
            ],
			'/details/:id' => [
				'action' => 'getOne',
				'method' => 'GET'
			],
            '/delete/:id' => [
                'action' => 'delete',
                'method' => 'DELETE'
            ],
            '/create' => [
                'action' => 'create',
                'method' => 'POST'
            ],
            '/update' => [
                'action' => 'update',
                'method' => 'PUT' 
            ],
            '/addTeamMemberVote' => [
                'action' => 'addTeamMemberVote',
                'method' => 'POST' 
            ],
            '/budgets' => [
                'action' => 'budget',
                'method' => 'GET' 
            ],
            '/artistNumber' => [
                'action' => 'artistNumber',
                'method' => 'GET' 
            ],
            '/saveEventSurveys' => [
                'action' => 'saveEventSurveys',
                'method' => 'POST'
            ],
            '/:eventId/getEventServeyResults' => [
                'action' => 'getEventServeyResults',
                'method' => 'GET'
            ],
            '/updateEventArtistPick' => [
                'action' => 'updateEventArtistPick',
                'method' => 'PUT'
            ],
            '/:eventId/getEventPickedArtists' => [
                'action' => 'getEventPickedArtists',
                'method' => 'GET'
            ],
            '/:eventId/getTotalPublicSurvey' => [
                'action' => 'getTotalPublicSurvey',
                'method' => 'GET'
            ],
            '/:eventId/getPublicSurveyQuestionAnswerdetails' => [
                'action' => 'getPublicSurveyQuestionAnswerdetails',
                'method' => 'GET'
            ],
            '/:eventId/getTeamMemberVote' => [
                'action' => 'getTeamMemberVote',
                'method' => 'GET'
            ],
            '/addEventTeamMember' => [
                'action' => 'addEventTeamMember',
                'method' => 'POST'
            ],
            ':eventId/updateArtistStatus' => [
                'action' => 'changeArtistStatus',
                'method' => 'POST'
            ]
        ]
    ]);

    // Artist api route do below
    $routes->resources('Artists', [
        'map' => [
            '/list' => [
                'action' => 'index',
                'method' => 'GET'
            ],
            '/delete/:id' => [
                'action' => 'delete',
                'method' => 'DELETE'
            ],
            '/create' => [
                'action' => 'create',
                'method' => 'POST'
            ],
            '/update/:id' => [
                'action' => 'update',
                'method' => 'PUT' 
            ],
            '/:id/getDetails' => [
                'action' => 'getDetails',
                'method' => 'GET' 
            ],
            '/:artistId/getRelatedArtists' => [
                'action' => 'getRelatedArtists',
                'method' => 'GET' 
            ]
            
        ]
    ]);


    $routes->resources('Youtube', [
        'map' => [
            '/live/:artist_id' => [
                'action' => 'live',
                'method' => 'GET'
            ]
        ]
    ]);




});

Plugin::routes();
