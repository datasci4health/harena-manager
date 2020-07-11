'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Role extends Model {
    static get incrementing () {
        return false
    }

    static get traits () {
        return [
            '@provider:Adonis/Acl/HasPermission'
        ]
    }
}

module.exports = Role
