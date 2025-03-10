import dbConnect from '@/lib/db/connect';
import Setting from '@/lib/db/models/Setting';

/**
 * Get settings by name
 * @param {string} name - The name of the setting
 * @returns {Object|null} The setting value or null if not found
 */
export const getSettings = async (name) => {
  try {
    await dbConnect();
    const setting = await Setting.findOne({ name });
    return setting?.keyValue || null;
  } catch (error) {
    console.error(`Error fetching ${name} settings:`, error);
    return null;
  }
};

/**
 * Save settings
 * @param {string} name - The name of the setting
 * @param {Object} keyValue - The setting value
 * @returns {Object} The saved setting
 */
export const saveSettings = async (name, keyValue) => {
  try {
    await dbConnect();
    const setting = await Setting.findOneAndUpdate(
      { name },
      { name, keyValue },
      { upsert: true, new: true }
    );
    return setting;
  } catch (error) {
    console.error(`Error saving ${name} settings:`, error);
    throw error;
  }
}; 