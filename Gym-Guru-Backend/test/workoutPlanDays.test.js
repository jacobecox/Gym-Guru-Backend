import express from 'express';
import request from 'supertest';
import User from '../models/user.js';
import authMiddleware from '../controllers/authMiddleware.js';
import getWorkoutDays from '../routes/getWorkoutDays.js';
import postWorkoutExercise from '../routes/postWorkoutExercise.js';
import deleteWorkoutDay from '../routes/deleteWorkoutDay.js';


// Mock Mongoose Model and Middleware
jest.mock('../models/User'); // Mocking User model
jest.mock('../controllers/authMiddleware'); // Mocking auth middleware

const app = express();
app.use(express.json());
app.use(getWorkoutDays)
app.use(postWorkoutExercise)
app.use(deleteWorkoutDay)


beforeEach(() => {
  jest.clearAllMocks();
});

// Test  for GET workout days
describe('GET /workout-days', () => {
  it('should return all workout days for the user', async () => {
    const userWithWorkoutPlan = {
      _id: '60d5f714f7a2f042f8a9b7b1',
      workoutPlan: [
        { day: 'Day 1', exercises: [] },
        { day: 'Day 2', exercises: [] },
      ],
    };

    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: '60d5f714f7a2f042f8a9b7b1' }; // User ID
      next();
    });

    // Mock the user object with workout plan
    User.findById.mockResolvedValue(userWithWorkoutPlan);

    const response = await request(app)
      .get('/workout-days')
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(userWithWorkoutPlan.workoutPlan);
  });

  it('should return an error if user is not found', async () => {
    // Mock no user found
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .get('/workout-days')
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

// Test for POST workout days
describe('POST /workout-days', () => {
  it('should add a new workout day to the user', async () => {
    const newDay = { day: 'Test Workout Day' };

    // Mock the user object
    const updatedUser = {
      _id: '60d5f714f7a2f042f8a9b7b1',
      workoutPlan: [{ day: 'Test Workout Day', exercises: [] }],
      save: jest.fn().mockResolvedValue(updatedUser), 
    };

    // Mock authMiddleware to simulate authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: '60d5f714f7a2f042f8a9b7b1' }; // User ID
      next();
    });

    // Mock User.findById to simulate finding a user
    User.findById.mockResolvedValue(updatedUser);

    // Mock User.save to simulate saving the updated user
    User.prototype.save.mockResolvedValue(updatedUser);

    const response = await request(app)
      .post('/workout-days')
      .set('Authorization', 'Bearer valid_token')
      .send(newDay);

      console.log('response.body:', response.body)

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Workout day added successfully');
    expect(response.body.day).toBe('Test Workout Day');
    expect(updatedUser.save).toHaveBeenCalled(); 
  });

  it('should return an error if day is missing', async () => {
    const response = await request(app)
      .post('/workout-days')
      .set('Authorization', 'Bearer valid_token')
      .send({}); // Missing 'day'

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Day name is required');
  });

  it('should return an error if day already exists', async () => {
    const newDay = { day: 'Test Workout Day' };
    const userWithExistingDay = {
      _id: '60d5f714f7a2f042f8a9b7b1',
      workoutPlan: [{ day: 'Test Workout Day', exercises: [] }],
    };

    // Mock the user object with existing day
    User.findById.mockResolvedValue(userWithExistingDay);

    const response = await request(app)
      .post('/workout-days')
      .set('Authorization', 'Bearer valid_token')
      .send(newDay);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Day already exists');
  });
});

// Test for DELETE workout days
describe('DELETE /workout/:day', () => {
  it('should delete a workout day for the user', async () => {
    const dayToDelete = 'Day 1';

    // Mock the user object with a workout plan
    const updatedUser = {
      _id: '60d5f714f7a2f042f8a9b7b1',
      workoutPlan: [{ day: 'Day 1', exercises: [] }],
      save: jest.fn().mockResolvedValue(updatedUser), // Mock save method
    };

    // Mock authMiddleware to simulate authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: '60d5f714f7a2f042f8a9b7b1' }; // User ID
      next();
    });

    // Mock User.findById to simulate finding a user
    User.findById.mockResolvedValue(updatedUser);

    const response = await request(app)
      .delete(`/workout/${dayToDelete}`)
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Workout day deleted successfully');
    expect(updatedUser.save).toHaveBeenCalled(); // Ensure save was called
  });

  it('should return an error if the user is not found', async () => {
    const dayToDelete = 'Day 1';

    // Mock User.findById to return null (user not found)
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/workout/${dayToDelete}`)
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});