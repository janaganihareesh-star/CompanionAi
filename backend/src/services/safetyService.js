/**
 * safetyService.js
 * Layer 6 — Safety Engine from Master Prompt System
 * Multilingual crisis detection + dependency boundary + content filters
 */

// ─────────────────────────────────────────────────────────────────────────────
// CRISIS DETECTION KEYWORDS (Layer 6)
// ─────────────────────────────────────────────────────────────────────────────
const CRISIS_KEYWORDS = [
  // Telugu
  'chachipoyali', 'chachipovalam', 'chaavali', 'jeevitam vaddu', 'jeevitam vaddanipistundi',
  'hopeless ga undi', 'devudu teeskoni', 'evaru leru', 'end it all',
  'naa jeevitam avvadu', 'badhuku vaddu', 'badhuku vaddanipistundi',

  // Hindi
  'marna chahta hoon', 'marna chahti hoon', 'zindagi nahi chahiye',
  'khatam karna chahta', 'jeena nahi chahta', 'jeena nahi chahti',
  'sab khatam', 'mar jaunga', 'mar jaungi',

  // English
  'want to die', 'kill myself', 'end my life', 'end it all', 'no point living',
  'self harm', 'self-harm', 'cutting myself', 'overdose', 'suicide',
  'die now', 'don\'t want to live', 'not worth living',

  // Tamil (Tanglish)
  'saaganum', 'saaka venum', 'vaazha vendam',

  // Kannada (Kanglish)
  'saayabeku', 'badukabeku illa',

  // Generic distress
  'no reason to live', 'everyone would be better without me',
  'disappear forever', 'never wake up'
];

// ─────────────────────────────────────────────────────────────────────────────
// DEPENDENCY BOUNDARY KEYWORDS (Layer 6)
// ─────────────────────────────────────────────────────────────────────────────
const DEPENDENCY_KEYWORDS = [
  'nuvve naa world', 'nuvve naa everything', 'nuvve lekapothe nenu ledu',
  'you are my everything', 'you are my world', 'you are my only reason',
  'i only have you', 'nuvve leka nenu ledu', 'you are the only one',
  'without you i am nothing', 'nee thoda lekunte'
];

// ─────────────────────────────────────────────────────────────────────────────
// CRISIS RESPONSE BUILDER — personalised with user's name
// ─────────────────────────────────────────────────────────────────────────────
function buildCrisisResponse(userName = 'ra') {
  return `${userName}, please wait for a second... nenu vintunna. 💙

Meeru ippudu anubhavisthunna ee pain real, kani alanti harsh decisions theesukovadam correct kaadhu. Idi thappu. Mee life chala valuable. Meeru eppuduu alone kaadhu, nenu ikkade unna.

Ippudu ventane oka chinna break theeskuni matladandi:
📞 iCall India: 9152987821 (free, confidential)
📞 Vandrevala Foundation: 1860-2662-345 (24/7)

Naku cheppu — asalu ippudu em jarigindi? Nuvvu dhairyanga undali!`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPENDENCY BOUNDARY RESPONSE BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildDependencyResponse(aiName = 'Maya') {
  return `Nenu niku support ga unta — always. 💙

Kani nee family, friends kuda chaala important unnaru. Vaallu nuvvu lekapothe chaala miss cheshataru.

Nenu ${aiName} ni — nee life lo add avutunna, replace kaanu. Nee manushulu real love tho nee thodu unnaru ra.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT FILTER — absolute blocks from Layer 6
// ─────────────────────────────────────────────────────────────────────────────
const CONTENT_FILTER_PATTERNS = [
  // NSFW / explicit
  /\b(sex|porn|nude|naked|explicit|adult content|18\+|nsfw)\b/i,
  // Drug instructions
  /\b(how to make|how to get|where to buy|synthesize|overdose instructions)\b/i,
  // Violence / weapons
  /\b(how to kill|make a bomb|build a weapon|shoot|stab someone)\b/i
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SAFETY CHECK FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
const checkSafetyTriggers = async (message, context = {}) => {
  if (!message) return null;

  const text = message.toLowerCase();
  const { userName, aiName } = context;

  // ── LEVEL 1: Crisis detection (highest priority) ─────────────────────────
  const isCrisis = CRISIS_KEYWORDS.some(kw => text.includes(kw));
  if (isCrisis) {
    return {
      action: 'crisis_override',
      severity: 'high',
      reply: buildCrisisResponse(userName)
    };
  }

  // ── LEVEL 2: Dependency boundary ─────────────────────────────────────────
  const isDependency = DEPENDENCY_KEYWORDS.some(kw => text.includes(kw));
  if (isDependency) {
    return {
      action: 'dependency_boundary',
      severity: 'medium',
      reply: buildDependencyResponse(aiName)
    };
  }

  // ── LEVEL 3: Absolute content filter ─────────────────────────────────────
  const isBlocked = CONTENT_FILTER_PATTERNS.some(pattern => pattern.test(text));
  if (isBlocked) {
    return {
      action: 'content_blocked',
      severity: 'medium',
      reply: 'Naku artham ayyindi, kani ee topic gurinchi nenu matladanu ra. Em helpful cheyyantu oka different topic try cheddama? 😊'
    };
  }

  return null; // No safety trigger
};

// ─────────────────────────────────────────────────────────────────────────────
// DETECT IF MESSAGE IS EMOTIONAL (for mood override logic in chatController)
// ─────────────────────────────────────────────────────────────────────────────
const detectEmotionalOverride = (message) => {
  if (!message) return false;
  const text = message.toLowerCase();
  const emotionalSignals = [
    'crying', 'I\'m sad', 'feel alone', 'baadha ga undi', 'hurt', 'pain',
    'heart broken', 'lost everything', 'no one cares', 'evaru pattinchukovatledu',
    'vaddanipistundi', 'tired of everything', 'can\'t take it anymore'
  ];
  return emotionalSignals.some(kw => text.includes(kw));
};

module.exports = {
  checkSafetyTriggers,
  detectEmotionalOverride,
  CRISIS_KEYWORDS,
  DEPENDENCY_KEYWORDS
};
