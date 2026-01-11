import api, { request } from './api';

export const loginUser = async ({ email, password, useSecondary = false }) => {
  const res = await request({
    url: 'api/login',
    method: 'POST',
    data: { email, password },
    useSecondary,
  });
  return res.data;
};

export const registerUser = async ({ name, email, password, useSecondary = false }) => {

  const res = await request({
    url: '/api/signup',
    method: 'POST',
    data: { name, email, password },
    useSecondary,
  });
  console.log('registerUser',res);
  return res.data;
};

export const getUserData = async ({ useSecondary = false } = {}) => {
  const res = await request({ url: '/api/me', method: 'GET', useSecondary });
  
  return res.data;
};


