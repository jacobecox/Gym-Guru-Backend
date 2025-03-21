import express from 'express';
import request from 'supertest';
import jwt from 'jwt-simple';
import User from '../models/user.js';
import authMiddleware from '../controllers/authMiddleware.js';

// Mock the dependencies
jest.mock('jwt-simple');
jest.mock('../models/user.js');

describe('authMiddleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Define the test route
    app.post('/protected', authMiddleware, (req, res) => {
      res.status(200).json({ message: 'Access granted' });
    });
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).post('/protected').send();

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized: No token provided');
  });

  it('should return 401 if token is invalid', async () => {
    // Mock jwt.decode to simulate an invalid token
    jwt.decode.mockImplementationOnce(() => null); // Simulate an invalid token

    const response = await request(app)
      .post('/protected')
      .set('Authorization', 'Bearer invalid_token')
      .send();

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized: Invalid token');
  });

  it('should return 401 if user is not found', async () => {
    // Mock jwt.decode to return a valid user ID but simulate no user found
    jwt.decode.mockImplementationOnce(() => ({ sub: 'valid_user_id' }));
    User.findById.mockResolvedValueOnce(null); // Simulate no user found

    const response = await request(app)
      .post('/protected')
      .set('Authorization', 'Bearer valid_token')
      .send();

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized: User not found');
  });

  it('should call next() and allow access if token is valid and user is found', async () => {
    // Mock jwt.decode to return a valid user ID
    jwt.decode.mockImplementationOnce(() => ({ sub: 'valid_user_id' }));
    // Mock User.findById to return a user object
    User.findById.mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce({ _id: 'valid_user_id', username: 'testUser' })
    }));

    const response = await request(app)
      .post('/protected')  // Ensure you're testing the correct route
      .set('Authorization', 'Bearer valid_token')
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted'); // Ensure the message matches the test route's response
  });
});
