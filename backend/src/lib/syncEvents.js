import { inngest } from '../config/inngest.js';
import { emitRealtime } from './realtime.js';
import { serializeOrder, serializeProduct } from './serializers.js';

export async function publishCatalogChange(action, productDoc) {
  const product = serializeProduct(productDoc);
  if (!product) return;

  const payload = {
    entity: 'product',
    action,
    data: product,
    at: new Date().toISOString(),
  };

  emitRealtime('products', 'catalog:product', payload);

  try {
    await inngest.send({
      name: 'catalog/product.changed',
      data: payload,
    });
  } catch (error) {
    console.error('Failed to publish catalog/product.changed event:', error);
  }
}

export async function publishOrderChange(action, orderDoc) {
  const order = serializeOrder(orderDoc);
  if (!order) return;

  const payload = {
    entity: 'order',
    action,
    data: order,
    at: new Date().toISOString(),
  };

  emitRealtime('orders', 'orders:changed', payload);

  try {
    await inngest.send({
      name: 'orders/status.changed',
      data: payload,
    });
  } catch (error) {
    console.error('Failed to publish orders/status.changed event:', error);
  }
}
