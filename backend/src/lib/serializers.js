function toPlain(doc) {
  if (!doc) return null;
  return doc.toObject ? doc.toObject() : doc;
}

function toId(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return String(value._id ?? value);
}

export function serializeUserSummary(user) {
  const o = toPlain(user);
  if (!o) return null;
  return {
    _id: toId(o),
    name: o.name || '',
    email: o.email || '',
    imageUrl: o.imageUrl || o.imageURL || '',
    role: o.role,
  };
}

export function serializeShop(shop, extra = {}) {
  const o = toPlain(shop);
  if (!o) return null;
  const owner =
    o.owner && typeof o.owner === 'object'
      ? serializeUserSummary(o.owner)
      : o.owner
        ? toId(o.owner)
        : null;

  return {
    _id: toId(o),
    name: o.name,
    description: o.description || '',
    bannerImage: o.bannerImage || '',
    isActive: Boolean(o.isActive),
    owner,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    ...extra,
  };
}

export function serializeProduct(product) {
  const o = toPlain(product);
  if (!o) return null;
  const shop =
    o.shop && typeof o.shop === 'object'
      ? serializeShop(o.shop)
      : o.shop
        ? toId(o.shop)
        : null;

  return {
    _id: toId(o),
    name: o.name,
    description: o.description || '',
    price: Number(o.price),
    stock: Number(o.stock),
    category: o.category || '',
    images: Array.isArray(o.images) ? o.images : [],
    averageRating: Number(o.averageRating || 0),
    totalReviews: Number(o.totalReviews || 0),
    shop,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export function serializeOrderItem(item) {
  const o = toPlain(item);
  if (!o) return null;
  const product =
    o.product && typeof o.product === 'object'
      ? serializeProduct(o.product)
      : o.product
        ? toId(o.product)
        : null;

  return {
    _id: o._id ? toId(o) : undefined,
    product,
    name: o.name,
    price: Number(o.price),
    quantity: Number(o.quantity),
    image: o.image || '',
  };
}

export function serializeOrder(order) {
  const o = toPlain(order);
  if (!o) return null;
  const user =
    o.user && typeof o.user === 'object'
      ? serializeUserSummary(o.user)
      : o.user
        ? toId(o.user)
        : null;

  return {
    _id: toId(o),
    user,
    clerkId: o.clerkId,
    orderItems: (o.orderItems || []).map(serializeOrderItem).filter(Boolean),
    shippingAddress: o.shippingAddress,
    paymentResult: o.paymentResult || {},
    totalPrice: Number(o.totalPrice),
    status: o.status,
    hasReviewed: o.hasReviewed,
    shippedAt: o.shippedAt ?? null,
    deliveredAt: o.deliveredAt ?? null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export function serializeUser(user) {
  const o = toPlain(user);
  if (!o) return null;
  return {
    _id: toId(o),
    clerkId: o.clerkId,
    email: o.email,
    name: o.name,
    imageUrl: o.imageUrl || o.imageURL || '',
    role: o.role,
    preferredTheme: o.preferredTheme,
    isBanned: Boolean(o.isBanned),
    bannedAt: o.bannedAt ?? null,
    bannedReason: o.bannedReason,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export function productsResponse(products) {
  return { products: (products || []).map(serializeProduct).filter(Boolean) };
}

export function productResponse(product) {
  return { product: serializeProduct(product) };
}

export function ordersResponse(orders) {
  return { orders: (orders || []).map(serializeOrder).filter(Boolean) };
}

export function orderResponse(order) {
  return { order: serializeOrder(order) };
}

export function shopsResponse(shops) {
  return { shops: (shops || []).map((s) => serializeShop(s)).filter(Boolean) };
}

export function shopResponse(shop, extra = {}) {
  return { shop: serializeShop(shop, extra) };
}

export function usersResponse(users) {
  return { users: (users || []).map(serializeUser).filter(Boolean) };
}
