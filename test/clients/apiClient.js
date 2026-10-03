import request from 'supertest';
import environment from '../config/environment.js';

const apiClient = request(environment.baseUrl);

export default apiClient;