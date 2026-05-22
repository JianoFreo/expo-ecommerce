import { Setting } from '../models/setting.model.js';

export async function getSettings(req, res) {
  try {
    // Return a map of settings; if missing, provide defaults
    const guestSetting = await Setting.findOne({ key: 'guestEnabled' });
    const guestEnabled = guestSetting ? Boolean(guestSetting.value) : true; // default allow guests

    res.status(200).json({ settings: { guestEnabled } });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function setGuestAccess(req, res) {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') return res.status(400).json({ message: 'enabled must be boolean' });

    const updated = await Setting.findOneAndUpdate(
      { key: 'guestEnabled' },
      { value: enabled },
      { upsert: true, new: true }
    );

    res.status(200).json({ settings: { guestEnabled: Boolean(updated.value) } });
  } catch (error) {
    console.error('Error updating guest access setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
