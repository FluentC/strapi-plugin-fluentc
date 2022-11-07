module.exports = [
  {
    method: 'POST',
    path: '/translate',
    handler: 'fluentcController.translate',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::strapi-plugin-fluentc.translate'] },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/usage',
    handler: 'fluentcController.usage',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::strapi-plugin-fluentc.usage'] },
        },
      ],
    },
  },
]
