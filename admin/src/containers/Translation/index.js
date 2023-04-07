/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import CMEditViewTranslateLocale from '../../components/CMEditViewTranslateLocale'
import { track } from '../../utils';

const client = new ApolloClient({
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'da2-n2smjogejzhhbfo4dvvc3frw5u',
  },
  uri: 'https://yks6m7xxfzdthm7ulpc5sea4te.appsync-api.us-east-1.amazonaws.com/graphql',
  cache: new InMemoryCache(),
});

const Translation = () => {
  React.useEffect(() => {
    const accountID = localStorage.getItem("FluentC_AccountID");
    track("Load Plugin", { accountID: accountID });
  })
  return (
    <ApolloProvider client={client}>
      <CMEditViewTranslateLocale />
    </ApolloProvider>
  )
}

export default memo(Translation)
