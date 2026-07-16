import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Language, Level, Lesson, Vocabulary, Exercise, UserProgress } from '../models/index';

dotenv.config();

const seed = async () => {
  await connectDB();
  console.log('🌱 Starting seed...');

  const fullReset = process.argv.includes('--full');

  // IMPORTANT: We NEVER reset user XP/streak automatically.
  // Only wipe content (languages, lessons, vocab, exercises).
  // Use --full flag to also reset users and progress.
  await Promise.all([
    Language.deleteMany({}),
    Level.deleteMany({}),
    Lesson.deleteMany({}),
    Vocabulary.deleteMany({}),
    Exercise.deleteMany({}),
  ]);

  if (fullReset) {
    await User.deleteMany({});
    await UserProgress.deleteMany({});
    console.log('🗑️  Full reset — all data cleared including users');
  } else {
    console.log('📝 Content reset only — user XP/progress preserved');
    console.log('   (Use: npm run seed -- --full to reset everything)');
  }

  // === USERS (only create if they don't exist) ===
  let admin = await User.findOne({ email: 'admin@lingoalb.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin LingoAlb',
      email: 'admin@lingoalb.com',
      password: 'Admin123!',
      role: 'admin',
      xp: 0,
      streak: 0,
    });
    console.log('👤 Admin user created');
  } else {
    console.log('👤 Admin user already exists — XP preserved:', admin.xp);
  }

  let student = await User.findOne({ email: 'student@lingoalb.com' });
  if (!student) {
    student = await User.create({
      name: 'Arben Kelmendi',
      email: 'student@lingoalb.com',
      password: 'Student123!',
      role: 'student',
      xp: 0,
      streak: 0,
    });
    console.log('👤 Student user created');
  } else {
    console.log('👤 Student user already exists — XP preserved:', student.xp);
  }

  // === LANGUAGES ===
  const english = await Language.create({
    code: 'en', name: 'English', nameAlb: 'Anglisht',
    flag: '🇬🇧', isAvailable: true, comingSoon: false,
    color: '#1B4FD8', description: 'Gjuha ndërkombëtare e biznesit dhe teknologjisë',
    order: 1,
  });

  const others = [
    { code: 'it', name: 'Italian', nameAlb: 'Italisht', flag: '🇮🇹', description: 'Gjuha e modës dhe kuzhinës', order: 4 },
    { code: 'es', name: 'Spanish', nameAlb: 'Spanjisht', flag: '🇪🇸', description: 'Gjuha e dytë më e folur në botë', order: 5 },
    { code: 'tr', name: 'Turkish', nameAlb: 'Turqisht', flag: '🇹🇷', description: 'Gjuha e fqinjit tonë historik', order: 6 },
  ];
  for (const lang of others) {
    await Language.create({ ...lang, isAvailable: false, comingSoon: true, color: '#94A3B8' });
  }
  console.log('🌍 Languages created');

  // === LEVELS ===
  const beginner = await Level.create({
    language: english._id, name: 'beginner', nameAlb: 'Fillestar',
    description: 'Fjalë dhe fraza bazë për fillestarët', order: 1, xpRequired: 0, icon: '🌱', totalLessons: 5,
  });
  const intermediate = await Level.create({
    language: english._id, name: 'intermediate', nameAlb: 'Mesatar',
    description: 'Gramatikë dhe konversacion i mesëm', order: 2, xpRequired: 300, icon: '🔥', totalLessons: 4,
  });
  const advanced = await Level.create({
    language: english._id, name: 'advanced', nameAlb: 'Avancuar',
    description: 'Shprehje idiomatike dhe nuanca gjuhësore', order: 3, xpRequired: 700, icon: '⚡', totalLessons: 2,
  });
  console.log('📊 Levels created');

  // === LESSON 1: Greetings ===
  const lesson1 = await Lesson.create({
    level: beginner._id, language: english._id,
    titleAlb: 'Përshëndetjet', title: 'Greetings',
    description: 'Mëso si të përshëndesësh në anglisht',
    order: 1, xpReward: 50, estimatedMinutes: 5, icon: '👋',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  const vocab1 = await Vocabulary.insertMany([
    { lesson: lesson1._id, language: english._id, albanianWord: 'Mirëmëngjes', targetWord: 'Good morning', pronunciation: 'ɡʊd ˈmɔːrnɪŋ', exampleAlb: 'Mirëmëngjes, si jeni?', exampleTarget: 'Good morning, how are you?', category: 'greeting', difficulty: 1 },
    { lesson: lesson1._id, language: english._id, albanianWord: 'Mirëdita', targetWord: 'Good afternoon', pronunciation: 'ɡʊd ˈæftərnuːn', exampleAlb: 'Mirëdita, ku po shkoni?', exampleTarget: 'Good afternoon, where are you going?', category: 'greeting', difficulty: 1 },
    { lesson: lesson1._id, language: english._id, albanianWord: 'Mirëmbrëma', targetWord: 'Good evening', pronunciation: 'ɡʊd ˈiːvnɪŋ', exampleAlb: 'Mirëmbrëma, si kaluat ditën?', exampleTarget: 'Good evening, how was your day?', category: 'greeting', difficulty: 1 },
    { lesson: lesson1._id, language: english._id, albanianWord: 'Natën e mirë', targetWord: 'Good night', pronunciation: 'ɡʊd naɪt', exampleAlb: 'Natën e mirë, ëndërroni mirë!', exampleTarget: 'Good night, sweet dreams!', category: 'greeting', difficulty: 1 },
    { lesson: lesson1._id, language: english._id, albanianWord: 'Faleminderit', targetWord: 'Thank you', pronunciation: 'θæŋk juː', exampleAlb: 'Faleminderit shumë!', exampleTarget: 'Thank you very much!', category: 'politeness', difficulty: 1 },
    { lesson: lesson1._id, language: english._id, albanianWord: 'Ju lutem', targetWord: 'Please', pronunciation: 'pliːz', exampleAlb: 'Ju lutem, ndihmo!', exampleTarget: 'Please help me!', category: 'politeness', difficulty: 1 },
    { lesson: lesson1._id, language: english._id, albanianWord: 'Më falni', targetWord: 'Sorry', pronunciation: 'ˈsɒri', exampleAlb: 'Më falni, nuk e dija.', exampleTarget: 'Sorry, I did not know.', category: 'politeness', difficulty: 1 },
    { lesson: lesson1._id, language: english._id, albanianWord: 'Mirupafshim', targetWord: 'Goodbye', pronunciation: 'ɡʊdˈbaɪ', exampleAlb: 'Mirupafshim, shpresoj të takohemi sërisht!', exampleTarget: 'Goodbye, hope to see you again!', category: 'greeting', difficulty: 1 },
  ]);

  await Exercise.insertMany([
    { lesson: lesson1._id, language: english._id, type: 'multiple_choice', question: 'Si thuhet "Mirëmëngjes" në anglisht?', options: ['Good morning', 'Good night', 'Good evening', 'Goodbye'], correctAnswer: 'Good morning', explanationAlb: '"Good morning" = Mirëmëngjes. Përdoret para mesditës.', xpReward: 15, order: 1 },
    { lesson: lesson1._id, language: english._id, type: 'translation', question: 'Përkthe: "Faleminderit shumë!"', correctAnswer: 'Thank you very much', explanationAlb: '"Thank you very much" shpreh mirënjohje të thellë.', xpReward: 20, order: 2 },
    { lesson: lesson1._id, language: english._id, type: 'fill_blank', question: 'Plotëso: "Good ___, how are you?" (Mirëdita)', correctAnswer: 'afternoon', explanationAlb: '"Good afternoon" = Mirëdita. Nga ora 12 deri 18.', xpReward: 15, order: 3 },
    { lesson: lesson1._id, language: english._id, type: 'multiple_choice', question: 'Cila fjalë do të thuash kur largohesh?', options: ['Goodbye', 'Please', 'Sorry', 'Thank you'], correctAnswer: 'Goodbye', explanationAlb: '"Goodbye" = Mirupafshim — thuhet kur largohesh.', xpReward: 15, order: 4 },
  ]);

  // === LESSON 2: Numbers ===
  const lesson2 = await Lesson.create({
    level: beginner._id, language: english._id,
    titleAlb: 'Numrat 1-20', title: 'Numbers 1-20',
    description: 'Mëso numrat bazë në anglisht',
    order: 2, xpReward: 60, estimatedMinutes: 7, icon: '🔢',
    vocabularyCount: 10, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: lesson2._id, language: english._id, albanianWord: 'Një', targetWord: 'One', pronunciation: 'wʌn', exampleAlb: 'Kam një motër.', exampleTarget: 'I have one sister.', category: 'numbers', difficulty: 1 },
    { lesson: lesson2._id, language: english._id, albanianWord: 'Dy', targetWord: 'Two', pronunciation: 'tuː', exampleAlb: 'Dy plus dy është katër.', exampleTarget: 'Two plus two is four.', category: 'numbers', difficulty: 1 },
    { lesson: lesson2._id, language: english._id, albanianWord: 'Tre', targetWord: 'Three', pronunciation: 'θriː', exampleAlb: 'Tre fëmijë luajnë.', exampleTarget: 'Three children are playing.', category: 'numbers', difficulty: 1 },
    { lesson: lesson2._id, language: english._id, albanianWord: 'Katër', targetWord: 'Four', pronunciation: 'fɔːr', exampleAlb: 'Katër stinë ka viti.', exampleTarget: 'There are four seasons.', category: 'numbers', difficulty: 1 },
    { lesson: lesson2._id, language: english._id, albanianWord: 'Pesë', targetWord: 'Five', pronunciation: 'faɪv', exampleAlb: 'Pesë gishta ka dora.', exampleTarget: 'A hand has five fingers.', category: 'numbers', difficulty: 1 },
    { lesson: lesson2._id, language: english._id, albanianWord: 'Gjashtë', targetWord: 'Six', pronunciation: 'sɪks', exampleAlb: 'Gjashtë orë gjumë nuk mjaftojnë.', exampleTarget: 'Six hours of sleep is not enough.', category: 'numbers', difficulty: 1 },
    { lesson: lesson2._id, language: english._id, albanianWord: 'Shtatë', targetWord: 'Seven', pronunciation: 'ˈsevən', exampleAlb: 'Shtatë ditë ka java.', exampleTarget: 'There are seven days in a week.', category: 'numbers', difficulty: 1 },
    { lesson: lesson2._id, language: english._id, albanianWord: 'Tetë', targetWord: 'Eight', pronunciation: 'eɪt', exampleAlb: 'Tetë orë duhet të flejë njeriu.', exampleTarget: 'A person needs eight hours of sleep.', category: 'numbers', difficulty: 1 },
    { lesson: lesson2._id, language: english._id, albanianWord: 'Nëntë', targetWord: 'Nine', pronunciation: 'naɪn', exampleAlb: 'Nëntë muaj zgjat shtatzënia.', exampleTarget: 'Pregnancy lasts nine months.', category: 'numbers', difficulty: 1 },
    { lesson: lesson2._id, language: english._id, albanianWord: 'Dhjetë', targetWord: 'Ten', pronunciation: 'ten', exampleAlb: 'Dhjetë euro kushtoi bileta.', exampleTarget: 'The ticket cost ten euros.', category: 'numbers', difficulty: 1 },
  ]);

  await Exercise.insertMany([
    { lesson: lesson2._id, language: english._id, type: 'multiple_choice', question: 'Si thuhet "Pesë" në anglisht?', options: ['Four', 'Five', 'Six', 'Seven'], correctAnswer: 'Five', explanationAlb: '"Five" = Pesë.', xpReward: 15, order: 1 },
    { lesson: lesson2._id, language: english._id, type: 'translation', question: 'Përkthe: "Shtatë ditë ka java."', correctAnswer: 'There are seven days in a week', explanationAlb: '"Seven days in a week" — numri "seven" = shtatë.', xpReward: 20, order: 2 },
    { lesson: lesson2._id, language: english._id, type: 'fill_blank', question: 'Plotëso: "___ plus two is four" (Dy)', correctAnswer: 'Two', explanationAlb: '"Two" = Dy. 2 + 2 = 4.', xpReward: 15, order: 3 },
    { lesson: lesson2._id, language: english._id, type: 'multiple_choice', question: 'Sa ditë ka java? (Seven)', options: ['Six', 'Eight', 'Seven', 'Ten'], correctAnswer: 'Seven', explanationAlb: '"Seven" = Shtatë. Java ka 7 ditë.', xpReward: 15, order: 4 },
  ]);

  // === LESSON 3: Colors ===
  const lesson3 = await Lesson.create({
    level: beginner._id, language: english._id,
    titleAlb: 'Ngjyrat', title: 'Colors',
    description: 'Mëso ngjyrat kryesore në anglisht',
    order: 3, xpReward: 55, estimatedMinutes: 6, icon: '🎨',
    vocabularyCount: 8, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: lesson3._id, language: english._id, albanianWord: 'E kuqe', targetWord: 'Red', pronunciation: 'red', exampleAlb: 'Trëndafili është i kuq.', exampleTarget: 'The rose is red.', category: 'colors', difficulty: 1 },
    { lesson: lesson3._id, language: english._id, albanianWord: 'E kaltër', targetWord: 'Blue', pronunciation: 'bluː', exampleAlb: 'Qielli është i kaltër.', exampleTarget: 'The sky is blue.', category: 'colors', difficulty: 1 },
    { lesson: lesson3._id, language: english._id, albanianWord: 'E gjelbër', targetWord: 'Green', pronunciation: 'ɡriːn', exampleAlb: 'Bari është i gjelbër.', exampleTarget: 'The grass is green.', category: 'colors', difficulty: 1 },
    { lesson: lesson3._id, language: english._id, albanianWord: 'E verdhë', targetWord: 'Yellow', pronunciation: 'ˈjeloʊ', exampleAlb: 'Dielli është i verdhë.', exampleTarget: 'The sun is yellow.', category: 'colors', difficulty: 1 },
    { lesson: lesson3._id, language: english._id, albanianWord: 'E zezë', targetWord: 'Black', pronunciation: 'blæk', exampleAlb: 'Nata është e zezë.', exampleTarget: 'The night is black.', category: 'colors', difficulty: 1 },
    { lesson: lesson3._id, language: english._id, albanianWord: 'E bardhë', targetWord: 'White', pronunciation: 'waɪt', exampleAlb: 'Bora është e bardhë.', exampleTarget: 'The snow is white.', category: 'colors', difficulty: 1 },
    { lesson: lesson3._id, language: english._id, albanianWord: 'Portokalli', targetWord: 'Orange', pronunciation: 'ˈɒrɪndʒ', exampleAlb: 'Portokalli ka ngjyrën portokalli.', exampleTarget: 'The orange is orange.', category: 'colors', difficulty: 1 },
    { lesson: lesson3._id, language: english._id, albanianWord: 'Vjollcë', targetWord: 'Purple', pronunciation: 'ˈpɜːrpəl', exampleAlb: 'Luleshtrydhet janë vjollcë.', exampleTarget: 'The lavender is purple.', category: 'colors', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: lesson3._id, language: english._id, type: 'multiple_choice', question: 'Cila ngjyrë ka qielli?', options: ['Red', 'Blue', 'Green', 'Yellow'], correctAnswer: 'Blue', explanationAlb: '"Blue" = E kaltër. Qielli i kthjellët është i kaltër.', xpReward: 15, order: 1 },
    { lesson: lesson3._id, language: english._id, type: 'translation', question: 'Përkthe: "Bari është i gjelbër."', correctAnswer: 'The grass is green', explanationAlb: '"Green" = E gjelbër.', xpReward: 20, order: 2 },
    { lesson: lesson3._id, language: english._id, type: 'multiple_choice', question: 'Si thuhet "E kuqe" në anglisht?', options: ['Blue', 'Pink', 'Red', 'Orange'], correctAnswer: 'Red', explanationAlb: '"Red" = E kuqe. Ngjyra e gjakut dhe trëndafilit.', xpReward: 15, order: 3 },
  ]);

  // === ENGLISH BEGINNER - LESSON 4: Family ===
  const enBLesson4 = await Lesson.create({
    level: beginner._id, language: english._id,
    titleAlb: 'Familja', title: 'Family',
    description: 'Mëso emrat e anëtarëve të familjes në anglisht',
    order: 4, xpReward: 55, estimatedMinutes: 6, icon: '👨‍👩‍👧‍👦',
    vocabularyCount: 8, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: enBLesson4._id, language: english._id, albanianWord: 'Babai', targetWord: 'Father', pronunciation: 'ˈfɑːðər', exampleAlb: 'Babai im punon çdo ditë.', exampleTarget: 'My father works every day.', category: 'family', difficulty: 1 },
    { lesson: enBLesson4._id, language: english._id, albanianWord: 'Nëna', targetWord: 'Mother', pronunciation: 'ˈmʌðər', exampleAlb: 'Nëna ime gatuan shumë mirë.', exampleTarget: 'My mother cooks very well.', category: 'family', difficulty: 1 },
    { lesson: enBLesson4._id, language: english._id, albanianWord: 'Vëllai', targetWord: 'Brother', pronunciation: 'ˈbrʌðər', exampleAlb: 'Vëllai im është i vogël.', exampleTarget: 'My brother is young.', category: 'family', difficulty: 1 },
    { lesson: enBLesson4._id, language: english._id, albanianWord: 'Motra', targetWord: 'Sister', pronunciation: 'ˈsɪstər', exampleAlb: 'Motra ime lexon shumë.', exampleTarget: 'My sister reads a lot.', category: 'family', difficulty: 1 },
    { lesson: enBLesson4._id, language: english._id, albanianWord: 'Djali', targetWord: 'Son', pronunciation: 'sʌn', exampleAlb: 'Djali i tij luhet jashtë.', exampleTarget: 'His son plays outside.', category: 'family', difficulty: 1 },
    { lesson: enBLesson4._id, language: english._id, albanianWord: 'Vajza', targetWord: 'Daughter', pronunciation: 'ˈdɔːtər', exampleAlb: 'Vajza e saj mëson piano.', exampleTarget: 'Her daughter learns piano.', category: 'family', difficulty: 1 },
    { lesson: enBLesson4._id, language: english._id, albanianWord: 'Gjyshi', targetWord: 'Grandfather', pronunciation: 'ˈɡrændfɑːðər', exampleAlb: 'Gjyshi im tregon histori.', exampleTarget: 'My grandfather tells stories.', category: 'family', difficulty: 2 },
    { lesson: enBLesson4._id, language: english._id, albanianWord: 'Gjyshja', targetWord: 'Grandmother', pronunciation: 'ˈɡrænmʌðər', exampleAlb: 'Gjyshja ime gatuan byrek.', exampleTarget: 'My grandmother makes byrek.', category: 'family', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: enBLesson4._id, language: english._id, type: 'multiple_choice', question: 'Si thuhet "Nëna" në anglisht?', options: ['Sister', 'Mother', 'Daughter', 'Grandmother'], correctAnswer: 'Mother', explanationAlb: '"Mother" = Nëna. Nëna është prindi femër.', xpReward: 15, order: 1 },
    { lesson: enBLesson4._id, language: english._id, type: 'translation', question: 'Përkthe: "Vëllai im është i vogël."', correctAnswer: 'My brother is young', explanationAlb: '"Brother" = Vëllai. "My" = Im/Ime. "Young" = i vogël/i ri.', xpReward: 20, order: 2 },
    { lesson: enBLesson4._id, language: english._id, type: 'fill_blank', question: 'Plotëso: "My ___ cooks very well." (nëna)', correctAnswer: 'mother', explanationAlb: '"Mother" = Nëna. Personi femër prind.', xpReward: 15, order: 3 },
  ]);

  // === ENGLISH BEGINNER - LESSON 5: Animals ===
  const enBLesson5 = await Lesson.create({
    level: beginner._id, language: english._id,
    titleAlb: 'Kafshët', title: 'Animals',
    description: 'Mëso emrat e kafshëve të zakonshme në anglisht',
    order: 5, xpReward: 55, estimatedMinutes: 6, icon: '🐾',
    vocabularyCount: 8, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: enBLesson5._id, language: english._id, albanianWord: 'Qeni', targetWord: 'Dog', pronunciation: 'dɒɡ', exampleAlb: 'Qeni im është shumë i dashur.', exampleTarget: 'My dog is very friendly.', category: 'animals', difficulty: 1 },
    { lesson: enBLesson5._id, language: english._id, albanianWord: 'Macja', targetWord: 'Cat', pronunciation: 'kæt', exampleAlb: 'Macja fle gjithë ditën.', exampleTarget: 'The cat sleeps all day.', category: 'animals', difficulty: 1 },
    { lesson: enBLesson5._id, language: english._id, albanianWord: 'Zogu', targetWord: 'Bird', pronunciation: 'bɜːrd', exampleAlb: 'Zogu këndon çdo mëngjes.', exampleTarget: 'The bird sings every morning.', category: 'animals', difficulty: 1 },
    { lesson: enBLesson5._id, language: english._id, albanianWord: 'Peshku', targetWord: 'Fish', pronunciation: 'fɪʃ', exampleAlb: 'Peshku noton në lumë.', exampleTarget: 'The fish swims in the river.', category: 'animals', difficulty: 1 },
    { lesson: enBLesson5._id, language: english._id, albanianWord: 'Kali', targetWord: 'Horse', pronunciation: 'hɔːrs', exampleAlb: 'Kali vrapoi shumë shpejt.', exampleTarget: 'The horse ran very fast.', category: 'animals', difficulty: 1 },
    { lesson: enBLesson5._id, language: english._id, albanianWord: 'Lopa', targetWord: 'Cow', pronunciation: 'kaʊ', exampleAlb: 'Lopa jep qumësht çdo ditë.', exampleTarget: 'The cow gives milk every day.', category: 'animals', difficulty: 1 },
    { lesson: enBLesson5._id, language: english._id, albanianWord: 'Luani', targetWord: 'Lion', pronunciation: 'ˈlaɪən', exampleAlb: 'Luani jeton në Afrikë.', exampleTarget: 'The lion lives in Africa.', category: 'animals', difficulty: 2 },
    { lesson: enBLesson5._id, language: english._id, albanianWord: 'Elefanti', targetWord: 'Elephant', pronunciation: 'ˈelɪfənt', exampleAlb: 'Elefanti është kafsha më e madhe.', exampleTarget: 'The elephant is the biggest animal.', category: 'animals', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: enBLesson5._id, language: english._id, type: 'multiple_choice', question: 'Si thuhet "Macja" në anglisht?', options: ['Dog', 'Bird', 'Cat', 'Fish'], correctAnswer: 'Cat', explanationAlb: '"Cat" = Macja. Kafsha shtëpiake e zakonshme.', xpReward: 15, order: 1 },
    { lesson: enBLesson5._id, language: english._id, type: 'translation', question: 'Përkthe: "Qeni im është shumë i dashur."', correctAnswer: 'My dog is very friendly', explanationAlb: '"Dog" = Qen. "My" = Im. "Friendly" = i dashur/miqësor.', xpReward: 20, order: 2 },
    { lesson: enBLesson5._id, language: english._id, type: 'multiple_choice', question: 'Cila kafshë quhet "Horse"?', options: ['Lopa', 'Kali', 'Luani', 'Elefanti'], correctAnswer: 'Kali', explanationAlb: '"Horse" = Kali. Kafsha që përdoret për të kalëruar.', xpReward: 15, order: 3 },
  ]);

  // === LESSON 4: Present Simple (Intermediate) ===
  const lesson4 = await Lesson.create({
    level: intermediate._id, language: english._id,
    titleAlb: 'Koha e Tashme', title: 'Present Simple Tense',
    description: 'Mëso si të ndërtosh fjali në kohën e tashme',
    order: 1, xpReward: 80, estimatedMinutes: 10, icon: '⏰',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: lesson4._id, language: english._id, albanianWord: 'Unë punoj', targetWord: 'I work', pronunciation: 'aɪ wɜːrk', exampleAlb: 'Unë punoj çdo ditë.', exampleTarget: 'I work every day.', category: 'verbs', difficulty: 2 },
    { lesson: lesson4._id, language: english._id, albanianWord: 'Ai/Ajo punon', targetWord: 'He works', pronunciation: 'hiː wɜːrks', exampleAlb: 'Ai punon në zyrë.', exampleTarget: 'He works in an office.', category: 'verbs', difficulty: 2 },
    { lesson: lesson4._id, language: english._id, albanianWord: 'Ne jetojmë', targetWord: 'We live', pronunciation: 'wiː lɪv', exampleAlb: 'Ne jetojmë në Tiranë.', exampleTarget: 'We live in Tirana.', category: 'verbs', difficulty: 2 },
    { lesson: lesson4._id, language: english._id, albanianWord: 'Unë flas', targetWord: 'I speak', pronunciation: 'aɪ spiːk', exampleAlb: 'Unë flas shqip.', exampleTarget: 'I speak Albanian.', category: 'verbs', difficulty: 2 },
    { lesson: lesson4._id, language: english._id, albanianWord: 'Ata mësojnë', targetWord: 'They study', pronunciation: 'ðeɪ ˈstʌdi', exampleAlb: 'Ata mësojnë çdo ditë.', exampleTarget: 'They study every day.', category: 'verbs', difficulty: 2 },
    { lesson: lesson4._id, language: english._id, albanianWord: 'Unë ha', targetWord: 'I eat', pronunciation: 'aɪ iːt', exampleAlb: 'Unë ha mëngjes çdo ditë.', exampleTarget: 'I eat breakfast every day.', category: 'verbs', difficulty: 2 },
    { lesson: lesson4._id, language: english._id, albanianWord: 'Ajo lexon', targetWord: 'She reads', pronunciation: 'ʃiː riːdz', exampleAlb: 'Ajo lexon çdo mbrëmje.', exampleTarget: 'She reads every evening.', category: 'verbs', difficulty: 2 },
    { lesson: lesson4._id, language: english._id, albanianWord: 'Ai dëgjon', targetWord: 'He listens', pronunciation: 'hiː ˈlɪsənz', exampleAlb: 'Ai dëgjon muzikë.', exampleTarget: 'He listens to music.', category: 'verbs', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: lesson4._id, language: english._id, type: 'multiple_choice', question: 'Cila është forma e saktë: "Ai punon" në anglisht?', options: ['He work', 'He works', 'He working', 'He worked'], correctAnswer: 'He works', explanationAlb: 'Në kohën e tashme, veta e tretë njëjës (he/she/it) merr "-s" në fund: works.', xpReward: 20, order: 1 },
    { lesson: lesson4._id, language: english._id, type: 'translation', question: 'Përkthe: "Unë flas shqip."', correctAnswer: 'I speak Albanian', explanationAlb: '"I speak" = Unë flas. Nuk ka "-s" sepse është veta e parë.', xpReward: 25, order: 2 },
    { lesson: lesson4._id, language: english._id, type: 'fill_blank', question: 'Plotëso: "She ___ every evening." (lexon)', correctAnswer: 'reads', explanationAlb: '"reads" = lexon. She/He/It marrin "-s" ose "-es" në fund.', xpReward: 20, order: 3 },
    { lesson: lesson4._id, language: english._id, type: 'multiple_choice', question: 'Si thuhet "Ne jetojmë"?', options: ['We lives', 'We lived', 'We live', 'They live'], correctAnswer: 'We live', explanationAlb: '"We live" — "we" nuk merr "-s" në fund.', xpReward: 20, order: 4 },
  ]);

  // === LESSON 5: Daily Routines (Intermediate) ===
  const lesson5 = await Lesson.create({
    level: intermediate._id, language: english._id,
    titleAlb: 'Rutina Ditore', title: 'Daily Routines',
    description: 'Shprehje për aktivitetet e përditshme',
    order: 2, xpReward: 80, estimatedMinutes: 10, icon: '📅',
    vocabularyCount: 8, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: lesson5._id, language: english._id, albanianWord: 'Zgjohem', targetWord: 'Wake up', pronunciation: 'weɪk ʌp', exampleAlb: 'Zgjohem në orën 7.', exampleTarget: 'I wake up at 7 o\'clock.', category: 'routine', difficulty: 2 },
    { lesson: lesson5._id, language: english._id, albanianWord: 'Lahem', targetWord: 'Take a shower', pronunciation: 'teɪk ə ˈʃaʊər', exampleAlb: 'Lahem çdo mëngjes.', exampleTarget: 'I take a shower every morning.', category: 'routine', difficulty: 2 },
    { lesson: lesson5._id, language: english._id, albanianWord: 'Ha mëngjes', targetWord: 'Have breakfast', pronunciation: 'hæv ˈbrekfəst', exampleAlb: 'Ha mëngjes me familjen.', exampleTarget: 'I have breakfast with my family.', category: 'routine', difficulty: 2 },
    { lesson: lesson5._id, language: english._id, albanianWord: 'Shkoj në punë', targetWord: 'Go to work', pronunciation: 'ɡoʊ tuː wɜːrk', exampleAlb: 'Shkoj në punë me autobus.', exampleTarget: 'I go to work by bus.', category: 'routine', difficulty: 2 },
    { lesson: lesson5._id, language: english._id, albanianWord: 'Ha drekë', targetWord: 'Have lunch', pronunciation: 'hæv lʌntʃ', exampleAlb: 'Ha drekë në orën 13.', exampleTarget: 'I have lunch at 1 PM.', category: 'routine', difficulty: 2 },
    { lesson: lesson5._id, language: english._id, albanianWord: 'Kthehem në shtëpi', targetWord: 'Come home', pronunciation: 'kʌm hoʊm', exampleAlb: 'Kthehem në shtëpi në orën 18.', exampleTarget: 'I come home at 6 PM.', category: 'routine', difficulty: 2 },
    { lesson: lesson5._id, language: english._id, albanianWord: 'Ha darkë', targetWord: 'Have dinner', pronunciation: 'hæv ˈdɪnər', exampleAlb: 'Ha darkë me familjen.', exampleTarget: 'I have dinner with my family.', category: 'routine', difficulty: 2 },
    { lesson: lesson5._id, language: english._id, albanianWord: 'Shkoj të fle', targetWord: 'Go to bed', pronunciation: 'ɡoʊ tuː bed', exampleAlb: 'Shkoj të fle në orën 23.', exampleTarget: 'I go to bed at 11 PM.', category: 'routine', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: lesson5._id, language: english._id, type: 'multiple_choice', question: 'Si thuhet "Zgjohem" në anglisht?', options: ['Go to bed', 'Wake up', 'Have lunch', 'Come home'], correctAnswer: 'Wake up', explanationAlb: '"Wake up" = Zgjohem. E kundërta është "Go to bed".', xpReward: 20, order: 1 },
    { lesson: lesson5._id, language: english._id, type: 'translation', question: 'Përkthe: "Shkoj të fle në orën 23."', correctAnswer: 'I go to bed at 11 PM', explanationAlb: '"Go to bed" = shkoj të fle. "PM" = pasdite/mbrëmje.', xpReward: 25, order: 2 },
    { lesson: lesson5._id, language: english._id, type: 'fill_blank', question: 'Plotëso: "I ___ breakfast every morning." (ha)', correctAnswer: 'have', explanationAlb: '"Have breakfast" = ha mëngjes. Foljet zakonisht nuk ndryshojnë me "I".', xpReward: 20, order: 3 },
  ]);

  // === ENGLISH INTERMEDIATE - LESSON 3: Past Simple ===
  const enILesson3 = await Lesson.create({
    level: intermediate._id, language: english._id,
    titleAlb: 'E Kaluara e Thjeshtë', title: 'Past Simple Tense',
    description: 'Mëso si të flasësh për ngjarje të së kaluarës',
    order: 3, xpReward: 85, estimatedMinutes: 12, icon: '📖',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: enILesson3._id, language: english._id, albanianWord: 'Punova', targetWord: 'I worked', pronunciation: 'aɪ wɜːrkt', exampleAlb: 'Punova deri vonë mbrëmë.', exampleTarget: 'I worked late last night.', category: 'verbs', difficulty: 2 },
    { lesson: enILesson3._id, language: english._id, albanianWord: 'Jetova', targetWord: 'I lived', pronunciation: 'aɪ lɪvd', exampleAlb: 'Jetova në Tiranë pesë vjet.', exampleTarget: 'I lived in Tirana for five years.', category: 'verbs', difficulty: 2 },
    { lesson: enILesson3._id, language: english._id, albanianWord: 'Mësova', targetWord: 'I studied', pronunciation: 'aɪ ˈstʌdid', exampleAlb: 'Mësova anglisht në shkollë.', exampleTarget: 'I studied English at school.', category: 'verbs', difficulty: 2 },
    { lesson: enILesson3._id, language: english._id, albanianWord: 'Pashë', targetWord: 'I watched', pronunciation: 'aɪ wɒtʃt', exampleAlb: 'Pashë një film mbrëmë.', exampleTarget: 'I watched a film last night.', category: 'verbs', difficulty: 2 },
    { lesson: enILesson3._id, language: english._id, albanianWord: 'Luajta', targetWord: 'I played', pronunciation: 'aɪ pleɪd', exampleAlb: 'Luajta futboll me shokët.', exampleTarget: 'I played football with my friends.', category: 'verbs', difficulty: 2 },
    { lesson: enILesson3._id, language: english._id, albanianWord: 'Vizitova', targetWord: 'I visited', pronunciation: 'aɪ ˈvɪzɪtɪd', exampleAlb: 'Vizitova Londrën vitin e kaluar.', exampleTarget: 'I visited London last year.', category: 'verbs', difficulty: 2 },
    { lesson: enILesson3._id, language: english._id, albanianWord: 'Gatova', targetWord: 'I cooked', pronunciation: 'aɪ kʊkt', exampleAlb: 'Gatova darkë për familjen.', exampleTarget: 'I cooked dinner for my family.', category: 'verbs', difficulty: 2 },
    { lesson: enILesson3._id, language: english._id, albanianWord: 'Bisedova', targetWord: 'I talked', pronunciation: 'aɪ tɔːkt', exampleAlb: 'Bisedova me miken time.', exampleTarget: 'I talked with my friend.', category: 'verbs', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: enILesson3._id, language: english._id, type: 'multiple_choice', question: 'Cila është forma e saktë e kaluar e "work"?', options: ['workes', 'worked', 'working', 'works'], correctAnswer: 'worked', explanationAlb: 'Foljet e rregullta marrin "-ed" në kohën e kaluar: work → worked.', xpReward: 20, order: 1 },
    { lesson: enILesson3._id, language: english._id, type: 'translation', question: 'Përkthe: "Vizitova Londrën vitin e kaluar."', correctAnswer: 'I visited London last year', explanationAlb: '"Visited" = vizitova. "Last year" = vitin e kaluar. Folja merr "-ed" sepse është e rregullt.', xpReward: 25, order: 2 },
    { lesson: enILesson3._id, language: english._id, type: 'fill_blank', question: 'Plotëso: "She ___ a film last night." (pa)', correctAnswer: 'watched', explanationAlb: '"Watched" = pashë/pa. Koha e kaluar e "watch" formohet me "-ed".', xpReward: 20, order: 3 },
    { lesson: enILesson3._id, language: english._id, type: 'multiple_choice', question: 'Cila fjali është gramatikisht e saktë?', options: ['We play football yesterday', 'We played football yesterday', 'We playing football yesterday', 'We plays football yesterday'], correctAnswer: 'We played football yesterday', explanationAlb: '"Played" = luajta/luajtëm. Koha e kaluar formohet me "-ed".', xpReward: 20, order: 4 },
  ]);

  // === ENGLISH INTERMEDIATE - LESSON 4: Food & Drinks ===
  const enILesson4 = await Lesson.create({
    level: intermediate._id, language: english._id,
    titleAlb: 'Ushqimi dhe Pijet', title: 'Food & Drinks',
    description: 'Mëso fjalët për ushqim dhe pije në anglisht',
    order: 4, xpReward: 80, estimatedMinutes: 10, icon: '🍕',
    vocabularyCount: 8, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: enILesson4._id, language: english._id, albanianWord: 'Bukë', targetWord: 'Bread', pronunciation: 'bred', exampleAlb: 'Bleva bukë të freskët.', exampleTarget: 'I bought fresh bread.', category: 'food', difficulty: 2 },
    { lesson: enILesson4._id, language: english._id, albanianWord: 'Ujë', targetWord: 'Water', pronunciation: 'ˈwɔːtər', exampleAlb: 'Pi ujë çdo ditë.', exampleTarget: 'Drink water every day.', category: 'drinks', difficulty: 1 },
    { lesson: enILesson4._id, language: english._id, albanianWord: 'Kafe', targetWord: 'Coffee', pronunciation: 'ˈkɒfi', exampleAlb: 'Pi kafe çdo mëngjes.', exampleTarget: 'I drink coffee every morning.', category: 'drinks', difficulty: 2 },
    { lesson: enILesson4._id, language: english._id, albanianWord: 'Qumësht', targetWord: 'Milk', pronunciation: 'mɪlk', exampleAlb: 'Qumështi është i mirë për shëndetin.', exampleTarget: 'Milk is good for your health.', category: 'drinks', difficulty: 1 },
    { lesson: enILesson4._id, language: english._id, albanianWord: 'Mollë', targetWord: 'Apple', pronunciation: 'ˈæpəl', exampleAlb: 'Hëngra një mollë pas drekës.', exampleTarget: 'I ate an apple after lunch.', category: 'food', difficulty: 1 },
    { lesson: enILesson4._id, language: english._id, albanianWord: 'Mish pule', targetWord: 'Chicken', pronunciation: 'ˈtʃɪkɪn', exampleAlb: 'Dua mish pule të pjekur.', exampleTarget: 'I want grilled chicken.', category: 'food', difficulty: 2 },
    { lesson: enILesson4._id, language: english._id, albanianWord: 'Oriz', targetWord: 'Rice', pronunciation: 'raɪs', exampleAlb: 'Orizi është ushqim bazë.', exampleTarget: 'Rice is a staple food.', category: 'food', difficulty: 2 },
    { lesson: enILesson4._id, language: english._id, albanianWord: 'Sallatë', targetWord: 'Salad', pronunciation: 'ˈsæləd', exampleAlb: 'Ha sallatë çdo ditë.', exampleTarget: 'Eat salad every day.', category: 'food', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: enILesson4._id, language: english._id, type: 'multiple_choice', question: 'Si thuhet "Bukë" në anglisht?', options: ['Water', 'Bread', 'Milk', 'Rice'], correctAnswer: 'Bread', explanationAlb: '"Bread" = Bukë. Ushqimi bazë i çdo dite.', xpReward: 20, order: 1 },
    { lesson: enILesson4._id, language: english._id, type: 'translation', question: 'Përkthe: "Dua kafe dhe bukë, ju lutem."', correctAnswer: 'I want coffee and bread please', explanationAlb: '"I want" = Dua. "Coffee" = Kafe. "Bread" = Bukë.', xpReward: 25, order: 2 },
    { lesson: enILesson4._id, language: english._id, type: 'fill_blank', question: 'Plotëso: "I drink ___ every morning." (qumësht)', correctAnswer: 'milk', explanationAlb: '"Milk" = Qumësht. Pije e bardhë dhe ushqyese.', xpReward: 20, order: 3 },
  ]);

  // === LESSON 6: Idioms (Advanced) ===
  const lesson6 = await Lesson.create({
    level: advanced._id, language: english._id,
    titleAlb: 'Shprehje Idiomatike', title: 'Idiomatic Expressions',
    description: 'Shprehje të veçanta të anglishtes së folur',
    order: 1, xpReward: 100, estimatedMinutes: 12, icon: '💬',
    vocabularyCount: 6, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: lesson6._id, language: english._id, albanianWord: 'Kosto sa të kushtojë', targetWord: 'At any cost', pronunciation: 'æt ˈeni kɒst', exampleAlb: 'Do ta arrij qëllimin kosto sa të kushtojë.', exampleTarget: 'I will reach my goal at any cost.', category: 'idioms', difficulty: 3 },
    { lesson: lesson6._id, language: english._id, albanianWord: 'Vras dy zogj me një gur', targetWord: 'Kill two birds with one stone', pronunciation: 'kɪl tuː bɜːrdz wɪð wʌn stoʊn', exampleAlb: 'Vras dy zogj me një gur — bëj punën dhe mësoj.', exampleTarget: 'I kill two birds with one stone.', category: 'idioms', difficulty: 4 },
    { lesson: lesson6._id, language: english._id, albanianWord: 'Shprehja e fytyrës', targetWord: 'Break a leg', pronunciation: 'breɪk ə leɡ', exampleAlb: 'Shprehja e fytyrës — thuaj para shfaqjes.', exampleTarget: 'Break a leg before the show!', category: 'idioms', difficulty: 3 },
    { lesson: lesson6._id, language: english._id, albanianWord: 'Çfarë rriten, aq korrin', targetWord: 'You reap what you sow', pronunciation: 'juː riːp wɒt juː soʊ', exampleAlb: 'Çfarë rriten, aq korrin — proverb i vjetër.', exampleTarget: 'You reap what you sow.', category: 'idioms', difficulty: 4 },
    { lesson: lesson6._id, language: english._id, albanianWord: 'Njeri i zakonshëm', targetWord: 'Down to earth', pronunciation: 'daʊn tuː ɜːrθ', exampleAlb: 'Ai është njeri i zakonshëm, pa krenari.', exampleTarget: 'He is very down to earth.', category: 'idioms', difficulty: 3 },
    { lesson: lesson6._id, language: english._id, albanianWord: 'Kurrë nuk është vonë', targetWord: 'Better late than never', pronunciation: 'ˈbetər leɪt ðæn ˈnevər', exampleAlb: 'Kurrë nuk është vonë të fillosh të mësosh.', exampleTarget: 'Better late than never to start learning.', category: 'idioms', difficulty: 3 },
  ]);

  await Exercise.insertMany([
    { lesson: lesson6._id, language: english._id, type: 'multiple_choice', question: '"Break a leg" çfarë do të thotë?', options: ['Thyej këmbën', 'Shumë fat!', 'Bëj sport', 'Ec ngadalë'], correctAnswer: 'Shumë fat!', explanationAlb: '"Break a leg" = Shumë fat! Përdoret para performancave, jo literalisht.', xpReward: 25, order: 1 },
    { lesson: lesson6._id, language: english._id, type: 'translation', question: 'Përkthe idiomën: "Vras dy zogj me një gur"', correctAnswer: 'Kill two birds with one stone', explanationAlb: 'Kjo idiomë ekziston edhe në shqip dhe anglisht — do të thotë arrij dy qëllime me një veprim.', xpReward: 30, order: 2 },
    { lesson: lesson6._id, language: english._id, type: 'multiple_choice', question: '"Down to earth" çfarë do të thotë?', options: ['I varfër', 'I thjeshtë dhe i sinqertë', 'I lodhur', 'I trishtuar'], correctAnswer: 'I thjeshtë dhe i sinqertë', explanationAlb: '"Down to earth" = i thjeshtë, pa arrogancë, realist.', xpReward: 25, order: 3 },
  ]);

  // === ENGLISH ADVANCED - LESSON 2: Business English ===
  const enALesson2 = await Lesson.create({
    level: advanced._id, language: english._id,
    titleAlb: 'Anglishte Biznesi', title: 'Business English',
    description: 'Fjalor profesional për mjedisin e punës',
    order: 2, xpReward: 100, estimatedMinutes: 15, icon: '💼',
    vocabularyCount: 8, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: enALesson2._id, language: english._id, albanianWord: 'Takim', targetWord: 'Meeting', pronunciation: 'ˈmiːtɪŋ', exampleAlb: 'Kemi takim nesër në mëngjes.', exampleTarget: 'We have a meeting tomorrow morning.', category: 'business', difficulty: 3 },
    { lesson: enALesson2._id, language: english._id, albanianWord: 'Afat', targetWord: 'Deadline', pronunciation: 'ˈdedlaɪn', exampleAlb: 'Afati është të premten.', exampleTarget: 'The deadline is on Friday.', category: 'business', difficulty: 3 },
    { lesson: enALesson2._id, language: english._id, albanianWord: 'Prezantim', targetWord: 'Presentation', pronunciation: 'ˌprezənˈteɪʃən', exampleAlb: 'Kam prezantim para klientëve.', exampleTarget: 'I have a presentation for the clients.', category: 'business', difficulty: 3 },
    { lesson: enALesson2._id, language: english._id, albanianWord: 'Negocioj', targetWord: 'Negotiate', pronunciation: 'nɪˈɡoʊʃieɪt', exampleAlb: 'Duhet të negociojmë çmimin.', exampleTarget: 'We need to negotiate the price.', category: 'business', difficulty: 4 },
    { lesson: enALesson2._id, language: english._id, albanianWord: 'Buxhet', targetWord: 'Budget', pronunciation: 'ˈbʌdʒɪt', exampleAlb: 'Buxheti i projektit është i kufizuar.', exampleTarget: 'The project budget is limited.', category: 'business', difficulty: 3 },
    { lesson: enALesson2._id, language: english._id, albanianWord: 'Rend dite', targetWord: 'Agenda', pronunciation: 'əˈdʒendə', exampleAlb: 'Cila është rend dita e takimit?', exampleTarget: 'What is the meeting agenda?', category: 'business', difficulty: 3 },
    { lesson: enALesson2._id, language: english._id, albanianWord: 'Reagim', targetWord: 'Feedback', pronunciation: 'ˈfiːdbæk', exampleAlb: 'Klientët dhanë reagime pozitive.', exampleTarget: 'The clients gave positive feedback.', category: 'business', difficulty: 3 },
    { lesson: enALesson2._id, language: english._id, albanianWord: 'Bashkëpunim', targetWord: 'Collaboration', pronunciation: 'kəˌlæbəˈreɪʃən', exampleAlb: 'Bashkëpunimi është çelësi i suksesit.', exampleTarget: 'Collaboration is the key to success.', category: 'business', difficulty: 4 },
  ]);

  await Exercise.insertMany([
    { lesson: enALesson2._id, language: english._id, type: 'multiple_choice', question: '"Deadline" çfarë do të thotë?', options: ['Takim', 'Afat', 'Buxhet', 'Reagim'], correctAnswer: 'Afat', explanationAlb: '"Deadline" = Afati i fundit. Koha kur duhet të përfundojë një detyrë.', xpReward: 25, order: 1 },
    { lesson: enALesson2._id, language: english._id, type: 'translation', question: 'Përkthe: "Kemi takim nesër në mëngjes."', correctAnswer: 'We have a meeting tomorrow morning', explanationAlb: '"Meeting" = takim. "Tomorrow morning" = nesër në mëngjes.', xpReward: 30, order: 2 },
    { lesson: enALesson2._id, language: english._id, type: 'multiple_choice', question: '"Feedback" çfarë do të thotë?', options: ['Bashkëpunim', 'Negocioj', 'Reagim', 'Rend dite'], correctAnswer: 'Reagim', explanationAlb: '"Feedback" = Reagim. Mendimi ose vlerësimi mbi punën e bërë.', xpReward: 25, order: 3 },
  ]);

  // ═══════════════════════════════════════════════
  // GERMAN LANGUAGE
  // ═══════════════════════════════════════════════
  const german = await Language.create({
    code: 'de', name: 'German', nameAlb: 'Gjermanisht',
    flag: '🇩🇪', isAvailable: true, comingSoon: false,
    color: '#2563EB', description: 'Gjuha e ekonomisë dhe teknologjisë evropiane',
    order: 2,
  });

  const deBeginner = await Level.create({
    language: german._id, name: 'beginner', nameAlb: 'Fillestar',
    description: 'Fjalë dhe fraza bazë në gjermanisht', order: 1, xpRequired: 0, icon: '🌱', totalLessons: 3,
  });

  // === DE LESSON 1: Greetings ===
  const deLesson1 = await Lesson.create({
    level: deBeginner._id, language: german._id,
    titleAlb: 'Përshëndetjet', title: 'Begrüßungen',
    description: 'Mëso si të përshëndesësh në gjermanisht',
    order: 1, xpReward: 50, estimatedMinutes: 5, icon: '👋',
    vocabularyCount: 10, exerciseCount: 4, isPublished: true,
  });
  await Vocabulary.insertMany([
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Përshëndetje', targetWord: 'Hallo', pronunciation: 'ˈhalo', exampleAlb: 'Përshëndetje, si jeni?', exampleTarget: 'Hallo, wie geht es Ihnen?', category: 'greeting', difficulty: 1 },
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Mirëmëngjes', targetWord: 'Guten Morgen', pronunciation: 'ˈɡuːtən ˈmɔrɡən', exampleAlb: 'Mirëmëngjes, si kaloi nata?', exampleTarget: 'Guten Morgen, wie war die Nacht?', category: 'greeting', difficulty: 1 },
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Mirëdita', targetWord: 'Guten Tag', pronunciation: 'ˈɡuːtən taːk', exampleAlb: 'Mirëdita, si jeni?', exampleTarget: 'Guten Tag, wie geht es Ihnen?', category: 'greeting', difficulty: 1 },
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Mirëmbrëma', targetWord: 'Guten Abend', pronunciation: 'ˈɡuːtən ˈaːbənt', exampleAlb: 'Mirëmbrëma, keni kaluar mirë?', exampleTarget: 'Guten Abend, hatten Sie einen guten Tag?', category: 'greeting', difficulty: 1 },
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Natën e mirë', targetWord: 'Gute Nacht', pronunciation: 'ˈɡuːtə naxt', exampleAlb: 'Natën e mirë, ëndërroni mirë!', exampleTarget: 'Gute Nacht, träum süß!', category: 'greeting', difficulty: 1 },
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Mirupafshim', targetWord: 'Auf Wiedersehen', pronunciation: 'aʊf ˈviːdɐzeːən', exampleAlb: 'Mirupafshim, shpresoj të takohemi sërisht!', exampleTarget: 'Auf Wiedersehen, bis bald!', category: 'greeting', difficulty: 1 },
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Ju lutem', targetWord: 'Bitte', pronunciation: 'ˈbɪtə', exampleAlb: 'Ju lutem, ndihmo!', exampleTarget: 'Bitte hilf mir!', category: 'politeness', difficulty: 1 },
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Faleminderit', targetWord: 'Danke', pronunciation: 'ˈdaŋkə', exampleAlb: 'Faleminderit shumë!', exampleTarget: 'Danke sehr!', category: 'politeness', difficulty: 1 },
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Po', targetWord: 'Ja', pronunciation: 'jaː', exampleAlb: 'Po, e kuptoj.', exampleTarget: 'Ja, ich verstehe.', category: 'basics', difficulty: 1 },
    { lesson: deLesson1._id, language: german._id, albanianWord: 'Jo', targetWord: 'Nein', pronunciation: 'naɪn', exampleAlb: 'Jo, nuk dua.', exampleTarget: 'Nein, ich möchte nicht.', category: 'basics', difficulty: 1 },
  ]);
  await Exercise.insertMany([
    { lesson: deLesson1._id, language: german._id, type: 'multiple_choice', question: 'Si thuhet "Mirëmëngjes" në gjermanisht?', options: ['Guten Tag', 'Guten Morgen', 'Gute Nacht', 'Guten Abend'], correctAnswer: 'Guten Morgen', explanationAlb: '"Guten Morgen" = Mirëmëngjes. Përdoret para mesditës.', xpReward: 15, order: 1 },
    { lesson: deLesson1._id, language: german._id, type: 'translation', question: 'Përkthe: "Faleminderit shumë!"', correctAnswer: 'Danke sehr', explanationAlb: '"Danke sehr" = Faleminderit shumë. "Danke" e thjeshtë do të thotë faleminderit.', xpReward: 20, order: 2 },
    { lesson: deLesson1._id, language: german._id, type: 'fill_blank', question: 'Plotëso: "_____ Nacht!" (natën e mirë)', correctAnswer: 'Gute', explanationAlb: '"Gute Nacht" = Natën e mirë. Thuhet kur je duke fjetur.', xpReward: 15, order: 3 },
    { lesson: deLesson1._id, language: german._id, type: 'listening_challenge', question: 'Dëgjoni me vëmendje dhe zgjidhni përkthimin e saktë:', listeningWord: 'Danke', listeningLang: 'de-DE', options: ['Faleminderit', 'Ju lutem', 'Mirupafshim', 'Mirëmëngjes'], correctAnswer: 'Faleminderit', explanationAlb: '"Danke" = Faleminderit. Është fjala gjermane për mirënjohje.', xpReward: 25, order: 4 },
  ]);

  // === DE LESSON 2: Numbers 1-10 ===
  const deLesson2 = await Lesson.create({
    level: deBeginner._id, language: german._id,
    titleAlb: 'Numrat 1–10', title: 'Zahlen 1–10',
    description: 'Mëso numrat bazë në gjermanisht',
    order: 2, xpReward: 55, estimatedMinutes: 6, icon: '🔢',
    vocabularyCount: 10, exerciseCount: 4, isPublished: true,
  });
  await Vocabulary.insertMany([
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Një', targetWord: 'Eins', pronunciation: 'aɪns', exampleAlb: 'Kam një qen.', exampleTarget: 'Ich habe einen Hund.', category: 'numbers', difficulty: 1 },
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Dy', targetWord: 'Zwei', pronunciation: 'tsvaɪ', exampleAlb: 'Dy plus dy është katër.', exampleTarget: 'Zwei plus zwei ist vier.', category: 'numbers', difficulty: 1 },
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Tre', targetWord: 'Drei', pronunciation: 'draɪ', exampleAlb: 'Tre fëmijë po luajnë.', exampleTarget: 'Drei Kinder spielen.', category: 'numbers', difficulty: 1 },
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Katër', targetWord: 'Vier', pronunciation: 'fiːr', exampleAlb: 'Katër stinë ka viti.', exampleTarget: 'Ein Jahr hat vier Jahreszeiten.', category: 'numbers', difficulty: 1 },
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Pesë', targetWord: 'Fünf', pronunciation: 'fʏnf', exampleAlb: 'Pesë gishta ka dora.', exampleTarget: 'Eine Hand hat fünf Finger.', category: 'numbers', difficulty: 1 },
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Gjashtë', targetWord: 'Sechs', pronunciation: 'zɛks', exampleAlb: 'Gjashtë orë gjumë nuk mjaftojnë.', exampleTarget: 'Sechs Stunden Schlaf reichen nicht.', category: 'numbers', difficulty: 1 },
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Shtatë', targetWord: 'Sieben', pronunciation: 'ˈziːbən', exampleAlb: 'Shtatë ditë ka java.', exampleTarget: 'Eine Woche hat sieben Tage.', category: 'numbers', difficulty: 1 },
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Tetë', targetWord: 'Acht', pronunciation: 'axt', exampleAlb: 'Tetë orë duhet të flemë.', exampleTarget: 'Wir brauchen acht Stunden Schlaf.', category: 'numbers', difficulty: 1 },
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Nëntë', targetWord: 'Neun', pronunciation: 'nɔɪn', exampleAlb: 'Nëntë muaj zgjat shtatzënia.', exampleTarget: 'Eine Schwangerschaft dauert neun Monate.', category: 'numbers', difficulty: 1 },
    { lesson: deLesson2._id, language: german._id, albanianWord: 'Dhjetë', targetWord: 'Zehn', pronunciation: 'tseːn', exampleAlb: 'Dhjetë euro kushtoi bileta.', exampleTarget: 'Das Ticket kostet zehn Euro.', category: 'numbers', difficulty: 1 },
  ]);
  await Exercise.insertMany([
    { lesson: deLesson2._id, language: german._id, type: 'multiple_choice', question: 'Si thuhet "Pesë" në gjermanisht?', options: ['Vier', 'Fünf', 'Sechs', 'Sieben'], correctAnswer: 'Fünf', explanationAlb: '"Fünf" = Pesë. Numri 5 në gjermanisht.', xpReward: 15, order: 1 },
    { lesson: deLesson2._id, language: german._id, type: 'translation', question: 'Përkthe: "Shtatë ditë ka java."', correctAnswer: 'Eine Woche hat sieben Tage', explanationAlb: '"Sieben" = shtatë. "Woche" = javë. "Tage" = ditë.', xpReward: 20, order: 2 },
    { lesson: deLesson2._id, language: german._id, type: 'fill_blank', question: 'Plotëso: "_____ plus zwei ist sieben" (pesë)', correctAnswer: 'Fünf', explanationAlb: '"Fünf" = Pesë. 5 + 2 = 7.', xpReward: 15, order: 3 },
    { lesson: deLesson2._id, language: german._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni numrin e saktë:', listeningWord: 'Acht', listeningLang: 'de-DE', options: ['Tetë', 'Pesë', 'Nëntë', 'Gjashtë'], correctAnswer: 'Tetë', explanationAlb: '"Acht" = Tetë. Numri 8 në gjermanisht.', xpReward: 25, order: 4 },
  ]);

  // === DE LESSON 3: Useful Phrases ===
  const deLesson3 = await Lesson.create({
    level: deBeginner._id, language: german._id,
    titleAlb: 'Fraza të Dobishme', title: 'Nützliche Phrasen',
    description: 'Fraza praktike për udhëtime dhe situata të përditshme',
    order: 3, xpReward: 70, estimatedMinutes: 8, icon: '💬',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });
  await Vocabulary.insertMany([
    { lesson: deLesson3._id, language: german._id, albanianWord: 'Unë vij nga Shqipëria', targetWord: 'Ich komme aus Albanien', pronunciation: 'ɪç ˈkɔmə aʊs alˈbaːni̯ən', exampleAlb: 'Kur pytesh nga je, thuaj kështu.', exampleTarget: 'Ich komme aus Albanien, und Sie?', category: 'phrases', difficulty: 2 },
    { lesson: deLesson3._id, language: german._id, albanianWord: 'Sa kushton kjo?', targetWord: 'Was kostet das?', pronunciation: 'vas ˈkɔstət das', exampleAlb: 'Pyete çmimin në dyqan.', exampleTarget: 'Was kostet das Brot?', category: 'phrases', difficulty: 2 },
    { lesson: deLesson3._id, language: german._id, albanianWord: 'Ku është stacioni i trenit?', targetWord: 'Wo ist der Bahnhof?', pronunciation: 'voː ɪst deːr ˈbaːnhoːf', exampleAlb: 'Pyete dikë ku është stacioni.', exampleTarget: 'Entschuldigung, wo ist der Bahnhof?', category: 'travel', difficulty: 2 },
    { lesson: deLesson3._id, language: german._id, albanianWord: 'Nuk kuptoj', targetWord: 'Ich verstehe nicht', pronunciation: 'ɪç fɛrˈʃteːə nɪçt', exampleAlb: 'Kur nuk kupton diçka, thuaj kështu.', exampleTarget: 'Es tut mir leid, ich verstehe nicht.', category: 'phrases', difficulty: 2 },
    { lesson: deLesson3._id, language: german._id, albanianWord: 'Si quheni?', targetWord: 'Wie heißen Sie?', pronunciation: 'viː ˈhaɪsən ziː', exampleAlb: 'Pyete emrin e dikujt me respekt.', exampleTarget: 'Wie heißen Sie? Ich heiße Anna.', category: 'phrases', difficulty: 2 },
    { lesson: deLesson3._id, language: german._id, albanianWord: 'Ku është tualeti?', targetWord: 'Wo ist die Toilette?', pronunciation: 'voː ɪst diː toaˈlɛtə', exampleAlb: 'Pyete ku ndodhet tualeti.', exampleTarget: 'Entschuldigung, wo ist die Toilette?', category: 'travel', difficulty: 2 },
    { lesson: deLesson3._id, language: german._id, albanianWord: 'Kam nevojë për ndihmë', targetWord: 'Ich brauche Hilfe', pronunciation: 'ɪç ˈbraʊxə ˈhɪlfə', exampleAlb: 'Kur ke nevojë për ndihmë.', exampleTarget: 'Bitte, ich brauche Hilfe!', category: 'phrases', difficulty: 2 },
    { lesson: deLesson3._id, language: german._id, albanianWord: 'Një moment, ju lutem', targetWord: 'Einen Moment, bitte', pronunciation: 'ˈaɪnən moˈmɛnt ˈbɪtə', exampleAlb: 'Kur ke nevojë për pak kohë.', exampleTarget: 'Einen Moment, bitte, ich komme gleich.', category: 'phrases', difficulty: 2 },
  ]);
  await Exercise.insertMany([
    { lesson: deLesson3._id, language: german._id, type: 'translation', question: 'Përkthe: "Unë vij nga Shqipëria"', correctAnswer: 'Ich komme aus Albanien', explanationAlb: '"Ich komme" = unë vij, "aus" = nga, "Albanien" = Shqipëria.', xpReward: 20, order: 1 },
    { lesson: deLesson3._id, language: german._id, type: 'multiple_choice', question: 'Si thuhet "Sa kushton?" në gjermanisht?', options: ['Wo ist das?', 'Was kostet das?', 'Wie heißen Sie?', 'Ich verstehe nicht'], correctAnswer: 'Was kostet das?', explanationAlb: '"Was kostet das?" pyet çmimin e diçkaje.', xpReward: 20, order: 2 },
    { lesson: deLesson3._id, language: german._id, type: 'fill_blank', question: 'Plotëso: "Ich _____ nicht" (nuk kuptoj)', correctAnswer: 'verstehe', explanationAlb: '"Verstehe" vjen nga folja "verstehen" = të kuptosh.', xpReward: 20, order: 3 },
    { lesson: deLesson3._id, language: german._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni përkthimin e saktë:', listeningWord: 'Wo ist der Bahnhof?', listeningLang: 'de-DE', options: ['Ku është stacioni i trenit?', 'Sa kushton kjo?', 'Nuk kuptoj', 'Si quheni?'], correctAnswer: 'Ku është stacioni i trenit?', explanationAlb: '"Wo ist der Bahnhof?" pyet ku ndodhet stacioni i trenit.', xpReward: 25, order: 4 },
  ]);

  // === GERMAN INTERMEDIATE LEVEL ===
  const deIntermediate = await Level.create({
    language: german._id, name: 'intermediate', nameAlb: 'Mesatar',
    description: 'Gramatikë dhe konversacion i mesëm në gjermanisht', order: 2, xpRequired: 300, icon: '🔥', totalLessons: 3,
  });

  // === DE INTERMEDIATE LESSON 1: Sein und Haben (To Be & To Have) ===
  const deILesson1 = await Lesson.create({
    level: deIntermediate._id, language: german._id,
    titleAlb: 'Jam dhe Kam', title: 'Sein und Haben',
    description: 'Mëso foljet themelore "jam" dhe "kam" në gjermanisht',
    order: 1, xpReward: 80, estimatedMinutes: 10, icon: '⏰',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: deILesson1._id, language: german._id, albanianWord: 'Unë jam', targetWord: 'Ich bin', pronunciation: 'ɪç bɪn', exampleAlb: 'Unë jam nga Shqipëria.', exampleTarget: 'Ich bin aus Albanien.', category: 'verbs', difficulty: 2 },
    { lesson: deILesson1._id, language: german._id, albanianWord: 'Ti je', targetWord: 'Du bist', pronunciation: 'duː bɪst', exampleAlb: 'Ti je shumë i mirë.', exampleTarget: 'Du bist sehr gut.', category: 'verbs', difficulty: 2 },
    { lesson: deILesson1._id, language: german._id, albanianWord: 'Ai/Ajo është', targetWord: 'Er/Sie ist', pronunciation: 'eːr/ziː ɪst', exampleAlb: 'Ai është mësuesi im.', exampleTarget: 'Er ist mein Lehrer.', category: 'verbs', difficulty: 2 },
    { lesson: deILesson1._id, language: german._id, albanianWord: 'Ne jemi', targetWord: 'Wir sind', pronunciation: 'viːr zɪnt', exampleAlb: 'Ne jemi shqiptarë.', exampleTarget: 'Wir sind Albaner.', category: 'verbs', difficulty: 2 },
    { lesson: deILesson1._id, language: german._id, albanianWord: 'Unë kam', targetWord: 'Ich habe', pronunciation: 'ɪç ˈhaːbə', exampleAlb: 'Unë kam një qen.', exampleTarget: 'Ich habe einen Hund.', category: 'verbs', difficulty: 2 },
    { lesson: deILesson1._id, language: german._id, albanianWord: 'Ti ke', targetWord: 'Du hast', pronunciation: 'duː hast', exampleAlb: 'Ti ke shumë libra.', exampleTarget: 'Du hast viele Bücher.', category: 'verbs', difficulty: 2 },
    { lesson: deILesson1._id, language: german._id, albanianWord: 'Ai/Ajo ka', targetWord: 'Er/Sie hat', pronunciation: 'eːr/ziː hat', exampleAlb: 'Ajo ka një makinë të re.', exampleTarget: 'Sie hat ein neues Auto.', category: 'verbs', difficulty: 2 },
    { lesson: deILesson1._id, language: german._id, albanianWord: 'Ne kemi', targetWord: 'Wir haben', pronunciation: 'viːr ˈhaːbən', exampleAlb: 'Ne kemi dy fëmijë.', exampleTarget: 'Wir haben zwei Kinder.', category: 'verbs', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: deILesson1._id, language: german._id, type: 'multiple_choice', question: 'Cila është forma e saktë për "Ti je" në gjermanisht?', options: ['Du bin', 'Du bist', 'Du ist', 'Du sind'], correctAnswer: 'Du bist', explanationAlb: '"Du bist" = Ti je. Folja "sein" ndryshon sipas vetës: ich bin, du bist, er/sie ist.', xpReward: 20, order: 1 },
    { lesson: deILesson1._id, language: german._id, type: 'translation', question: 'Përkthe: "Unë jam nga Shqipëria."', correctAnswer: 'Ich bin aus Albanien', explanationAlb: '"Ich bin" = Unë jam. "aus" = nga. "Albanien" = Shqipëria.', xpReward: 25, order: 2 },
    { lesson: deILesson1._id, language: german._id, type: 'fill_blank', question: 'Plotëso: "Wir ___ in Berlin." (jemi)', correctAnswer: 'sind', explanationAlb: '"Sind" = jemi. Folja "sein" për "wir" (ne).', xpReward: 20, order: 3 },
    { lesson: deILesson1._id, language: german._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni kuptimin e saktë:', listeningWord: 'Ich bin müde', listeningLang: 'de-DE', options: ['Unë jam i lodhur', 'Ti je i lodhur', 'Ai është i lodhur', 'Ne jemi të lodhur'], correctAnswer: 'Unë jam i lodhur', explanationAlb: '"Ich bin müde" = Unë jam i lodhur. "müde" = i lodhur.', xpReward: 25, order: 4 },
  ]);

  // === DE INTERMEDIATE LESSON 2: Die Familie (Family) ===
  const deILesson2 = await Lesson.create({
    level: deIntermediate._id, language: german._id,
    titleAlb: 'Familja', title: 'Die Familie',
    description: 'Mëso emrat e anëtarëve të familjes në gjermanisht',
    order: 2, xpReward: 80, estimatedMinutes: 10, icon: '👨‍👩‍👧‍👦',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: deILesson2._id, language: german._id, albanianWord: 'Babai', targetWord: 'der Vater', pronunciation: 'deːr ˈfaːtər', exampleAlb: 'Babai im punon çdo ditë.', exampleTarget: 'Mein Vater arbeitet jeden Tag.', category: 'family', difficulty: 2 },
    { lesson: deILesson2._id, language: german._id, albanianWord: 'Nëna', targetWord: 'die Mutter', pronunciation: 'diː ˈmʊtər', exampleAlb: 'Nëna ime gatuan shumë mirë.', exampleTarget: 'Meine Mutter kocht sehr gut.', category: 'family', difficulty: 2 },
    { lesson: deILesson2._id, language: german._id, albanianWord: 'Vëllai', targetWord: 'der Bruder', pronunciation: 'deːr ˈbruːdər', exampleAlb: 'Vëllai im quhet Arben.', exampleTarget: 'Mein Bruder heißt Arben.', category: 'family', difficulty: 2 },
    { lesson: deILesson2._id, language: german._id, albanianWord: 'Motra', targetWord: 'die Schwester', pronunciation: 'diː ˈʃvɛstər', exampleAlb: 'Motra ime shkon në shkollë.', exampleTarget: 'Meine Schwester geht in die Schule.', category: 'family', difficulty: 2 },
    { lesson: deILesson2._id, language: german._id, albanianWord: 'Djali', targetWord: 'der Sohn', pronunciation: 'deːr zoːn', exampleAlb: 'Djali i tyre luan futboll.', exampleTarget: 'Ihr Sohn spielt Fußball.', category: 'family', difficulty: 2 },
    { lesson: deILesson2._id, language: german._id, albanianWord: 'Vajza', targetWord: 'die Tochter', pronunciation: 'diː ˈtɔxtər', exampleAlb: 'Vajza e tyre mëson violin.', exampleTarget: 'Ihre Tochter lernt Geige.', category: 'family', difficulty: 2 },
    { lesson: deILesson2._id, language: german._id, albanianWord: 'Gjyshi', targetWord: 'der Großvater', pronunciation: 'deːr ˈɡroːsfaːtər', exampleAlb: 'Gjyshi im jeton në fshat.', exampleTarget: 'Mein Großvater lebt auf dem Land.', category: 'family', difficulty: 3 },
    { lesson: deILesson2._id, language: german._id, albanianWord: 'Gjyshja', targetWord: 'die Großmutter', pronunciation: 'diː ˈɡroːsmʊtər', exampleAlb: 'Gjyshja ime tregon histori.', exampleTarget: 'Meine Großmutter erzählt Geschichten.', category: 'family', difficulty: 3 },
  ]);

  await Exercise.insertMany([
    { lesson: deILesson2._id, language: german._id, type: 'multiple_choice', question: 'Si thuhet "Nëna" në gjermanisht?', options: ['der Vater', 'die Mutter', 'die Schwester', 'die Tochter'], correctAnswer: 'die Mutter', explanationAlb: '"die Mutter" = Nëna. "die" është nyjë femërore në gjermanisht.', xpReward: 20, order: 1 },
    { lesson: deILesson2._id, language: german._id, type: 'translation', question: 'Përkthe: "Vëllai im quhet Arben."', correctAnswer: 'Mein Bruder heißt Arben', explanationAlb: '"Mein Bruder" = Vëllai im. "heißt" = quhet.', xpReward: 25, order: 2 },
    { lesson: deILesson2._id, language: german._id, type: 'fill_blank', question: 'Plotëso: "Meine ___ kocht sehr gut." (nëna)', correctAnswer: 'Mutter', explanationAlb: '"Mutter" = Nëna. "Meine" = Ime (femërore).', xpReward: 20, order: 3 },
    { lesson: deILesson2._id, language: german._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni kuptimin e saktë:', listeningWord: 'der Vater', listeningLang: 'de-DE', options: ['Babai', 'Gjyshi', 'Vëllai', 'Djali'], correctAnswer: 'Babai', explanationAlb: '"der Vater" = Babai. "der" është nyjë mashkullore.', xpReward: 25, order: 4 },
  ]);

  // === DE INTERMEDIATE LESSON 3: Essen und Einkaufen (Food & Shopping) ===
  const deILesson3 = await Lesson.create({
    level: deIntermediate._id, language: german._id,
    titleAlb: 'Ushqimi dhe Blerja', title: 'Essen und Einkaufen',
    description: 'Mëso fjalë për ushqim dhe blerje në gjermanisht',
    order: 3, xpReward: 85, estimatedMinutes: 10, icon: '🛒',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: deILesson3._id, language: german._id, albanianWord: 'Bukë', targetWord: 'das Brot', pronunciation: 'das broːt', exampleAlb: 'Blej bukë çdo mëngjes.', exampleTarget: 'Ich kaufe jeden Morgen Brot.', category: 'food', difficulty: 2 },
    { lesson: deILesson3._id, language: german._id, albanianWord: 'Ujë', targetWord: 'das Wasser', pronunciation: 'das ˈvasər', exampleAlb: 'Pi ujë çdo ditë.', exampleTarget: 'Ich trinke jeden Tag Wasser.', category: 'drinks', difficulty: 1 },
    { lesson: deILesson3._id, language: german._id, albanianWord: 'Qumësht', targetWord: 'die Milch', pronunciation: 'diː mɪlç', exampleAlb: 'Qumështi është i mirë për fëmijët.', exampleTarget: 'Die Milch ist gut für Kinder.', category: 'drinks', difficulty: 2 },
    { lesson: deILesson3._id, language: german._id, albanianWord: 'Kafe', targetWord: 'der Kaffee', pronunciation: 'deːr kaˈfeː', exampleAlb: 'Pi kafe çdo mëngjes.', exampleTarget: 'Ich trinke jeden Morgen Kaffee.', category: 'drinks', difficulty: 2 },
    { lesson: deILesson3._id, language: german._id, albanianWord: 'Fruta', targetWord: 'das Obst', pronunciation: 'das oːpst', exampleAlb: 'Ha fruta çdo ditë.', exampleTarget: 'Iss jeden Tag Obst.', category: 'food', difficulty: 2 },
    { lesson: deILesson3._id, language: german._id, albanianWord: 'Perime', targetWord: 'das Gemüse', pronunciation: 'das ɡəˈmyːzə', exampleAlb: 'Perimet janë të shëndetshme.', exampleTarget: 'Das Gemüse ist gesund.', category: 'food', difficulty: 2 },
    { lesson: deILesson3._id, language: german._id, albanianWord: 'Mish', targetWord: 'das Fleisch', pronunciation: 'das flaɪʃ', exampleAlb: 'Dua mish të pjekur.', exampleTarget: 'Ich möchte gegrilltes Fleisch.', category: 'food', difficulty: 2 },
    { lesson: deILesson3._id, language: german._id, albanianWord: 'Supermarketi', targetWord: 'der Supermarkt', pronunciation: 'deːr ˈzuːpərmarkt', exampleAlb: 'Shkoj në supermarket çdo javë.', exampleTarget: 'Ich gehe jede Woche in den Supermarkt.', category: 'shopping', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: deILesson3._id, language: german._id, type: 'multiple_choice', question: 'Si thuhet "Bukë" në gjermanisht?', options: ['die Milch', 'das Brot', 'das Fleisch', 'das Wasser'], correctAnswer: 'das Brot', explanationAlb: '"das Brot" = Bukë. "das" është nyjë asnjanëse.', xpReward: 20, order: 1 },
    { lesson: deILesson3._id, language: german._id, type: 'translation', question: 'Përkthe: "Ku është supermarketi?"', correctAnswer: 'Wo ist der Supermarkt?', explanationAlb: '"Wo ist" = Ku është. "der Supermarkt" = supermarketi.', xpReward: 25, order: 2 },
    { lesson: deILesson3._id, language: german._id, type: 'fill_blank', question: 'Plotëso: "Ich trinke jeden Morgen ___." (kafe)', correctAnswer: 'Kaffee', explanationAlb: '"Kaffee" = Kafe. Pija e mëngjesit.', xpReward: 20, order: 3 },
    { lesson: deILesson3._id, language: german._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni kuptimin e saktë:', listeningWord: 'das Brot', listeningLang: 'de-DE', options: ['Bukë', 'Qumësht', 'Ujë', 'Kafe'], correctAnswer: 'Bukë', explanationAlb: '"das Brot" = Bukë. Ushqimi bazë në Gjermani.', xpReward: 25, order: 4 },
  ]);

  // === GERMAN ADVANCED LEVEL ===
  const deAdvanced = await Level.create({
    language: german._id, name: 'advanced', nameAlb: 'Avancuar',
    description: 'Gramatikë e avancuar dhe shprehje komplekse gjermane', order: 3, xpRequired: 700, icon: '⚡', totalLessons: 2,
  });

  // === DE ADVANCED LESSON 1: Die Artikel (German Articles) ===
  const deALesson1 = await Lesson.create({
    level: deAdvanced._id, language: german._id,
    titleAlb: 'Nyjat Gjermane', title: 'Die Artikel',
    description: 'Mëso sistemin e nyjave gjermane der, die, das dhe rasat',
    order: 1, xpReward: 100, estimatedMinutes: 12, icon: '📚',
    vocabularyCount: 7, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: deALesson1._id, language: german._id, albanianWord: 'Njeriu (mashkull, emëror)', targetWord: 'der Mann', pronunciation: 'deːr man', exampleAlb: 'Der Mann arbeitet. (Njeriu punon.)', exampleTarget: 'Der Mann arbeitet in der Stadt.', category: 'grammar', difficulty: 3 },
    { lesson: deALesson1._id, language: german._id, albanianWord: 'Gruaja (femër, emëror)', targetWord: 'die Frau', pronunciation: 'diː fraʊ', exampleAlb: 'Die Frau liest. (Gruaja lexon.)', exampleTarget: 'Die Frau liest ein Buch.', category: 'grammar', difficulty: 3 },
    { lesson: deALesson1._id, language: german._id, albanianWord: 'Fëmija (asnjanës, emëror)', targetWord: 'das Kind', pronunciation: 'das kɪnt', exampleAlb: 'Das Kind spielt. (Fëmija luan.)', exampleTarget: 'Das Kind spielt im Park.', category: 'grammar', difficulty: 3 },
    { lesson: deALesson1._id, language: german._id, albanianWord: 'Njeriu (rasë kallëzore)', targetWord: 'den Mann', pronunciation: 'deːn man', exampleAlb: 'Shoh njeriun: Ich sehe den Mann.', exampleTarget: 'Ich sehe den Mann.', category: 'grammar', difficulty: 4 },
    { lesson: deALesson1._id, language: german._id, albanianWord: 'Gruaja (rasë dhanore)', targetWord: 'der Frau', pronunciation: 'deːr fraʊ', exampleAlb: 'I jap gruas: Ich gebe der Frau.', exampleTarget: 'Ich gebe der Frau das Buch.', category: 'grammar', difficulty: 4 },
    { lesson: deALesson1._id, language: german._id, albanianWord: 'Fëmija (rasë dhanore)', targetWord: 'dem Kind', pronunciation: 'deːm kɪnt', exampleAlb: 'I jap fëmijës: Ich gebe dem Kind.', exampleTarget: 'Ich gebe dem Kind ein Geschenk.', category: 'grammar', difficulty: 4 },
    { lesson: deALesson1._id, language: german._id, albanianWord: 'Njeriu (rasë gjinore)', targetWord: 'des Mannes', pronunciation: 'des ˈmanəs', exampleAlb: 'Makina e njeriut: das Auto des Mannes.', exampleTarget: 'Das Auto des Mannes ist neu.', category: 'grammar', difficulty: 5 },
  ]);

  await Exercise.insertMany([
    { lesson: deALesson1._id, language: german._id, type: 'multiple_choice', question: 'Cili artikull shkon me "Frau" (femëror, emëror)?', options: ['der', 'die', 'das', 'den'], correctAnswer: 'die', explanationAlb: '"die" është nyjë femërore (emëror). Femërorja gjermane merr "die" si nyje.', xpReward: 25, order: 1 },
    { lesson: deALesson1._id, language: german._id, type: 'fill_blank', question: 'Plotëso: "___ Kind spielt im Park." (asnjanës, emëror)', correctAnswer: 'Das', explanationAlb: '"Das" është nyjë asnjanëse. "Kind" (fëmijë) është asnjanëse në gjermanisht.', xpReward: 25, order: 2 },
    { lesson: deALesson1._id, language: german._id, type: 'multiple_choice', question: '"Ich sehe ___ Mann." — cili artikull? (kallëzore)', options: ['der', 'die', 'den', 'dem'], correctAnswer: 'den', explanationAlb: '"den" është forma kallëzore e "der". Kur njeriu është kundrinë (objekt), "der" → "den".', xpReward: 30, order: 3 },
  ]);

  // === DE ADVANCED LESSON 2: Zusammensetzungen (Compound Words) ===
  const deALesson2 = await Lesson.create({
    level: deAdvanced._id, language: german._id,
    titleAlb: 'Fjalët e Përbëra Gjermane', title: 'Zusammensetzungen',
    description: 'Zbulo si gjermanishtja krijon fjalë të reja duke kombinuar fjalë',
    order: 2, xpReward: 110, estimatedMinutes: 15, icon: '💡',
    vocabularyCount: 6, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: deALesson2._id, language: german._id, albanianWord: 'Doreza (dorë + këpucë)', targetWord: 'der Handschuh', pronunciation: 'deːr ˈhantʃuː', exampleAlb: '"Hand"(dorë) + "Schuh"(këpucë) = doreza', exampleTarget: 'Im Winter braucht man Handschuhe.', category: 'compound', difficulty: 4 },
    { lesson: deALesson2._id, language: german._id, albanianWord: 'Frigorifer (ftohur + dollap)', targetWord: 'der Kühlschrank', pronunciation: 'deːr ˈkyːlʃraŋk', exampleAlb: '"kühl"(ftohur) + "Schrank"(dollap) = frigorifer', exampleTarget: 'Das Essen ist im Kühlschrank.', category: 'compound', difficulty: 4 },
    { lesson: deALesson2._id, language: german._id, albanianWord: 'Spitali (i sëmurë + shtëpi)', targetWord: 'das Krankenhaus', pronunciation: 'das ˈkraŋkənhaʊs', exampleAlb: '"krank"(i sëmurë) + "Haus"(shtëpi) = spitali', exampleTarget: 'Der Arzt arbeitet im Krankenhaus.', category: 'compound', difficulty: 4 },
    { lesson: deALesson2._id, language: german._id, albanianWord: 'Stacioni kryesor i trenit', targetWord: 'der Hauptbahnhof', pronunciation: 'deːr ˈhaʊptbaːnhoːf', exampleAlb: '"Haupt"(kryesor) + "Bahnhof"(stacion) = stacioni qendror', exampleTarget: 'Der Zug fährt vom Hauptbahnhof ab.', category: 'compound', difficulty: 4 },
    { lesson: deALesson2._id, language: german._id, albanianWord: 'Ashensori (udhëtoj + karrige)', targetWord: 'der Fahrstuhl', pronunciation: 'deːr ˈfaːrʃtuːl', exampleAlb: '"fahren"(udhëtoj) + "Stuhl"(karrige) = ashensori', exampleTarget: 'Nehmen wir den Fahrstuhl?', category: 'compound', difficulty: 4 },
    { lesson: deALesson2._id, language: german._id, albanianWord: 'Çadra e diellit (diell + çadër)', targetWord: 'der Sonnenschirm', pronunciation: 'deːr ˈzɔnənʃɪrm', exampleAlb: '"Sonne"(diell) + "Schirm"(çadër) = çadra e diellit', exampleTarget: 'Am Strand brauche ich einen Sonnenschirm.', category: 'compound', difficulty: 5 },
  ]);

  await Exercise.insertMany([
    { lesson: deALesson2._id, language: german._id, type: 'multiple_choice', question: '"Krankenhaus" nga cilat fjalë formohet?', options: ['"klein"(i vogël) + "Haus"(shtëpi)', '"krank"(i sëmurë) + "Haus"(shtëpi)', '"klar"(i qartë) + "Haus"(shtëpi)', '"kurz"(i shkurtër) + "Haus"(shtëpi)'], correctAnswer: '"krank"(i sëmurë) + "Haus"(shtëpi)', explanationAlb: '"Krankenhaus" = Spitali. "krank" = i sëmurë, "Haus" = shtëpi.', xpReward: 30, order: 1 },
    { lesson: deALesson2._id, language: german._id, type: 'translation', question: 'Çfarë do të thotë "der Kühlschrank"?', correctAnswer: 'Frigorifer', explanationAlb: '"Kühlschrank" = Frigorifer. "kühl"(ftohur) + "Schrank"(dollap) = dollapi ftohues.', xpReward: 30, order: 2 },
    { lesson: deALesson2._id, language: german._id, type: 'multiple_choice', question: '"Handschuh" çfarë do të thotë?', options: ['Këpucë', 'Çorape', 'Doreza', 'Kapelë'], correctAnswer: 'Doreza', explanationAlb: '"Handschuh" = Doreza. "Hand"(dorë) + "Schuh"(këpucë) — këpucë për dorë.', xpReward: 30, order: 3 },
  ]);

  console.log('🇩🇪 German language and lessons created');

  // ═══════════════════════════════════════════════
  // FRENCH LANGUAGE
  // ═══════════════════════════════════════════════
  const french = await Language.create({
    code: 'fr', name: 'French', nameAlb: 'Frëngjisht',
    flag: '🇫🇷', isAvailable: true, comingSoon: false,
    color: '#002395', description: 'Gjuha e artit, kulturës dhe diplomacisë',
    order: 3,
  });

  const frBeginner = await Level.create({
    language: french._id, name: 'beginner', nameAlb: 'Fillestar',
    description: 'Fjalë dhe fraza bazë në frëngjisht', order: 1, xpRequired: 0, icon: '🌱', totalLessons: 3,
  });

  // === FR BEGINNER LESSON 1: Salutations (Greetings) ===
  const frLesson1 = await Lesson.create({
    level: frBeginner._id, language: french._id,
    titleAlb: 'Përshëndetjet', title: 'Salutations',
    description: 'Mëso si të përshëndesësh në frëngjisht',
    order: 1, xpReward: 50, estimatedMinutes: 5, icon: '👋',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: frLesson1._id, language: french._id, albanianWord: 'Përshëndetje/Mirëdita', targetWord: 'Bonjour', pronunciation: 'bɔ̃ʒuːr', exampleAlb: 'Përshëndetje, si jeni?', exampleTarget: 'Bonjour, comment allez-vous?', category: 'greeting', difficulty: 1 },
    { lesson: frLesson1._id, language: french._id, albanianWord: 'Mirëmbrëma', targetWord: 'Bonsoir', pronunciation: 'bɔ̃swaːr', exampleAlb: 'Mirëmbrëma, keni kaluar mirë?', exampleTarget: 'Bonsoir, vous avez passé une bonne journée?', category: 'greeting', difficulty: 1 },
    { lesson: frLesson1._id, language: french._id, albanianWord: 'Natën e mirë', targetWord: 'Bonne nuit', pronunciation: 'bɔn nɥi', exampleAlb: 'Natën e mirë, ëndërroni mirë!', exampleTarget: 'Bonne nuit, faites de beaux rêves!', category: 'greeting', difficulty: 1 },
    { lesson: frLesson1._id, language: french._id, albanianWord: 'Mirupafshim', targetWord: 'Au revoir', pronunciation: 'o ʁəvwaːr', exampleAlb: 'Mirupafshim, shpresoj të takohemi sërisht!', exampleTarget: 'Au revoir, à bientôt!', category: 'greeting', difficulty: 1 },
    { lesson: frLesson1._id, language: french._id, albanianWord: 'Faleminderit', targetWord: 'Merci', pronunciation: 'mɛʁsi', exampleAlb: 'Faleminderit shumë!', exampleTarget: 'Merci beaucoup!', category: 'politeness', difficulty: 1 },
    { lesson: frLesson1._id, language: french._id, albanianWord: 'Ju lutem', targetWord: 'S\'il vous plaît', pronunciation: 'sil vu plɛ', exampleAlb: 'Ju lutem, ndihmo!', exampleTarget: 'S\'il vous plaît, aidez-moi!', category: 'politeness', difficulty: 1 },
    { lesson: frLesson1._id, language: french._id, albanianWord: 'Më falni', targetWord: 'Excusez-moi', pronunciation: 'ɛkskyze mwa', exampleAlb: 'Më falni, nuk e dija.', exampleTarget: 'Excusez-moi, je ne savais pas.', category: 'politeness', difficulty: 1 },
    { lesson: frLesson1._id, language: french._id, albanianWord: 'Si jeni?', targetWord: 'Comment allez-vous?', pronunciation: 'kɔmɑ̃ ale vu', exampleAlb: 'Si jeni sot?', exampleTarget: 'Comment allez-vous aujourd\'hui?', category: 'greeting', difficulty: 1 },
  ]);

  await Exercise.insertMany([
    { lesson: frLesson1._id, language: french._id, type: 'multiple_choice', question: 'Si thuhet "Mirëmëngjes/Mirëdita" në frëngjisht?', options: ['Bonsoir', 'Bonjour', 'Bonne nuit', 'Au revoir'], correctAnswer: 'Bonjour', explanationAlb: '"Bonjour" = Mirëmëngjes/Mirëdita. Përdoret gjatë gjithë ditës deri në mbrëmje.', xpReward: 15, order: 1 },
    { lesson: frLesson1._id, language: french._id, type: 'translation', question: 'Përkthe: "Faleminderit shumë!"', correctAnswer: 'Merci beaucoup', explanationAlb: '"Merci beaucoup" = Faleminderit shumë. "Merci" e thjeshtë do të thotë faleminderit.', xpReward: 20, order: 2 },
    { lesson: frLesson1._id, language: french._id, type: 'fill_blank', question: 'Plotëso: "___ revoir, à bientôt!" (mirupafshim)', correctAnswer: 'Au', explanationAlb: '"Au revoir" = Mirupafshim. "Au" është bashkim i "à" dhe "le".', xpReward: 15, order: 3 },
    { lesson: frLesson1._id, language: french._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni përkthimin e saktë:', listeningWord: 'Merci', listeningLang: 'fr-FR', options: ['Faleminderit', 'Ju lutem', 'Mirupafshim', 'Mirëmëngjes'], correctAnswer: 'Faleminderit', explanationAlb: '"Merci" = Faleminderit. Fjala bazë e mirënjohjes në frëngjisht.', xpReward: 25, order: 4 },
  ]);

  // === FR BEGINNER LESSON 2: Les Nombres 1-10 (Numbers) ===
  const frLesson2 = await Lesson.create({
    level: frBeginner._id, language: french._id,
    titleAlb: 'Numrat 1-10', title: 'Les Nombres 1-10',
    description: 'Mëso numrat bazë në frëngjisht',
    order: 2, xpReward: 55, estimatedMinutes: 6, icon: '🔢',
    vocabularyCount: 10, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Një', targetWord: 'Un', pronunciation: 'œ̃', exampleAlb: 'Kam një motër.', exampleTarget: 'J\'ai une sœur.', category: 'numbers', difficulty: 1 },
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Dy', targetWord: 'Deux', pronunciation: 'dø', exampleAlb: 'Dy plus dy është katër.', exampleTarget: 'Deux plus deux font quatre.', category: 'numbers', difficulty: 1 },
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Tre', targetWord: 'Trois', pronunciation: 'tʁwa', exampleAlb: 'Tre fëmijë po luajnë.', exampleTarget: 'Trois enfants jouent.', category: 'numbers', difficulty: 1 },
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Katër', targetWord: 'Quatre', pronunciation: 'katʁ', exampleAlb: 'Katër stinë ka viti.', exampleTarget: 'Il y a quatre saisons.', category: 'numbers', difficulty: 1 },
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Pesë', targetWord: 'Cinq', pronunciation: 'sɛ̃k', exampleAlb: 'Pesë gishta ka dora.', exampleTarget: 'Une main a cinq doigts.', category: 'numbers', difficulty: 1 },
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Gjashtë', targetWord: 'Six', pronunciation: 'sis', exampleAlb: 'Gjashtë orë gjumë nuk mjaftojnë.', exampleTarget: 'Six heures de sommeil ne suffisent pas.', category: 'numbers', difficulty: 1 },
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Shtatë', targetWord: 'Sept', pronunciation: 'sɛt', exampleAlb: 'Shtatë ditë ka java.', exampleTarget: 'Il y a sept jours dans une semaine.', category: 'numbers', difficulty: 1 },
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Tetë', targetWord: 'Huit', pronunciation: 'ɥit', exampleAlb: 'Tetë orë duhet të flemë.', exampleTarget: 'Il faut dormir huit heures.', category: 'numbers', difficulty: 1 },
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Nëntë', targetWord: 'Neuf', pronunciation: 'nœf', exampleAlb: 'Nëntë muaj zgjat shtatzënia.', exampleTarget: 'La grossesse dure neuf mois.', category: 'numbers', difficulty: 1 },
    { lesson: frLesson2._id, language: french._id, albanianWord: 'Dhjetë', targetWord: 'Dix', pronunciation: 'dis', exampleAlb: 'Dhjetë euro kushtoi bileta.', exampleTarget: 'Le billet coûte dix euros.', category: 'numbers', difficulty: 1 },
  ]);

  await Exercise.insertMany([
    { lesson: frLesson2._id, language: french._id, type: 'multiple_choice', question: 'Si thuhet "Pesë" në frëngjisht?', options: ['Quatre', 'Cinq', 'Six', 'Sept'], correctAnswer: 'Cinq', explanationAlb: '"Cinq" = Pesë. Numri 5 në frëngjisht.', xpReward: 15, order: 1 },
    { lesson: frLesson2._id, language: french._id, type: 'translation', question: 'Përkthe: "Shtatë ditë ka java."', correctAnswer: 'Il y a sept jours dans une semaine', explanationAlb: '"Sept" = shtatë. "Semaine" = javë. "Jours" = ditë.', xpReward: 20, order: 2 },
    { lesson: frLesson2._id, language: french._id, type: 'fill_blank', question: 'Plotëso: "___ plus deux font quatre." (dy)', correctAnswer: 'Deux', explanationAlb: '"Deux" = Dy. 2 + 2 = 4.', xpReward: 15, order: 3 },
    { lesson: frLesson2._id, language: french._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni numrin e saktë:', listeningWord: 'Huit', listeningLang: 'fr-FR', options: ['Gjashtë', 'Shtatë', 'Tetë', 'Nëntë'], correctAnswer: 'Tetë', explanationAlb: '"Huit" = Tetë. Numri 8 në frëngjisht.', xpReward: 25, order: 4 },
  ]);

  // === FR BEGINNER LESSON 3: Les Couleurs (Colors) ===
  const frLesson3 = await Lesson.create({
    level: frBeginner._id, language: french._id,
    titleAlb: 'Ngjyrat', title: 'Les Couleurs',
    description: 'Mëso ngjyrat kryesore në frëngjisht',
    order: 3, xpReward: 55, estimatedMinutes: 6, icon: '🎨',
    vocabularyCount: 8, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: frLesson3._id, language: french._id, albanianWord: 'E kuqe', targetWord: 'Rouge', pronunciation: 'ʁuʒ', exampleAlb: 'Trëndafili është i kuq.', exampleTarget: 'La rose est rouge.', category: 'colors', difficulty: 1 },
    { lesson: frLesson3._id, language: french._id, albanianWord: 'E kaltër', targetWord: 'Bleu', pronunciation: 'blø', exampleAlb: 'Qielli është i kaltër.', exampleTarget: 'Le ciel est bleu.', category: 'colors', difficulty: 1 },
    { lesson: frLesson3._id, language: french._id, albanianWord: 'E gjelbër', targetWord: 'Vert', pronunciation: 'vɛʁ', exampleAlb: 'Bari është i gjelbër.', exampleTarget: 'L\'herbe est verte.', category: 'colors', difficulty: 1 },
    { lesson: frLesson3._id, language: french._id, albanianWord: 'E verdhë', targetWord: 'Jaune', pronunciation: 'ʒon', exampleAlb: 'Dielli është i verdhë.', exampleTarget: 'Le soleil est jaune.', category: 'colors', difficulty: 1 },
    { lesson: frLesson3._id, language: french._id, albanianWord: 'E zezë', targetWord: 'Noir', pronunciation: 'nwaʁ', exampleAlb: 'Nata është e zezë.', exampleTarget: 'La nuit est noire.', category: 'colors', difficulty: 1 },
    { lesson: frLesson3._id, language: french._id, albanianWord: 'E bardhë', targetWord: 'Blanc', pronunciation: 'blɑ̃', exampleAlb: 'Bora është e bardhë.', exampleTarget: 'La neige est blanche.', category: 'colors', difficulty: 1 },
    { lesson: frLesson3._id, language: french._id, albanianWord: 'Portokalli', targetWord: 'Orange', pronunciation: 'ɔʁɑ̃ʒ', exampleAlb: 'Portokalli ka ngjyrën portokalli.', exampleTarget: 'L\'orange est orange.', category: 'colors', difficulty: 1 },
    { lesson: frLesson3._id, language: french._id, albanianWord: 'Vjollcë', targetWord: 'Violet', pronunciation: 'vjɔlɛ', exampleAlb: 'Luleshtrydhet janë vjollcë.', exampleTarget: 'Les lavandes sont violettes.', category: 'colors', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: frLesson3._id, language: french._id, type: 'multiple_choice', question: 'Cila ngjyrë ka qielli?', options: ['Rouge', 'Bleu', 'Vert', 'Jaune'], correctAnswer: 'Bleu', explanationAlb: '"Bleu" = E kaltër. Qielli i kthjellët është i kaltër.', xpReward: 15, order: 1 },
    { lesson: frLesson3._id, language: french._id, type: 'translation', question: 'Përkthe: "Qielli është i kaltër."', correctAnswer: 'Le ciel est bleu', explanationAlb: '"Bleu" = E kaltër. "Le ciel" = Qielli.', xpReward: 20, order: 2 },
    { lesson: frLesson3._id, language: french._id, type: 'fill_blank', question: 'Plotëso: "La rose est ___." (e kuqe)', correctAnswer: 'rouge', explanationAlb: '"Rouge" = E kuqe. Ngjyra e trëndafilit dhe gjakut.', xpReward: 15, order: 3 },
  ]);

  // === FRENCH INTERMEDIATE LEVEL ===
  const frIntermediate = await Level.create({
    language: french._id, name: 'intermediate', nameAlb: 'Mesatar',
    description: 'Gramatikë dhe konversacion i mesëm në frëngjisht', order: 2, xpRequired: 300, icon: '🔥', totalLessons: 3,
  });

  // === FR INTERMEDIATE LESSON 1: Être et Avoir (To Be & To Have) ===
  const frILesson1 = await Lesson.create({
    level: frIntermediate._id, language: french._id,
    titleAlb: 'Jam dhe Kam', title: 'Être et Avoir',
    description: 'Mëso foljet themelore "jam" dhe "kam" në frëngjisht',
    order: 1, xpReward: 80, estimatedMinutes: 10, icon: '⏰',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: frILesson1._id, language: french._id, albanianWord: 'Unë jam', targetWord: 'Je suis', pronunciation: 'ʒə sɥi', exampleAlb: 'Unë jam nga Shqipëria.', exampleTarget: 'Je suis d\'Albanie.', category: 'verbs', difficulty: 2 },
    { lesson: frILesson1._id, language: french._id, albanianWord: 'Ti je', targetWord: 'Tu es', pronunciation: 'ty ɛ', exampleAlb: 'Ti je shumë i mirë.', exampleTarget: 'Tu es très gentil.', category: 'verbs', difficulty: 2 },
    { lesson: frILesson1._id, language: french._id, albanianWord: 'Ai/Ajo është', targetWord: 'Il/Elle est', pronunciation: 'il/ɛl ɛ', exampleAlb: 'Ai është mësuesi im.', exampleTarget: 'Il est mon professeur.', category: 'verbs', difficulty: 2 },
    { lesson: frILesson1._id, language: french._id, albanianWord: 'Ne jemi', targetWord: 'Nous sommes', pronunciation: 'nu sɔm', exampleAlb: 'Ne jemi shqiptarë.', exampleTarget: 'Nous sommes albanais.', category: 'verbs', difficulty: 2 },
    { lesson: frILesson1._id, language: french._id, albanianWord: 'Unë kam', targetWord: 'J\'ai', pronunciation: 'ʒɛ', exampleAlb: 'Unë kam një qen.', exampleTarget: 'J\'ai un chien.', category: 'verbs', difficulty: 2 },
    { lesson: frILesson1._id, language: french._id, albanianWord: 'Ti ke', targetWord: 'Tu as', pronunciation: 'ty a', exampleAlb: 'Ti ke shumë libra.', exampleTarget: 'Tu as beaucoup de livres.', category: 'verbs', difficulty: 2 },
    { lesson: frILesson1._id, language: french._id, albanianWord: 'Ai/Ajo ka', targetWord: 'Il/Elle a', pronunciation: 'il/ɛl a', exampleAlb: 'Ajo ka një makinë të re.', exampleTarget: 'Elle a une nouvelle voiture.', category: 'verbs', difficulty: 2 },
    { lesson: frILesson1._id, language: french._id, albanianWord: 'Ne kemi', targetWord: 'Nous avons', pronunciation: 'nu zavɔ̃', exampleAlb: 'Ne kemi dy fëmijë.', exampleTarget: 'Nous avons deux enfants.', category: 'verbs', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: frILesson1._id, language: french._id, type: 'multiple_choice', question: 'Cila është forma e saktë për "Ti je" në frëngjisht?', options: ['Tu est', 'Tu es', 'Tu êtes', 'Tu suis'], correctAnswer: 'Tu es', explanationAlb: '"Tu es" = Ti je. Folja "être" (jam) ndryshon sipas vetës: je suis, tu es, il/elle est.', xpReward: 20, order: 1 },
    { lesson: frILesson1._id, language: french._id, type: 'translation', question: 'Përkthe: "Unë jam nga Shqipëria."', correctAnswer: 'Je suis d\'Albanie', explanationAlb: '"Je suis" = Unë jam. "d\'Albanie" = nga Shqipëria. Apostrofi "d\'" është formë e shkurtuar e "de".', xpReward: 25, order: 2 },
    { lesson: frILesson1._id, language: french._id, type: 'fill_blank', question: 'Plotëso: "Nous ___ à Paris." (jemi)', correctAnswer: 'sommes', explanationAlb: '"Sommes" = jemi. Folja "être" për "nous" (ne).', xpReward: 20, order: 3 },
    { lesson: frILesson1._id, language: french._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni kuptimin e saktë:', listeningWord: 'Je suis fatigué', listeningLang: 'fr-FR', options: ['Unë jam i lodhur', 'Ti je i lodhur', 'Ai është i lodhur', 'Ne jemi të lodhur'], correctAnswer: 'Unë jam i lodhur', explanationAlb: '"Je suis fatigué" = Unë jam i lodhur. "fatigué" = i lodhur.', xpReward: 25, order: 4 },
  ]);

  // === FR INTERMEDIATE LESSON 2: La Famille (Family) ===
  const frILesson2 = await Lesson.create({
    level: frIntermediate._id, language: french._id,
    titleAlb: 'Familja', title: 'La Famille',
    description: 'Mëso emrat e anëtarëve të familjes në frëngjisht',
    order: 2, xpReward: 80, estimatedMinutes: 10, icon: '👨‍👩‍👧‍👦',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: frILesson2._id, language: french._id, albanianWord: 'Babai', targetWord: 'le père', pronunciation: 'lə pɛːʁ', exampleAlb: 'Babai im punon çdo ditë.', exampleTarget: 'Mon père travaille tous les jours.', category: 'family', difficulty: 2 },
    { lesson: frILesson2._id, language: french._id, albanianWord: 'Nëna', targetWord: 'la mère', pronunciation: 'la mɛːʁ', exampleAlb: 'Nëna ime gatuan shumë mirë.', exampleTarget: 'Ma mère cuisine très bien.', category: 'family', difficulty: 2 },
    { lesson: frILesson2._id, language: french._id, albanianWord: 'Vëllai', targetWord: 'le frère', pronunciation: 'lə fʁɛːʁ', exampleAlb: 'Vëllai im quhet Marc.', exampleTarget: 'Mon frère s\'appelle Marc.', category: 'family', difficulty: 2 },
    { lesson: frILesson2._id, language: french._id, albanianWord: 'Motra', targetWord: 'la sœur', pronunciation: 'la sœːʁ', exampleAlb: 'Motra ime shkon në shkollë.', exampleTarget: 'Ma sœur va à l\'école.', category: 'family', difficulty: 2 },
    { lesson: frILesson2._id, language: french._id, albanianWord: 'Djali', targetWord: 'le fils', pronunciation: 'lə fis', exampleAlb: 'Djali i tyre luan futboll.', exampleTarget: 'Leur fils joue au football.', category: 'family', difficulty: 2 },
    { lesson: frILesson2._id, language: french._id, albanianWord: 'Vajza', targetWord: 'la fille', pronunciation: 'la fij', exampleAlb: 'Vajza e tyre mëson violin.', exampleTarget: 'Leur fille apprend le violon.', category: 'family', difficulty: 2 },
    { lesson: frILesson2._id, language: french._id, albanianWord: 'Gjyshi', targetWord: 'le grand-père', pronunciation: 'lə ɡʁɑ̃ pɛːʁ', exampleAlb: 'Gjyshi im tregon histori.', exampleTarget: 'Mon grand-père raconte des histoires.', category: 'family', difficulty: 3 },
    { lesson: frILesson2._id, language: french._id, albanianWord: 'Gjyshja', targetWord: 'la grand-mère', pronunciation: 'la ɡʁɑ̃ mɛːʁ', exampleAlb: 'Gjyshja ime gatuan byrek.', exampleTarget: 'Ma grand-mère fait de la pâtisserie.', category: 'family', difficulty: 3 },
  ]);

  await Exercise.insertMany([
    { lesson: frILesson2._id, language: french._id, type: 'multiple_choice', question: 'Si thuhet "Nëna" në frëngjisht?', options: ['le père', 'la mère', 'la sœur', 'la fille'], correctAnswer: 'la mère', explanationAlb: '"la mère" = Nëna. "la" është nyjë femërore në frëngjisht.', xpReward: 20, order: 1 },
    { lesson: frILesson2._id, language: french._id, type: 'translation', question: 'Përkthe: "Vëllai im quhet Marc."', correctAnswer: 'Mon frère s\'appelle Marc', explanationAlb: '"Mon frère" = Vëllai im. "s\'appelle" = quhet (folja "s\'appeler").', xpReward: 25, order: 2 },
    { lesson: frILesson2._id, language: french._id, type: 'fill_blank', question: 'Plotëso: "Ma ___ cuisine très bien." (nëna)', correctAnswer: 'mère', explanationAlb: '"Mère" = Nëna. "Ma" = Ime (femërore).', xpReward: 20, order: 3 },
    { lesson: frILesson2._id, language: french._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni kuptimin e saktë:', listeningWord: 'le père', listeningLang: 'fr-FR', options: ['Babai', 'Gjyshi', 'Vëllai', 'Djali'], correctAnswer: 'Babai', explanationAlb: '"le père" = Babai. "le" është nyjë mashkullore në frëngjisht.', xpReward: 25, order: 4 },
  ]);

  // === FR INTERMEDIATE LESSON 3: La Nourriture et les Boissons (Food & Drinks) ===
  const frILesson3 = await Lesson.create({
    level: frIntermediate._id, language: french._id,
    titleAlb: 'Ushqimi dhe Pijet', title: 'La Nourriture et les Boissons',
    description: 'Mëso fjalë për ushqim dhe pije në frëngjisht',
    order: 3, xpReward: 85, estimatedMinutes: 10, icon: '🥐',
    vocabularyCount: 8, exerciseCount: 4, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: frILesson3._id, language: french._id, albanianWord: 'Bukë', targetWord: 'le pain', pronunciation: 'lə pɛ̃', exampleAlb: 'Blej bukë çdo mëngjes.', exampleTarget: 'J\'achète du pain chaque matin.', category: 'food', difficulty: 2 },
    { lesson: frILesson3._id, language: french._id, albanianWord: 'Ujë', targetWord: 'l\'eau', pronunciation: 'lo', exampleAlb: 'Pi ujë çdo ditë.', exampleTarget: 'Je bois de l\'eau chaque jour.', category: 'drinks', difficulty: 1 },
    { lesson: frILesson3._id, language: french._id, albanianWord: 'Kafe', targetWord: 'le café', pronunciation: 'lə kafe', exampleAlb: 'Pi kafe çdo mëngjes.', exampleTarget: 'Je bois du café chaque matin.', category: 'drinks', difficulty: 2 },
    { lesson: frILesson3._id, language: french._id, albanianWord: 'Qumësht', targetWord: 'le lait', pronunciation: 'lə lɛ', exampleAlb: 'Qumështi është i mirë për shëndetin.', exampleTarget: 'Le lait est bon pour la santé.', category: 'drinks', difficulty: 1 },
    { lesson: frILesson3._id, language: french._id, albanianWord: 'Mollë', targetWord: 'la pomme', pronunciation: 'la pɔm', exampleAlb: 'Hëngra një mollë pas drekës.', exampleTarget: 'J\'ai mangé une pomme après le déjeuner.', category: 'food', difficulty: 1 },
    { lesson: frILesson3._id, language: french._id, albanianWord: 'Mish pule', targetWord: 'le poulet', pronunciation: 'lə pulɛ', exampleAlb: 'Dua mish pule të pjekur.', exampleTarget: 'Je veux du poulet grillé.', category: 'food', difficulty: 2 },
    { lesson: frILesson3._id, language: french._id, albanianWord: 'Oriz', targetWord: 'le riz', pronunciation: 'lə ʁi', exampleAlb: 'Orizi është ushqim bazë.', exampleTarget: 'Le riz est un aliment de base.', category: 'food', difficulty: 2 },
    { lesson: frILesson3._id, language: french._id, albanianWord: 'Djathë', targetWord: 'le fromage', pronunciation: 'lə fʁɔmaʒ', exampleAlb: 'Franca është e famshme për djathët.', exampleTarget: 'La France est célèbre pour ses fromages.', category: 'food', difficulty: 2 },
  ]);

  await Exercise.insertMany([
    { lesson: frILesson3._id, language: french._id, type: 'multiple_choice', question: 'Si thuhet "Bukë" në frëngjisht?', options: ['le lait', 'le pain', 'le café', 'le riz'], correctAnswer: 'le pain', explanationAlb: '"le pain" = Bukë. Ushqimi bazë i frëngjishtfolësve.', xpReward: 20, order: 1 },
    { lesson: frILesson3._id, language: french._id, type: 'translation', question: 'Përkthe: "Ku është kafeja?"', correctAnswer: 'Où est le café?', explanationAlb: '"Où est" = Ku është. "le café" = kafeja.', xpReward: 25, order: 2 },
    { lesson: frILesson3._id, language: french._id, type: 'fill_blank', question: 'Plotëso: "Je bois du ___ chaque matin." (kafe)', correctAnswer: 'café', explanationAlb: '"Café" = Kafe. Pija tipike e mëngjesit frëngjez.', xpReward: 20, order: 3 },
    { lesson: frILesson3._id, language: french._id, type: 'listening_challenge', question: 'Dëgjoni dhe zgjidhni kuptimin e saktë:', listeningWord: 'le pain', listeningLang: 'fr-FR', options: ['Bukë', 'Qumësht', 'Ujë', 'Djathë'], correctAnswer: 'Bukë', explanationAlb: '"le pain" = Bukë. Elementi bazë i kuzhinës frëngjeze.', xpReward: 25, order: 4 },
  ]);

  // === FRENCH ADVANCED LEVEL ===
  const frAdvanced = await Level.create({
    language: french._id, name: 'advanced', nameAlb: 'Avancuar',
    description: 'Shprehje idiomatike dhe fjalor profesional frëngjez', order: 3, xpRequired: 700, icon: '⚡', totalLessons: 2,
  });

  // === FR ADVANCED LESSON 1: Expressions Idiomatiques (Idioms) ===
  const frALesson1 = await Lesson.create({
    level: frAdvanced._id, language: french._id,
    titleAlb: 'Shprehje Idiomatike', title: 'Expressions Idiomatiques',
    description: 'Shprehje të veçanta dhe idioma të frëngjishtes',
    order: 1, xpReward: 100, estimatedMinutes: 12, icon: '💬',
    vocabularyCount: 6, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: frALesson1._id, language: french._id, albanianWord: 'Jam i mërzitur/deprimuar', targetWord: 'Avoir le cafard', pronunciation: 'avwaʁ lə kafaʁ', exampleAlb: 'Sot jam shumë i mërzitur.', exampleTarget: 'Aujourd\'hui j\'ai vraiment le cafard.', category: 'idioms', difficulty: 3 },
    { lesson: frALesson1._id, language: french._id, albanianWord: 'Bie shi me dushë', targetWord: 'Il pleut des cordes', pronunciation: 'il plø de kɔʁd', exampleAlb: 'Mos dil jashtë, po bie shi me dushë.', exampleTarget: 'Ne sors pas, il pleut des cordes.', category: 'idioms', difficulty: 3 },
    { lesson: frALesson1._id, language: french._id, albanianWord: 'I bie të ligët', targetWord: 'Tomber dans les pommes', pronunciation: 'tɔ̃be dɑ̃ le pɔm', exampleAlb: 'Iu ligështua nga nxehtësia.', exampleTarget: 'Elle est tombée dans les pommes à cause de la chaleur.', category: 'idioms', difficulty: 4 },
    { lesson: frALesson1._id, language: french._id, albanianWord: 'Nuk më intereson', targetWord: 'Je m\'en fiche', pronunciation: 'ʒə mɑ̃ fiʃ', exampleAlb: 'Nuk më intereson çfarë mendojnë.', exampleTarget: 'Je m\'en fiche de ce qu\'ils pensent.', category: 'idioms', difficulty: 3 },
    { lesson: frALesson1._id, language: french._id, albanianWord: 'Kalo mirë', targetWord: 'Passer un bon moment', pronunciation: 'pase œ̃ bɔ̃ mɔmɑ̃', exampleAlb: 'Shpresoj të kalosh mirë.', exampleTarget: 'J\'espère que tu vas passer un bon moment.', category: 'idioms', difficulty: 3 },
    { lesson: frALesson1._id, language: french._id, albanianWord: 'Njëherë e mirë', targetWord: 'Il faut ce qu\'il faut', pronunciation: 'il fo sə kil fo', exampleAlb: 'Duhet bërë çfarë duhet bërë.', exampleTarget: 'Il faut ce qu\'il faut — on va commander du champagne!', category: 'idioms', difficulty: 4 },
  ]);

  await Exercise.insertMany([
    { lesson: frALesson1._id, language: french._id, type: 'multiple_choice', question: '"Avoir le cafard" çfarë do të thotë?', options: ['Jam i gëzuar', 'Jam i mërzitur', 'Jam i lodhur', 'Jam i sëmurë'], correctAnswer: 'Jam i mërzitur', explanationAlb: '"Avoir le cafard" = Jam i mërzitur/deprimuar. Fjalë për fjalë "kurokulë" — idiomë karakteristike frëngjeze.', xpReward: 25, order: 1 },
    { lesson: frALesson1._id, language: french._id, type: 'multiple_choice', question: '"Il pleut des cordes" çfarë do të thotë?', options: ['Po bie dëborë', 'Po bie shi me dushë', 'Është mot i mirë', 'Është erë e fortë'], correctAnswer: 'Po bie shi me dushë', explanationAlb: '"Il pleut des cordes" = Po bie shi me dushë (fjalë për fjalë "po bie litar").', xpReward: 25, order: 2 },
    { lesson: frALesson1._id, language: french._id, type: 'translation', question: 'Si thuhet "Nuk më intereson" në frëngjisht?', correctAnswer: 'Je m\'en fiche', explanationAlb: '"Je m\'en fiche" = Nuk më intereson. Shprehje joformale për indiferencë.', xpReward: 30, order: 3 },
  ]);

  // === FR ADVANCED LESSON 2: Vocabulaire Professionnel (Business French) ===
  const frALesson2 = await Lesson.create({
    level: frAdvanced._id, language: french._id,
    titleAlb: 'Frëngjishte Biznesi', title: 'Vocabulaire Professionnel',
    description: 'Fjalor profesional për mjedisin e punës në frëngjisht',
    order: 2, xpReward: 110, estimatedMinutes: 15, icon: '💼',
    vocabularyCount: 8, exerciseCount: 3, isPublished: true,
  });

  await Vocabulary.insertMany([
    { lesson: frALesson2._id, language: french._id, albanianWord: 'Takim', targetWord: 'la réunion', pronunciation: 'la ʁeynjɔ̃', exampleAlb: 'Kemi takim nesër në mëngjes.', exampleTarget: 'Nous avons une réunion demain matin.', category: 'business', difficulty: 3 },
    { lesson: frALesson2._id, language: french._id, albanianWord: 'Afat', targetWord: 'la date limite', pronunciation: 'la dat limit', exampleAlb: 'Afati është të premten.', exampleTarget: 'La date limite est vendredi.', category: 'business', difficulty: 3 },
    { lesson: frALesson2._id, language: french._id, albanianWord: 'Prezantim', targetWord: 'la présentation', pronunciation: 'la pʁezɑ̃tasjɔ̃', exampleAlb: 'Kam prezantim para klientëve.', exampleTarget: 'J\'ai une présentation pour les clients.', category: 'business', difficulty: 3 },
    { lesson: frALesson2._id, language: french._id, albanianWord: 'Negocioj', targetWord: 'négocier', pronunciation: 'neɡɔsje', exampleAlb: 'Duhet të negociojmë çmimin.', exampleTarget: 'Nous devons négocier le prix.', category: 'business', difficulty: 4 },
    { lesson: frALesson2._id, language: french._id, albanianWord: 'Buxhet', targetWord: 'le budget', pronunciation: 'lə bydʒɛ', exampleAlb: 'Buxheti i projektit është i kufizuar.', exampleTarget: 'Le budget du projet est limité.', category: 'business', difficulty: 3 },
    { lesson: frALesson2._id, language: french._id, albanianWord: 'Rend dite', targetWord: 'l\'ordre du jour', pronunciation: 'lɔʁdʁ dy ʒuʁ', exampleAlb: 'Cila është rend dita e takimit?', exampleTarget: 'Quel est l\'ordre du jour de la réunion?', category: 'business', difficulty: 3 },
    { lesson: frALesson2._id, language: french._id, albanianWord: 'Reagim', targetWord: 'le retour', pronunciation: 'lə ʁətuʁ', exampleAlb: 'Klientët dhanë reagime pozitive.', exampleTarget: 'Les clients ont donné des retours positifs.', category: 'business', difficulty: 3 },
    { lesson: frALesson2._id, language: french._id, albanianWord: 'Bashkëpunim', targetWord: 'la collaboration', pronunciation: 'la kɔlaboʁasjɔ̃', exampleAlb: 'Bashkëpunimi është çelësi i suksesit.', exampleTarget: 'La collaboration est la clé du succès.', category: 'business', difficulty: 4 },
  ]);

  await Exercise.insertMany([
    { lesson: frALesson2._id, language: french._id, type: 'multiple_choice', question: '"La réunion" çfarë do të thotë?', options: ['Afat', 'Takim', 'Prezantim', 'Buxhet'], correctAnswer: 'Takim', explanationAlb: '"La réunion" = Takim. Kur njerëzit mblidhen bashkë për të diskutuar.', xpReward: 25, order: 1 },
    { lesson: frALesson2._id, language: french._id, type: 'translation', question: 'Përkthe: "Kemi takim nesër."', correctAnswer: 'Nous avons une réunion demain', explanationAlb: '"Nous avons" = Kemi. "une réunion" = takim. "demain" = nesër.', xpReward: 30, order: 2 },
    { lesson: frALesson2._id, language: french._id, type: 'multiple_choice', question: '"La date limite" çfarë do të thotë?', options: ['Takim', 'Reagim', 'Afat', 'Buxhet'], correctAnswer: 'Afat', explanationAlb: '"La date limite" = Afati i fundit. "date" = datë, "limite" = kufizim/afat.', xpReward: 25, order: 3 },
  ]);

  console.log('🇫🇷 French language and lessons created');

  console.log('📚 All lessons, vocabulary and exercises created');

  const totalVocab = await Vocabulary.countDocuments();
  const totalEx = await Exercise.countDocuments();
  const totalLessons = await Lesson.countDocuments();
  const totalUsers = await User.countDocuments();

  console.log('\n✅ Seed completed!');
  console.log(`   👥 Users: ${totalUsers}`);
  console.log(`   📖 Lessons: ${totalLessons}`);
  console.log(`   📝 Vocabulary: ${totalVocab}`);
  console.log(`   🧩 Exercises: ${totalEx}`);
  console.log('\n🔑 Demo credentials:');
  console.log('   Student: student@lingoalb.com / Student123!');
  console.log('   Admin:   admin@lingoalb.com / Admin123!');
  console.log('\n⚠️  NOTE: User XP is preserved between seeds.');
  console.log('   Run "npm run seed -- --full" to reset everything.\n');

  mongoose.connection.close();
};

seed().catch(err => {
  console.error('❌ Seed error:', err);
  mongoose.connection.close();
  process.exit(1);
});
