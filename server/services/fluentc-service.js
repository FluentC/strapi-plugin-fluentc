'use strict'

const get = require('lodash/get')
const set = require('lodash/set')

const fluentc = require('../utils/fluentc-api')

module.exports = ({ strapi }) => ({
  async translate({ data, sourceLocale, targetLocale, fieldsToTranslate }) {
    const { apiKey, freeApi, glossaryId } = strapi.config.get('plugin.strapi-plugin-fluentc')

    const textsToTranslate = fieldsToTranslate.map((field) => {
      return get(data, field, '')
    })

    const translateResult = await fluentc.translate({
      text: textsToTranslate,
      auth_key: apiKey,
      free_api: freeApi,
      target_lang: fluentc.parseLocale(targetLocale),
      source_lang: fluentc.parseLocale(sourceLocale),
      glossary_id: glossaryId,
    })

    const translatedData = { ...data }
    fieldsToTranslate.forEach((field, index) => {
      set(translatedData, field, translateResult.translations[index]?.text)
    })

    return translatedData
  },

  async usage() {
    const { apiKey, freeApi } = strapi.config.get('plugin.strapi-plugin-fluentc')
    return await fluentc.usage({
      auth_key: apiKey,
      free_api: freeApi,
    })
  },
})
