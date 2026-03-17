const mongoose = require('mongoose');

const websiteSettingsSchema = new mongoose.Schema({
  collegeName: { type: String, default: 'CampusNex' },
  collegeShortName: { type: String, default: 'CX' },
  address: {
    street: { type: String, default: '123 College Road' },
    city: { type: String, default: 'Surat' },
    state: { type: String, default: 'Gujarat' },
    pin: { type: String, default: '395001' },
  },
  contact: {
    phone: { type: String, default: '+91 98765 43210' },
    email: { type: String, default: 'admissions@campusnex.ac.in' },
    whatsapp: { type: String },
  },
  socialLinks: {
    facebook: { type: String, default: '#' },
    twitter: { type: String, default: '#' },
    instagram: { type: String, default: '#' },
    youtube: { type: String, default: '#' },
    linkedin: { type: String, default: '#' },
  },
  logo: { type: String }, // URL to college logo
  principal: {
    name: { type: String, default: 'Dr. Ramesh Patel' },
    designation: { type: String, default: 'Principal, CampusNex College' },
    message: { type: String, default: "Education is not just about acquiring knowledge — it's about developing the character, skills, and mindset to make a difference in the world." },
    image: { type: String, default: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face' },
  },
  aboutCollege: { type: String, default: 'Empowering education through smart campus management.' },
  affiliation: { type: String, default: 'Affiliated to VNSGU, Surat' },
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
