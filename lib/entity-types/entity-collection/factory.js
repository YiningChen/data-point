'use strict'

const _ = require('lodash')
const createTransform = require('../../transform-expression').create
const parseCompose = require('../parse-compose')
const helpers = require('../../helpers')

/**
 * Collection Type.
 * @class
 */
function Collection () {}

module.exports.Collection = Collection

const modifierKeys = ['filter', 'find', 'map']

function createCompose (composeParse) {
  return composeParse.map(modifier => {
    return _.assign({}, modifier, {
      transform: createTransform(modifier.spec)
    })
  })
}

function validateComposeVsInlineModifiers (spec, invalidInlinesKeys) {
  if (!spec.compose) {
    return true
  }

  if (spec.compose && !(spec.compose instanceof Array)) {
    throw new Error(
      `Entity ${spec.id} Hash.compose property is expected to be of instance of Array and found ${spec.compose}`
    )
  }

  const specKeys = Object.keys(spec)
  const intersection = _.intersection(invalidInlinesKeys, specKeys)
  if (intersection.length !== 0) {
    throw new Error(
      `Entity ${spec.id} Spec is invalid, when 'compose' is defined the key(s): '${intersection.join(
        ', '
      )}' should be inside compose.`
    )
  }
}

function create (spec) {
  validateComposeVsInlineModifiers(spec, modifierKeys)

  const entity = helpers.createEntity(Collection, spec)

  const compose = parseCompose.parse(spec, modifierKeys)
  entity.compose = createCompose(compose)

  return Object.freeze(entity)
}

module.exports.create = create
