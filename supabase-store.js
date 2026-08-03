(function defineBarMartiriStore() {
  'use strict';

  const PRODUCTS_KEY = 'barMartiri.products.v1';
  const config = window.BAR_MARTIRI_SUPABASE || {};
  const menuData = window.BAR_MARTIRI_MENU || { products: [] };
  const isConfigured = Boolean(
    config.url &&
      config.publishableKey &&
      window.supabase?.createClient
  );
  const client = isConfigured
    ? window.supabase.createClient(config.url, config.publishableKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

  function normalizeProduct(product, index = 0) {
    return {
      id: String(product.id || `product-${Date.now()}-${index}`),
      name: String(product.name || '').slice(0, 80),
      category: String(product.category || ''),
      description: String(product.description || '').slice(0, 240),
      price:
        product.price === null || product.price === undefined
          ? ''
          : String(product.price),
      image: String(product.image || ''),
      sortOrder: Number(product.sort_order ?? product.sortOrder ?? index),
    };
  }

  function loadLocalProducts() {
    try {
      const stored = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
      return Array.isArray(stored)
        ? stored.map(normalizeProduct)
        : menuData.products.map(normalizeProduct);
    } catch {
      return menuData.products.map(normalizeProduct);
    }
  }

  function saveLocalProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }

  function toDatabaseProduct(product, index = 0) {
    const normalized = normalizeProduct(product, index);
    const numericPrice =
      normalized.price.trim() === '' ? null : Number(normalized.price);

    return {
      id: normalized.id,
      name: normalized.name,
      category: normalized.category,
      description: normalized.description,
      price: Number.isFinite(numericPrice) ? numericPrice : null,
      image: normalized.image,
      sort_order: normalized.sortOrder,
      updated_at: new Date().toISOString(),
    };
  }

  async function listProducts() {
    if (!client) return loadLocalProducts();

    const { data, error } = await client
      .from('products')
      .select('id,name,category,description,price,image,sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(normalizeProduct);
  }

  async function saveProduct(product) {
    const normalized = normalizeProduct(product);
    if (!client) {
      const products = loadLocalProducts();
      const index = products.findIndex((item) => item.id === normalized.id);
      if (index >= 0) products[index] = normalized;
      else products.unshift(normalized);
      saveLocalProducts(products);
      return normalized;
    }

    const { data, error } = await client
      .from('products')
      .upsert(toDatabaseProduct(normalized), { onConflict: 'id' })
      .select('id,name,category,description,price,image,sort_order')
      .single();

    if (error) throw error;
    return normalizeProduct(data);
  }

  async function deleteProduct(id) {
    if (!client) {
      saveLocalProducts(loadLocalProducts().filter((product) => product.id !== id));
      return;
    }

    const { error } = await client.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  async function replaceProducts(products) {
    const normalized = products.map(normalizeProduct);
    if (!client) {
      saveLocalProducts(normalized);
      return normalized;
    }

    const { error: deleteError } = await client
      .from('products')
      .delete()
      .neq('id', '');
    if (deleteError) throw deleteError;

    if (normalized.length) {
      const { error: insertError } = await client
        .from('products')
        .insert(normalized.map(toDatabaseProduct));
      if (insertError) throw insertError;
    }

    return normalized;
  }

  async function uploadImage(file, originalName = 'product.webp') {
    if (!client) return '';

    const extension = String(originalName).split('.').pop()?.toLowerCase() || 'webp';
    const safeExtension = ['png', 'jpg', 'jpeg', 'webp'].includes(extension)
      ? extension
      : 'webp';
    const uniqueId =
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const path = `${uniqueId}.${safeExtension}`;
    const bucket = config.imageBucket || 'product-images';
    const { error } = await client.storage.from(bucket).upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type || 'image/webp',
      upsert: false,
    });

    if (error) throw error;
    return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function signIn(password) {
    if (!client) return { error: null };
    return client.auth.signInWithPassword({
      email: config.adminEmail,
      password,
    });
  }

  async function getSession() {
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  window.BAR_MARTIRI_STORE = Object.freeze({
    isRemote: () => Boolean(client),
    listProducts,
    saveProduct,
    deleteProduct,
    replaceProducts,
    uploadImage,
    signIn,
    getSession,
    signOut,
  });
})();
