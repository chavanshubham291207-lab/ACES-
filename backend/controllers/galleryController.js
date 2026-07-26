const Gallery = require('../models/Gallery');

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
const getGallery = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;

    const items = await Gallery.find(query).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload image to gallery
// @route   POST /api/gallery
// @access  Private (Admin/Lead)
const addGalleryItem = async (req, res, next) => {
  try {
    const { title, imageUrl, category } = req.body;

    const item = await Gallery.create({
      title,
      imageUrl,
      category: category || 'Events',
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private (Admin)
const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Gallery image deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGallery,
  addGalleryItem,
  deleteGalleryItem
};
