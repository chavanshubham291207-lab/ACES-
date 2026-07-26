const express = require('express');
const router = express.Router();
const { getGallery, addGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getGallery);
router.post('/', protect, authorizeRoles('Super Admin', 'President', 'Vice President', 'Team Lead'), addGalleryItem);
router.delete('/:id', protect, authorizeRoles('Super Admin', 'President'), deleteGalleryItem);

module.exports = router;
