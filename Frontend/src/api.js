import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Render backend URL
});

export default API;
