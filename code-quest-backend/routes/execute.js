const express = require('express');
const axios = require('axios');
const router = express.Router();

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

router.post('/', async (req, res) => {
  const { language, sourceCode, input } = req.body;

  let runtime;
  if (language === 'java') runtime = 'java';
  else if (language === 'php') runtime = 'php';
  else return res.status(400).json({ error: 'Unsupported language' });

  try {
    const response = await axios.post(PISTON_URL, {
      language: runtime,
      source: sourceCode,
      stdin: input
    });

    const result = response.data;

    res.json({
      output: result.output,
      stderr: result.stderr,
      exitCode: result.code
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Code execution failed' });
  }
});

module.exports = router;
