(function defineMenuData() {
  const categories = [
    { id: 'icecreams', label: 'Akullore', labels: { sq: 'Akullore', it: 'Gelato', en: 'Ice Cream' } },
    { id: 'sodas', label: 'Pije Freskuese', labels: { sq: 'Pije Freskuese', it: 'Bibite', en: 'Soft Drinks' } },
    { id: 'coffee', label: 'Kafe', labels: { sq: 'Kafe', it: 'Caffè', en: 'Coffee' } },
    { id: 'beers', label: 'Birra', labels: { sq: 'Birra', it: 'Birre', en: 'Beers' } },
    { id: 'cocktails', label: 'Kokteje', labels: { sq: 'Kokteje', it: 'Cocktail', en: 'Cocktails' } },
    { id: 'alcohol', label: 'Alkol', labels: { sq: 'Alkol', it: 'Alcolici', en: 'Spirits' } },
  ];

  const products = [
    {
      id: 'vanilla-soft-serve',
      name: 'Vanilje',
      category: 'icecreams',
      description: 'Akullore e bute me shije vaniljeje dhe kaush krokant.',
      price: '',
      image: 'assets/optimized/ice-cream-cone.webp',
    },
    {
      id: 'vanilla-chocolate',
      name: 'Vanilje + cokollate',
      category: 'icecreams',
      description: 'Dy shije te bashkuara ne nje spirale.',
      price: '',
      image: 'assets/optimized/vanilla-chocolate-cone.webp',
    },
    {
      id: 'chocolate-soft-serve',
      name: 'Cokollate',
      category: 'icecreams',
      description: 'Akullore e bute me shije te plote cokollate.',
      price: '',
      image: 'assets/optimized/chocolate-cone.webp',
    },
    {
      id: 'vanilla-pink',
      name: 'Vanilje + luleshtrydhe',
      category: 'icecreams',
      description: 'Perzierje e fresket vaniljeje dhe luleshtrydheje.',
      price: '',
      image: 'assets/optimized/vanilla-pink-cone.webp',
    },
    {
      id: 'pink-soft-serve',
      name: 'Luleshtrydhe',
      category: 'icecreams',
      description: 'Akullore e bute me shije luleshtrydheje.',
      price: '',
      image: 'assets/optimized/pink-cone.webp',
    },
  ];

  window.BAR_MARTIRI_MENU = { categories, products };
})();
