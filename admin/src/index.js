import { prefixPluginTranslations } from '@strapi/helper-plugin'
import pluginPkg from '../../package.json'
import pluginId from './pluginId'
import Initializer from './components/Initializer'
import Translation from './containers/Translation'

const name = pluginPkg.strapi.name

export default {
  register(app) {
    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: {
          id: `${pluginId}.plugin.name`,
          defaultMessage: 'FluentC Plugin',
        },
      },
      [
        {
          intlLabel: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: 'API Key',
          },
          id: 'settings',
          to: `/settings/${pluginId}/apikey`,
          Component: async () => {
            return import('./containers/Setting');
          },
        },
        {
          intlLabel: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: 'Tracking',
          },
          id: 'tracking',
          to: `/settings/${pluginId}/tracking`,
          Component: async () => {
            return import('./containers/Setting/tracking');
          },
        },
      ]
    );
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    })
  },

  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'strapi-plugin-fluentc',
      Component: Translation,
    })
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            }
          })
          .catch(() => {
            return {
              data: {},
              locale,
            }
          })
      })
    )

    return Promise.resolve(importedTrads)
  },
}
