'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Brain, ChevronDown, ChevronUp, Lightbulb, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const lessons = [
  {
    id: 1,
    emoji: '🧠',
    title: 'Drejtpërdrejt vs Rrethanas',
    subtitle: 'Anglezët thonë çfarë duan — ne bëjmë rrugë',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    content: `Shqiptarët janë miqësorë dhe indirektë. Nëse dikush të ofron diçka dhe ti nuk e do, ne themi "jo s'ka nevoja" ose heshtime me buzëqeshje. Anglezët? Thonë "No thanks!" dhe kjo nuk konsiderohet imoralitet — është respekt ndaj kohës suaj.

Në anglisht, drejtpërdrejtshmëria është virtyt. "I don't agree" është frazë normale — nuk do të thotë "të urrej" — do të thotë "mendoj ndryshe". Ky ndryshim kulturor ka pasoja të mëdha kur mëson anglishten.`,
    albanian: ['Jo, nuk pajtohem me ty — mund ta konsideroj si sulm personal', 'Kur them "do të shoh" = ndoshta nuk do ta bëj', '"Mirë" mund të nënkuptojë 5 gjëra të ndryshme'],
    english: ['"I disagree" = frazë neutrale, jo e fyer', '"I\'ll think about it" = do mendoj me të vërtetë', '"Yes" do të thotë "yes" — "no" do të thotë "no"'],
    tip: 'Kur flisni anglisht, mos kini frikë të jeni direkt. "I don\'t understand" është shumë respektuese — jo shenjë dobësie!',
    quiz: {
      question: 'Shoku anglez ju thotë "That\'s an interesting idea" me ton neutral. Çfarë do të thotë?',
      options: ['Ideja juaj është fantastike!', 'Ndoshta nuk i pelqen por nuk dëshiron të ofendojë', 'Po mendon ta vjedhë idenë tuaj', 'Është duke bërë shaka'],
      correct: 1,
      explanation: '"Interesting" në anglishten britanike shpesh nënkupton skepticizëm të butë. Anglezët janë edhe ata pak indirektë — por jo si shqiptarët!'
    }
  },
  {
    id: 2,
    emoji: '⏰',
    title: 'Koha dhe Premtimet',
    subtitle: '"Ora 3" do të thotë... orë 3 pikë!',
    color: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    content: `Kemi një shprehje: "ora shqiptare" — kur takohemi "në orën 8" mund të nënkuptojë 8:30 ose 9. Ky kulturë nuk ekziston në botën anglofone.

Nëse ke takim "at 9 AM" dhe vjen në 9:15, kjo konsiderohet vonë dhe mosprespekt serioz. Shumë shqiptarë humbin mundësi pune ose marrëdhënie biznesi për shkak të kësaj ndryshimi kulturor. "I'll be there soon" ka kuptim të ndryshëm — anglezët presin "soon" = 5-10 minuta, jo 45!`,
    albanian: ['"Vij shpejt" = mund të thotë 30 minuta deri 2 orë', '"Nesër" = ndoshta pasnesër ose javën e ardhshme', 'Vona 15 minutë = normale dhe e pranueshme'],
    english: ['"I\'ll be there in 5" = 5 minuta, jo 20', '"By tomorrow" = para mesnatës', 'Vonesa pa njoftim = mosprespekt serioz'],
    tip: 'Trick praktik: Vendosni alarmin 15 minuta para takimit anglez. Kur mendoni jeni "në kohë" shqiptare — jeni me vonesë angleze!',
    quiz: {
      question: 'Shefi anglez ju shkruan "Can we meet at 2 PM sharp?". Çfarë nënkupton "sharp"?',
      options: ['Rreth orës 2, give or take', 'Saktësisht orën 14:00 — asnjë minutë vonesë', 'Pak pas orës 2', 'Herë tjetër kur të kemi kohë'],
      correct: 1,
      explanation: '"Sharp" ose "on the dot" = saktësisht në atë orë. Vona edhe 2 minuta do të vërehet!'
    }
  },
  {
    id: 3,
    emoji: '🗣️',
    title: 'Si Formohet Fjalia në Anglisht',
    subtitle: 'Anglezët mendojnë kë pastaj çfarë — ne mendojnë ngjitur',
    color: 'from-green-500 to-teal-600',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    content: `Në shqip: "Unë dje në treg mollë bleva" — kuptojmë, sepse shqipja është gjuhë fleksive.
Në anglisht: DUHET të ndjekësh rregullin: Kush + Bën + Çfarë + Ku + Kur.

"I (Kush) bought (Bën) apples (Çfarë) at the market (Ku) yesterday (Kur)"

Ky rregull quhet SVO — Subject-Verb-Object. Anglezët mendojnë në këtë mënyrë automatikisht. Nuk mund të thuash "Yesterday apples I bought" — edhe nëse kuptohet, tingëllon si Yoda nga Star Wars dhe njerëzit do buzëqeshin!`,
    albanian: ['Mund të vendosim fjalët thuajse kudo në fjali', '"Mollë bleva" dhe "Bleva mollë" — të dyja janë OK', 'Folja mund të vijë në fund të fjalisë'],
    english: ['Subject GJITHMONË vjen i pari (me pak përjashtime)', 'Verb MENJËHERË pas subjektit', '"Yesterday I ate" ✅ — "I yesterday ate" ❌'],
    tip: 'Mnyra e shpejtë: Gjithmonë pyesni veten "KU ËSHTË KRYEFJALA?" Para se të flisni, gjeni atë fjalë dhe vendoseni të parë!',
    quiz: {
      question: 'Cila fjali është korrekte anglisht?',
      options: ['Yesterday to the shop I went with my friend', 'I went to the shop yesterday with my friend', 'With my friend to the shop went I yesterday', 'To the shop I with friend yesterday went'],
      correct: 1,
      explanation: 'I (Subject) + went (Verb) + to the shop (Where) + yesterday (When) + with my friend (With whom). Ky është renditja natyrale angleze!'
    }
  },
  {
    id: 4,
    emoji: '😊',
    title: '"How Are You?" — Mos u Ankoni!',
    subtitle: 'Shqiptarët tregojnë gjithçka — anglezët duan "Fine, thanks"',
    color: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-200 dark:border-pink-800',
    content: `Kur shqiptarët takojnë njeri të njohur dhe pyesin "Si je?", ata DUAN ta dijnë: si është shëndeti, familja, puna, fëmijët, vjehrra...

Kur anglezët (veçanërisht amerikanët dhe britanikët) thonë "How are you?", kjo është PËRSHËNDETJE, jo pyetje e vërtetë. Përgjigja e pritur është automatikisht "Fine, thanks! You?" — dhe pastaj vazhdon biseda.

Nëse filloni t'u tregoni problemet tuaja shëndetësore ose familja, personi anglez do të çuditur shumë — dhe gjasa është të nxjerrë telefonin dhe të shtirë se mori sms urgjente!`,
    albanian: ['"Si je?" = pyetje e sinqertë që kërkon përgjigje të gjatë', 'Mosdhënia e informacionit = mosbesim ose mendjemadhësi', 'Ankimet janë shenjë besimi dhe miqësie'],
    english: ['"How are you?" = "Përshëndetje" — jo pyetje e vërtetë', '"I\'m good!" ose "Not bad!" = përgjigjet standarde', 'Ankimet me të panjohur = bisedë e papërshtatshme'],
    tip: 'Nëse anglezi pyet "How are you?" dhe ju doni të tregoni diçka, thyeni rregullin me "Actually, not great — do you have a minute?". Kjo sinjalizon që doni bisedë të vërtetë!',
    quiz: {
      question: 'Kolegja angleze ju pyet "How are you?" në koridor. Çfarë përgjigjeni?',
      options: ['Kam dhimbje koke 3 ditë, ndërkaq vjehrra... ', '"Fine thanks, you?"', 'Silemi si të mos e kemi dëgjuar', '"Mirë faleminderit, po ti si je?"'],
      correct: 1,
      explanation: '"Fine thanks, you?" është përgjigja perfekte — e shpejtë, pozitive, dhe i kthen topin atij. Shqip: "Mirë faleminderit, po ti?" është gjithashtu e pranuar!'
    }
  },
  {
    id: 5,
    emoji: '🤝',
    title: 'Small Talk — Arti i Bisedës pa Substancë',
    subtitle: 'Moti, sport, fundjavë — bullshit i organizuar që ndërton raporte',
    color: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    content: `Shqiptarët konsiderojnë bisedën për motin si shenjë të mungesës së substancës. "Pse flasim për motin kur kemi aq gjëra importante të diskutojmë?"

Kultura anglofone — veçanërisht britanike — e sheh Small Talk si ART SOCIAL shumë të rëndësishëm. Para çdo takimi biznesi, interviste pune, ose takimi me shoqëri, pritet të flisni 3-5 minuta për: motin, ekipin sportiv, planin e fundjavës, ose ndonjë lajm neutral.

Kjo nuk është humbje kohe — është mënyra angleze e krijimit të besimit dhe relaximit të atmosferës. Nëse kaloni direkt te puna pa small talk, anglezët mendojnë jeni të ftohtë ose nervozë!`,
    albanian: ['Kalojmë direkt te çështja kryesore = efikasitet', 'Biseda për motin = mungesë teme', 'Miqësia formohet me tregime dhe familje'],
    english: ['Small talk para çdo takimi = respekt dhe miqësi', 'Temat e sigurta: mot, sport, udhëtime, filma', 'Temat TABU me të panjohur: politikë, fe, pagë, age'],
    tip: '3 fraza small talk për të mësuar përmendsh: "Lovely weather!" / "Did you have a good weekend?" / "Have you seen [popular show] yet?" — Këto hapen 90% të bisedave angleze!',
    quiz: {
      question: 'Intervistë pune. Intervistruesi fillon me "So, did you find parking okay?". Çfarë bëni?',
      options: ['Kaloj direkt te CV-ja ime — koha është e çmuar', 'Them "Yes, actually! Took me a minute but found a spot nearby. How is the parking usually around here?"', 'Them "Po" dhe heshtem', 'Them "Nuk e di anglisht shumë mirë"'],
      correct: 1,
      explanation: 'Kjo është small talk dhe ju duhet ta ktheni! Pergjigjja e zgjedhur: pranon, shton detaj, dhe bën pyetje — sinjalizon aftësi sociale. Intervistat shpesh fitohen para se të fillojnë!'
    }
  },
  {
    id: 6,
    emoji: '🦅',
    title: 'Krenaria Shqiptare si Superpower',
    subtitle: 'Ajo gjë që e mendonim si pengesë — është avantazhi ynë',
    color: 'from-red-500 to-orange-500',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    content: `Shqiptarët kanë diçka që shumë popuj nuk e kanë: BESA — fjala e dhënë si ligji. Kur shqiptari premton diçka, e mban. Kjo vlerë, e transferuar në anglisht dhe kontekstin profesional ndërkombëtar, është jashtëzakonisht e fuqishme.

Gjithashtu: Shqiptarët janë të mësuar të mbijetojnë. Kemi kaluar perandori, diktaturë, izolim. Kjo na bën adaptiv, kreativë, dhe resilient — cilësi të çmuara në çdo gjuhë dhe kulturë.

Mëso anglishten jo si "gjuhën e të tjerëve" — por si mjetin TËND për të çuar mesazhin shqiptar në botën e gjerë. Skënderbeu do kishte mësuar anglisht. 🦅`,
    albanian: ['Besimi = aftësi e rrallë dhe e çmuar globalisht', 'Adaptueshmëria jonë historike = avantazh modern', 'Solidariteti familjar = rrjet social i fuqishëm'],
    english: ['Reliability = aftësia nr.1 e kërkuar nga punëdhënësit', 'Resilience = buzzword pozitiv në çdo CV angleze', 'Community-oriented = leadership skill i lartë'],
    tip: 'Kur prezantoheni me anglisht-folës, mos u turpëroni nga origjina juaj. Thuani me krenari: "I\'m Albanian" — dhe kur pyesin "Where\'s Albania?", kjo është mundësia juaj të bëni ambasador! 🇦🇱',
    quiz: {
      question: 'Një koleg anglez ju thotë "You speak English really well for an Albanian!". Si reagoni?',
      options: ['Ndihem i ofenduar dhe heshtem', '"Thank you! Albanian is actually a very ancient language — it survived 500 years of Ottoman rule!"', '"Jo, flasim shumë keq anglisht"', 'Ndryshoj temën menjëherë'],
      correct: 1,
      explanation: 'Ky është kompliment! Kthejeni me krenari dhe edukim — por pa mënjanuar mendjemadhësinë. Tregoni historinë tuaj! Njerëzit duan të dijnë!'
    }
  }
];

export default function MentalitetiPage() {
  const { isDark } = useAuthStore();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [quizShown, setQuizShown] = useState<Record<number, boolean>>({});
  const [progress, setProgress] = useState<number[]>([]);

  const markRead = (id: number) => {
    if (!progress.includes(id)) setProgress(p => [...p, id]);
  };

  const handleAnswer = (lessonId: number, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [lessonId]: answerIndex }));
    markRead(lessonId);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white dark:hover:bg-dark-50 shadow-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              🧠 Mentaliteti Anglez
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Si mendojnë ndryshe folësit e anglishtes</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6 ml-14">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-dark-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary-600 to-green-500 rounded-full"
              animate={{ width: `${(progress.length / lessons.length) * 100}%` }}
              transition={{ duration: 0.5 }} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
            {progress.length}/{lessons.length} mësuar
          </span>
        </div>

        {/* Intro card */}
        <div className="card mb-6 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white border-0 shadow-xl">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-primary-200 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-lg mb-2">Pse kjo seksion ekziston?</h2>
              <p className="text-primary-100 text-sm leading-relaxed">
                Shumë shqiptarë mësojnë fjalë dhe gramatikë angleze — por prapë ndihen të humbur kur flasin me anglezë të vërtetë. 
                Arsyeja nuk është gjuha — është <strong>mënyra e të menduarit</strong>. 
                Kjo seksion ju mëson jo vetëm fjalë, por si të <em>mendoni</em> si anglez.
              </p>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-4">
          {lessons.map((lesson, idx) => {
            const isOpen = expanded === lesson.id;
            const answered = quizAnswers[lesson.id] !== undefined && quizAnswers[lesson.id] !== null;
            const isCorrect = answered && quizAnswers[lesson.id] === lesson.quiz.correct;
            const isDone = progress.includes(lesson.id);

            return (
              <motion.div key={lesson.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`card rounded-2xl overflow-hidden transition-all ${isDone ? 'border-green-200 dark:border-green-800' : ''}`}>

                {/* Lesson header */}
                <button
                  className="w-full text-left flex items-center gap-4"
                  onClick={() => { setExpanded(isOpen ? null : lesson.id); markRead(lesson.id); }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
                    {lesson.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{lesson.title}</h3>
                      {isDone && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lesson.subtitle}</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>

                {/* Lesson body */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">

                        {/* Main explanation */}
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {lesson.content}
                        </div>

                        {/* Comparison table */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`${lesson.bgLight} ${lesson.border} border rounded-xl p-3`}>
                            <div className="font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                              🇦🇱 Shqip
                            </div>
                            <ul className="space-y-1.5">
                              {lesson.albanian.map((item, i) => (
                                <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                                  <AlertCircle className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                            <div className="font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                              🇬🇧 Anglisht
                            </div>
                            <ul className="space-y-1.5">
                              {lesson.english.map((item, i) => (
                                <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Tip */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{lesson.tip}</p>
                        </div>

                        {/* Quiz */}
                        <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-4">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            🧩 Testo veten:
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{lesson.quiz.question}</p>
                          <div className="space-y-2">
                            {lesson.quiz.options.map((opt, i) => {
                              const isSelected = quizAnswers[lesson.id] === i;
                              const showResult = answered;
                              const correct = lesson.quiz.correct === i;
                              return (
                                <button key={i}
                                  onClick={() => !answered && handleAnswer(lesson.id, i)}
                                  disabled={answered}
                                  className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                                    showResult && correct ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                    : showResult && isSelected && !correct ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600'
                                    : isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700'
                                    : 'border-gray-200 dark:border-dark-50 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                  }`}>
                                  {showResult && correct && <CheckCircle className="w-4 h-4 inline mr-1.5 text-green-500" />}
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {answered && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                              className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                              <strong>{isCorrect ? '✅ Saktë! ' : '❌ Jo saktë — '}</strong>
                              {lesson.quiz.explanation}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Completion message */}
        {progress.length === lessons.length && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="card mt-6 rounded-2xl text-center bg-gradient-to-br from-green-50 to-primary-50 dark:from-green-900/20 dark:to-primary-900/20 border-green-200 dark:border-green-800">
            <div className="text-5xl mb-3">🦅</div>
            <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
              E keni mbaruar! Brava!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Tani e kuptoni jo vetëm gjuhën — por edhe mënyrën e të menduarit anglez. 
              Kjo është aftësia që ndan ata që "dijnë anglisht" nga ata që <em>mendojnë</em> anglisht!
            </p>
            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> Vazhdo mësimet
            </Link>
          </motion.div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
