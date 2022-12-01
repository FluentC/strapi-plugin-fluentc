import React, { memo, useState, useEffect } from "react";
// import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  IconButton,
  ModalLayout,
  TextInput,
  Button,
  Typography,
} from "@strapi/design-system";
import { Grid, GridItem } from "@strapi/design-system/Grid";
import CustomCard from "../../components/CustomCard";
import { Cross } from "@strapi/icons";
import {
  fetchNewApiKeyQuery,
  registerQuery,
  confirmQuery,
  fetchUserTokensQuery,
} from "../../graphql";
import { useLazyQuery } from "@apollo/client";
import { useNotification } from "@strapi/helper-plugin";

const limitedTrial = {
  title: "Limited Free Trial",
  content: [
    "No Access to FluentC Toolkit",
    "1,000 translated characters",
    "One free trial per StrApi user",
  ],
  btnLabel: "Start Now",
};

const freeTrial = {
  title: "Free Trial",
  content: [
    "Access to FluentC Toolkit",
    "10,000 translated characters",
    "One free trial per StrApi user",
  ],
  btnLabel: "Enter Email",
};

const subscription = {
  title: "Subscription",
  content: [
    "Access to FluentC Toolkit",
    "Pay per translated characters",
    "API Access to Translations",
    "iOS Applications Supported",
    "Android Applications Supported",
  ],
  btnLabel: "Subscribe",
};

const Register = (props) => {
  const [fetchNewKey] = useLazyQuery(fetchNewApiKeyQuery);
  const [confirmUser] = useLazyQuery(confirmQuery);
  const [registerUser] = useLazyQuery(registerQuery);
  const [fetchUserTokens] = useLazyQuery(fetchUserTokensQuery);

  const toggleNotification = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {}, []);

  const showNoti = (msg, type = "warning") => {
    toggleNotification({
      type,
      message: {
        defaultMessage: msg,
      },
    });
  };

  const toggleShowModal = () => {
    setShowModal(!showModal);
  };

  const toggleShowVerify = () => {
    setShowVerify(!showVerify);
  };

  const emailChanged = (e) => {
    setEmail(e.target.value);
  };
  const passwordChanged = (e) => {
    setPassword(e.target.value);
  };
  const codeChanged = (e) => {
    setCode(e.target.value);
  };

  const onStartNow = async () => {
    try {
      setLoading(true);
      const res = await fetchNewKey({
        variables: { vendorID: "", venderName: "", vendor: "StrApi" },
      });
      setLoading(false);
      props.setAccountID(res.data.fetchNewApiKey.apiKey);
    } catch (e) {
      showNoti("Fetch new API Key Error!");
      console.log("Fetch new API Key Error!", e);
    }
  };

  const sendEmail = async () => {
    if (!email || !password) return;
    try {
      setLoading(true);
      const res = await registerUser({
        variables: { password, email },
      });
      setLoading(false);
      if (res.data) toggleShowVerify();
      else showNoti(res.error?.message || "Register Error!", "warning");
    } catch (e) {
      console.log("Register Error!", e);
      showNoti("Register Error!");
    }
  };

  const sendVerify = async () => {
    if (!code) return;
    try {
      setLoading(true);
      const res = await confirmUser({
        variables: { confirmCode: code, email: email },
      });
      setLoading(false);
      if (res?.data?.confirmUser?.success === true) {
        try {
          setLoading(true);
          const tokens = await fetchUserTokens({
            variables: { email: email },
          });
          setLoading(false);
          if (tokens?.data?.fetchUserTokens?.tokens[0]?.apiKey) {
            props.setAccountID(tokens.data.fetchUserTokens.tokens[0].apiKey);
          } else {
            showNoti(tokens.error?.message || "Fetch Tokens Error!");
          }
        } catch (e) {
          console.log("Fetch Tokens Error!!!", e);
          showNoti("Fetch Tokens Error!");
        }
      } else {
        showNoti(res.error?.message || "validation error");
        console.log("validation error");
      }
    } catch (e) {
      showNoti("validation error");
      console.log("validation Error!", e);
    }
  };

  return (
    <>
      <Box style={{ width: "600px", height: "400px", padding: "10px 20px" }}>
        <Flex justifyContent="space-between">
          <img
            src="https://crowdflare-staging.nyc3.cdn.digitaloceanspaces.com/delete-fluentc/no-background.png"
            style={{ maxWidth: "100%" }}
            width={130}
            alt="logodash"
          />
          <IconButton
            onClick={() => props.close()}
            label="Close"
            icon={<Cross />}
            noBorder
          />
        </Flex>
        <Grid gap={1} marginTop={2}>
          <GridItem col={4}>
            <CustomCard
              loading={loading}
              accountID={props.accountID}
              data={limitedTrial}
              click={onStartNow}
            />
          </GridItem>
          <GridItem col={4}>
            <CustomCard
              loading={loading}
              data={freeTrial}
              click={toggleShowModal}
            />
          </GridItem>
          <GridItem col={4}>
            <CustomCard
              data={subscription}
              click={() => {
                window.open("https://dashboard.fluentc.io/", "_blank");
              }}
            />
          </GridItem>
        </Grid>
      </Box>
      {showModal && (
        <ModalLayout
          onClose={() => toggleShowModal((prev) => !prev)}
          labelledBy="title"
          style={{
            width: showVerify ? "450px" : "500px",
            height: showVerify ? "250px" : "320px",
          }}
        >
          <Box
            style={{
              width: "100%",
              padding: "10px 20px",
              borderBottom: "1px solid #016AE950",
            }}
          >
            <Flex justifyContent="space-between">
              <img
                src="https://crowdflare-staging.nyc3.cdn.digitaloceanspaces.com/delete-fluentc/no-background.png"
                style={{ maxWidth: "100%" }}
                width={100}
                alt="logodash"
              />
              <IconButton
                onClick={toggleShowModal}
                label="Close"
                icon={<Cross />}
                noBorder
              />
            </Flex>
          </Box>
          {!showVerify && (
            <Box style={{ width: "100%", padding: "10px 20px" }}>
              <Typography variant="sigma" textColor="#19519D">
                Enter your email and password below to sign up for a free
                account.
              </Typography>
              <Box marginTop={3}>
                <TextInput
                  placeholder="Please input Email"
                  label="Email"
                  name="email"
                  error={email ? "" : "* Email is required!"}
                  onChange={emailChanged}
                  value={email}
                />
              </Box>
              <Box marginTop={3}>
                <TextInput
                  type="password"
                  placeholder="Please input Password"
                  label="Password"
                  name="password"
                  error={password ? "" : "* Password is required!"}
                  onChange={passwordChanged}
                  value={password}
                />
              </Box>
              <Flex marginTop={3} justifyContent="flex-end">
                <Button disabled={loading} onClick={sendEmail}>
                  Submit
                </Button>
              </Flex>
            </Box>
          )}
          {showVerify && (
            <Box style={{ width: "100%", padding: "10px 20px" }}>
              <Typography variant="sigma" textColor="#19519D">
                Please check your email and enter the validation code below.
              </Typography>
              <Box marginTop={3}>
                <TextInput
                  placeholder="Please input validation code"
                  label="code"
                  name="code"
                  error={code ? "" : "* Validation Code is required!"}
                  onChange={codeChanged}
                  value={code}
                />
              </Box>
              <Flex marginTop={3} justifyContent="space-between">
                <Button variant="tertiary" onClick={toggleShowVerify}>
                  Back
                </Button>
                <Button disabled={loading} onClick={sendVerify}>
                  Verify
                </Button>
              </Flex>
            </Box>
          )}
        </ModalLayout>
      )}
    </>
  );
};

export default memo(Register);