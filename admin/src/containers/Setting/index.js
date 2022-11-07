/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react'
import {ApolloProvider, ApolloClient, InMemoryCache} from '@apollo/client';
import Settings from './setting'

const client = new ApolloClient({
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'da2-n2smjogejzhhbfo4dvvc3frw5u',
  },
  uri: 'https://yks6m7xxfzdthm7ulpc5sea4te.appsync-api.us-east-1.amazonaws.com/graphql',
  cache: new InMemoryCache(),
});

const Setting = () => {
  return (
    <ApolloProvider client={client}>
      <Settings />
    </ApolloProvider>
  )
}

export default memo(Setting)
