/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react'
import * as mixpanel from "mixpanel-figma";
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId'
import {ApolloProvider, ApolloClient, InMemoryCache} from '@apollo/client';
import CMEditViewTranslateLocale from '../../components/CMEditViewTranslateLocale'

const client = new ApolloClient({
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'da2-n2smjogejzhhbfo4dvvc3frw5u',
  },
  uri: 'https://yks6m7xxfzdthm7ulpc5sea4te.appsync-api.us-east-1.amazonaws.com/graphql',
  cache: new InMemoryCache(),
});

mixpanel.init("be46e38c843b078807526ee305f946fa", {
  disable_cookie: true,
  disable_persistence: true,
});

const Translation = () => {
  React.useEffect(() => {
    const accountID = localStorage.getItem("FluentC_AccountID");
    mixpanel.track("Run", {
      accountID: accountID,
    });
  })
  return (
    <ApolloProvider client={client}>
        <CMEditViewTranslateLocale />
    </ApolloProvider>
  )
}

export default memo(Translation)
