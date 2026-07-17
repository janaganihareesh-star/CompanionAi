const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/codeController');

router.use(auth);

router.post('/generate',      c.generateCode);
router.post('/debug',         c.debugCode);
router.post('/review',        c.reviewCode);
router.post('/optimize',      c.optimizeCode);
router.post('/test-cases',    c.generateTests);
router.post('/documentation', c.generateDocs);
router.post('/explain',       c.explainCode);
router.post('/security',      c.securityReview);
router.get('/languages',      c.getSupportedLanguages);
router.post('/execute',       c.executeCode);

module.exports = router;
