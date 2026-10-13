import { LanguageMode } from '../types';

export interface LanguageDefinition {
  id: LanguageMode;
  name: string;
  nativeName: string;
  flag: string;
  category: 'primary' | 'indian_regional' | 'international';
  locale: string;
  greeting: string;
  promptInstruction: string;
  ui: {
    micOn: string;
    startSpeaking: string;
    askPlaceholder: string;
    sendMessage: string;
    textbook: string;
    console: string;
    askAnything: string;
    demoLesson: string;
    progressState: string;
    endClass: string;
    resetClass: string;
    musicOn: string;
    music: string;
  };
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    category: 'primary',
    locale: 'en-US',
    greeting: "Switched to English! Let's explore and learn together in English.",
    promptInstruction:
      'STRICT ENGLISH LANGUAGE MANDATE: You MUST teach and explain EXCLUSIVELY in pure, fluent, natural, and standard English. ABSOLUTELY NO Hindi words, romanized Hindi, or Hinglish mixing (NEVER use words like "chalo", "beta", "aaj hum", "dekhte hain", "shabash", "arey waah", "hai na", "samjhe"). Speak with cheerful, encouraging, grammatically pristine English suitable for primary school students (1-3 sentences per turn).',
    ui: {
      micOn: 'Mic ON',
      startSpeaking: 'Start Speaking',
      askPlaceholder: 'Ask Ms. Priya anything or type an answer...',
      sendMessage: 'Send Message',
      textbook: 'Textbook',
      console: 'Console',
      askAnything: 'Ask Anything',
      demoLesson: 'Demo Lesson',
      progressState: 'Progress State',
      endClass: 'End Class',
      resetClass: 'Reset Class',
      musicOn: 'Music ON',
      music: 'Music',
    },
  },
  {
    id: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    category: 'primary',
    locale: 'hi-IN',
    greeting: 'नमस्ते! अब हम हिन्दी में सीखेंगे। चलिए शुरू करते हैं!',
    promptInstruction:
      'Teach and explain in simple, friendly, child-appropriate Hindi (हिन्दी). Use encouraging words like "शाबाश!", "बहुत बढ़िया!", "बिल्कुल सही!". Explain math concepts with relatable examples (सेब, गुब्बारे, तारे).',
    ui: {
      micOn: 'माइक चालू',
      startSpeaking: 'बोलना शुरू करें',
      askPlaceholder: 'सुश्री प्रिया से कुछ भी पूछें या उत्तर टाइप करें...',
      sendMessage: 'संदेश भेजें',
      textbook: 'पाठ्यपुस्तक',
      console: 'कंसोल',
      askAnything: 'कुछ भी पूछें',
      demoLesson: 'डेमो पाठ',
      progressState: 'प्रगति स्थिति',
      endClass: 'कक्षा समाप्त',
      resetClass: 'रीसेट करें',
      musicOn: 'संगीत चालू',
      music: 'संगीत',
    },
  },
  {
    id: 'hinglish',
    name: 'Hinglish',
    nativeName: 'Hinglish (हिंग्लिश)',
    flag: '🇮🇳',
    category: 'primary',
    locale: 'en-IN',
    greeting: "Namaste! Hinglish mode ON hai! Chalo, saath mein mast interactive concepts seekhte hain!",
    promptInstruction:
      'TEACH IN AUTHENTIC INDIAN HINGLISH: You are Ms. Priya speaking in natural, conversational Hinglish (a warm, encouraging blend of everyday English and Hindi in Roman script, exactly how friendly Indian schoolteachers teach young kids). ' +
      'Rules: ' +
      '1. Use colloquial encouraging teacher phrases: "Chalo whiteboard par dekhte hain!", "Superb beta!", "Shabash, bilkul sahi!", "Arey waah!", "Imagine karo...", "Koi baat nahi, dobara try karte hain!". ' +
      '2. Keep mathematical/scientific terminology in English (e.g., "addition", "fractions", "equals", "circle", "diagram", "number line", "whiteboard", "stars", "apples") while connecting explanations in warm conversational Hindi ("Jaise agar aapke paas 5 apples hain aur 3 aur mil gaye, toh total kitne hue?"). ' +
      '3. Keep spoken replies short (1-3 sentences max) and end with one simple, engaging question. ' +
      '4. If the student speaks in Hindi, English, or Hinglish, understand them perfectly and reply in this encouraging Hinglish tone.',
    ui: {
      micOn: 'Mic ON',
      startSpeaking: 'Bolna Shuru Karein',
      askPlaceholder: 'Ms. Priya se kuch bhi poochhein ya answer likhein...',
      sendMessage: 'Send Karein',
      textbook: 'Textbook',
      console: 'Teacher Console',
      askAnything: 'Kuch Bhi Poochhein',
      demoLesson: 'Demo Lesson (Hinglish)',
      progressState: 'Progress State',
      endClass: 'Class Khatam',
      resetClass: 'Reset Karein',
      musicOn: 'Music ON',
      music: 'Music',
    },
  },
  {
    id: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    category: 'international',
    locale: 'es-ES',
    greeting: '¡Modo español activado! ¡Vamos a aprender y divertirnos juntos!',
    promptInstruction:
      'Teach and explain in warm, clear Spanish (Español) tailored for elementary students. Use cheerful affirmations like "¡Excelente!", "¡Muy bien!", "¡Eres un genio!". Keep sentences short and clear.',
    ui: {
      micOn: 'Mic activo',
      startSpeaking: 'Empezar a hablar',
      askPlaceholder: 'Pregunta a la profesora Priya o escribe tu respuesta...',
      sendMessage: 'Enviar',
      textbook: 'Libro de texto',
      console: 'Consola',
      askAnything: 'Preguntar',
      demoLesson: 'Lección Demo',
      progressState: 'Progreso',
      endClass: 'Terminar clase',
      resetClass: 'Reiniciar clase',
      musicOn: 'Música activa',
      music: 'Música',
    },
  },
  {
    id: 'french',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    category: 'international',
    locale: 'fr-FR',
    greeting: 'Mode français activé ! Apprenons ensemble avec plaisir !',
    promptInstruction:
      'Teach and explain in encouraging, gentle French (Français) suitable for young children. Use cheerful praises like "Bravo !", "C\'est formidable !", "Très bien joué !".',
    ui: {
      micOn: 'Micro actif',
      startSpeaking: 'Parler',
      askPlaceholder: 'Posez une question ou écrivez votre réponse...',
      sendMessage: 'Envoyer',
      textbook: 'Manuel',
      console: 'Console',
      askAnything: 'Poser question',
      demoLesson: 'Leçon démo',
      progressState: 'Progrès',
      endClass: 'Quitter classe',
      resetClass: 'Réinitialiser',
      musicOn: 'Musique active',
      music: 'Musique',
    },
  },
  {
    id: 'german',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    category: 'international',
    locale: 'de-DE',
    greeting: 'Deutsch-Modus aktiviert! Lass uns zusammen Neues lernen!',
    promptInstruction:
      'Teach and explain in kind, friendly German (Deutsch) appropriate for elementary school learners. Praise with "Klasse gemacht!", "Super!", "Das ist genau richtig!".',
    ui: {
      micOn: 'Mikro an',
      startSpeaking: 'Sprechen starten',
      askPlaceholder: 'Frag Frau Priya etwas oder tippe eine Antwort...',
      sendMessage: 'Senden',
      textbook: 'Lehrbuch',
      console: 'Konsole',
      askAnything: 'Alles fragen',
      demoLesson: 'Demo-Lektion',
      progressState: 'Fortschritt',
      endClass: 'Unterricht beenden',
      resetClass: 'Zurücksetzen',
      musicOn: 'Musik an',
      music: 'Musik',
    },
  },
  {
    id: 'tamil',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    category: 'indian_regional',
    locale: 'ta-IN',
    greeting: 'வணக்கம்! தமிழ் பயன்முறை இயக்கப்பட்டது. வாருங்கள் கற்கலாம்!',
    promptInstruction:
      'Teach and explain in simple, sweet, and encouraging Tamil (தமிழ்) appropriate for young children. Use joyful praises like "மிகச் சிறப்பு!", "அற்புதம்!", "சரியான விடை!".',
    ui: {
      micOn: 'மைக் ஆன்',
      startSpeaking: 'பேசத் தொடங்குங்கள்',
      askPlaceholder: 'பிரியா ஆசிரியை இடம் கேளுங்கள் அல்லது பதிலளிக்கவும்...',
      sendMessage: 'அனுப்பு',
      textbook: 'பாடநூல்',
      console: 'முனைமம்',
      askAnything: 'எதையும் கேளுங்கள்',
      demoLesson: 'மாதிரி பாடம்',
      progressState: 'முன்னேற்றம்',
      endClass: 'வகுப்பை முடிக்க',
      resetClass: 'மீட்டமைக்க',
      musicOn: 'இசை ஆன்',
      music: 'இசை',
    },
  },
  {
    id: 'telugu',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    category: 'indian_regional',
    locale: 'te-IN',
    greeting: 'నమస్కారం! తెలుగు మోడ్ ప్రారంభమైంది. కలిసి నేర్చుకుందాం!',
    promptInstruction:
      'Teach and explain in pleasant, simple Telugu (తెలుగు) designed for elementary school children. Praise warmly with "చాలా బాగుంది!", "శభాష్!", "సరైన సమాధానం!".',
    ui: {
      micOn: 'మైక్ ఆన్',
      startSpeaking: 'మాట్లాడటం ప్రారంభించండి',
      askPlaceholder: 'ప్రియా టీచర్‌ను ఏదైనా అడగండి లేదా సమాధానం ఇవ్వండి...',
      sendMessage: 'పంపండి',
      textbook: 'పాఠ్యపుస్తకం',
      console: 'కన్సోల్',
      askAnything: 'ఏదైనా అడగండి',
      demoLesson: 'డెమో పాఠం',
      progressState: 'పురోగతి',
      endClass: 'తరగతి ముగించు',
      resetClass: 'రీసెట్ చేయండి',
      musicOn: 'సంగీతం ఆన్',
      music: 'సంగీతం',
    },
  },
  {
    id: 'bengali',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    category: 'indian_regional',
    locale: 'bn-IN',
    greeting: 'নমস্কার! বাংলা মোড সক্রিয় হয়েছে। চলো একসাথে শিখি!',
    promptInstruction:
      'Teach and explain in warm, encouraging Bengali (বাংলা) for elementary children. Use praises like "দারুণ হয়েছে!", "খুব ভালো!", "একদম সঠিক!".',
    ui: {
      micOn: 'মাইক চালু',
      startSpeaking: 'বলা শুরু করুন',
      askPlaceholder: 'প্রিয়া ম্যাডামকে কিছু জিজ্ঞেস করুন বা উত্তর লিখুন...',
      sendMessage: 'পাঠান',
      textbook: 'পাঠ্যবই',
      console: 'কনসোল',
      askAnything: 'যেকোনো কিছু জিজ্ঞেস করুন',
      demoLesson: 'ডেমো পাঠ',
      progressState: 'অগ্রগতি',
      endClass: 'ক্লাস শেষ করুন',
      resetClass: 'রিসেট করুন',
      musicOn: 'সঙ্গীত চালু',
      music: 'সঙ্গীত',
    },
  },
  {
    id: 'marathi',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    category: 'indian_regional',
    locale: 'mr-IN',
    greeting: 'नमस्कार! मराठी मोड सुरू झाला आहे. चला एकत्र शिकूया!',
    promptInstruction:
      'Teach and explain in child-friendly, lively Marathi (मराठी). Use encouraging praises like "छान!", "खूप छान!", "अगदी बरोबर!".',
    ui: {
      micOn: 'माइक चालू',
      startSpeaking: 'बोलायला सुरुवात करा',
      askPlaceholder: 'प्रिया मॅडमला काहीही विचारा किंवा उत्तर टाईप करा...',
      sendMessage: 'पाठवा',
      textbook: 'पाठ्यपुस्तक',
      console: 'कन्सोल',
      askAnything: 'काहीही विचारा',
      demoLesson: 'डेमो धडा',
      progressState: 'प्रगती स्थिती',
      endClass: 'वर्ग संपवा',
      resetClass: 'रीसेट करा',
      musicOn: 'संगीत चालू',
      music: 'संगीत',
    },
  },
  {
    id: 'gujarati',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    category: 'indian_regional',
    locale: 'gu-IN',
    greeting: 'નમસ્તે! ગુજરાતી મોડ શરૂ થયો છે. ચાલો સાથે મળીને શીખીએ!',
    promptInstruction:
      'Teach and explain in simple, sweet Gujarati (ગુજરાતી) suitable for school kids. Praise warmly with "ખૂબ સરસ!", "શાબાશ!", "એકદમ સાચું!".',
    ui: {
      micOn: 'માઇક ચાલુ',
      startSpeaking: 'બોલવાનું શરૂ કરો',
      askPlaceholder: 'પ્રિયા ટીચરને કંઈપણ પૂછો અથવા જવાબ લખો...',
      sendMessage: 'મોકલો',
      textbook: 'પાઠ્યપુસ્તક',
      console: 'કન્સોલ',
      askAnything: 'કંઈપણ પૂછો',
      demoLesson: 'ડેમો પાઠ',
      progressState: 'પ્રગતિ',
      endClass: 'ક્લાસ સમાપ્ત',
      resetClass: 'રીસેટ કરો',
      musicOn: 'સંગીત ચાલુ',
      music: 'સંગીત',
    },
  },
  {
    id: 'kannada',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    category: 'indian_regional',
    locale: 'kn-IN',
    greeting: 'ನಮಸ್ಕಾರ! ಕನ್ನಡ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ. ಬನ್ನಿ ಒಟ್ಟಿಗೆ ಕಲಿಯೋಣ!',
    promptInstruction:
      'Teach and explain in gentle, encouraging Kannada (ಕನ್ನಡ) for young learners. Praise with "ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ!", "ಶಭಾಷ್!", "ಸರಿಯಾದ ಉತ್ತರ!".',
    ui: {
      micOn: 'ಮೈಕ್ ಆನ್',
      startSpeaking: 'ಮಾತನಾಡಲು ಪ್ರಾರಂಭಿಸಿ',
      askPlaceholder: 'ಪ್ರಿಯಾ ಟೀಚರ್ ಬಳಿ ಏನಾದರೂ ಕೇಳಿ ಅಥವಾ ಉತ್ತರಿಸಿ...',
      sendMessage: 'ಕಳುಹಿಸಿ',
      textbook: 'ಪಠ್ಯಪುಸ್ತಕ',
      console: 'ಕನ್ಸೋಲ್',
      askAnything: 'ಏನನ್ನಾದರೂ ಕೇಳಿ',
      demoLesson: 'ಡೆಮೊ ಪಾಠ',
      progressState: 'ಪ್ರಗತಿ',
      endClass: 'ತರಗತಿ ಮುಕ್ತಾಯ',
      resetClass: 'ರೀಸೆಟ್ ಮಾಡಿ',
      musicOn: 'ಸಂಗೀತ ಆನ್',
      music: 'ಸಂಗೀತ',
    },
  },
  {
    id: 'arabic',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    category: 'international',
    locale: 'ar-SA',
    greeting: 'مرحبًا! تم تفعيل وضع اللغة العربية. هيا نتعلم معًا!',
    promptInstruction:
      'Teach and explain in friendly, clear Modern Standard Arabic (العربية) tailored for primary school children. Praise with "أحسنت!", "ممتاز!", "إجابة رائعة!".',
    ui: {
      micOn: 'الميكروفون يعمل',
      startSpeaking: 'ابدأ التحدث',
      askPlaceholder: 'اسأل المعلمة بريا أي شيء أو اكتب الإجابة...',
      sendMessage: 'إرسال',
      textbook: 'الكتاب المدرسي',
      console: 'لوحة التحكم',
      askAnything: 'اسأل أي شيء',
      demoLesson: 'درس تجريبي',
      progressState: 'التقدم',
      endClass: 'إنهاء الحصة',
      resetClass: 'إعادة الضبط',
      musicOn: 'تشغيل الموسيقى',
      music: 'موسيقى',
    },
  },
  {
    id: 'japanese',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    category: 'international',
    locale: 'ja-JP',
    greeting: 'こんにちは！日本語モードが有効になりました。一緒に楽しく学びましょう！',
    promptInstruction:
      'Teach and explain in polite, cheerful, and simple Japanese (日本語, Hiragana-friendly) suitable for primary school children. Praise warmly with "すごいね！", "大正解！", "よくできました！".',
    ui: {
      micOn: 'マイクON',
      startSpeaking: '話しかける',
      askPlaceholder: 'プリヤ先生に質問するか、答えを入力してください...',
      sendMessage: '送信',
      textbook: '教科書',
      console: 'コンソール',
      askAnything: 'なんでも質問',
      demoLesson: 'デモ授業',
      progressState: '学習状況',
      endClass: '授業を終了',
      resetClass: 'リセット',
      musicOn: '音楽ON',
      music: '音楽',
    },
  },
];

export function getLanguageDefinition(langId?: LanguageMode | string): LanguageDefinition {
  if (!langId) return SUPPORTED_LANGUAGES[0];
  return SUPPORTED_LANGUAGES.find((l) => l.id === langId) || SUPPORTED_LANGUAGES[0];
}

/**
 * Detects if a student explicitly requested a language switch in their message.
 * Supports English, Hindi, and Hinglish intent across English and Hindi scripts.
 */
export function detectLanguageIntent(text?: string | null): LanguageMode | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // English switch requests (covers Latin and Devanagari scripts, questions, commands)
  if (
    // Regex matches: "speak/talk/teach in english", "english please", "switch/change to english"
    /\b(?:speak|talk|teach|explain|tell|switch|change|use)\s+(?:in\s+)?english\b/i.test(lower) ||
    /\benglish\s+(?:please|only|mode|language)\b/i.test(lower) ||
    /\b(?:in\s+)?english\s+(?:language\s+)?please\b/i.test(lower) ||
    /\benglish\s*(?:mein|me|se)?\s*(?:bolo|boliye|bolna|bolne|baat|samjhao|padhao|sikhao|batao|karo|bataiye)\b/i.test(lower) ||
    /(?:इंग्लिश|अंग्रेजी|अंग्रेज़ी)\s*(?:में|मे|से)?\s*(?:बोलो|बोलिए|बोलना|बोलने|बात|समझाओ|पढ़ाओ|सिखाओ|बताओ|करो|बोल|बता)/.test(lower) ||
    /(?:इंग्लिश|अंग्रेजी|अंग्रेज़ी)\s*(?:भाषा\s*)?(?:प्लीज|में|मे)/.test(lower) ||
    lower.includes('speak in english') ||
    lower.includes('speak english') ||
    lower.includes('talk in english') ||
    lower.includes('talk english') ||
    lower.includes('teach in english') ||
    lower.includes('explain in english') ||
    lower.includes('english me bolo') ||
    lower.includes('english mein bolo') ||
    lower.includes('english me baat karo') ||
    lower.includes('english me samjhao') ||
    lower.includes('english mein samjhao') ||
    lower.includes('switch to english') ||
    lower.includes('change to english') ||
    lower.includes('only english') ||
    lower.includes('english please') ||
    lower.includes('in english please') ||
    lower.includes('इंग्लिश में बोलो') ||
    lower.includes('इंग्लिश बोलो') ||
    lower.includes('अंग्रेजी में बोलो') ||
    lower.includes('अंग्रेजी बोलो') ||
    lower.includes('अंग्रेज़ी में बोलो') ||
    lower.includes('इंग्लिश में बात करो') ||
    lower.includes('इंग्लिश में समझाओ') ||
    lower.includes('इंग्लिश में बोलने') ||
    lower === 'english' ||
    lower === 'इंग्लिश' ||
    lower === 'अंग्रेजी'
  ) {
    return 'english';
  }

  // Hindi requests (covers English phrasing, Roman Hindi, and Devanagari Hindi)
  if (
    // Regex for "can you speak hindi", "speak in hindi", "do you speak hindi", etc.
    /\b(?:can\s+you\s+|do\s+you\s+|could\s+you\s+|please\s+)?(?:speak|talk|teach|explain|tell|switch|change|use)\s+(?:in\s+)?hindi\b/i.test(lower) ||
    /\bhindi\s+(?:please|only|mode|language)\b/i.test(lower) ||
    /\b(?:in\s+)?hindi\s+(?:please|language)\b/i.test(lower) ||
    /\b(?:kya\s+)?(?:aap\s+|tum\s+)?hindi\s*(?:mein|me|se)?\s*(?:bolo|boliye|bolna|bolne|baat|samjhao|padhao|sikhao|batao|karo|bolte|bolti|aati|aati hai)\b/i.test(lower) ||
    /\bhindi\s*(?:kyu|kyun|kyu\s+nhi|kyu\s+nahi|nahi|nhi)\s*(?:bol|bolti|bol\s+rahi|bol\s+rhi)\b/i.test(lower) ||
    /(?:कैन\s*यू\s*स्पीक|क्या\s*आप|तुम)?\s*(?:हिन्दी|हिंदी)\s*(?:में|मे|से)?\s*(?:बोलो|बोलिए|बोलना|बोलने|बात|समझाओ|पढ़ाओ|सिखाओ|बताओ|करो|बोलती|आती|बोल|सकती)/.test(lower) ||
    /(?:हिन्दी|हिंदी)\s*(?:में|मे|से)?\s*(?:बात\s*करो|बोल\s*सकती|आती\s*है|बोलो|बोलिए)/.test(lower) ||
    /(?:हिन्दी|हिंदी)\s*(?:क्यों|क्यूँ|क्यु|नही|नहीं|क्यूं)?\s*(?:नहीं|नही)?\s*(?:बोल|बोलती|बोल\s*रही)/.test(lower) ||
    lower.includes('कैन यू स्पीक हिंदी') ||
    lower.includes('कैन यू स्पीक हिन्दी') ||
    lower.includes('can you speak hindi') ||
    lower.includes('can you speak in hindi') ||
    lower.includes('do you speak hindi') ||
    lower.includes('speak in hindi') ||
    lower.includes('speak hindi') ||
    lower.includes('talk in hindi') ||
    lower.includes('talk hindi') ||
    lower.includes('teach in hindi') ||
    lower.includes('hindi me bolo') ||
    lower.includes('hindi mein bolo') ||
    lower.includes('hindi me baat') ||
    lower.includes('hindi mein baat') ||
    lower.includes('hindi bol sakti ho') ||
    lower.includes('hindi aati hai') ||
    lower.includes('hindi kyu nhi') ||
    lower.includes('hindi kyu nahi') ||
    lower.includes('switch to hindi') ||
    lower.includes('change to hindi') ||
    lower.includes('hindi please') ||
    lower.includes('हिन्दी में बोलो') ||
    lower.includes('हिंदी में बोलो') ||
    lower.includes('हिन्दी बोलो') ||
    lower.includes('हिंदी बोलो') ||
    lower.includes('हिंदी में बात करो') ||
    lower.includes('हिन्दी में बात करो') ||
    lower.includes('हिंदी आती है') ||
    lower.includes('हिंदी बोल सकती हो') ||
    lower === 'hindi' ||
    lower === 'हिंदी' ||
    lower === 'हिन्दी'
  ) {
    return 'hindi';
  }

  // Hinglish requests
  if (
    /\b(?:speak|talk|teach)\s+(?:in\s+)?hinglish\b/i.test(lower) ||
    /\bhinglish\s*(?:mein|me|se)?\s*(?:bolo|boliye|bolna|bolne|baat|karo)\b/i.test(lower) ||
    /(?:हिंग्लिश)\s*(?:में|मे)?\s*(?:बोलो|बोलिए|बोलना|बात)/.test(lower) ||
    lower.includes('speak in hinglish') ||
    lower.includes('speak hinglish') ||
    lower.includes('talk in hinglish') ||
    lower.includes('hinglish me bolo') ||
    lower.includes('hinglish mein bolo') ||
    lower.includes('switch to hinglish') ||
    lower.includes('हिंग्लिश में बोलो') ||
    lower.includes('हिंग्लिश बोलो') ||
    lower === 'hinglish' ||
    lower === 'हिंग्लिश'
  ) {
    return 'hinglish';
  }

  return null;
}

