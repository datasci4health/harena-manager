'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Quest = use('App/Models/v1/Quest');
const User = use('App/Models/v1/User');
const Case = use('App/Models/v1/Case');

const uuidv4 = require('uuid/v4');

class QuestController {

    async store({ request, response, auth }) {
        try{
            let q = request.all()

            q.id = await uuidv4()

            let quest = new Quest()
            quest.merge(q)

            await quest.save()

            return response.json(quest)
        } catch(e){
            console.log(e)

            if (e.code === 'ER_DUP_ENTRY') {
                return response.status(409).json({ code: e.code, message: e.sqlMessage })
            }
            return response.status(e.status).json({ message: e.message })
        }
    }

    async link_user({ request, response }) {
        try {
            const {user_id, quest_id} = request.post()
            let user = await User.find(user_id)
            let quest = await Quest.find(quest_id)

            await quest.users().attach(user.id)

            user.quests = await user.quests().fetch()

            return response.json(user)
        } catch (e) {
            console.log(e)
            if (e.code === 'ER_DUP_ENTRY') {
                return response.status(409).json({ message: e.message })
            }

            return response.json({ message: e.toString() })
        }
    }

    async link_case({ request, response }) {
        try {
            const {quest_id, case_id, order_position} = request.post()

            // let c = await Case.find(case_id)
            let quest = await Quest.find(quest_id)

            await quest.cases().attach(case_id, (row) => {
                row.order_position = order_position
            })

            quest.cases = await quest.cases().fetch()

            return response.json(quest)
        } catch (e) {
            console.log(e)
            if (e.code === 'ER_DUP_ENTRY') {
                return response.status(409).json({ message: e.message })
            }

            return response.status(500).json( e )
        }
    }


    async list_users({ params, response }) {
        try{
            let quest = await Quest.find(params.id)

            return response.json(await quest.users().fetch())
        } catch(e){
            console.log(e)
        }
    }

    async list_cases({ request, response, auth }) {
        try{
            let use = await auth.user

            Database
              .select('*')
              .from('quests')
              .leftJoin('users', 'quests.user_id', 'users.id')



            let quest_id = request.input('quest_id')
            let quest = await Quest.find(quest_id)
            
            return response.json(await quest.cases().fetch())
        } catch(e){
            console.log(e)
        }
    }

    async index({ response }) {
        try{
            let quests = await Quest.all()
            return response.json(quests)
        } catch(e){
            return response.status(e.status).json({ message: e.message })
        }
    }
}

module.exports = QuestController
