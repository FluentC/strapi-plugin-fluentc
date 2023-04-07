/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from "react";
// import PropTypes from 'prop-types';
import {
  Box,
  BaseHeaderLayout,
  TextInput,
  Button,
  Flex,
  Typography,
  ProgressBar,
} from "@strapi/design-system";
import { Card, CardBody } from "@strapi/design-system/Card";
import { Check, Feather, Star } from "@strapi/icons";
import { useLazyQuery } from "@apollo/client";
import { fetchApiKeyUsage } from "../../graphql";
import logo from '../../assets/fluentc-logo.png'
import { track } from "../../utils";

const Setting = () => {
  const [accountID, setAccountID] = useState(
    localStorage.getItem("FluentC_AccountID") || ""
  );
  const [savedAccountID, setSavedAccountID] = useState(
    localStorage.getItem("FluentC_AccountID") || ""
  );
  const [currentUsage, setCurrentUsage] = useState(0);
  const [maxUsage, setMaxUsage] = useState(0);
  const [tier, setTier] = useState("");
  const [getApiKeyUsage] = useLazyQuery(fetchApiKeyUsage);

  useEffect(() => {
    track('Open ApiKey');
    getApiKeyUsage({
      variables: { apiKey: savedAccountID },
    })
      .then((res) => {
        const { currentUsage, maxUsage, tier } = res.data.fetchApiKeyUsage;
        setCurrentUsage(currentUsage);
        setMaxUsage(maxUsage);
        setTier(tier);
        console.log(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const accountIDChanged = (e) => {
    setAccountID(e.target.value);
  };

  const saveAccountID = (e) => {
    if (!accountID) {
      return;
    }
    track('save', { accountID: accountID });
    localStorage.setItem("FluentC_AccountID", accountID);
    setSavedAccountID(accountID);
  };

  const openDashboard = () => {
    track('Click Register');
    window.open('https://dashboard.fluentc.io#strapi', '_blank');
  }

  const openUpgrade = () => {
    track('Click Upgrade');
    window.open('https://dashboard.fluentc.io/billing', '_blank');
  }

  return (
    <>
      <Box background="neutral100">
        <BaseHeaderLayout
          title="API Key"
          subtitle="Configure your FluentC API Key"
          as="h2"
        />
      </Box>
      <Box paddingLeft={10} paddingRight={10} marginBottom={5}>
        <Card>
          <CardBody>
            <Box style={{ width: "100%" }}>
              <Flex padding={3} gap={3} justifyContent="flex-end">
                { tier ? <Button
                    startIcon={<Star />}
                    margin={3}
                    onClick={openUpgrade}
                  >
                    Upgrade
                  </Button> : <Button
                    startIcon={<Feather />}
                    margin={3}
                    onClick={openDashboard}
                  >
                    Register
                  </Button>
                }
                <Button
                  disabled={accountID === savedAccountID || !accountID}
                  startIcon={<Check />}
                  onClick={saveAccountID}
                >
                  Save
                </Button>
              </Flex>
              {/* {(tier === "SUPERLIMITED" || tier === "LIMITED") && ( */}
                <Box padding={3} style={{ width: "100%" }}>
                  <Typography variant="sigma">
                    Current Usage ({currentUsage} / {(tier === "PAYED") ? "Unlimited" : maxUsage})
                  </Typography>
                  <ProgressBar
                    value={!maxUsage ? 0 : (currentUsage / maxUsage) * 100}
                    style={{ width: "100%" }}
                  >
                    Current Usage
                  </ProgressBar>
                </Box>
              {/* )} */}
              <Box padding={3} style={{ width: "100%" }}>
                <TextInput
                  placeholder="Please input AccountID"
                  label="API Key"
                  name="accountid"
                  error={accountID ? "" : "* AccountID is required!"}
                  onChange={accountIDChanged}
                  value={accountID}
                />
              </Box>
              <Flex marginTop={3} justifyContent="center">
                <div
                  onClick={() =>
                    window.open("https://dashboard.fluentc.io/", "_blank")
                  }
                >
                  <img
                    // src="https://crowdflare-staging.nyc3.cdn.digitaloceanspaces.com/delete-fluentc/no-background.png"
                    src={logo}
                    style={{ maxWidth: "100%" }}
                    width={400}
                    alt="logodash"
                  />
                </div>
              </Flex>
              <Box marginTop={3} marginBottom={5} textAlign="center">
                <Typography variant="beta" textColor="#19519D">
                  <a href="https://dashboard.fluentc.io/" target="_blank">
                    To get your API key register at
                    https://dashboard.fluentc.io/
                  </a>
                </Typography>
                <br />
                <Typography variant="delta" textColor="#19519D">
                  Plugin will not work without a valid API key.
                </Typography>
              </Box>
            </Box>
          </CardBody>
        </Card>
      </Box>
    </>
  );
};

export default memo(Setting);