import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your IP address when running on physical device with Expo Go (e.g. http://192.168.1.5:5000/api)
const API_URL = 'http://10.0.2.2:5000/api'; // Default for Android Emulator; change to http://localhost:5000/api for iOS Simulator

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('aces_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default API;
