export interface Exercise {
  id: string;
  name: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  description: string;
  instructions: string[];
  fittPrinciple: {
    frequency: string;
    intensity: string;
    time: string;
    type: string;
  };
  demoVideoUrl?: string;
  bodyPart: string[];
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  exercises: Exercise[];
  conditions: string[];
}

export const exerciseCategories: ExerciseCategory[] = [
  {
    id: 'pain-mobility',
    name: 'Pain & Mobility Relief',
    description: 'Exercises focused on reducing pain and improving range of motion',
    icon: '🏥',
    conditions: ['neck-pain', 'lower-back-pain', 'shoulder-pain', 'knee-pain', 'hip-pain'],
    exercises: [
      {
        id: 'neck-stretches',
        name: 'Neck Stretches',
        duration: '5 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        description: 'Gentle neck stretches to improve range of motion and reduce tension.',
        bodyPart: ['neck', 'upper-back'],
        fittPrinciple: {
          frequency: '3-4 times daily',
          intensity: 'Light - should feel gentle stretch',
          time: '15-30 seconds per stretch',
          type: 'Static stretching'
        },
        instructions: [
          'Sit comfortably with your back straight',
          'Slowly tilt your head to the right, hold for 15 seconds',
          'Return to center and repeat on the left side',
          'Gently look up and down, holding each position',
          'Repeat 3 times each direction'
        ]
      },
      {
        id: 'lower-back-cat-cow',
        name: 'Cat-Cow Stretch',
        duration: '4 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        description: 'Improve spinal flexibility and reduce lower back tension.',
        bodyPart: ['lower-back', 'core'],
        fittPrinciple: {
          frequency: '2-3 times daily',
          intensity: 'Light to moderate',
          time: '10-15 repetitions',
          type: 'Dynamic mobility'
        },
        instructions: [
          'Start on hands and knees',
          'Arch your back and look up (cow position)',
          'Round your back and tuck chin to chest (cat position)',
          'Move slowly and breathe deeply',
          'Repeat 10-15 times'
        ]
      },
      {
        id: 'shoulder-pendulum',
        name: 'Shoulder Pendulum Swings',
        duration: '3 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        description: 'Gentle shoulder mobility exercise for pain relief.',
        bodyPart: ['shoulder', 'arm'],
        fittPrinciple: {
          frequency: '3-4 times daily',
          intensity: 'Very light - let gravity do the work',
          time: '30 seconds each direction',
          type: 'Passive range of motion'
        },
        instructions: [
          'Lean forward and let your affected arm hang',
          'Gently swing arm in small circles',
          'Gradually increase circle size as tolerated',
          'Switch directions after 30 seconds',
          'Keep movements slow and controlled'
        ]
      }
    ]
  },
  {
    id: 'post-surgery',
    name: 'Post-Surgery Rehabilitation',
    description: 'Structured rehabilitation programs for post-surgical recovery',
    icon: '🏥',
    conditions: ['knee-replacement', 'hip-surgery', 'spinal-surgery', 'upper-limb-surgery'],
    exercises: [
      {
        id: 'knee-rom',
        name: 'Knee Range of Motion',
        duration: '10 minutes',
        difficulty: 'Beginner',
        category: 'Rehabilitation',
        description: 'Progressive knee mobility after surgery.',
        bodyPart: ['knee', 'thigh'],
        fittPrinciple: {
          frequency: '3-4 times daily',
          intensity: 'Light - within pain tolerance',
          time: '10-15 repetitions',
          type: 'Active assisted range of motion'
        },
        instructions: [
          'Lie on your back with knee supported',
          'Slowly bend knee as far as comfortable',
          'Hold for 5 seconds',
          'Slowly straighten knee',
          'Repeat 10-15 times'
        ]
      },
      {
        id: 'hip-abduction',
        name: 'Hip Abduction',
        duration: '8 minutes',
        difficulty: 'Beginner',
        category: 'Strengthening',
        description: 'Strengthen hip muscles after surgery.',
        bodyPart: ['hip', 'glutes'],
        fittPrinciple: {
          frequency: '2-3 times daily',
          intensity: 'Light to moderate',
          time: '10 repetitions, 3 sets',
          type: 'Isometric strengthening'
        },
        instructions: [
          'Lie on your back',
          'Slowly move leg out to the side',
          'Keep toes pointing up',
          'Hold for 5 seconds',
          'Slowly return to center'
        ]
      }
    ]
  },
  {
    id: 'neurological',
    name: 'Neurological Rehabilitation',
    description: 'Specialized exercises for neurological conditions',
    icon: '🧠',
    conditions: ['stroke', 'parkinsons', 'multiple-sclerosis', 'balance-disorders'],
    exercises: [
      {
        id: 'balance-training',
        name: 'Balance Training',
        duration: '15 minutes',
        difficulty: 'Intermediate',
        category: 'Balance',
        description: 'Improve balance and stability for neurological conditions.',
        bodyPart: ['whole-body', 'core'],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Moderate - challenging but safe',
          time: '30 seconds per exercise',
          type: 'Proprioceptive training'
        },
        instructions: [
          'Stand with feet hip-width apart',
          'Close eyes and maintain balance for 30 seconds',
          'Progress to single-leg stands',
          'Use wall support if needed',
          'Focus on steady breathing'
        ]
      },
      {
        id: 'gait-training',
        name: 'Gait Training Exercises',
        duration: '20 minutes',
        difficulty: 'Intermediate',
        category: 'Functional',
        description: 'Improve walking patterns and coordination.',
        bodyPart: ['legs', 'core'],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Moderate',
          time: '10-15 minutes',
          type: 'Functional movement'
        },
        instructions: [
          'Walk in straight line, heel to toe',
          'Focus on lifting knees high',
          'Take deliberate, controlled steps',
          'Practice turning safely',
          'Use support as needed'
        ]
      }
    ]
  },
  {
    id: 'geriatric',
    name: 'Geriatric (Elderly) Care',
    description: 'Safe and effective exercises for older adults',
    icon: '👴',
    conditions: ['fall-prevention', 'daily-function', 'flexibility', 'low-impact-cardio'],
    exercises: [
      {
        id: 'fall-prevention',
        name: 'Fall Prevention Exercises',
        duration: '12 minutes',
        difficulty: 'Beginner',
        category: 'Balance',
        description: 'Strengthen legs and improve balance to prevent falls.',
        bodyPart: ['legs', 'core', 'ankles'],
        fittPrinciple: {
          frequency: '3-4 times per week',
          intensity: 'Light to moderate',
          time: '10-12 repetitions',
          type: 'Functional strengthening'
        },
        instructions: [
          'Hold onto chair for support',
          'Practice standing from seated position',
          'Stand on one foot for 10 seconds',
          'Walk heel to toe in straight line',
          'Practice stepping over obstacles'
        ]
      },
      {
        id: 'chair-exercises',
        name: 'Chair-Based Exercises',
        duration: '15 minutes',
        difficulty: 'Beginner',
        category: 'Strengthening',
        description: 'Safe strengthening exercises using a chair.',
        bodyPart: ['arms', 'legs', 'core'],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Light',
          time: '8-12 repetitions',
          type: 'Resistance training'
        },
        instructions: [
          'Sit tall in sturdy chair',
          'Perform arm circles and leg extensions',
          'Practice standing and sitting',
          'Do seated marching in place',
          'Gentle torso twists'
        ]
      }
    ]
  },
  {
    id: 'sports-injury',
    name: 'Sports Injury Rehabilitation',
    description: 'Recovery and return-to-play programs for athletes',
    icon: '⚽',
    conditions: ['acl-rehab', 'ankle-sprain', 'rotator-cuff', 'return-to-play'],
    exercises: [
      {
        id: 'acl-rehab',
        name: 'ACL Rehabilitation',
        duration: '25 minutes',
        difficulty: 'Advanced',
        category: 'Rehabilitation',
        description: 'Comprehensive ACL recovery program.',
        bodyPart: ['knee', 'thigh', 'glutes'],
        fittPrinciple: {
          frequency: '4-5 times per week',
          intensity: 'Moderate to high',
          time: '15 repetitions, 3 sets',
          type: 'Progressive strengthening'
        },
        instructions: [
          'Start with range of motion exercises',
          'Progress to quadriceps strengthening',
          'Add balance and proprioception training',
          'Include plyometric exercises when ready',
          'Follow surgeon and PT guidelines'
        ]
      },
      {
        id: 'ankle-sprain-rehab',
        name: 'Ankle Sprain Recovery',
        duration: '18 minutes',
        difficulty: 'Intermediate',
        category: 'Rehabilitation',
        description: 'Progressive ankle strengthening and mobility.',
        bodyPart: ['ankle', 'calf', 'foot'],
        fittPrinciple: {
          frequency: '2-3 times daily initially',
          intensity: 'Light to moderate',
          time: '10-15 repetitions',
          type: 'Progressive loading'
        },
        instructions: [
          'Start with gentle range of motion',
          'Progress to resistance band exercises',
          'Add balance training on unstable surface',
          'Include calf strengthening',
          'Gradually return to sport-specific movements'
        ]
      }
    ]
  },
  {
    id: 'chronic-conditions',
    name: 'Chronic Conditions Support',
    description: 'Long-term management exercises for chronic conditions',
    icon: '💪',
    conditions: ['arthritis', 'osteoporosis', 'cardiac-rehab', 'respiratory'],
    exercises: [
      {
        id: 'arthritis-mobility',
        name: 'Arthritis Joint Mobility',
        duration: '12 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        description: 'Gentle exercises to maintain joint mobility in arthritis.',
        bodyPart: ['joints', 'whole-body'],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Light - within comfort zone',
          time: '5-10 repetitions',
          type: 'Range of motion'
        },
        instructions: [
          'Warm up joints with gentle movement',
          'Move each joint through full range',
          'Hold stretches for 15-30 seconds',
          'Use heat therapy before exercise',
          'Stop if pain increases'
        ]
      },
      {
        id: 'cardiac-rehab',
        name: 'Cardiac Rehabilitation',
        duration: '30 minutes',
        difficulty: 'Beginner',
        category: 'Cardio',
        description: 'Safe cardiovascular exercise for heart health.',
        bodyPart: ['cardiovascular', 'whole-body'],
        fittPrinciple: {
          frequency: '3-5 times per week',
          intensity: 'Low to moderate (60-70% max HR)',
          time: '20-30 minutes',
          type: 'Aerobic exercise'
        },
        instructions: [
          'Start with 5-minute warm-up',
          'Monitor heart rate throughout',
          'Include walking, cycling, or swimming',
          'Cool down for 5-10 minutes',
          'Track symptoms and progress'
        ]
      }
    ]
  },
  {
    id: 'wellness-prevention',
    name: 'General Wellness & Prevention',
    description: 'Preventive exercises for overall health and fitness',
    icon: '🌟',
    conditions: ['posture-correction', 'core-stability', 'flexibility', 'functional-fitness'],
    exercises: [
      {
        id: 'posture-correction',
        name: 'Posture Correction Program',
        duration: '15 minutes',
        difficulty: 'Beginner',
        category: 'Posture',
        description: 'Combat desk job posture and improve alignment.',
        bodyPart: ['spine', 'shoulders', 'neck'],
        fittPrinciple: {
          frequency: '2-3 times daily',
          intensity: 'Light to moderate',
          time: '30 seconds to 1 minute holds',
          type: 'Postural strengthening'
        },
        instructions: [
          'Strengthen upper back muscles',
          'Stretch chest and hip flexors',
          'Practice proper sitting posture',
          'Perform desk-based exercises',
          'Take frequent posture breaks'
        ]
      },
      {
        id: 'core-stability',
        name: 'Core Stability Training',
        duration: '20 minutes',
        difficulty: 'Intermediate',
        category: 'Strengthening',
        description: 'Strengthen deep core muscles for spinal stability.',
        bodyPart: ['core', 'lower-back', 'pelvis'],
        fittPrinciple: {
          frequency: '3-4 times per week',
          intensity: 'Moderate',
          time: '30-60 second holds',
          type: 'Isometric strengthening'
        },
        instructions: [
          'Start with basic planks',
          'Progress to side planks',
          'Add dead bug exercises',
          'Include bird dog movements',
          'Focus on breathing during holds'
        ]
      },
      {
        id: 'functional-fitness',
        name: 'Functional Fitness',
        duration: '25 minutes',
        difficulty: 'Intermediate',
        category: 'Functional',
        description: 'Exercises that mimic daily activities.',
        bodyPart: ['whole-body'],
        fittPrinciple: {
          frequency: '3 times per week',
          intensity: 'Moderate',
          time: '8-12 repetitions',
          type: 'Multi-joint movements'
        },
        instructions: [
          'Practice squatting movements',
          'Work on lifting and carrying',
          'Include pushing and pulling motions',
          'Add rotational movements',
          'Progress to more complex patterns'
        ]
      }
    ]
  }
];

export const getExercisesByCondition = (condition: string): Exercise[] => {
  const matchingCategories = exerciseCategories.filter(category => 
    category.conditions.includes(condition)
  );
  
  return matchingCategories.flatMap(category => category.exercises);
};

export const getExerciseById = (id: string): Exercise | undefined => {
  for (const category of exerciseCategories) {
    const exercise = category.exercises.find(ex => ex.id === id);
    if (exercise) return exercise;
  }
  return undefined;
};