'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Database = use('Database')
const Helpers = use('Helpers')
const Drive = use('Drive')

const Quest = use('App/Models/v1/Quest')
const User = use('App/Models/v1/User')
const Case = use('App/Models/v1/Case')
const Role = use('App/Models/v1/Role')
const Artifact = use('App/Models/v1/Artifact')

const uuidv4 = require('uuid/v4')

class QuestController {
  async index ({ response }) {
    try {
      const quests = await Quest.all()
      return response.json(quests)
    } catch (e) {
      return response.status(e.status).json({ message: e.message })
    }
  }

  async store ({ request, response, auth }) {
    const trx = await Database.beginTransaction()
    try {
      const user = auth.user

      const quest = new Quest()
      quest.id = await uuidv4()

      const q = request.all()
      q.color = q.color ? q.color : '#505050'
      q.artifact_id = q.artifact_id ? q.artifact_id : 'default-quest-image'
      // if(q.color == null || q.color =='')
      //   q.color = '#505050'
      // if(q.artifact_id == null || q.artifact_id =='')
      //   q.artifact_id = 'default-quest-image-00000-0000-00000'

      quest.merge(q)

      await quest.save(trx)
      await user.quests().attach([quest.id], (row) => {
        row.role = 0
      }, trx)
      trx.commit()

      return response.json(quest)
    } catch (e) {
      trx.rollback()
      console.log(e)

      if (e.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({ code: e.code, message: e.sqlMessage })
      }
      return response.status(e.status).json({ message: e.message })
    }
  }


  async update ({ params, request, response }) {

    try {

      const q = await Quest.find(params.id)

      if (q != null) {
        q.title = request.input('title')
        q.color = request.input('color')

        await q.save()
        return response.json(q)
      } else return response.status(500).json('quest not found, update failed')
    } catch (e) {
      console.log(e)
      return response.status(500).json({ message: e })
    }
  }


  async destroy ({ params, response }) {
    const trx = await Database.beginTransaction()
    try {
      const q = await Quest.findBy('id', params.id)

      if (q != null) {
        console.log('===== Deleting quest...')
        console.log(q)
        await q.users().detach()
        await q.cases().detach()
        let artifact = await Artifact.find(q.artifact_id)
        await q.artifact().dissociate()
        try {
          const artifactPath = Helpers.publicPath('/resources/artifacts/quests/') + params.id + '/'

          if (artifact.id === 'default-quest-image') {
            console.log('Cannot delete default quest image...Moving on...')
          } else {
            await artifact.delete(trx)
            await Drive.delete(artifactPath)
          }
        } catch (e) {
          console.log('Error deleting artifact quest')
          console.log(e)
        }
        await q.delete(trx)

        // await c.users().detach()
        // await c.quests().detach()
        // await c.artifacts().delete()
        //
        // await c.delete(trx)

        trx.commit()
        return response.json('Quest deletion successfull')
      } else {
        trx.rollback()
        return response.status(500).json('quest not found')
      }
    } catch (e) {
      console.log('Some error: ' + e)
      trx.rollback()

      console.log(e)
      return response.status(500).json({ message: e })
    }
  }


  async linkUser ({ request, response }) {
    const trx = await Database.beginTransaction()

    try {
      const { userId, questId, permission } = request.post()

      if (permission != 'read' && permission != 'share' && permission != 'write'){
        return response.json('invalid permission')
      }

      const user = await User.find(userId)
      const quest = await Quest.find(questId)

      await user.quests().detach(null, trx)

      if (permission == 'read'){
        if (await user.checkRole('player') || await user.checkRole('author')){
          await user.quests().attach([quest.id], (row) => {
            row.permission = permission
          }, trx)
        }else {
          trx.rollback()
          return response.status(500).json('target user must be an author or a player to be elegible for such permission')
        }
      }

      if (permission == 'write' || permission == 'share'){
        if (await user.checkRole('author')){
          await user.quests().attach([quest.id], (row) => {
            row.permission = permission
          }, trx)
        } else {
          trx.rollback()
          return response.status(500).json('target user must be an author to be elegible for such permission')
        }
      }

      trx.commit()
      return response.json('user and quest successfully linked')
    } catch (e) {
      trx.rollback()
      console.log(e)
      return response.status(500).json(e)
    }
  }

  async linkCase ({ request, response, auth }) {
    try {
      const loggedUser = auth.user
      const { questId, caseId, orderPosition } = request.post()

      if (await loggedUser.checkCasePermission(caseId, 'share')){

        const quest = await Quest.find(questId)

        await quest.cases().attach(caseId, (row) => {
          row.order_position = orderPosition
        })

        quest.cases = await quest.cases().fetch()

        return response.json(quest)
      } else{
        return response.status(500).json('you dont have permission to add such case for quests')
      }
    } catch (e) {
      console.log(e)
      return response.status(500).json(e)
    }
  }


  async listUsers ({ request, response }) {
    try {
      const questId = request.input('questId')

      const quest = await Quest.find(questId)

      return response.json(await quest.users().fetch())
    } catch (e) {
      console.log(e)
      return response.status(500).json(e)
    }
  }


  async listCases ({ request, response }) {
    try {
      const questId = request.input('questId')
      const quest = await Quest.find(questId)

      return response.json(await quest.cases().fetch())
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = QuestController
