import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import get from "lodash/get";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import { Dialog, DialogBody, DialogFooter } from "@strapi/design-system/Dialog";
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system';
import { Button, BaseCheckbox, Select, Option } from "@strapi/design-system";
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
import { ModalLayout, ModalBody, ModalHeader, ModalFooter } from '@strapi/design-system';
import { axiosInstance } from "@strapi/plugin-i18n/admin/src/utils";
import { getTrad, track } from "../../utils";
import permissions from "../../permissions";
import cleanData from "./utils/cleanData";
import { generateOptions } from "@strapi/plugin-i18n/admin/src/components/CMEditViewInjectedComponents/CMEditViewCopyLocale/utils";
import useContentTypePermissions from "@strapi/plugin-i18n/admin/src/hooks/useContentTypePermissions";
import selectI18NLocales from "@strapi/plugin-i18n/admin/src/selectors/selectI18nLocales";
import { useLazyQuery } from "@apollo/client";
import { transQuery, langQuery } from "../../graphql";

import logo from '../../assets/fluentc-logo.png'

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
  const [isTranslatedOpen, setIsTranslatedOpen] = useState(false);
  const [value, setValue] = useState(options[0]?.value || "");
  const [languages, setLanguages] = useState([]);

  //For translate
  const [translatedContents, setTranslatedContents] = useState([]);
  const [dataCollection, setDataCollection] = useState(null);

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
        if (["createdBy", "updatedBy", "publishedAt", "id", "createdAt"].indexOf(itm) > -1)
          return "";
        return cleanedData[itm];
      })
      .filter((itm) => typeof itm === "string" && itm !== "");
  };
  const setContents = () => {
    const cleanedData = dataCollection;
    const res = translatedContents.filter(itm => itm.selected);
    const ret = { ...cleanedData };
    const keys = Object.keys(ret);
    console.log('setContents');
    for (let i = 0; i < keys.length; i++) {
      const itm = keys[i];
      if (typeof ret[itm] !== "string") {
        ret[itm] = cleanedData[itm];
        continue;
      }

      const idx = res.findIndex((r) => ret[itm] === r.originalText);
      
      if (idx > -1) {
        ret[itm] = res[idx].translatedText;
      } else {
        delete ret[itm]
      }
    }
    ['createdBy', 'updatedBy', 'publishedAt', 'id', 'createdAt'].forEach((key) => {
      if (!initialData[key]) return;
      ret[key] = initialData[key];
    });
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
      
      const { data: response } = await axiosInstance.get(requestDataURL);
      
      const cleanedData = cleanData(response, allLayoutData, localizations);
      const contents = getContents(cleanedData);
      
      const accountID = localStorage.getItem("FluentC_AccountID");
      track("Translate", {accountID: accountID});

      getTranslatedText({
        variables: {
          accountID,
          source: sourceLocale,
          target: currentLocale,
          labels: contents,
        },
      })
        .then((res) => {
          if (!res.error && res.data?.translate?.body) {
            const contents = (res.data?.translate?.body || []).map(itm => { return { ...itm, selected: true } });
            console.log(contents);
            for (let i = 0; i < contents.length; i ++) contents[i].selected = true;
            setTranslatedContents(contents)
            setDataCollection(cleanedData);
            setIsTranslatedOpen(true);
          } else {
            showErrNoti(res.error?.message || 'Translate failed');
          }

          setIsLoading(false);
          handleToggle();
        })
        .catch((err) => {
          showErrNoti(err.message);
          setIsLoading(false);
        });
    } catch (err) {
      setIsLoading(false);
    } 
  };

  const translate = () => {
    try {
      const translatedData = setContents();
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
      setIsTranslatedOpen(false);
    } catch (err) {
      console.log(err);
      showErrNoti(err.message);
    }
  }

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

  const selectValueChanged = (idx, val) => {
    translatedContents[idx].selected = val;
    setTranslatedContents([...translatedContents]);
  }

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
            <Stack>
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
                Cancel
              </Button>
            }
            endAction={
              <Button
                variant="success"
                onClick={handleConfirmCopyLocale}
                loading={isLoading}
              >
                Translate
              </Button>
            }
          />
        </Dialog>
      )}
      {isTranslatedOpen && (
        <ModalLayout onClose={() => setIsTranslatedOpen(false)} labelledBy="title">
        <ModalHeader>
          <Flex>
            <img
              src={logo}
              style={{ maxWidth: "100%" }}
              width={100}
              alt="logodash"
            />
            {/* <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
              Translated Content
            </Typography> */}
          </Flex>
        </ModalHeader>
        <ModalBody style={{padding: '10px'}}>
          <Table style={{ width: '100%' }} colCount={3} rowCount={translatedContents.length}>
            <Thead>
              <Tr>
                <Th><></></Th>
                <Th>
                  <Typography variant="omega" fontWeight="bold">Original Text</Typography>
                </Th>
                <Th>
                  <Typography variant="omega" fontWeight="bold">Translated Text</Typography>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {translatedContents.map((itm, idx) => <Tr key={idx}>
                <Td>
                  <BaseCheckbox value={itm.selected} onValueChange={(val) => selectValueChanged(idx, val)} />
                </Td>
                <Td>
                  <Typography style={{whiteSpace: 'break-spaces'}} textColor="neutral800">{itm.originalText}</Typography>
                </Td>
                <Td>
                  <Typography style={{whiteSpace: 'break-spaces'}} textColor="neutral800">{itm.translatedText}</Typography>
                </Td>
              </Tr>)}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter startActions={<Button onClick={() => setIsTranslatedOpen(false)} variant="tertiary">
              Cancel
            </Button>} endActions={<>
              <Button onClick={translate}>Fill in</Button>
            </>} />
        </ModalLayout>
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