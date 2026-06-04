import { Shop } from '../models/shop.model.js';
import { User } from '../models/user.model.js';

export async function getPlatformStoreShop() {
  let shop = await Shop.findOne({ name: 'Platform Store' }).populate('owner', 'name email imageUrl role');

  if (shop) {
    return shop;
  }

  const adminUser = await User.findOne({ email: 'magtangob65@gmail.com' });
  if (!adminUser) {
    return null;
  }

  shop = await Shop.create({
    name: 'Platform Store',
    description: 'Default marketplace shop for existing products',
    owner: adminUser._id,
  });
  return shop.populate('owner', 'name email imageUrl role');
}
