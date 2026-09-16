import { ClassroomState, LanguageMode } from '../types';

export const MATH_CLASS_2_CHAPTERS = [
  {
    chapter: 'Chapter 1: What is Long, What is Round?',
    hindiName: 'लम्बा क्या है, गोल क्या है?',
    concept: 'Roll and slide objects, identifying shapes',
    objective: 'Understand rolling and sliding objects and shapes around us',
  },
  {
    chapter: 'Chapter 2: Counting in Groups',
    hindiName: 'समूहों में गिनती',
    concept: 'Counting objects by grouping in tens and pairs',
    objective: 'Learn grouping items for faster and easier counting',
  },
  {
    chapter: 'Chapter 3: How Much Can You Carry?',
    hindiName: 'तुम कितना उठा सकते हो?',
    concept: 'Heavy and light objects, comparison',
    objective: 'Understand weight and lifting capacity of different items',
  },
  {
    chapter: 'Chapter 4: Counting in Tens',
    hindiName: 'दहाई तक गिनती',
    concept: 'Bundles of 10 sticks, place value basics',
    objective: 'Group numbers into tens and ones',
  },
  {
    chapter: 'Chapter 5: Patterns',
    hindiName: 'पैटर्न',
    concept: 'Repeating shapes, numbers, and designs',
    objective: 'Recognize and extend repeating visual and number patterns',
  },
  {
    chapter: 'Chapter 6: Footprints',
    hindiName: 'पैर के निशान',
    concept: 'Tracing shapes of leaves, feet, and objects',
    objective: 'Observe shapes and outlines of common objects',
  },
  {
    chapter: 'Chapter 7: Jugs and Mugs',
    hindiName: 'मग और जग',
    concept: 'Capacity, measuring liquid in glasses and jugs',
    objective: 'Compare volumes and liquid holding capacities',
  },
  {
    chapter: 'Chapter 8: Tens and Ones',
    hindiName: 'दहाई और इकाई',
    concept: 'Number bonds, place value rods',
    objective: 'Master two-digit numbers with tens and ones',
  },
  {
    chapter: 'Chapter 9: My Funday',
    hindiName: 'मेरा मजेदार दिन',
    concept: 'Days of the week, months of the year',
    objective: 'Learn weekdays, sequence of months, and time concepts',
  },
  {
    chapter: 'Chapter 10: Addition up to 20',
    hindiName: 'हमारे अंक जोड़ें (जोड़)',
    concept: 'Combining groups of objects, visual addition',
    objective: 'Count total items when combining two smaller sets up to 20',
  },
];

export const HINDI_CLASS_2_CHAPTERS = [
  {
    chapter: 'पाठ 1: ऊँट चला',
    hindiName: 'ऊँट चला कविता',
    concept: 'ऊँट की विशेषताएँ और कविता पाठ',
    objective: 'ऊँट के बारे में कविता पढ़ना और नए शब्द सीखना',
  },
  {
    chapter: 'पाठ 2: भालू ने खेली फुटबॉल',
    hindiName: 'भालू ने खेली फुटबॉल',
    concept: 'कहानी और मजेदार खेल',
    objective: 'कहानी सुनना और समझकर प्रश्नों के उत्तर देना',
  },
  {
    chapter: 'पाठ 3: म्याऊँ-म्याऊँ!',
    hindiName: 'म्याऊँ-म्याऊँ!',
    concept: 'बिल्ली और चूहे की मजेदार कविता',
    objective: 'डर भगाना और जानवरों की आवाजें पहचानना',
  },
  {
    chapter: 'पाठ 4: अधिक बलवान कौन?',
    hindiName: 'अधिक बलवान कौन? (हवा और सूरज)',
    concept: 'हवा और सूरज की कहानी',
    objective: 'समझना कि प्यार और नरमी से सब जीतते हैं',
  },
  {
    chapter: 'पाठ 5: दोस्त की मदद',
    hindiName: 'दोस्त की मदद',
    concept: 'कछुए और लोमड़ी की सच्ची दोस्ती',
    objective: 'मित्रों की मुसीबत में सहायता करना सीखना',
  },
  {
    chapter: 'पाठ 6: बहुत हुआ',
    hindiName: 'बहुत हुआ (वर्षा ऋतु)',
    concept: 'बरसात के दिन और कीचड़',
    objective: 'वर्षा ऋतु का आनंद लेना और कविता गाना',
  },
  {
    chapter: 'पाठ 7: मेरी किताब',
    hindiName: 'मेरी किताब',
    concept: 'किताबों का महत्व और पसंद',
    objective: 'पुस्तकों से दोस्ती और पढ़ने की आदत डालना',
  },
  {
    chapter: 'पाठ 8: तितली और कली',
    hindiName: 'तितली और कली',
    concept: 'फूल और तितली का संवाद',
    objective: 'प्रकृति प्रेम और कोमल भावनाओं को समझना',
  },
  {
    chapter: 'पाठ 9: बुलबुल',
    hindiName: 'बुलबुल पक्षी',
    concept: 'पक्षी बुलबुल की पहचान और खान-पान',
    objective: 'विभिन्न पक्षियों के बारे में जानकारी प्राप्त करना',
  },
  {
    chapter: 'पाठ 10: मीठी सारंगी',
    hindiName: 'मीठी सारंगी',
    concept: 'गाँव का मेला और संगीत का आनंद',
    objective: 'संगीत की मिठास और आनंद को महसूस करना',
  },
];

export const GK_CLASS_2_CHAPTERS = [
  {
    chapter: 'Chapter 1: Our National Symbols',
    hindiName: 'हमारे राष्ट्रीय प्रतीक',
    concept: 'National flag, anthem, bird, and animal',
    objective: 'Learn about India\'s national symbols and respect them',
  },
  {
    chapter: 'Chapter 2: Famous Leaders & Freedom Fighters',
    hindiName: 'महान नेता और स्वतंत्रता सेनानी',
    concept: 'Mahatma Gandhi, Subhas Chandra Bose, Nehru',
    objective: 'Know the great leaders who gave us freedom',
  },
  {
    chapter: 'Chapter 3: Incredible India (States & Capitals)',
    hindiName: 'अद्भुत भारत (राज्य और राजधानियाँ)',
    concept: 'Major Indian states, capitals, and cultural diversity',
    objective: 'Explore famous places and states across India',
  },
  {
    chapter: 'Chapter 4: Wonders of Nature & Animals',
    hindiName: 'प्रकृति और जानवरों के आश्चर्य',
    concept: 'Tallest animals, fastest runners, deep oceans',
    objective: 'Discover amazing facts about wildlife and nature',
  },
  {
    chapter: 'Chapter 5: Solar System & Space',
    hindiName: 'सौरमंडल और अंतरिक्ष',
    concept: 'Sun, moon, planets, and astronauts',
    objective: 'Learn about planets revolving around the Sun',
  },
  {
    chapter: 'Chapter 6: Festivals of India',
    hindiName: 'भारत के त्योहार',
    concept: 'Diwali, Holi, Eid, Christmas, Gurpurab',
    objective: 'Understand the joy and unity in Indian festivals',
  },
  {
    chapter: 'Chapter 7: States and Their Capitals',
    hindiName: 'राज्य और राजधानियाँ',
    concept: 'India has 28 States and 8 Union Territories. Matching states with their capital cities (e.g., Rajasthan-Jaipur, UP-Lucknow, Bihar-Patna, Maharashtra-Mumbai).',
    objective: 'Learn to identify Indian states and their respective capital cities from the map',
  },
  {
    chapter: 'Chapter 8: Computers & Technology',
    hindiName: 'कंप्यूटर और तकनीक',
    concept: 'Parts of a computer, mouse, keyboard, screen',
    objective: 'Learn basic computer parts and how they help us',
  },
  {
    chapter: 'Chapter 9: First Aid & Safety',
    hindiName: 'प्राथमिक चिकित्सा और सुरक्षा',
    concept: 'Road safety rules, home safety, first aid box',
    objective: 'Learn how to stay safe and handle small injuries',
  },
  {
    chapter: 'Chapter 10: Good Habits & Manners',
    hindiName: 'अच्छी आदतें और शिष्टाचार',
    concept: 'Saying please, thank you, brushing, washing hands',
    objective: 'Practice polite manners and daily hygiene habits',
  },
];

export const EVS_CLASS_2_CHAPTERS = [
  {
    chapter: 'Chapter 1: Our Family',
    hindiName: 'परिवार और रिश्ते',
    concept: 'Family members and relationships',
    objective: 'Understand nuclear and joint families and how family members help each other',
  },
  {
    chapter: 'Chapter 2: Parts of Our Body',
    hindiName: 'हमारे शरीर के अंग',
    concept: 'External and internal body parts & senses',
    objective: 'Identify body parts and their functions along with five sense organs',
  },
  {
    chapter: 'Chapter 3: Food We Eat',
    hindiName: 'हम जो भोजन करते हैं',
    concept: 'Healthy food, fruits, vegetables, and meals',
    objective: 'Learn about healthy eating habits and sources of food (plants and animals)',
  },
  {
    chapter: 'Chapter 4: Clothes We Wear',
    hindiName: 'हमारे कपड़े',
    concept: 'Clothes for different seasons (summer, winter, rainy)',
    objective: 'Understand why we wear different clothes in different weather',
  },
  {
    chapter: 'Chapter 5: Houses We Live In',
    hindiName: 'हमारे घर',
    concept: 'Types of houses (pucca, kutcha) and rooms in a house',
    objective: 'Learn why we need a house and how to keep it clean',
  },
  {
    chapter: 'Chapter 6: Plants Around Us',
    hindiName: 'हमारे चारों ओर के पौधे',
    concept: 'Trees, shrubs, herbs, and creepers',
    objective: 'Identify different types of plants and their importance in nature',
  },
  {
    chapter: 'Chapter 7: Animals Around Us',
    hindiName: 'हमारे चारों ओर के जानवर',
    concept: 'Wild, domestic, pet, and water animals',
    objective: 'Classify animals based on where they live and what they eat',
  },
  {
    chapter: 'Chapter 8: Our Neighborhood',
    hindiName: 'हमारा पड़ोस',
    concept: 'School, hospital, market, police station, and park',
    objective: 'Recognize important places and helpers in our neighborhood',
  },
  {
    chapter: 'Chapter 9: Means of Transport',
    hindiName: 'यातायात के साधन',
    concept: 'Land, water, and air transport',
    objective: 'Learn how we travel from one place to another',
  },
  {
    chapter: 'Chapter 10: Our Earth & Sky',
    hindiName: 'हमारी पृथ्वी और आकाश',
    concept: 'Sun, moon, stars, water, and air',
    objective: 'Observe natural objects in the sky and understand water sources',
  },
];

export const NCERT_CLASS_2_SUBJECTS = [
  {
    subject: 'Mathematics',
    hindiName: 'गणित',
    chapter: 'Chapter 1: What is Long, What is Round?',
    concept: 'Roll and slide objects, identifying shapes',
    objective: 'Understand rolling and sliding objects and shapes around us',
    chapters: MATH_CLASS_2_CHAPTERS,
  },
  {
    subject: 'English',
    hindiName: 'English',
    chapter: 'Unit 1: First Day at School',
    concept: 'Reading & Phonics',
    objective: 'Learn new vocabulary and poem recitation',
  },
  {
    subject: 'Hindi',
    hindiName: 'हिन्दी',
    chapter: 'पाठ 1: ऊँट चला',
    concept: 'ऊँट की विशेषताएँ और कविता पाठ',
    objective: 'ऊँट के बारे में कविता पढ़ना और नए शब्द सीखना',
    chapters: HINDI_CLASS_2_CHAPTERS,
  },
  {
    subject: 'Punjabi',
    hindiName: 'ਪੰਜਾਬੀ',
    chapter: 'ਪਾਠ 1: ਗਿਣਤੀ ਅਤੇ ਵਰਣਮਾਲਾ (1-20)',
    concept: 'Punjabi Alphabets & Counting',
    objective: 'Learn Punjabi numerals and basic words',
  },
  {
    subject: 'EVS',
    hindiName: 'पर्यावरण अध्ययन',
    chapter: 'Chapter 1: Our Family',
    concept: 'Family members and relationships',
    objective: 'Understand nuclear and joint families and how family members help each other',
    chapters: EVS_CLASS_2_CHAPTERS,
  },
  {
    subject: 'GK',
    hindiName: 'सामान्य ज्ञान',
    chapter: 'Chapter 1: Our National Symbols',
    concept: 'National flag, anthem, bird, and animal',
    objective: 'Learn about India\'s national symbols and respect them',
    chapters: GK_CLASS_2_CHAPTERS,
  },
];

export const DEFAULT_CLASSROOM_STATE: ClassroomState = {
  student: {
    name: 'Niyati',
    age: 7,
    gradeClass: 2,
    preferredLanguage: 'english',
  },
  subject: 'Mathematics',
  chapter: 'Addition up to 20',
  currentConcept: 'Combining two groups of objects',
  lessonObjective: 'Count total items when combining two smaller sets',
  language: 'english',
  difficulty: 'easy',
  understandingEstimate: 70,
  confidenceLevel: 85,
  recentQuestions: [],
  recentMistakes: [],
  misconceptions: [],
  conceptsMastered: ['Counting up to 20', 'Recognizing numbers 1-10'],
  conceptsNeedingRevision: ['Addition with carry'],
  conceptMastery: {
    'Counting up to 20': 95,
    'Recognizing numbers 1-10': 90,
    'Combining two groups': 70,
    'Number Line Addition': 60,
  },
  completedLessons: ['Lesson 1: Number recognition', 'Lesson 2: Basic Counting'],
  badges: [
    {
      id: 'badge-1',
      title: 'First Step Star',
      description: 'Completed your first interactive lesson!',
      icon: '⭐',
      earnedAt: '10:00 AM',
      subject: 'Mathematics',
    },
    {
      id: 'badge-2',
      title: 'Counting Champion',
      description: 'Mastered counting up to 20 with 95% accuracy',
      icon: '🏆',
      earnedAt: '10:15 AM',
      subject: 'Mathematics',
    },
  ],
  learningHistory: [
    { timestamp: '10:00 AM', concept: 'Counting', action: 'Completed practice drill', understanding: 90, strategy: 'DIRECT_EXPLANATION' },
    { timestamp: '10:15 AM', concept: 'Combining groups', action: 'Visual apples exercise', understanding: 70, strategy: 'VISUAL_EXAMPLE' },
  ],
  recommendedNextConcept: 'Word problems with addition up to 20',
  currentStrategy: 'VISUAL_EXAMPLE',
  currentAiActivity: 'Choosing visual explanation',
};

export const DEMO_MATH_LESSON_STATE: ClassroomState = {
  student: {
    name: 'Niyati',
    age: 7,
    gradeClass: 2,
    preferredLanguage: 'hinglish',
  },
  subject: 'Mathematics',
  chapter: 'Addition up to 20',
  currentConcept: 'Visual Addition with Apples',
  lessonObjective: 'Understand addition by combining groups of 5 and 3 apples',
  language: 'hinglish',
  difficulty: 'easy',
  understandingEstimate: 75,
  confidenceLevel: 90,
  recentQuestions: ['How many apples total?'],
  recentMistakes: [],
  misconceptions: [],
  conceptsMastered: ['Single digit counting'],
  conceptsNeedingRevision: ['Visual group addition'],
  conceptMastery: {
    'Single digit counting': 90,
    'Visual group addition': 75,
  },
  completedLessons: ['Basics of numbers'],
  badges: [
    {
      id: 'badge-demo-1',
      title: 'Apple Addition Expert',
      description: 'Successfully counted and added groups of apples!',
      icon: '🍎',
      earnedAt: '10:30 AM',
      subject: 'Mathematics',
    },
  ],
  learningHistory: [
    { timestamp: '10:30 AM', concept: 'Visual Addition', action: 'Apples counting simulation', understanding: 75, strategy: 'VISUAL_EXAMPLE' },
  ],
  recommendedNextConcept: 'Subtraction basics',
  currentStrategy: 'VISUAL_EXAMPLE',
  currentAiActivity: 'Assessing answer',
};

export function updateStateFromTool(
  currentState: ClassroomState,
  misconception?: string,
  masteredConcept?: string,
  understandingDelta: number = 5
): ClassroomState {
  const next = { ...currentState };
  if (!next.badges) next.badges = [];
  if (misconception && !next.misconceptions.includes(misconception)) {
    next.misconceptions = [...next.misconceptions, misconception];
  }
  if (masteredConcept && !next.conceptsMastered.includes(masteredConcept)) {
    next.conceptsMastered = [...next.conceptsMastered, masteredConcept];
    // Award badge for mastering concept
    const newBadgeId = `badge-${Date.now()}`;
    if (!next.badges.some(b => b.title === `${masteredConcept} Master`)) {
      next.badges.push({
        id: newBadgeId,
        title: `${masteredConcept} Master`,
        description: `Successfully mastered ${masteredConcept} in ${next.subject}!`,
        icon: '🌟',
        earnedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: next.subject,
      });
    }
  }
  next.understandingEstimate = Math.min(100, Math.max(0, next.understandingEstimate + understandingDelta));
  if (next.understandingEstimate >= 85 && !next.badges.some(b => b.title === 'High Flyer')) {
    next.badges.push({
      id: `badge-high-${Date.now()}`,
      title: 'High Flyer',
      description: 'Reached 85%+ understanding across active lessons!',
      icon: '🚀',
      earnedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subject: next.subject,
    });
  }
  return next;
}
