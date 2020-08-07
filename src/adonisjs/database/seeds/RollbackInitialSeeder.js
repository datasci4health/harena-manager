'use strict'

/*
|--------------------------------------------------------------------------
| RollbackInitialSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const CaseVersion = use('App/Models/v1/CaseVersion');
const Case = use('App/Models/v1/Case');
const User = use('App/Models/v1/User');
const Role = use('App/Models/v1/Role');
const Permission = use('App/Models/v1/Permission');
const Quest = use('App/Models/v1/Quest');
const Token = use('App/Models/v1/Token');

const Database = use('Database')

class RollbackInitialSeeder {
  async run () {
  	let trx = await Database.beginTransaction()
  	
  	try{
      let c = await Case.findBy('title', 'default-case')
		  let versions = await c.versions().fetch()
      let cvs = versions.rows

      await c.versions().delete()
      await c.users().detach()
      await c.delete(trx)


      let slug_roles = ['admin', 'author', 'player'] 

      for (var i = 0; i < slug_roles.length; i++) {
        let role = await Role.findBy('slug', slug_roles[i])

        await role.permissions().detach()
        await role.users().detach()
        await role.delete(trx)
      }

      // let slug_permissions = ['admin_permissions', 'author_permissions', 'player_permissions'] 

      // for (var i = 0; i < slug_permissions.length; i++) {
      //   let permission = await Permission.findBy('slug', slug_permissions[i])
      //   await permission.delete(trx)
      // }

      const quest = await Quest.findBy('title', 'default-quest')
      await quest.cases().detach()
      await quest.users().detach()

      await quest.delete(trx)

      let user = await User.findBy('username', 'jacinto')
      await user.delete(trx)

      trx.commit()
    } catch(e){
      console.log('Error on seed process. Transactions rolled back. Log:')
      console.log(e)

      trx.rollback()
    }
  }
}

module.exports = RollbackInitialSeeder