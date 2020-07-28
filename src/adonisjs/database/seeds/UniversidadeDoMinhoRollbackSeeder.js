'use strict'

/*
|--------------------------------------------------------------------------
| UniversidadeDoMinhoSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Database = use('Database')
const uuidv4 = require('uuid/v4');


const User = use('App/Models/v1/User');
const Quest = use('App/Models/v1/Quest');

class UniversidadeDoMinhoSeeder {


  	async run () {
		let trx = await Database.beginTransaction()

  		try{
		
			let users = [{email: 'minho1@mail.com'}, {email: 'minho2@mail.com'}, {email: 'minho3@mail.com'}]

			for (var i = 0; i < users.length; i++) {
				const user = await User.findBy('email', users[i].email)

				await user.quests().detach()
				await user.delete(trx)

			}

			const quest = await Quest.findBy('title', 'Decisões Extremas')
			await quest.cases().detach()
			await quest.delete(trx)

		    trx.commit()
  		} catch(e){
			console.log('Error on rollback-seed process. Transactions rolled back. Log:')
      		console.log(e)

		    trx.rollback()
  		}
		
  	}
}

module.exports = UniversidadeDoMinhoSeeder
