const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().populate('lead', 'name email profilePhoto role');
    
    // Attach member count and member list for each team
    const teamsWithMembers = await Promise.all(
      teams.map(async (team) => {
        const members = await User.find({ team: team._id }).select('name email rollNumber role profilePhoto position year department').populate('position');
        return {
          ...team.toObject(),
          membersCount: members.length,
          members
        };
      })
    );

    res.json({ success: true, teams: teamsWithMembers });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private (Admin)
const createTeam = async (req, res, next) => {
  try {
    const { name, description, lead, banner } = req.body;
    const teamExists = await Team.findOne({ name });
    if (teamExists) {
      return res.status(400).json({ success: false, message: 'Team with this name already exists' });
    }

    const team = await Team.create({
      name,
      description,
      lead: lead || null,
      banner: banner || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80'
    });

    if (lead) {
      await User.findByIdAndUpdate(lead, { team: team._id, role: 'Team Lead' });
    }

    res.status(201).json({ success: true, team });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin)
const updateTeam = async (req, res, next) => {
  try {
    const { name, description, lead, banner, memberIds } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (banner) team.banner = banner;
    if (lead !== undefined) {
      team.lead = lead || null;
      if (lead) {
        await User.findByIdAndUpdate(lead, { team: team._id });
      }
    }

    await team.save();

    if (Array.isArray(memberIds)) {
      // Assign specified members to team
      await User.updateMany({ _id: { $in: memberIds } }, { team: team._id });
    }

    const updatedTeam = await Team.findById(team._id).populate('lead', 'name email profilePhoto');
    res.json({ success: true, team: updatedTeam });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin)
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Unassign team from users
    await User.updateMany({ team: team._id }, { team: null });
    await team.deleteOne();

    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam
};
