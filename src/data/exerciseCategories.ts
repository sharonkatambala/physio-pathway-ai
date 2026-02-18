export type ExerciseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ExerciseCategoryExercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: ExerciseDifficulty;
  category: string;
  bodyPart: string[];
  instructions: string[];
  fittPrinciple: {
    frequency: string;
    intensity: string;
    time: string;
    type: string;
  };
  demoImageUrl?: string;
  demoVideoUrl?: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  swName?: string;
  swDescription?: string;
  demoImageUrl?: string;
  demoVideoUrl?: string;
  exercises: ExerciseCategoryExercise[];
}

export const exerciseCategories: ExerciseCategory[] = [
  {
    id: 'pain-mobility',
    name: 'Pain & Mobility Relief',
    swName: 'Utulivu wa Maumivu na Uhamaji',
    description: 'Exercises focused on reducing pain and improving range of motion.',
    swDescription: 'Mazoezi yanayolenga kupunguza maumivu na kuboresha uwezo wa mwendo.',
    exercises: [
      {
        id: 'neck-stretches',
        name: 'Neck Stretches',
        description: 'Gentle neck stretches to improve range of motion and reduce tension.',
        duration: '5 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        bodyPart: ['neck', 'upper-back'],
        instructions: [
          'Sit comfortably with your back straight.',
          'Slowly tilt your head to the right and hold for 15 seconds.',
          'Return to center and repeat on the left side.',
          'Gently look up and down, holding each position.',
          'Repeat 3 times each direction.'
        ],
        fittPrinciple: {
          frequency: '3-4 times daily',
          intensity: 'Light - should feel a gentle stretch',
          time: '15-30 seconds per stretch',
          type: 'Static stretching'
        },
        demoImageUrl: '/exercises/neck-stretches.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=JH1M-p8PZeU'
      },
      {
        id: 'cat-cow-stretch',
        name: 'Cat-Cow Stretch',
        description: 'Improve spinal flexibility and reduce lower back tension.',
        duration: '4 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        bodyPart: ['lower-back', 'core'],
        instructions: [
          'Start on hands and knees.',
          'Arch your back and look up (Cow position).',
          'Round your back and tuck your chin (Cat position).',
          'Move slowly and breathe deeply.',
          'Repeat 10-15 times.'
        ],
        fittPrinciple: {
          frequency: '2-3 times daily',
          intensity: 'Light to moderate',
          time: '10-15 repetitions',
          type: 'Dynamic mobility'
        },
        demoImageUrl: '/exercises/cat_cow%20stretch.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=4iKECqKy_q0'
      },
      {
        id: 'shoulder-pendulum-swings',
        name: 'Shoulder Pendulum Swings',
        description: 'Gentle shoulder mobility exercise for pain relief.',
        duration: '3 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        bodyPart: ['shoulder', 'arm'],
        instructions: [
          'Lean forward and let your affected arm hang.',
          'Gently swing the arm in small circles.',
          'Gradually increase circle size as tolerated.',
          'Switch directions after 30 seconds.',
          'Keep movements slow and controlled.'
        ],
        fittPrinciple: {
          frequency: '3-4 times daily',
          intensity: 'Very light - let gravity do the work',
          time: '30 seconds each direction',
          type: 'Passive range of motion'
        },
        demoImageUrl: '/exercises/pendulum-exercise.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=V57uoLgsq04'
      },
      {
        id: 'pelvic-tilts',
        name: 'Pelvic Tilts',
        description: 'Activate core stabilizers and reduce lumbar stiffness.',
        duration: '6-8 min',
        difficulty: 'Intermediate',
        category: 'Stability',
        bodyPart: ['core', 'pelvis', 'lower-back'],
        instructions: [
          'Lie on your back with knees bent, feet flat.',
          'Gently flatten your lower back into the floor.',
          'Hold for 3-5 seconds, then relax.',
          'Repeat for 10-15 reps.'
        ],
        fittPrinciple: {
          frequency: '1-2x daily',
          intensity: 'Low to moderate, RPE 3-4/10',
          time: '6-8 minutes',
          type: 'Core activation'
        },
        demoImageUrl: '/exercises/pelvic-tilt-cdc.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=W665sT9B-7U'
      },
      {
        id: 'neck-bends',
        name: 'Neck Bends',
        description: 'Gentle side-to-side neck mobility to reduce stiffness.',
        duration: '4-6 minutes',
        difficulty: 'Intermediate',
        category: 'Mobility',
        bodyPart: ['neck', 'upper-back'],
        instructions: [
          'Sit tall with shoulders relaxed.',
          'Slowly tilt your head toward one shoulder.',
          'Hold briefly, then return to center.',
          'Repeat to the other side.',
          'Complete 8-10 reps per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x daily',
          intensity: 'Light',
          time: '8-10 repetitions per side',
          type: 'Mobility & flexibility'
        },
        demoImageUrl: '/exercises/Neck%20Bends.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=54y0JAT46vE'
      },
      {
        id: 'lower-trunk-rotation',
        name: 'Lower Trunk Rotation',
        description: 'Improve lumbar mobility and reduce stiffness.',
        duration: '6-8 minutes',
        difficulty: 'Advanced',
        category: 'Mobility',
        bodyPart: ['lower-back', 'hips', 'core'],
        instructions: [
          'Lie on your back with knees bent and feet flat.',
          'Let both knees fall slowly to one side.',
          'Keep shoulders relaxed on the floor.',
          'Return to center and repeat to the other side.',
          'Complete 10-12 reps each side.'
        ],
        fittPrinciple: {
          frequency: '3-4x per week',
          intensity: 'Light to moderate',
          time: '10-12 repetitions per side',
          type: 'Mobility & control'
        },
        demoImageUrl: '/exercises/Lower%20Trunk%20Rotation.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=LC1rtQrd6m0'
      },
      {
        id: 'thoracic-extension',
        name: 'Thoracic Extension',
        description: 'Open the upper back to improve posture and mobility.',
        duration: '6-8 minutes',
        difficulty: 'Advanced',
        category: 'Mobility',
        bodyPart: ['upper-back', 'shoulders'],
        instructions: [
          'Sit or kneel with hands behind your head.',
          'Gently extend the upper back over a support.',
          'Hold briefly, then return to neutral.',
          'Avoid arching the lower back.',
          'Repeat 8-10 times.'
        ],
        fittPrinciple: {
          frequency: '3-4x per week',
          intensity: 'Light',
          time: '8-10 repetitions',
          type: 'Mobility & posture'
        },
        demoImageUrl: '/exercises/Thoracic%20Extension.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=wyAPLCyLntg'
      }
    ]
  },
  {
    id: 'post-surgery',
    name: 'Post-Surgery Rehabilitation',
    swName: 'Urejeshaji Baada ya Upasuaji',
    description: 'Structured rehabilitation programs for post-surgical recovery.',
    swDescription: 'Mipango ya urekebishaji baada ya upasuaji kwa urejeshaji salama.',
    exercises: [
      {
        id: 'knee-rom',
        name: 'Knee Range of Motion',
        description: 'Progressive knee mobility after surgery.',
        duration: '10 minutes',
        difficulty: 'Beginner',
        category: 'Rehabilitation',
        bodyPart: ['knee', 'thigh'],
        instructions: [
          'Lie on your back with knee supported.',
          'Slowly bend the knee as far as comfortable.',
          'Hold for 5 seconds.',
          'Slowly straighten the knee.',
          'Repeat 10-15 times.'
        ],
        fittPrinciple: {
          frequency: '3-4 times daily',
          intensity: 'Light - within pain tolerance',
          time: '10-15 repetitions',
          type: 'Active assisted range of motion'
        },
        demoImageUrl: '/exercises/Knee%20Range%20of%20Motion.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=zlxxgZqZuPQ'
      },
      {
        id: 'hip-abduction',
        name: 'Hip Abduction',
        description: 'Strengthen hip muscles after surgery.',
        duration: '8 minutes',
        difficulty: 'Beginner',
        category: 'Strengthening',
        bodyPart: ['hip', 'glutes'],
        instructions: [
          'Lie on your back.',
          'Slowly move leg out to the side.',
          'Keep toes pointing up.',
          'Hold for 5 seconds.',
          'Slowly return to center.'
        ],
        fittPrinciple: {
          frequency: '2-3 times daily',
          intensity: 'Light to moderate',
          time: '10 repetitions, 3 sets',
          type: 'Isometric strengthening'
        },
        demoImageUrl: '/exercises/Hip%20Abduction.jpg',
        demoVideoUrl: 'https://www.youtube.com/watch?v=dBeyU0RddP4'
      },
      {
        id: 'quad-sets',
        name: 'Seated Quad Sets',
        description: 'Activate the quadriceps to support knee recovery.',
        duration: '6-8 minutes',
        difficulty: 'Intermediate',
        category: 'Strengthening',
        bodyPart: ['quadriceps', 'knee'],
        instructions: [
          'Sit with the leg extended and supported.',
          'Tighten the thigh muscle to press the knee down.',
          'Hold for 5 seconds, then relax.',
          'Repeat 10-15 reps per leg.'
        ],
        fittPrinciple: {
          frequency: '2-3x daily',
          intensity: 'Light',
          time: '10-15 repetitions',
          type: 'Isometric strengthening'
        },
        demoImageUrl: '/exercises/Seated%20Quad%20Sets.jpg',
        demoVideoUrl: 'https://www.youtube.com/watch?v=KZ1mC5zg2TI'
      },
      {
        id: 'towel-slides',
        name: 'Towel Slides',
        description: 'Improve knee flexion with controlled sliding.',
        duration: '8-10 minutes',
        difficulty: 'Intermediate',
        category: 'Rehabilitation',
        bodyPart: ['knee', 'hamstrings'],
        instructions: [
          'Lie on your back with a towel under the heel.',
          'Slowly slide the heel toward your hips.',
          'Pause briefly, then slide back to start.',
          'Move within a comfortable range.',
          'Complete 10-12 repetitions.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Light',
          time: '10-12 repetitions',
          type: 'Active assisted range of motion'
        },
        demoImageUrl: '/exercises/Towel%20Slides.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=vK3pu3n1JLk'
      },
      {
        id: 'step-ups-post-surgery',
        name: 'Supported Step-Ups',
        description: 'Build functional strength for stairs and daily activity.',
        duration: '8-10 minutes',
        difficulty: 'Advanced',
        category: 'Strength',
        bodyPart: ['quadriceps', 'glutes', 'hips'],
        instructions: [
          'Step onto a low step with the surgical leg.',
          'Drive through the heel to stand tall.',
          'Step down slowly with control.',
          'Use a rail or wall for support.',
          'Complete 2-3 sets of 8-10 reps.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 sets of 8-10 reps',
          type: 'Functional strength'
        },
        demoImageUrl: '/exercises/step-up-cdc.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=lP_uKBrkdmM'
      },
      {
        id: 'assisted-lunge',
        name: 'Assisted Lunge',
        description: 'Restore lower-body control with a supported lunge.',
        duration: '8-10 minutes',
        difficulty: 'Advanced',
        category: 'Strength',
        bodyPart: ['glutes', 'quadriceps', 'hips'],
        instructions: [
          'Stand holding a stable support.',
          'Step forward and lower into a gentle lunge.',
          'Keep the front knee aligned over the toes.',
          'Push back to start and repeat.',
          'Complete 2-3 sets of 8-10 reps per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 sets of 8-10 reps',
          type: 'Functional strength'
        },
        demoImageUrl: '/exercises/lunge-cdc.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=aMCTlZztF54'
      }
    ]
  },
  {
    id: 'neurological',
    name: 'Neurological Rehabilitation',
    swName: 'Urekebishaji wa Mfumo wa Neva',
    description: 'Specialized exercises for neurological conditions.',
    swDescription: 'Mazoezi maalum kwa hali za mfumo wa neva.',
    exercises: [
      {
        id: 'seated-weight-shifts',
        name: 'Seated Weight Shifts',
        description: 'Improve balance and postural control while seated.',
        duration: '6-8 min',
        difficulty: 'Beginner',
        category: 'Balance',
        bodyPart: ['core', 'trunk', 'hips'],
        instructions: [
          'Sit tall with feet flat and hands on thighs.',
          'Shift weight slowly to the right without lifting the hips.',
          'Return to center, then shift left.',
          'Complete 8-10 shifts each side.'
        ],
        fittPrinciple: {
          frequency: '1-2x daily',
          intensity: 'Low, RPE 2-3/10',
          time: '6-8 minutes',
          type: 'Balance & control'
        },
        demoImageUrl: '/exercises/Seated%20Weight%20Shifts.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=FQdCcgglf80'
      },
      {
        id: 'ankle-bends',
        name: 'Ankle Bends',
        description: 'Improve ankle mobility and proprioception.',
        duration: '5-7 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        bodyPart: ['ankles', 'feet'],
        instructions: [
          'Sit with feet flat on the floor.',
          'Lift toes toward the ceiling, then lower.',
          'Press toes down, then return to neutral.',
          'Move slowly and evenly.',
          'Repeat 12-15 times.'
        ],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Light',
          time: '12-15 repetitions',
          type: 'Mobility & control'
        },
        demoImageUrl: '/exercises/Ankle%20Bends.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=gUgG_hfS_nQ'
      },
      {
        id: 'sit-to-stand-neuro',
        name: 'Supported Sit-to-Stand',
        description: 'Build functional strength and improve transfer ability.',
        duration: '8-10 min',
        difficulty: 'Intermediate',
        category: 'Functional',
        bodyPart: ['glutes', 'quadriceps', 'core'],
        instructions: [
          'Sit at the edge of a chair with feet hip-width apart.',
          'Lean forward and stand with control, using support as needed.',
          'Pause briefly, then sit back down slowly.',
          'Complete 2-3 sets of 6-10 reps.'
        ],
        fittPrinciple: {
          frequency: '3-4x per week',
          intensity: 'Low to moderate, RPE 3-4/10',
          time: '8-10 minutes',
          type: 'Functional strength'
        },
        demoImageUrl: '/exercises/Supported%20Sit-to-Stand.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=USUqkjIaR_Y'
      },
      {
        id: 'toe-taps-neuro',
        name: 'Toe Taps',
        description: 'Improve balance, timing, and lower limb control.',
        duration: '6-8 minutes',
        difficulty: 'Intermediate',
        category: 'Balance',
        bodyPart: ['ankles', 'core', 'legs'],
        instructions: [
          'Stand near support with one foot on a low step.',
          'Tap the free foot up and down on the step.',
          'Keep posture tall and movements controlled.',
          'Complete 10-12 taps per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Low to moderate',
          time: '10-12 taps per side',
          type: 'Balance & coordination'
        },
        demoImageUrl: '/exercises/Toe%20Taps.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=OQ-a6ByYhuc'
      },
      {
        id: 'tandem-walk-balance',
        name: 'Tandem Walk',
        description: 'Challenge balance and coordination with heel-to-toe walking.',
        duration: '6-8 min',
        difficulty: 'Advanced',
        category: 'Balance',
        bodyPart: ['ankles', 'hips', 'core'],
        instructions: [
          'Stand near a stable surface for support.',
          'Walk heel-to-toe in a straight line.',
          'Keep your gaze forward and move slowly.',
          'Complete 2-3 passes of 8-12 steps.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate, RPE 4-5/10',
          time: '6-8 minutes',
          type: 'Balance & gait'
        },
        demoImageUrl: '/exercises/Tandem%20Walk.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=MuueTXaBJ3k'
      },
      {
        id: 'gait-training',
        name: 'Gait Training Walk',
        description: 'Practice steady walking with posture and control.',
        duration: '8-10 minutes',
        difficulty: 'Advanced',
        category: 'Gait',
        bodyPart: ['legs', 'core'],
        instructions: [
          'Walk at a comfortable pace with even steps.',
          'Focus on heel-to-toe foot placement.',
          'Keep shoulders relaxed and head up.',
          'Complete 5-8 minutes of steady walking.'
        ],
        fittPrinciple: {
          frequency: '3-4x per week',
          intensity: 'Moderate',
          time: '5-8 minutes',
          type: 'Gait & endurance'
        },
        demoImageUrl: '/exercises/Gait%20Training%20Walk.png',
        demoImagePosition: '50% 60%',
        demoVideoUrl: 'https://www.youtube.com/watch?v=pOPnPaydsB8'
      }
    ]
  },
  {
    id: 'geriatric',
    name: 'Geriatric (Elderly) Care',
    swName: 'Huduma kwa Wazee',
    description: 'Safe and effective exercises for older adults.',
    swDescription: 'Mazoezi salama na yenye ufanisi kwa wazee.',
    exercises: [
      {
        id: 'chair-based-strength',
        name: 'Chair-Based Strength',
        description: 'Foundational strength and mobility using a stable chair.',
        duration: '12-15 minutes',
        difficulty: 'Beginner',
        category: 'Strengthening',
        bodyPart: ['arms', 'legs', 'core'],
        instructions: [
          'Sit tall in a sturdy chair with feet flat.',
          'Perform arm circles for 20 seconds each direction.',
          'Do seated knee extensions for 10-12 reps per leg.',
          'Perform seated marches for 30-45 seconds.',
          'Finish with gentle torso twists.'
        ],
        fittPrinciple: {
          frequency: '3-5 times per week',
          intensity: 'Light',
          time: '8-12 repetitions',
          type: 'Resistance & mobility'
        },
          demoImageUrl: '/exercises/Chair-Based%20Strength.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=FQxLxN2e5Hc'
      },
      {
        id: 'toe-taps-geriatric',
        name: 'Seated Toe Taps',
        description: 'Boost circulation and ankle mobility while seated.',
        duration: '6-8 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        bodyPart: ['ankles', 'legs'],
        instructions: [
          'Sit tall with feet flat on the floor.',
          'Lift toes while keeping heels down.',
          'Lower toes and repeat in a steady rhythm.',
          'Complete 15-20 taps.'
        ],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Light',
          time: '15-20 repetitions',
          type: 'Mobility & circulation'
        },
          demoImageUrl: '/exercises/Seated%20Toe%20Taps.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=Q2a6a7EOYw4'
      },
      {
        id: 'sit-to-stand-balance',
        name: 'Sit-to-Stand + Heel-To-Toe Walk',
        description: 'Build functional leg strength and improve gait balance.',
        duration: '10-12 minutes',
        difficulty: 'Intermediate',
        category: 'Balance',
        bodyPart: ['legs', 'hips', 'core'],
        instructions: [
          'Stand from a chair with control, then sit back down.',
          'Complete 2 sets of 8-10 sit-to-stands.',
          'Next, walk heel-to-toe in a straight line for 6-8 steps.',
          'Turn and repeat 3-4 passes.',
          'Use a wall or rail for support if needed.'
        ],
        fittPrinciple: {
          frequency: '3-4 times per week',
          intensity: 'Light to moderate',
          time: '2 sets + 3-4 passes',
          type: 'Functional strength & balance'
        },
          demoImageUrl: '/exercises/Sit-to-Stand%20Heel-To-Toe%20Walk.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=USUqkjIaR_Y'
      },
      {
        id: 'supported-lunge-geriatric',
        name: 'Supported Lunge',
        description: 'Improve leg strength with controlled supported lunges.',
        duration: '8-10 minutes',
        difficulty: 'Intermediate',
        category: 'Strength',
        bodyPart: ['glutes', 'quadriceps', 'hips'],
        instructions: [
          'Hold a stable surface for support.',
          'Step forward and lower into a gentle lunge.',
          'Keep the front knee aligned over the toes.',
          'Push back to start and repeat.',
          'Complete 2 sets of 6-8 reps per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Light to moderate',
          time: '2 sets of 6-8 reps',
          type: 'Functional strength'
        },
        demoImageUrl: '/exercises/lunge-cdc.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE'
      },
      {
        id: 'single-leg-stance',
        name: 'Single-Leg Stance with Reach',
        description: 'Challenge balance and stability to reduce fall risk.',
        duration: '8-10 minutes',
        difficulty: 'Advanced',
        category: 'Balance',
        bodyPart: ['ankles', 'hips', 'core'],
        instructions: [
          'Stand near a sturdy surface for safety.',
          'Lift one foot and balance for 10-20 seconds.',
          'Reach forward with the opposite hand while maintaining balance.',
          'Switch legs and repeat.',
          'Complete 3-4 rounds per side.'
        ],
        fittPrinciple: {
          frequency: '2-3 times per week',
          intensity: 'Moderate',
          time: '10-20 seconds per hold',
          type: 'Balance & proprioception'
        },
          demoImageUrl: '/exercises/Standing%20Balance%20Reach.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=4p5Q2y3b3t4'
      },
      {
        id: 'dumbbell-curl-geriatric',
        name: 'Dumbbell Curl',
        description: 'Maintain upper-body strength for daily tasks.',
        duration: '6-8 minutes',
        difficulty: 'Advanced',
        category: 'Strength',
        bodyPart: ['arms', 'upper-back'],
        instructions: [
          'Stand or sit tall holding light dumbbells.',
          'Curl the weights toward your shoulders.',
          'Lower slowly with control.',
          'Complete 2-3 sets of 8-12 reps.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 sets of 8-12 reps',
          type: 'Strength maintenance'
        },
        demoImageUrl: '/exercises/dumbbell-9839238.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'
      }
    ]
  },
  {
    id: 'sports-injury',
    name: 'Sports Injury Rehabilitation',
    swName: 'Urekebishaji wa Majeraha ya Michezo',
    description: 'Recovery and return-to-play programs for athletes.',
    swDescription: 'Mipango ya kupona na kurudi kwenye michezo kwa wanariadha.',
    exercises: [
      {
        id: 'ankle-balance-holds',
        name: 'Single-Leg Balance Holds',
        description: 'Restore ankle and knee stability after injury.',
        duration: '6-8 minutes',
        difficulty: 'Beginner',
        category: 'Balance',
        bodyPart: ['ankles', 'knees', 'core'],
        instructions: [
          'Stand near support and lift one foot.',
          'Hold balance for 20-30 seconds.',
          'Switch legs and repeat.',
          'Complete 3-4 rounds per side.'
        ],
        fittPrinciple: {
          frequency: '3-5x per week',
          intensity: 'Low to moderate, RPE 3-4/10',
          time: '6-8 minutes',
          type: 'Balance & stability'
        },
        demoImageUrl: '/exercises/Single-Leg%20Balance%20Holds.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=7SF7AYh2_Yw'
      },
      {
        id: 'ankle-alphabet',
        name: 'Ankle Alphabet',
        description: 'Improve ankle mobility and neuromuscular control.',
        duration: '5-6 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        bodyPart: ['ankles', 'feet'],
        instructions: [
          'Sit with one leg extended and foot off the floor.',
          'Trace the alphabet in the air with your big toe.',
          'Move slowly through comfortable ranges.',
          'Complete 1-2 alphabets per foot.'
        ],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Light',
          time: '1-2 alphabets per foot',
          type: 'Active mobility'
        },
        demoImageUrl: '/exercises/Ankle%20Alphabet.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=ro0eWSYbSuY'
      },
      {
        id: 'calf-raises',
        name: 'Calf Raises',
        description: 'Restore calf strength and ankle control.',
        duration: '6-8 minutes',
        difficulty: 'Beginner',
        category: 'Strength',
        bodyPart: ['calves', 'ankles'],
        instructions: [
          'Stand with feet hip-width apart, hold support if needed.',
          'Rise onto your toes slowly.',
          'Lower with control.',
          'Complete 2-3 sets of 10-15 reps.'
        ],
        fittPrinciple: {
          frequency: '3-4x per week',
          intensity: 'Light to moderate',
          time: '2-3 sets of 10-15 reps',
          type: 'Strength & endurance'
        },
        demoImageUrl: '/exercises/toe-stand-cdc.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=hXB5YxfeoDo'
      },
      {
        id: 'controlled-step-ups',
        name: 'Controlled Step-Ups',
        description: 'Build lower limb strength and control with a low step.',
        duration: '8-10 minutes',
        difficulty: 'Intermediate',
        category: 'Strength',
        bodyPart: ['quadriceps', 'glutes', 'hips'],
        instructions: [
          'Step onto a low step with the injured leg.',
          'Drive through the heel to stand tall.',
          'Step down slowly with control.',
          'Complete 2-3 sets of 8-12 reps per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate, RPE 4-5/10',
          time: '8-10 minutes',
          type: 'Strength & control'
        },
        demoImageUrl: '/exercises/step-up-cdc.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=lP_uKBrkdmM'
      },
      {
        id: 'banded-ankle-strength',
        name: 'Ankle Circles',
        description: 'Improve ankle mobility and control through circular motion.',
        duration: '8-10 minutes',
        difficulty: 'Intermediate',
        category: 'Mobility',
        bodyPart: ['ankles', 'feet'],
        instructions: [
          'Sit with one leg extended and foot off the floor.',
          'Draw slow circles with the toes.',
          'Complete 10 circles clockwise and 10 counterclockwise.',
          'Repeat on the other foot.'
        ],
        fittPrinciple: {
          frequency: '3-5x per week',
          intensity: 'Light',
          time: '10 circles each direction',
          type: 'Mobility & control'
        },
        demoImageUrl: '/exercises/Ankle%20Circles.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=uV0I5adTRXw'
      },
      {
        id: 'lateral-band-walks',
        name: 'Lateral Lunges',
        description: 'Strengthen hips and improve lateral stability.',
        duration: '8-10 minutes',
        difficulty: 'Intermediate',
        category: 'Strength',
        bodyPart: ['hips', 'glutes', 'adductors'],
        instructions: [
          'Stand tall with feet together.',
          'Step out to the side and bend the stepping knee.',
          'Keep the other leg straight and chest up.',
          'Push back to start and repeat.',
          'Complete 2-3 sets of 8-10 reps per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 sets of 8-10 reps',
          type: 'Strength & stability'
        },
        demoImageUrl: '/exercises/lunge-10080464.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=_xRpNzcdzrA'
      },
      {
        id: 'lateral-step-down',
        name: 'Lateral Step-Down',
        description: 'Rebuild lower limb control and eccentric strength.',
        duration: '8-10 min',
        difficulty: 'Advanced',
        category: 'Strength',
        bodyPart: ['quadriceps', 'glutes', 'hips'],
        instructions: [
          'Stand on a low step with one foot hanging off.',
          'Lower the hanging heel toward the floor with control.',
          'Return to start without bouncing.',
          'Complete 2-3 sets of 8-10 reps per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate, RPE 5-6/10',
          time: '8-10 minutes',
          type: 'Strength & control'
        },
        demoImageUrl: '/exercises/step-up-cdc.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=ACf3RgHE9Nw'
      },
      {
        id: 'single-leg-squat-box',
        name: 'Single-Leg Squat to Box',
        description: 'Advance lower limb control and strength safely.',
        duration: '8-10 minutes',
        difficulty: 'Advanced',
        category: 'Strength',
        bodyPart: ['glutes', 'quadriceps', 'core'],
        instructions: [
          'Stand in front of a box or chair.',
          'Lower into a single-leg squat until you tap the box.',
          'Stand back up with control.',
          'Complete 2-3 sets of 6-10 reps per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate to high',
          time: '2-3 sets of 6-10 reps',
          type: 'Strength & control'
        },
        demoImageUrl: '/exercises/Single-Leg%20Squat%20to%20Box.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=_BX9SwZTurA'
      },
      {
        id: 'skater-hops',
        name: 'Skater Hops',
        description: 'Train lateral power and landing control for return to sport.',
        duration: '6-8 minutes',
        difficulty: 'Advanced',
        category: 'Plyometrics',
        bodyPart: ['glutes', 'hips', 'ankles'],
        instructions: [
          'Hop laterally from one foot to the other.',
          'Land softly with knee aligned over toes.',
          'Pause briefly to regain balance.',
          'Complete 2-3 sets of 8-12 hops per side.'
        ],
        fittPrinciple: {
          frequency: '2x per week',
          intensity: 'High, RPE 6-7/10',
          time: '2-3 sets of 8-12 hops',
          type: 'Plyometric & agility'
        },
        demoImageUrl: '/exercises/Skater%20Hops.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=8S3BvdEC1bU'
      }
    ]
  },
  {
    id: 'chronic-conditions',
    name: 'Chronic Conditions Support',
    swName: 'Msaada wa Magonjwa Sugu',
    description: 'Long-term management exercises for chronic conditions.',
    swDescription: 'Mazoezi ya muda mrefu kwa udhibiti wa magonjwa sugu.',
    exercises: [
      {
        id: 'interval-walk',
        name: 'Interval Walk',
        description: 'Low impact walking intervals for endurance and joint health.',
        duration: '10-15 minutes',
        difficulty: 'Beginner',
        category: 'Endurance',
        bodyPart: ['legs', 'cardio'],
        instructions: [
          'Walk at a comfortable pace for 2-3 minutes.',
          'Slow down for 1 minute.',
          'Repeat for 3-4 rounds.'
        ],
        fittPrinciple: {
          frequency: '3-5x per week',
          intensity: 'Low, RPE 2-3/10',
          time: '10-15 minutes',
          type: 'Aerobic endurance'
        },
        demoImageUrl: '/exercises/Interval%20Walk.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=G7_rtJpW9m4'
      },
      {
        id: 'seated-march',
        name: 'Marching in Place',
        description: 'Low-impact marching to improve circulation and endurance.',
        duration: '6-8 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        bodyPart: ['hips', 'core', 'legs'],
        instructions: [
          'Stand tall and lift one knee at a time.',
          'Swing arms naturally for balance.',
          'Keep movements controlled and steady.',
          'Continue for 45-60 seconds per round.'
        ],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Low',
          time: '2-3 rounds',
          type: 'Mobility & circulation'
        },
        demoImageUrl: '/exercises/Marching%20in%20Place.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=ENk9GSf8e2w'
      },
      {
        id: 'breathing-reset',
        name: 'Breathing & Posture Reset',
        description: 'Reduce tension and improve posture with diaphragmatic breathing.',
        duration: '5-7 minutes',
        difficulty: 'Beginner',
        category: 'Recovery',
        bodyPart: ['core', 'diaphragm'],
        instructions: [
          'Sit or lie comfortably with a neutral spine.',
          'Inhale through the nose, expanding the belly.',
          'Exhale slowly and relax the shoulders.',
          'Repeat for 6-8 slow breaths.'
        ],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Very light',
          time: '6-8 breaths',
          type: 'Breathing & relaxation'
        },
        demoImageUrl: '/exercises/diaphragmatic-breathing.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=mgLVqJcWj1w'
      },
      {
        id: 'supported-squat',
        name: 'Supported Mini Squat',
        description: 'Strengthen legs with support to protect joints.',
        duration: '8-10 minutes',
        difficulty: 'Intermediate',
        category: 'Strength',
        bodyPart: ['quadriceps', 'glutes', 'knees'],
        instructions: [
          'Hold a stable surface for balance.',
          'Bend knees to a comfortable depth.',
          'Stand back up with control.',
          'Complete 2-3 sets of 10-12 reps.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Low to moderate, RPE 3-4/10',
          time: '8-10 minutes',
          type: 'Strength & joint support'
        },
        demoImageUrl: '/exercises/Supported%20Mini%20Squat.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U'
      },
      {
        id: 'band-row',
        name: 'Resistance Band Row',
        description: 'Strengthen upper back to support posture and daily activity.',
        duration: '8-10 minutes',
        difficulty: 'Intermediate',
        category: 'Strengthening',
        bodyPart: ['upper-back', 'shoulders', 'arms'],
        instructions: [
          'Anchor a resistance band at chest height.',
          'Pull elbows back, squeezing shoulder blades.',
          'Return slowly with control.',
          'Complete 2-3 sets of 10-12 reps.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 sets of 10-12 reps',
          type: 'Strength & posture'
        },
        demoImageUrl: '/exercises/Resistance%20Band%20Row%202.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=6Eec2P5G9xQ'
      },
      {
        id: 'bridge-holds',
        name: 'Glute Bridge Holds',
        description: 'Improve posterior chain strength and reduce low back stress.',
        duration: '8-10 minutes',
        difficulty: 'Intermediate',
        category: 'Strength',
        bodyPart: ['glutes', 'hamstrings', 'core'],
        instructions: [
          'Lie on your back with knees bent.',
          'Lift hips to form a straight line from knees to shoulders.',
          'Hold for 5-10 seconds.',
          'Complete 2-3 sets of 8-10 reps.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 sets of 8-10 reps',
          type: 'Strength & stability'
        },
        demoImageUrl: '/exercises/Glute%20Bridge%20Holds.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=XPQ5JDwK85Y'
      },
      {
        id: 'interval-walk-advanced',
        name: 'Progressive Interval Walk',
        description: 'Build endurance with longer intervals and controlled pace.',
        duration: '15-20 minutes',
        difficulty: 'Advanced',
        category: 'Endurance',
        bodyPart: ['legs', 'cardio'],
        instructions: [
          'Walk at a steady pace for 3-4 minutes.',
          'Recover for 1 minute at an easy pace.',
          'Repeat for 3-4 rounds.',
          'Finish with a 2-minute cool down.'
        ],
        fittPrinciple: {
          frequency: '3-4x per week',
          intensity: 'Moderate, RPE 4-5/10',
          time: '15-20 minutes',
          type: 'Aerobic endurance'
        },
        demoImageUrl: '/exercises/Progressive%20Interval%20Walk.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=G7_rtJpW9m4'
      },
      {
        id: 'step-ups-low',
        name: 'Low Step-Ups',
        description: 'Functional leg strength with low impact.',
        duration: '10-12 minutes',
        difficulty: 'Advanced',
        category: 'Strength',
        bodyPart: ['quadriceps', 'glutes', 'hips'],
        instructions: [
          'Step onto a low step and stand tall.',
          'Step down slowly with control.',
          'Alternate legs each rep.',
          'Complete 2-3 sets of 10-12 reps.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 sets of 10-12 reps',
          type: 'Functional strength'
        },
        demoImageUrl: '/exercises/step-up-cdc.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=lP_uKBrkdmM'
      },
      {
        id: 'balance-reach',
        name: 'Standing Balance Reach',
        description: 'Improve balance and coordination with gentle reach patterns.',
        duration: '8-10 minutes',
        difficulty: 'Advanced',
        category: 'Balance',
        bodyPart: ['core', 'ankles', 'hips'],
        instructions: [
          'Stand near support and shift weight onto one leg.',
          'Reach forward with the opposite hand, then return.',
          'Repeat to the side and slightly upward.',
          'Complete 2-3 rounds per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 rounds per side',
          type: 'Balance & coordination'
        },
          demoImageUrl: '/exercises/Standing%20Balance%20Reach.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=7SF7AYh2_Yw'
      }
    ]
  },
  {
    id: 'wellness-prevention',
    name: 'General Wellness & Prevention',
    swName: 'Afya kwa Ujumla na Kinga',
    description: 'Preventive exercises for overall health and fitness.',
    swDescription: 'Mazoezi ya kinga kwa afya na utimamu wa mwili.',
    exercises: [
      {
        id: 'dynamic-mobility-flow',
        name: 'Dynamic Mobility Flow',
        description: 'Full body mobility sequence to maintain joint range.',
        duration: '8-12 minutes',
        difficulty: 'Beginner',
        category: 'Mobility',
        bodyPart: ['full-body', 'hips', 'shoulders'],
        instructions: [
          'Start with gentle arm circles and neck rolls.',
          'Add hip circles and torso rotations.',
          'Finish with leg swings and ankle circles.',
          'Move continuously and comfortably.'
        ],
        fittPrinciple: {
          frequency: '3-5x per week',
          intensity: 'Low, RPE 2-3/10',
          time: '8-12 minutes',
          type: 'Mobility & recovery'
        },
        demoImageUrl: '/exercises/Dynamic%20Mobility%20Flow.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=KK-9C_Wt0hw'
      },
      {
        id: 'daily-walk',
        name: 'Brisk Walk',
        description: 'Low-impact aerobic activity for overall health.',
        duration: '10-20 minutes',
        difficulty: 'Beginner',
        category: 'Endurance',
        bodyPart: ['legs', 'cardio'],
        instructions: [
          'Walk at a comfortable but purposeful pace.',
          'Maintain tall posture and relaxed shoulders.',
          'Breathe steadily throughout.',
          'Cool down with a slower pace for 2 minutes.'
        ],
        fittPrinciple: {
          frequency: 'Most days',
          intensity: 'Low to moderate, RPE 3-4/10',
          time: '10-20 minutes',
          type: 'Aerobic endurance'
        },
        demoImageUrl: '/exercises/Brisk%20Walk.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=_Y_FTROkP-U'
      },
      {
        id: 'gentle-stretch-series',
        name: 'Gentle Stretch Series',
        description: 'Ease muscle tension with a short daily stretch routine.',
        duration: '8-10 minutes',
        difficulty: 'Beginner',
        category: 'Flexibility',
        bodyPart: ['full-body'],
        instructions: [
          'Hold each stretch for 15-30 seconds.',
          'Focus on calves, hamstrings, hips, and chest.',
          'Avoid bouncing or pain.',
          'Repeat each stretch 1-2 times.'
        ],
        fittPrinciple: {
          frequency: 'Daily',
          intensity: 'Light',
          time: '15-30 seconds per stretch',
          type: 'Flexibility'
        },
        demoImageUrl: '/exercises/Gentle%20Stretch%20Series.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=_ftNKYfWY10'
      },
      {
        id: 'core-breathing',
        name: 'Core Breathing & Bracing',
        description: 'Improve posture and core stability with breath control.',
        duration: '6-8 minutes',
        difficulty: 'Intermediate',
        category: 'Stability',
        bodyPart: ['core', 'diaphragm'],
        instructions: [
          'Sit or lie comfortably with a neutral spine.',
          'Inhale into the belly and ribs, expand gently.',
          'Exhale and lightly brace the core.',
          'Repeat for 6-8 breaths.'
        ],
        fittPrinciple: {
          frequency: '3-5x per week',
          intensity: 'Low, RPE 2-3/10',
          time: '6-8 minutes',
          type: 'Breathing & stability'
        },
        demoImageUrl: '/exercises/diaphragmatic-breathing.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=ZGQPEzcJAPo'
      },
      {
        id: 'resistance-band-row',
        name: 'Resistance Band Row',
        description: 'Strengthen upper back for posture and shoulder health.',
        duration: '8-10 minutes',
        difficulty: 'Intermediate',
        category: 'Strengthening',
        bodyPart: ['upper-back', 'shoulders', 'arms'],
        instructions: [
          'Anchor a band at chest height.',
          'Pull elbows back, squeezing shoulder blades.',
          'Return slowly with control.',
          'Complete 2-3 sets of 10-12 reps.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 sets of 10-12 reps',
          type: 'Strength & posture'
        },
        demoImageUrl: '/exercises/Resistance%20Band%20Row.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=EuteHJq7z40'
      },
      {
        id: 'split-stance-hold',
        name: 'Split Stance Balance Hold',
        description: 'Improve balance and lower body stability.',
        duration: '6-8 minutes',
        difficulty: 'Intermediate',
        category: 'Balance',
        bodyPart: ['hips', 'core', 'ankles'],
        instructions: [
          'Stand in a split stance with one foot forward.',
          'Hold balance for 20-30 seconds.',
          'Switch sides and repeat.',
          'Complete 2-3 rounds per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Low to moderate',
          time: '20-30 seconds per hold',
          type: 'Balance & stability'
        },
        demoImageUrl: '/exercises/lunge-10080464.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=Y11bomXm9Zc'
      },
      {
        id: 'bridge-march',
        name: 'Bridge March',
        description: 'Build hip stability and posterior chain endurance.',
        duration: '8-10 minutes',
        difficulty: 'Advanced',
        category: 'Strength',
        bodyPart: ['glutes', 'core', 'hamstrings'],
        instructions: [
          'Start in a glute bridge position.',
          'Lift one knee toward the chest without dropping hips.',
          'Lower the foot and switch sides.',
          'Complete 2-3 sets of 8-10 marches per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate, RPE 5-6/10',
          time: '8-10 minutes',
          type: 'Strength & endurance'
        },
        demoImageUrl: '/exercises/Bridge%20March.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=dVjj5RMCg4Y'
      },
      {
        id: 'step-up-knee-drive',
        name: 'Step-Up with Knee Drive',
        description: 'Advance lower body strength and coordination.',
        duration: '8-10 minutes',
        difficulty: 'Advanced',
        category: 'Strength',
        bodyPart: ['glutes', 'quadriceps', 'core'],
        instructions: [
          'Step onto a low step with one foot.',
          'Drive the opposite knee up while balancing.',
          'Step down slowly and switch sides.',
          'Complete 2-3 sets of 8-10 reps per side.'
        ],
        fittPrinciple: {
          frequency: '2-3x per week',
          intensity: 'Moderate',
          time: '2-3 sets of 8-10 reps',
          type: 'Strength & coordination'
        },
        demoImageUrl: '/exercises/step-up-cdc.gif',
        demoVideoUrl: 'https://www.youtube.com/watch?v=7T4_faGQhpM'
      },
      {
        id: 'jump-rope-basic',
        name: 'Basic Jump Rope',
        description: 'Boost cardio fitness with a low-volume jump rope set.',
        duration: '5-7 minutes',
        difficulty: 'Advanced',
        category: 'Endurance',
        bodyPart: ['calves', 'cardio'],
        instructions: [
          'Jump lightly on the balls of your feet.',
          'Keep elbows close to your sides.',
          'Perform 20-30 second sets with 30 seconds rest.',
          'Repeat for 3-4 rounds.'
        ],
        fittPrinciple: {
          frequency: '2x per week',
          intensity: 'Moderate to high',
          time: '3-4 rounds of 20-30 seconds',
          type: 'Aerobic endurance'
        },
        demoImageUrl: '/exercises/jump-rope-10080462.png',
        demoVideoUrl: 'https://www.youtube.com/watch?v=nMHfZ-yrFjA'
      }
    ]
  }
];
