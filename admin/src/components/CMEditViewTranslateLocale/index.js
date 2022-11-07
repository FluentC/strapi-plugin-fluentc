import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import get from "lodash/get";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import { Dialog, DialogBody, DialogFooter } from "@strapi/design-system/Dialog";
import { Select, Option } from "@strapi/design-system/Select";
import { Button } from "@strapi/design-system/Button";
import { Box } from "@strapi/design-system/Box";
import { Divider } from "@strapi/design-system/Divider";
import { Typography } from "@strapi/design-system/Typography";
import { Flex } from "@strapi/design-system/Flex";
import { Stack } from "@strapi/design-system/Stack";
import ExclamationMarkCircle from "@strapi/icons/ExclamationMarkCircle";
import Duplicate from "@strapi/icons/Duplicate";
import {
  useCMEditViewDataManager,
  useNotification,
  useQueryParams,
  CheckPermissions,
} from "@strapi/helper-plugin";
import { axiosInstance } from "@strapi/plugin-i18n/admin/src/utils";
import { getTrad } from "../../utils";
import permissions from "../../permissions";
import cleanData from "./utils/cleanData";
import { generateOptions } from "@strapi/plugin-i18n/admin/src/components/CMEditViewInjectedComponents/CMEditViewCopyLocale/utils";
import useContentTypePermissions from "@strapi/plugin-i18n/admin/src/hooks/useContentTypePermissions";
import selectI18NLocales from "@strapi/plugin-i18n/admin/src/selectors/selectI18nLocales";
import { useLazyQuery } from "@apollo/client";
import { transQuery, langQuery } from "../../graphql";

const StyledTypography = styled(Typography)`
  svg {
    margin-right: ${({ theme }) => theme.spaces[2]};
    fill: none;
    > g,
    path {
      fill: ${({ theme }) => theme.colors.primary600};
    }
  }
`;

const CenteredTypography = styled(Typography)`
  text-align: center;
`;

const CMEditViewTranslateLocale = () => {
  const [{ query }] = useQueryParams();
  const locales = useSelector(selectI18NLocales);
  const { layout, modifiedData, slug } = useCMEditViewDataManager();
  const { readPermissions } = useContentTypePermissions(slug);

  const defaultLocale = locales.find((loc) => loc.isDefault);
  const currentLocale = get(query, "plugins.i18n.locale", defaultLocale.code);
  const hasI18nEnabled = get(
    layout,
    ["pluginOptions", "i18n", "localized"],
    false
  );
  const localizations = get(modifiedData, "localizations", []);

  if (!hasI18nEnabled || !localizations.length) {
    return null;
  }

  return (
    <CheckPermissions permissions={permissions.translate}>
      <Content
        {...{
          appLocales: locales,
          currentLocale,
          localizations,
          readPermissions,
        }}
      />
    </CheckPermissions>
  );
};

const Content = ({
  appLocales,
  currentLocale,
  localizations,
  readPermissions,
}) => {
  const { allLayoutData, initialData, slug } = useCMEditViewDataManager();
  const [getTranslatedText] = useLazyQuery(transQuery);
  const [getLanguages] = useLazyQuery(langQuery);

  const options = generateOptions(
    appLocales,
    currentLocale,
    localizations,
    readPermissions
  );

  const toggleNotification = useNotification();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(options[0]?.value || "");
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    getLanguages().then((res) => {
      const langList = res.data.getAvailableLanguages.body;
      const dropOptions = langList.map((lang) => {
        return { label: lang.label, value: lang.code };
      });
      setLanguages(dropOptions);
    });
  }, []);

  const getContents = (cleanedData) => {
    return Object.keys(cleanedData)
      .map((itm) => {
        if (
          ["createdBy", "updatedBy", "publishedAt", "id", "createdAt"].indexOf(
            itm
          ) > -1
        )
          return "";
        return cleanedData[itm];
      })
      .filter((itm) => typeof itm === "string" && itm !== "");
  };
  const setContents = (cleanedData, res) => {
    const ret = { ...cleanedData };
    const keys = Object.keys(ret);
    for (let i = 0; i < keys.length; i++) {
      const itm = keys[i];
      if (
        ["createdBy", "updatedBy", "publishedAt", "id", "createdAt"].indexOf(
          itm
        ) > -1 ||
        typeof ret[itm] !== "string"
      ) {
        ret[itm] = cleanedData[itm];
        continue;
      }

      const idx = res.findIndex((r) => ret[itm] === r.originalText);
      console.log(res[idx].translatedText);
      if (idx > -1) {
        ret[itm] = res[idx].translatedText;
      }
    }
    return ret;
  };

  const showErrNoti = (err) => {
    toggleNotification({
      type: "warning",
      message: {
        id: getTrad(err),
        defaultMessage: err || "Failed to translate locale",
      },
    });
  };

  const handleConfirmCopyLocale = async () => {
    if (!value) {
      handleToggle();
      return;
    }

    const { locale: sourceLocale } = localizations.find(
      ({ id }) => id == value
    );

    if (languages.findIndex((lang) => lang.value === sourceLocale) === -1) {
      showErrNoti(`We don't support ${sourceLocale}`);
      return;
    }

    setIsLoading(true);

    try {
      const requestDataURL = `/content-manager/collection-types/${slug}/${value}`;
      // const translateURL = `/fluentc/translate`

      const { data: response } = await axiosInstance.get(requestDataURL);

      const cleanedData = cleanData(response, allLayoutData, localizations);
      const contents = getContents(cleanedData);

      const accountID = localStorage.getItem("FluentC_AccountID");

      getTranslatedText({
        variables: {
          accountID,
          source: sourceLocale,
          target: currentLocale,
          labels: contents,
        },
      })
        .then((res) => {
          if (!res.error) {
            const contents = res.data?.translate?.body;
            const translatedData = setContents(cleanedData, contents);
            dispatch({
              type: "ContentManager/CrudReducer/GET_DATA_SUCCEEDED",
              data: translatedData,
            });

            toggleNotification({
              type: "success",
              message: {
                id: getTrad("CMEditViewTranslateLocale.translate-success"),
                defaultMessage: "Copied and translated from other locale!",
              },
            });
          } else {
            showErrNoti(res.error?.message);
          }
        })
        .catch((err) => {
          showErrNoti(err.message);
        });

      // FIXME: Two issues here
      // - Date/time field is only shown with value after save
      // - The dispatch updates not just modified data but also the initial data
      //   -> Saving is impossible until manual modification if object already existed
    } catch (err) {
    } finally {
      setIsLoading(false);
      handleToggle();
    }
  };

  const handleChange = (value) => {
    setValue(value);
  };

  const handleToggle = () => {
    if (languages.findIndex((lang) => lang.value === currentLocale) === -1) {
      showErrNoti(`We don't support ${currentLocale}`);
      return;
    }

    setIsOpen((prev) => !prev);
  };

  return (
    <Box paddingTop={6}>
      <Typography variant="sigma" textColor="neutral600">
        {formatMessage({
          id: getTrad("plugin.name"),
          defaultMessage: "FluentC",
        })}
      </Typography>
      <Box paddingTop={2} paddingBottom={6}>
        <Divider />
      </Box>
      <StyledTypography
        fontSize={2}
        textColor="primary600"
        as="button"
        type="button"
        onClick={handleToggle}
      >
        <Flex>
          <Duplicate width="12px" height="12px" />
          {formatMessage({
            id: getTrad("CMEditViewTranslateLocale.translate-text"),
            defaultMessage: "Translate from another locale",
          })}
        </Flex>
      </StyledTypography>
      {isOpen && (
        <Dialog onClose={handleToggle} title="Confirmation" isOpen={isOpen}>
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack size={2}>
              <Flex justifyContent="center">
                <CenteredTypography id="confirm-description">
                  {formatMessage({
                    id: getTrad(
                      "CMEditViewTranslateLocale.ModalConfirm.content"
                    ),
                    defaultMessage:
                      "Your current content will be erased and filled by the translated content of the selected locale:",
                  })}
                </CenteredTypography>
              </Flex>
              <Box>
                <Select
                  label={formatMessage({
                    id: getTrad("Settings.locales.modal.locales.label"),
                  })}
                  onChange={handleChange}
                  value={value}
                >
                  {options.map(({ label, value }) => {
                    return (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>
              </Box>
            </Stack>
          </DialogBody>
          <DialogFooter
            startAction={
              <Button onClick={handleToggle} variant="tertiary">
                {formatMessage({
                  id: "popUpWarning.button.cancel",
                  defaultMessage: "No, cancel",
                })}
              </Button>
            }
            endAction={
              <Button
                variant="success"
                onClick={handleConfirmCopyLocale}
                loading={isLoading}
              >
                {formatMessage({
                  id: getTrad("CMEditViewTranslateLocale.submit-text"),
                  defaultMessage: "Yes, fill in",
                })}
              </Button>
            }
          />
        </Dialog>
      )}
    </Box>
  );
};

Content.propTypes = {
  appLocales: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  currentLocale: PropTypes.string.isRequired,
  localizations: PropTypes.array.isRequired,
  readPermissions: PropTypes.array.isRequired,
};

export default CMEditViewTranslateLocale;
