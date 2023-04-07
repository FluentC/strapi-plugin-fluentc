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
  Flex,
  Typography,
  Switch
} from "@strapi/design-system";
import { Card, CardBody } from "@strapi/design-system/Card";
import { mixpanelStatus, setMixpanelStatus, track } from "../../utils";

const Tracking = () => {
  const [enabledMixpanel, setEnabledMixpanel] = useState(mixpanelStatus());

  useEffect(() => {
    track('Open Tracking');
  }, []);

  const changeMixpanelStatus = () => {
    const status = !enabledMixpanel;
    track('Config Tracking', { status });
    setEnabledMixpanel(status);
    setMixpanelStatus(status);
  }

  return (
    <>
      <Box background="neutral100">
        <BaseHeaderLayout
          title="Tracking"
          subtitle="Configure tracking settings for FluentC"
          as="h2"
        />
      </Box>
      <Box paddingLeft={10} paddingRight={10} marginBottom={5}>
        <Card>
          <CardBody>
            <Box marginTop={5} marginBottom={5} style={{ width: "100%" }}>
              <Typography variant="epsilon">
                FluentC tracks user actions using Mixpanel, a third-party analytics tool, to help improve the user experience and identify potential issues.
              </Typography>
              <Flex marginTop={5} gap={5}>
                <Typography variant="delta">
                  Enable/Disable Mixpanel Tracking
                </Typography>
                <Switch label="" selected={enabledMixpanel} onChange={changeMixpanelStatus} />
              </Flex>
            </Box>
          </CardBody>
        </Card>
      </Box>
    </>
  );
};

export default memo(Tracking);