// Utility kept for manual use if needed — auto-generation is in Application model pre-save hook
const generateAppId = (count) => {
  const year = new Date().getFullYear();
  return `CX-${year}-${String(count + 1).padStart(5, '0')}`;
};

module.exports = generateAppId;
