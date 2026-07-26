const Position = require('../models/Position');

// @desc    Get all club positions sorted by displayOrder
// @route   GET /api/positions
// @access  Public
const getPositions = async (req, res, next) => {
  try {
    const { search, nameSearch, positionSearch } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { memberName: { $regex: search, $options: 'i' } },
        { positionName: { $regex: search, $options: 'i' } }
      ];
    }

    if (nameSearch) {
      query.memberName = { $regex: nameSearch, $options: 'i' };
    }

    if (positionSearch) {
      query.positionName = { $regex: positionSearch, $options: 'i' };
    }

    const positions = await Position.find(query).sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, positions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new executive position entry
// @route   POST /api/positions
// @access  Private (Admin)
const createPosition = async (req, res, next) => {
  try {
    const { memberName, positionName, photo, displayOrder } = req.body;

    if (!photo) {
      return res.status(400).json({ success: false, message: 'Member photo is required.' });
    }

    if (!memberName || !memberName.trim()) {
      return res.status(400).json({ success: false, message: 'Member name is required.' });
    }

    if (!positionName || !positionName.trim()) {
      return res.status(400).json({ success: false, message: 'Position name is required.' });
    }

    const count = await Position.countDocuments();
    const finalOrder = displayOrder !== undefined ? displayOrder : count + 1;

    const position = await Position.create({
      memberName: memberName.trim(),
      positionName: positionName.trim(),
      photo,
      displayOrder: finalOrder
    });

    res.status(201).json({ success: true, position });
  } catch (error) {
    next(error);
  }
};

// @desc    Update executive position entry / replace photo
// @route   PUT /api/positions/:id
// @access  Private (Admin)
const updatePosition = async (req, res, next) => {
  try {
    const { memberName, positionName, photo, displayOrder } = req.body;
    const position = await Position.findById(req.params.id);

    if (!position) {
      return res.status(404).json({ success: false, message: 'Position not found' });
    }

    if (memberName) position.memberName = memberName.trim();
    if (positionName) position.positionName = positionName.trim();
    if (photo) position.photo = photo;
    if (displayOrder !== undefined) position.displayOrder = displayOrder;

    await position.save();
    res.json({ success: true, position });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder positions
// @route   PUT /api/positions/reorder
// @access  Private (Admin)
const reorderPositions = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array is required' });
    }

    const updates = orderedIds.map((id, index) => {
      return Position.findByIdAndUpdate(id, { displayOrder: index + 1 });
    });

    await Promise.all(updates);
    const updatedPositions = await Position.find().sort({ displayOrder: 1 });

    res.json({ success: true, message: 'Positions reordered successfully', positions: updatedPositions });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete position
// @route   DELETE /api/positions/:id
// @access  Private (Admin)
const deletePosition = async (req, res, next) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({ success: false, message: 'Position not found' });
    }

    await position.deleteOne();
    res.json({ success: true, message: 'Position deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPositions,
  createPosition,
  updatePosition,
  reorderPositions,
  deletePosition
};
