import {gql} from '@apollo/client';

export const transQuery = gql`
    query translate($accountID: String!, $source: String!, $target: String!, $labels: [String!]) {
        translate(accountID: $accountID, sourceLanguage: $source, targetLanguage: $target, labels: $labels) {
            body {
                sourceLanguage
                targetLanguage
                originalText
                translatedText
            }
        }
    }
`;

export const langQuery = gql`
    query langQuery {
        getAvailableLanguages {
            body {
                code
                label
            }
        }
    }
`;

export const fetchApiKeyUsage = gql`
    query fetchApiKeyUsage($apiKey: String!) {
        fetchApiKeyUsage(apiKey: $apiKey) {
            apiKey
            currentUsage
            maxUsage
            tier
        }
    }
`;

export const contentQuery = gql`
    query content($accountID: String!, $lang: String!) {
        requestContent(environmentID: $accountID, language: $lang) {
            body {
                key
                value
            }
        }
    }
`;
