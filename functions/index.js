const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

// Load Judge0 secure keys from Firebase config
const JUDGE0_HOST = functions.config().judge0.host;
const JUDGE0_KEY = functions.config().judge0.key;

// Helper: Forward request to Judge0
async function forwardToJudge0(source_code, language_id, stdin = '') {
  const resp = await fetch(
    `https://${JUDGE0_HOST}/submissions?base64_encoded=false&wait=true`,
    {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': JUDGE0_KEY,
        'X-RapidAPI-Host': JUDGE0_HOST,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ source_code, language_id, stdin })
    }
  );
  return resp.json();
}

// -------------------------
// Compile endpoint
// -------------------------
app.post('/compile', async (req, res) => {
  try {
    const { source_code, language_id, stdin } = req.body;
    if (!source_code || !language_id) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await forwardToJudge0(source_code, language_id, stdin || '');
    res.json(result);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// -------------------------
// Submit-result endpoint
// -------------------------
app.post('/submit-result', async (req, res) => {
  try {
    const { uid, challengeId, lang, source_code, language_id } = req.body;

    if (!uid || !challengeId || !lang) {
      return res.status(400).json({ ok: false, reason: 'Missing fields' });
    }

    // Load challenge data
    const challengeRef = db
      .collection('challenges')
      .doc(lang)
      .collection('levels')
      .doc(String(challengeId));

    const snap = await challengeRef.get();

    if (!snap.exists) {
      return res.json({ ok: false, reason: 'Challenge missing' });
    }

    const challenge = snap.data();

    // Compile submitted code
    const judge = await forwardToJudge0(source_code, language_id, '');

    const stdout = (judge.stdout || '').trim();
    const stderr = judge.stderr || judge.compile_output || '';

    if (stderr) {
      return res.json({ ok: false, reason: 'Error', stderr });
    }

    // Compare output
    const normalize = s => s.replace(/\r/g, '').trim().replace(/\s+/g, ' ');
    const expected = normalize(challenge.expectedOutput);
    const actual = normalize(stdout);

    if (expected !== actual) {
      return res.json({
        ok: false,
        reason: 'Wrong output',
        expected,
        actual
      });
    }

    // Update XP & completed levels
    const userRef = db.collection('users').doc(uid);

    await db.runTransaction(async t => {
      const userSnap = await t.get(userRef);
      const data = userSnap.data() || { xp: 0, completedLevels: {} };

      const prev = data.completedLevels[lang] || [];

      if (!prev.includes(challengeId)) {
        const xpMap = { Easy: 10, Medium: 20, Hard: 40 };
        const award = xpMap[challenge.difficulty] || 10;

        const newCompleted = [...prev, challengeId];
        const newXP = (data.xp || 0) + award;

        t.set(
          userRef,
          {
            xp: newXP,
            completedLevels: {
              ...data.completedLevels,
              [lang]: newCompleted
            }
          },
          { merge: true }
        );
      }
    });

    res.json({ ok: true, passed: true });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Export the API
exports.api = functions.https.onRequest(app);
