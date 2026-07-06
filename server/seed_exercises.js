import mongoose from 'mongoose';
import './src/config/env.js';
import ExercicesAdmin from './src/models/ExercicesAdmin.js';

const exercises = [
  // Chest
  { nomExercice: 'Barbell Bench Press', muscle: 'chest', angle: 'middle', type: 'Compound', category: 'Chest' },
  { nomExercice: 'Incline Barbell Press', muscle: 'chest', angle: 'upper', type: 'Compound', category: 'Chest' },
  { nomExercice: 'Dumbbell Bench Press', muscle: 'chest', angle: 'middle', type: 'Compound', category: 'Chest' },
  { nomExercice: 'Dumbbell Flyes', muscle: 'chest', angle: 'isolation', type: 'Isolation', category: 'Chest' },
  { nomExercice: 'Cable Crossover', muscle: 'chest', angle: 'lower', type: 'Isolation', category: 'Chest' },
  
  // Back
  { nomExercice: 'Pull Ups', muscle: 'back', angle: 'lats', type: 'Compound', category: 'Back' },
  { nomExercice: 'Lat Pulldown', muscle: 'back', angle: 'lats', type: 'Compound', category: 'Back' },
  { nomExercice: 'Bent Over Row', muscle: 'back', angle: 'rhomboides', type: 'Compound', category: 'Back' },
  { nomExercice: 'Seated Cable Row', muscle: 'back', angle: 'rhomboides', type: 'Isolation', category: 'Back' },
  { nomExercice: 'Deadlift', muscle: 'back', angle: 'low_back', type: 'Compound', category: 'Back' },

  // Legs
  { nomExercice: 'Barbell Squat', muscle: 'legs', angle: 'quadriceps', type: 'Compound', category: 'Legs' },
  { nomExercice: 'Leg Press', muscle: 'legs', angle: 'quadriceps', type: 'Compound', category: 'Legs' },
  { nomExercice: 'Leg Curls', muscle: 'legs', angle: 'hamstrings', type: 'Isolation', category: 'Legs' },
  { nomExercice: 'Calf Raises', muscle: 'legs', angle: 'calves', type: 'Isolation', category: 'Legs' },
  { nomExercice: 'Hip Thrusts', muscle: 'legs', angle: 'glutes', type: 'Compound', category: 'Legs' },

  // Shoulders
  { nomExercice: 'Military Press', muscle: 'delt', angle: 'FrontDelt', type: 'Compound', category: 'Shoulders' },
  { nomExercice: 'Dumbbell Side Lateral Raise', muscle: 'delt', angle: 'LateralDelt', type: 'Isolation', category: 'Shoulders' },
  { nomExercice: 'Face Pulls', muscle: 'delt', angle: 'RearDelt', type: 'Isolation', category: 'Shoulders' },

  // Arms
  { nomExercice: 'Barbell Curl', muscle: 'biceps', angle: 'longHead', type: 'Isolation', category: 'Arms' },
  { nomExercice: 'Hammer Curls', muscle: 'biceps', angle: 'Brachialis', type: 'Isolation', category: 'Arms' },
  { nomExercice: 'Triceps Pushdown', muscle: 'triceps', angle: 'lateralHead', type: 'Isolation', category: 'Arms' },
  { nomExercice: 'Skull Crushers', muscle: 'triceps', angle: 'longHead', type: 'Compound', category: 'Arms' },

  // Traps & Core
  { nomExercice: 'Dumbbell Shrugs', muscle: 'trapez', angle: 'default', type: 'Isolation', category: 'Traps' },
  { nomExercice: 'Plank', muscle: 'core', angle: 'default', type: 'Isolation', category: 'Core' },
  { nomExercice: 'Hanging Leg Raise', muscle: 'core', angle: 'default', type: 'Isolation', category: 'Core' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB for re-seeding');
    await ExercicesAdmin.deleteMany({});
    await ExercicesAdmin.insertMany(exercises);
    console.log('Successfully re-seeded with enhanced exercise data');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
