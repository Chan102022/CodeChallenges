import axios from 'axios';

// Use your own IP if you're testing on a device
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Change to your server IP if using a phone
});

export default API;
