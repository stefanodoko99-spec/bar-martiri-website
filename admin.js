(function startAdmin() {
  'use strict';

  const SESSION_KEY = 'barMartiri.adminSession.v1';
  const FIXED_AUTH = Object.freeze({
    salt: 'MzrnCzBtHkehrdhCb9gt4A==',
    hash: '2tHUgjFh/Au5Zm/lzdyVyNHmOVYI56QahH1AdVaL9f4=',
    iterations: 30000,
  });
  const menuData = window.BAR_MARTIRI_MENU || { categories: [], products: [] };
  const store = window.BAR_MARTIRI_STORE;

  const authShell = document.querySelector('[data-auth-shell]');
  const loginView = document.querySelector('[data-login-view]');
  const adminApp = document.querySelector('[data-admin-app]');
  const loginForm = document.querySelector('[data-login-form]');
  const productForm = document.querySelector('[data-product-form]');
  const productList = document.querySelector('[data-admin-product-list]');
  const productCount = document.querySelector('[data-product-count]');
  const categorySelect = document.querySelector('[data-category-select]');
  const editorTitle = document.querySelector('[data-editor-title]');
  const deleteButton = document.querySelector('[data-delete-product]');
  const imageInput = document.querySelector('[data-image-input]');
  const dropZone = document.querySelector('[data-drop-zone]');
  const imagePreview = document.querySelector('[data-image-preview]');
  const dropCopy = document.querySelector('[data-drop-copy]');
  const productError = document.querySelector('[data-product-error]');
  const storageStatus = document.querySelector('[data-storage-status]');
  const storageNotice = document.querySelector('[data-storage-notice]');
  let products = [...menuData.products];
  let currentImage = '';
  let pendingImage = null;

  function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  }

  function base64ToBytes(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  async function derivePassword(password, salt, iterations = FIXED_AUTH.iterations) {
    if (window.crypto?.subtle) {
      const material = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
      );
      const bits = await window.crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
        material,
        256
      );
      return bytesToBase64(new Uint8Array(bits));
    }

    if (!window.CryptoJS) throw new Error('PBKDF2 fallback is unavailable.');
    const saltWords = window.CryptoJS.lib.WordArray.create(salt);
    return window.CryptoJS.PBKDF2(password, saltWords, {
      keySize: 256 / 32,
      iterations,
      hasher: window.CryptoJS.algo.SHA256,
    }).toString(window.CryptoJS.enc.Base64);
  }

  function getAuth() {
    return FIXED_AUTH;
  }

  function showAuthView() {
    authShell.hidden = false;
    adminApp.hidden = true;
    loginView.hidden = false;
    loginView.querySelector('input[name="password"]')?.focus();
  }

  async function showAdmin() {
    sessionStorage.setItem(SESSION_KEY, 'active');
    authShell.hidden = true;
    adminApp.hidden = false;
    renderProducts();
    resetEditor();
    try {
      products = await store.listProducts();
      renderProducts();
    } catch {
      productError.textContent = 'Produktet nuk mund te ngarkohen nga Supabase.';
    }
  }

  function setError(element, message) {
    if (element) element.textContent = message;
  }

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = String(new FormData(loginForm).get('password') || '');
    const error = document.querySelector('[data-login-error]');

    if (store?.isRemote()) {
      try {
        const { error: loginError } = await store.signIn(password);
        if (loginError) throw loginError;
        loginForm.reset();
        setError(error, '');
        await showAdmin();
      } catch {
        setError(error, 'Fjalekalimi nuk eshte i sakte.');
      }
      return;
    }

    const auth = getAuth();
    let attempt = '';
    try {
      attempt = await derivePassword(
        password,
        base64ToBytes(auth.salt),
        auth.iterations
      );
    } catch {
      setError(error, 'Fjalekalimi nuk mund te verifikohet ne kete shfletues.');
      return;
    }
    if (attempt !== auth.hash) {
      setError(error, 'Fjalekalimi nuk eshte i sakte.');
      return;
    }

    loginForm.reset();
    setError(error, '');
    await showAdmin();
  });

  function renderCategoryOptions() {
    if (!categorySelect) return;
    categorySelect.replaceChildren();
    menuData.categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.label;
      categorySelect.append(option);
    });
  }

  function categoryLabel(categoryId) {
    return menuData.categories.find((category) => category.id === categoryId)?.label || categoryId;
  }

  function formatPrice(price) {
    return String(price || '').trim() ? `${price} ALL` : 'Pa cmim';
  }

  function renderProducts() {
    if (!productList) return;
    productList.replaceChildren();
    productCount.textContent = String(products.length);

    if (!products.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-list';
      empty.textContent = 'Nuk ka ende produkte.';
      productList.append(empty);
      return;
    }

    products.forEach((product) => {
      const row = document.createElement('button');
      row.className = 'admin-product-row';
      row.type = 'button';
      row.dataset.productId = product.id;

      const image = document.createElement('img');
      image.src = product.image || 'assets/icecream-gallery/ice-cream-cone-transparent.png';
      image.alt = '';

      const details = document.createElement('span');
      const name = document.createElement('strong');
      const category = document.createElement('small');
      name.textContent = product.name || 'Pa emer';
      category.textContent = categoryLabel(product.category);
      details.append(name, category);

      const price = document.createElement('span');
      price.textContent = formatPrice(product.price);
      row.append(image, details, price);
      row.addEventListener('click', () => editProduct(product.id));
      productList.append(row);
    });
  }

  function showImage(source, alt = '') {
    currentImage = source || '';
    imagePreview.src = currentImage;
    imagePreview.alt = alt;
    imagePreview.hidden = !currentImage;
    dropCopy.hidden = Boolean(currentImage);
  }

  function resetEditor() {
    productForm?.reset();
    pendingImage = null;
    if (productForm?.elements.category && menuData.categories[0]) {
      productForm.elements.category.value = menuData.categories[0].id;
    }
    if (productForm?.elements.id) productForm.elements.id.value = '';
    editorTitle.textContent = 'Shto produkt';
    deleteButton.hidden = true;
    productError.textContent = '';
    showImage('');
    document.querySelectorAll('.admin-product-row').forEach((row) => row.classList.remove('is-selected'));
  }

  function editProduct(id) {
    const product = products.find((item) => item.id === id);
    if (!product || !productForm) return;

    pendingImage = null;
    productForm.elements.id.value = product.id;
    productForm.elements.name.value = product.name || '';
    productForm.elements.category.value = product.category || menuData.categories[0]?.id || '';
    productForm.elements.price.value = product.price || '';
    productForm.elements.description.value = product.description || '';
    editorTitle.textContent = 'Ndrysho produktin';
    deleteButton.hidden = false;
    productError.textContent = '';
    showImage(product.image, product.name);

    document.querySelectorAll('.admin-product-row').forEach((row) => {
      row.classList.toggle('is-selected', row.dataset.productId === id);
    });
    if (window.matchMedia('(max-width: 1050px)').matches) {
      document.querySelector('.product-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function createId() {
    return window.crypto?.randomUUID?.() || `product-${Date.now()}`;
  }

  productForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(productForm);
    const id = String(data.get('id') || '');
    const existingProduct = products.find((item) => item.id === id);
    const product = {
      id: id || createId(),
      name: String(data.get('name') || '').trim(),
      category: String(data.get('category') || ''),
      price: String(data.get('price') || '').trim(),
      description: String(data.get('description') || '').trim(),
      image: currentImage,
      sortOrder: existingProduct?.sortOrder ?? products.length,
    };

    if (!product.name || !product.category) {
      productError.textContent = 'Emri dhe kategoria jane te detyrueshme.';
      return;
    }

    const submitButton = productForm.querySelector('button[type="submit"]');
    try {
      submitButton.disabled = true;
      if (pendingImage && store.isRemote()) {
        product.image = await store.uploadImage(pendingImage.blob, pendingImage.name);
      }
      const savedProduct = await store.saveProduct(product);
      const existingIndex = products.findIndex((item) => item.id === savedProduct.id);
      if (existingIndex >= 0) products[existingIndex] = savedProduct;
      else products.unshift(savedProduct);
      renderProducts();
      resetEditor();
    } catch (error) {
      productError.textContent =
        error.message || 'Produkti nuk mund te ruhet.';
    } finally {
      submitButton.disabled = false;
    }
  });

  deleteButton?.addEventListener('click', async () => {
    const id = productForm?.elements.id.value;
    const product = products.find((item) => item.id === id);
    if (!product) return;
    if (!window.confirm(`Te fshihet "${product.name}"?`)) return;
    try {
      deleteButton.disabled = true;
      await store.deleteProduct(id);
      products = products.filter((item) => item.id !== id);
      renderProducts();
      resetEditor();
    } catch (error) {
      productError.textContent = error.message || 'Produkti nuk mund te fshihet.';
    } finally {
      deleteButton.disabled = false;
    }
  });

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(String(reader.result || '')));
      reader.addEventListener('error', () => reject(reader.error));
      reader.readAsDataURL(blob);
    });
  }

  async function compressImage(file) {
    if (!file.type.startsWith('image/')) throw new Error('Zgjidh nje skedar fotografie.');
    if (file.size > 8 * 1024 * 1024) throw new Error('Fotoja duhet te jete me e vogel se 8 MB.');

    const bitmap = await createImageBitmap(file);
    const maxSide = 1400;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.82)
    );
    if (!blob) throw new Error('Fotoja nuk mund te kompresohet.');
    return {
      blob,
      dataUrl: await blobToDataUrl(blob),
    };
  }

  async function handleImage(file) {
    if (!file) return;
    try {
      productError.textContent = '';
      const compressed = await compressImage(file);
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'product';
      pendingImage = {
        blob: compressed.blob,
        name: `${baseName}.webp`,
      };
      showImage(compressed.dataUrl, 'Pamja e fotos se produktit');
    } catch (error) {
      productError.textContent = error.message || 'Fotoja nuk mund te lexohet.';
    }
  }

  imageInput?.addEventListener('change', () => handleImage(imageInput.files?.[0]));

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add('is-dragging');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove('is-dragging');
    });
  });

  dropZone?.addEventListener('drop', (event) => handleImage(event.dataTransfer?.files?.[0]));

  document.querySelector('[data-new-product]')?.addEventListener('click', () => {
    resetEditor();
    document.querySelector('.product-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    productForm?.elements.name.focus();
  });
  document.querySelector('[data-cancel-edit]')?.addEventListener('click', resetEditor);

  document.querySelector('[data-export]')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bar-martiri-menu-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });

  document.querySelector('[data-import]')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported)) throw new Error();
      products = imported
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          id: String(item.id || createId()),
          name: String(item.name || '').slice(0, 80),
          category: String(item.category || menuData.categories[0]?.id || ''),
          description: String(item.description || '').slice(0, 240),
          price: String(item.price || ''),
          image: String(item.image || ''),
        }))
        .filter((item) => item.name);
      products = await store.replaceProducts(products);
      renderProducts();
      resetEditor();
    } catch {
      window.alert('Skedari JSON nuk eshte i vlefshem.');
    } finally {
      event.target.value = '';
    }
  });

  document.querySelector('[data-logout]')?.addEventListener('click', async () => {
    try {
      await store.signOut();
    } catch {
      // The local session is still cleared below.
    }
    sessionStorage.removeItem(SESSION_KEY);
    showAuthView();
  });

  async function initializeAdmin() {
    renderCategoryOptions();
    if (store?.isRemote()) {
      if (storageStatus) {
        storageStatus.lastChild.textContent = ' Supabase online';
      }
      if (storageNotice) {
        storageNotice.querySelector('strong').textContent = 'Sinkronizim online';
        storageNotice.querySelector('p').textContent =
          'Ndryshimet ruhen ne Supabase dhe shfaqen ne te gjitha pajisjet.';
      }
      try {
        const session = await store.getSession();
        if (session) await showAdmin();
        else showAuthView();
      } catch {
        showAuthView();
      }
      return;
    }

    if (sessionStorage.getItem(SESSION_KEY) === 'active' && getAuth()) {
      await showAdmin();
    } else {
      showAuthView();
    }
  }

  void initializeAdmin();
})();
