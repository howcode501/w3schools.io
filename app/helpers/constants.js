// Previous regex: /^[a-zA-Z0-9 !@#$%^&*)(+=._-]+$/gu
export const EMOJIS_REGEX =
  // eslint-disable-next-line
  /^[\w \r\n]+(?:['";:!@#$%^&*)(+=.,_-]([\w \r\n]+)|([\.\?\)\]\}]{1}))*$/gm;

// Manage Base Image Menu
export const MANAGE_SERVER_CREATE_IMAGE_STATE = 'create_image';
export const MANAGE_SERVER_DEPLOY_IMAGE_STATE = 'deploy_image';

export const MANAGE_BASE_IMAGES_MENUS = [
  { key: MANAGE_SERVER_CREATE_IMAGE_STATE, value: 'Create Image' },
  { key: MANAGE_SERVER_DEPLOY_IMAGE_STATE, value: 'Deploy Image' }
];

export const LEFT_DRAWER_WIDTH = 300;

// Maximum
export const MAX_NOTIFICATION_COUNT = 15;

// Data Pull Interval
export const LOAD_DATA_INTERVAL = 10000;

// Time Out Delay
export const TIME_OUT_DELAY = 15000;
