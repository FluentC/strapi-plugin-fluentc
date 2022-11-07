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

export const fetchApiKeyQuery = gql`
    query fetchApiKeyQuery {
        fetchNewApiKey {
            apiKey
            currentUsage
            maxUsage
            tier
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

export const fetchNewApiKeyQuery = gql`
    query fetchNewApiKey($vendorID: String!, $venderName: String!) {
        fetchNewApiKey(vendor: "figma", vendorID: $vendorID, vendorName: $venderName) {
            apiKey
            currentUsage
            maxUsage
            tier
        }
    }
`;

export const registerQuery = gql`
    query registerUser($password: String!, $email: String!) {
        registerUser(password: $password, email: $email) {
            success
        }
    }
`;

export const confirmQuery = gql`
    query confirmUser($confirmCode: String!, $email: String!) {
        confirmUser(confirmationCode: $confirmCode, email: $email) {
            success
        }
    }
`;

export const fetchUserTokensQuery = gql`
    query fetchUserTokens($email: String!) {
        fetchUserTokens(email: $email) {
            tokens {
                apiKey
                currentUsage
                maxUsage
                tier
            }
        }
    }
`;
