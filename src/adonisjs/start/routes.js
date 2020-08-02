'use strict'


const Route   = use('Route')

/*
|----------------------------------------------------------------------------------------------
|  index                                                   
|----------------------------------------------------------------------------------------------
*/
Route.get('/', () => { return 'Hello from Harena Manager'} )


/*
|----------------------------------------------------------------------------------------------
|       api: v1                                                   
|  resource: /user
|----------------------------------------------------------------------------------------------
*/
Route.group(() => { 
	Route.post('',		 	'v1/UserController.store')
	Route.post('login',		'v1/AuthController.login') 
					
}).prefix('/api/v1/user')



/*
|----------------------------------------------------------------------------------------------
|       api: v2                                                   
|  resource: /auth
|----------------------------------------------------------------------------------------------
*/
Route.group(() => { 
                    Route.post('login',		'AuthController.login') 
					Route.post('logout', 	'AuthController.logout').middleware(['auth'])

}).prefix('/api/v2/auth')


Route.post('/api/v1/user/register', 'v1/UserController.store')
Route.post('/api/v1/user/login',    'v1/AuthController.login') 


Route.group(() => { 

    Route.get( 	 'cases',        	'v1/UserController.list_cases')  
	Route.get(   'quests',  		'v1/UserController.list_quests')
	Route.get(   'cases_by_quest', 'v1/UserController.list_cases_by_quests')

    Route.get(   ':id',             'v1/UserController.show') 
    Route.put(   ':id',             'v1/UserController.update')
    Route.delete(':id',             'v1/UserController.destroy')

}).prefix('/api/v1/user').middleware(['auth'])



Route.get('/api/v1/users',           'v1/UserController.index').middleware(['auth', 'is:admin'])




/*
|----------------------------------------------------------------------------------------------
|       api: v1                                                   
|  resource: /case
|----------------------------------------------------------------------------------------------
*/
Route.group(() => {
	
	Route.get( 	 '',            'v1/CaseController.index')
	Route.get(   ':id',         'v1/CaseController.show') 
	Route.post(  '',			'v1/CaseController.store')
	Route.put(   ':id',         'v1/CaseController.update')
	Route.delete(':id',         'v1/CaseController.destroy')
	Route.post(  'share',       'v1/CaseController.share')

}).prefix('/api/v1/case').middleware(['auth', 'is:author'])


/*
|----------------------------------------------------------------------------------------------
|       api: v1                                                   
|  resource: /artifacts
|----------------------------------------------------------------------------------------------
*/
Route.group(() => {
	
	Route.post(  '',                    'v1/ArtifactController.store')
	
}).prefix('/api/v1/artifact/').middleware(['auth:jwt', 'is:author'])

/*
|----------------------------------------------------------------------------------------------
|       api: v1
|  resource: /quest
|----------------------------------------------------------------------------------------------
*/

Route.get('/api/v1/play/quest/cases', 'v1/QuestController.list_cases').middleware(['auth', 'is:player'])
Route.get('/api/v1/auth/quest/cases', 'v1/QuestController.list_cases').middleware(['auth', 'is:author'])


Route.group(() => {

	Route.get(   '',     			'v1/QuestController.index')
	Route.put(   '',             	'v1/QuestController.store')

	Route.post(  'link/user',		'v1/QuestController.link_user')
	Route.post(  'link/case',		'v1/QuestController.link_case')
	Route.get(   ':id/users',      	'v1/QuestController.list_users')

}).prefix('/api/v1/quest').middleware('auth', 'is:admin')


/*
|----------------------------------------------------------------------------------------------
|       api: v1
|  resource: /admin
|----------------------------------------------------------------------------------------------
*/
Route.group(() => {
	Route.put(   'role',             		'v1/AdminController.create_role')
	Route.put(   'permission',        		'v1/AdminController.create_permission')
	Route.get(   'roles',               	'v1/AdminController.list_roles')
	Route.get(   'permissions',             'v1/AdminController.list_permissions')

	Route.post(  'role/link/user',			'v1/AdminController.link_role_user')
	Route.post(  'role/link/permission',	'v1/AdminController.link_role_permission')

	Route.get(   'user/:id/roles',		  	'v1/AdminController.list_roles_by_user')
	Route.get(   'role/:id/permissions',	'v1/AdminController.list_permissions_by_role')
	Route.get(   'user/:id/permissions',	'v1/AdminController.list_permissions_by_user')

	Route.post(   'institution',       		'v1/InstitutionController.store')

	Route.post(   'revoke_tokens',     		'v1/AdminController.revoke_tokens')


}).prefix('/api/v1/admin').middleware(['auth', 'is:admin'])




/* Test route */
Route.get('/api/imagetest', 	'TestController.index')
Route.post('/', 				'TestController.create').as('profile');
