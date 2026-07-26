const Certificate = require('../models/Certificate');
const User = require('../models/User');

// @desc    Get certificates for current logged-in user
// @route   GET /api/certificates/my-certificates
// @access  Private
const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ recipient: req.user._id })
      .populate('issuedBy', 'name role')
      .sort({ issueDate: -1 });

    res.json({ success: true, certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all certificates (Admin)
// @route   GET /api/certificates
// @access  Private (Admin)
const getAllCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find()
      .populate('recipient', 'name email rollNumber department year team')
      .populate('issuedBy', 'name role')
      .sort({ issueDate: -1 });

    res.json({ success: true, certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / Assign certificate to member
// @route   POST /api/certificates
// @access  Private (Admin)
const createCertificate = async (req, res, next) => {
  try {
    const { title, description, recipient, fileUrl } = req.body;

    const user = await User.findById(recipient);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    const certificate = await Certificate.create({
      title,
      description: description || '',
      recipient,
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800&auto=format&fit=crop&q=80',
      issuedBy: req.user._id
    });

    const populated = await Certificate.findById(certificate._id)
      .populate('recipient', 'name email rollNumber')
      .populate('issuedBy', 'name');

    res.status(201).json({ success: true, certificate: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private (Admin)
const deleteCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    await cert.deleteOne();
    res.json({ success: true, message: 'Certificate removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCertificates,
  getAllCertificates,
  createCertificate,
  deleteCertificate
};
