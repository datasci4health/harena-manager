'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Database = use('Database')

const Quest = use('App/Models/v1/Quest');
const User = use('App/Models/v1/User');
const Case = use('App/Models/v1/Case');
const Role = use('App/Models/v1/Role');

const uuidv4 = require('uuid/v4');

class QuestController {

    async index({ response }) {
        console.log('aqui')
        try{
            let quests = await Quest.all()
            return response.json(quests)
        } catch(e){
            return response.status(e.status).json({ message: e.message })
        }
    }



    async store({ request, response, auth }) {
        let trx = await Database.beginTransaction()

        try{

            let user = auth.user
            let q = request.all()

            q.id = await uuidv4()

            let quest = new Quest()
            quest.merge(q)

            await quest.save(trx)

            await user.quests().attach([quest.id], (row) => {
                row.role = 0
            }, trx)
            trx.commit()

            return response.json(quest)
        } catch(e){
            trs.rollback()
            console.log(e)

            if (e.code === 'ER_DUP_ENTRY') {
                return response.status(409).json({ code: e.code, message: e.sqlMessage })
            }
            return response.status(e.status).json({ message: e.message })
        }
    }

    async link_user({ request, response }) {
        try {
            const {user_id, quest_id, roleSlug} = request.post()
            let user = await User.find(user_id)
            let quest = await Quest.find(quest_id)
            let role = await Role.findBy('slug', roleSlug)

            if (role == null)
                return response.status(500).json('Invalid roleSlug')

            if (await user.check_role(role.slug)){
                await user.quests().attach([quest.id], (row) => {
                    if (role.slug == 'author'){
                        row.role = 1
                    }
                    if (role.slug == 'player'){
                        row.role = 2
                    }
                })

                return response.json(role.slug + ' ' + user.username + ' was added to the quest '+ quest.title)
            } else {
                return response.status(500).json('target user must have ' + role.slug + ' role')
            }
        } catch (e) {
            console.log(e)
            return response.status(500).json(e)
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


    async listUsers({ request, response }) {
        try{
            let questId = request.input('questId')

            let quest = await Quest.find(questId)

            return response.json(await quest.users().fetch())
        } catch(e){
            console.log(e)
            return response.status(500).json(e)
        }
    }

    async listCases({ request, response }) {
        try{
            let questId = request.input('questId')

            let quest = await Quest.find(questId)

            return response.json(await quest.cases().fetch())
        } catch(e){
            console.log(e)
        }
    }

}

module.exports = QuestController
