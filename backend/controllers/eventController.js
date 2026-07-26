const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('registeredMembers', 'name email rollNumber profilePhoto')
      .sort({ startTime: -1 });

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin/Lead)
const createEvent = async (req, res, next) => {
  try {
    const { title, banner, venue, startTime, endTime, description, chiefGuest, category } = req.body;

    const event = await Event.create({
      title,
      banner: banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
      venue,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      description,
      chiefGuest: chiefGuest || 'Industry Leader',
      category: category || 'Workshop',
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Register user for event
// @route   POST /api/events/:id/register
// @access  Private
const registerEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.registeredMembers.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    event.registeredMembers.push(req.user._id);
    await event.save();

    // Award +20 contribution points for registering
    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionPoints: 20 } });

    res.json({ success: true, message: 'Successfully registered for event (+20 points awarded!)', event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  registerEvent,
  deleteEvent
};
