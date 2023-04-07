import * as mixpanel from "mixpanel-figma";

mixpanel.init("be46e38c843b078807526ee305f946fa", {
  disable_cookie: true,
  disable_persistence: true,
});

export const track = (event, params = {}) => {
  if (mixpanelStatus()) {
    mixpanel.track(event, { ...params, product: 'Strapi' });
  }
}

export const mixpanelStatus = () => {
  const status = window.localStorage.getItem("FluentC_Enable_Mixpanel");
  if (status === false || status === 'false') return false;
  console.log('mixpanel status', status);
  return true;
}

export const setMixpanelStatus = (status) => {
  const _status = !(status === false);
  console.log('mixpanel', _status);
  window.localStorage.setItem("FluentC_Enable_Mixpanel", _status)
}

export { default as getTrad } from './getTrad'