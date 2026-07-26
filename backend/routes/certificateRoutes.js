const express = require('express');
const router = express.Router();
const { getMyCertificates, getAllCertificates, createCertificate, deleteCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/my-certificates', getMyCertificates);
router.get('/', authorizeRoles('Super Admin', 'President', 'Vice President', 'Secretary'), getAllCertificates);
router.post('/', authorizeRoles('Super Admin', 'President', 'Vice President', 'Secretary'), createCertificate);
router.delete('/:id', authorizeRoles('Super Admin', 'President'), deleteCertificate);

module.exports = router;
