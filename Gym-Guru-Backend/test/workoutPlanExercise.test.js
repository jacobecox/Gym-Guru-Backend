import express from 'express';
import request from 'supertest';
import User from '../models/user.js';
import authMiddleware from '../controllers/authMiddleware.js';
import postWorkoutExercise from '../routes/postWorkoutExercise.js'
import deleteWorkoutExercise from '../routes/deleteWorkoutExercise.js'


// Mock Mongoose Model and Middleware
jest.mock('../models/User'); // Mocking User model
jest.mock('../controllers/authMiddleware'); // Mocking auth middleware

const app = express();
app.use(express.json());
app.use(postWorkoutExercise)
app.use(deleteWorkoutExercise)


beforeEach(() => {
  jest.clearAllMocks();
});

// Test for POST workout plan exercise
describe('POST /workout-days/:day/exercises', () => {
  it('should add an exercise to a workout day for the user', async () => {
    const day = 'Day 1';
    const newExercise = {
      id: 'exercise1',
      name: 'Squat',
      equipment: 'Barbell',
      target: 'Legs'
    };

    // Mock the user object with a workout plan
    const userWithWorkout = {
      _id: '60d5f714f7a2f042f8a9b7b1',
      workoutPlan: [{ day: 'Day 1', exercises: [] }],
      save: jest.fn().mockResolvedValue(userWithWorkout), // Mock save method
    };

    // Mock authMiddleware to simulate authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: '60d5f714f7a2f042f8a9b7b1' }; // User ID
      next();
    });

    // Mock User.findById to simulate finding a user
    User.findById.mockResolvedValue(userWithWorkout);

    const response = await request(app)
      .post(`/workout-days/${day}/exercises`)
      .set('Authorization', 'Bearer valid_token')
      .send(newExercise);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Exercise added successfully');
    expect(response.body.workoutPlan[0].exercises).toHaveLength(1); // Ensure the exercise was added
    expect(response.body.workoutPlan[0].exercises[0].name).toBe('Squat'); // Ensure exercise details match
  });

  it('should return an error if any exercise detail is missing', async () => {
    const day = 'Day 1';
    const incompleteExercise = {
      id: 'exercise1',
      name: 'Squat', // Missing equipment and target
    };

    const response = await request(app)
      .post(`/workout-days/${day}/exercises`)
      .set('Authorization', 'Bearer valid_token')
      .send(incompleteExercise);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All exercise details are required');
  });

  it('should return an error if the workout day is not found', async () => {
    const day = 'Day 2'; // Non-existent day
    const newExercise = {
      id: 'exercise1',
      name: 'Squat',
      equipment: 'Barbell',
      target: 'Legs'
    };

    // Mock user object without the requested workout day
    const userWithNoDay = {
      _id: '60d5f714f7a2f042f8a9b7b1',
      workoutPlan: [{ day: 'Day 1', exercises: [] }],
      save: jest.fn().mockResolvedValue(userWithNoDay), // Mock save method
    };

    // Mock User.findById to return the user without the requested day
    User.findById.mockResolvedValue(userWithNoDay);

    const response = await request(app)
      .post(`/workout-days/${day}/exercises`)
      .set('Authorization', 'Bearer valid_token')
      .send(newExercise);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Workout day not found');
  });

  it('should return an error if the user is not found', async () => {
    const day = 'Day 1';
    const newExercise = {
      id: 'exercise1',
      name: 'Squat',
      equipment: 'Barbell',
      target: 'Legs'
    };

    // Mock User.findById to return null (user not found)
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .post(`/workout-days/${day}/exercises`)
      .set('Authorization', 'Bearer valid_token')
      .send(newExercise);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

// Test for DELETE workout plan exercise
describe('DELETE /workout-days/:day/exercises/:exerciseId', () => {
  it('should remove an exercise from a workout day for the user', async () => {
    const day = 'Day 1';
    const exerciseIdToRemove = 'exercise1';

    // Mock the user object with a workout plan containing exercises
    const userWithExercises = {
      _id: '60d5f714f7a2f042f8a9b7b1',
      workoutPlan: [{ day: 'Day 1', exercises: [{ id: exerciseIdToRemove, name: 'Squat', equipment: 'Barbell', target: 'Legs' }] }],
      save: jest.fn().mockResolvedValue(userWithExercises), // Mock save method
    };

    // Mock authMiddleware to simulate authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { _id: '60d5f714f7a2f042f8a9b7b1' }; // User ID
      next();
    });

    // Mock User.findById to simulate finding a user
    User.findById.mockResolvedValue(userWithExercises);

    const response = await request(app)
      .delete(`/workout-days/${day}/exercises/${exerciseIdToRemove}`)
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Exercise removed successfully');
    expect(response.body.workoutPlan[0].exercises).toHaveLength(0); // Ensure the exercise was removed
  });

  it('should return an error if the workout day is not found', async () => {
    const day = 'Day 2'; // Non-existent day
    const exerciseIdToRemove = 'exercise1';

    // Mock user object without the requested workout day
    const userWithNoDay = {
      _id: '60d5f714f7a2f042f8a9b7b1',
      workoutPlan: [{ day: 'Day 1', exercises: [] }],
      save: jest.fn().mockResolvedValue(userWithNoDay), // Mock save method
    };

    // Mock User.findById to return the user without the requested day
    User.findById.mockResolvedValue(userWithNoDay);

    const response = await request(app)
      .delete(`/workout-days/${day}/exercises/${exerciseIdToRemove}`)
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Workout day not found');
  });


  it('should return an error if the user is not found', async () => {
    const day = 'Day 1';
    const exerciseIdToRemove = 'exercise1';

    // Mock User.findById to return null (user not found)
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/workout-days/${day}/exercises/${exerciseIdToRemove}`)
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});