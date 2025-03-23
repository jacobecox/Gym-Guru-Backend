/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import request from 'supertest';
import User from '../models/user.js';
import authMiddleware from '../controllers/authMiddleware.js';
import postSavedExercises from '../routes/postSavedExercises.js'
import deleteSavedExercises from '../routes/deleteSavedExercises.js'
import getSavedExercises from '../routes/getSavedExercises.js'

// Mock Mongoose Model and Middleware
jest.mock('../models/User'); // Mocking User model
jest.mock('../controllers/authMiddleware'); // Mocking auth middleware

const app = express();
app.use(express.json());
app.use(postSavedExercises)
app.use(getSavedExercises)
app.use(deleteSavedExercises)


beforeEach(() => {
  jest.clearAllMocks();
});

// Test for GET saved exercises
describe('GET /saved-exercises', () => {
  it('should return saved exercises for the authenticated user', async () => {
    const mockUser = {
      _id: 'user123',
      savedExercises: [
        { id: 'exercise1', name: 'Squat', equipment: 'Barbell', target: 'Legs' }
      ]
    };

    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: 'user123' }; // Simulate authenticated user
      next();
    });

    User.findById.mockResolvedValue(mockUser);

    const response = await request(app)
      .get('/saved-exercises')
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(200);
    expect(response.body.savedExercises).toEqual(mockUser.savedExercises);
  });

  it('should return 404 if user is not found', async () => {
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: 'user123' };
      next();
    });

    User.findById.mockResolvedValue(null); // Simulate user not found

    const response = await request(app)
      .get('/saved-exercises')
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

// Test for POST saved exercises
describe('POST /saved-exercises', () => {
  it('should save a new exercise for the user', async () => {
    const newExercise = {
      id: 'exercise2',
      name: 'Deadlift',
      equipment: 'Barbell',
      target: 'Back'
    };

    // Mock updated user with the new exercise
    const updatedUser = {
      _id: 'user123',
      savedExercises: [
        { id: 'exercise1', name: 'Squat', equipment: 'Barbell', target: 'Legs' },
        newExercise
      ]
    };

    // Mock the User.findByIdAndUpdate method to simulate the database update
    User.findByIdAndUpdate.mockResolvedValue(updatedUser);

    // Mock the authMiddleware to simulate authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: 'user123' };
      next();
    });

    const response = await request(app)
      .post('/saved-exercises')
      .set('Authorization', 'Bearer valid_token')
      .send(newExercise);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Exercise saved');
    expect(response.body.savedExercises).toHaveLength(2); // Ensure new exercise is added
    expect(response.body.savedExercises).toContainEqual(newExercise);
  });

  it('should return an error if exercise already saved', async () => {
    const existingExercise = {
      id: 'exercise1',
      name: 'Squat',
      equipment: 'Barbell',
      target: 'Legs'
    };

    const userWithExistingExercise = {
      _id: 'user123',
      savedExercises: [existingExercise]
    };

    // Mock User.findOne to simulate that the exercise already exists
    User.findOne.mockResolvedValue(userWithExistingExercise);

    // Mock the authMiddleware to simulate authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: 'user123' };
      next();
    });

    const response = await request(app)
      .post('/saved-exercises')
      .set('Authorization', 'Bearer valid_token')
      .send(existingExercise);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Exercise already saved');
  });

  it('should return an error if id is missing', async () => {
    const invalidExercise = {
      name: 'Deadlift',
      equipment: 'Barbell',
      target: 'Back'
    };

    // Mock the authMiddleware to simulate authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: 'user123' };
      next();
    });

    const response = await request(app)
      .post('/saved-exercises')
      .set('Authorization', 'Bearer valid_token')
      .send(invalidExercise);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing exercise id');
  });
});

// Test for DELETE saved exercises
describe('DELETE /saved-exercises', () => {
  it('should remove a saved exercise for the user', async () => {
    const exerciseToRemove = {
      id: 'exercise1',
      name: 'Squat',
      equipment: 'Barbell',
      target: 'Legs',
    };

    // Mock the updated user object with the exercise removed
    const updatedUser = {
      _id: '60d5f714f7a2f042f8a9b7b1',
      savedExercises: [], // Exercise is removed
    };

    // Mock the authMiddleware to simulate authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: '60d5f714f7a2f042f8a9b7b1' };
      next();
    });

    // Mock User.findByIdAndUpdate to return the updated user without the exercise
    User.findByIdAndUpdate.mockResolvedValue(updatedUser);

    // Mock findById to return the updated user without the need for populate
    User.findById.mockResolvedValue(updatedUser);

    const response = await request(app)
      .delete('/saved-exercises')
      .set('Authorization', 'Bearer valid_token')
      .set('Content-Type', 'application/json')
      .send({ id: 'exercise1' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Exercise removed');
    expect(response.body.savedExercises).toEqual([]); // Ensure the exercise is removed
  });
});


  it('should return an error if id is missing', async () => {
    // Mock the authMiddleware to simulate authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: 'user123' };
      next();
    });

    const response = await request(app)
      .delete('/saved-exercises')
      .set('Authorization', 'Bearer valid_token')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid user ID');
  });
