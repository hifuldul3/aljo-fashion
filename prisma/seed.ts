import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AL-JO Fashion database...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'AL-JO Store Manager',
      email: 'admin@aljo.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'user@aljo.com',
      passwordHash: userPasswordHash,
      role: 'CUSTOMER',
      phone: '+91 91234 56789',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      addresses: {
        create: [
          {
            label: 'Home',
            fullName: 'Aarav Sharma',
            phone: '+91 91234 56789',
            addressLine1: 'Flat 402, Royal Residency, Bandra West',
            addressLine2: 'Near Promenade',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            country: 'India',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('Users created:', { admin: adminUser.email, customer: customerUser.email });

  // 2. Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Men',
        slug: 'men',
        description: 'Bespoke suits, luxury shirts, designer jackets and essential trousers for men.',
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Women',
        slug: 'women',
        description: 'Haute couture gowns, silk dresses, designer coats and elegant western wear.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Kids',
        slug: 'kids',
        description: 'Premium, comfortable and stylish luxury kidswear collection.',
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Handcrafted leather belts, luxury bags, sunglasses and signature jewelry.',
        image: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=800&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1600&q=80',
      },
    }),
  ]);

  const menCategory = categories[0];
  const womenCategory = categories[1];
  const kidsCategory = categories[2];
  const accessoriesCategory = categories[3];

  // 3. Create Products & Variants
  const productsData = [
    {
      name: 'Royal Onyx Velvet Tuxedo',
      slug: 'royal-onyx-velvet-tuxedo',
      description: 'Handcrafted from pure Italian velvet with satin lapels. Tailored for unforgettable gala evenings.',
      price: 18999,
      discountPrice: 15499,
      categoryId: menCategory.id,
      subcategory: 'Suits & Tuxedos',
      gender: 'MEN',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      SKU: 'ALJO-M-TUX01',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=80',
      ]),
      specifications: JSON.stringify({ Fabric: '100% Italian Cotton Velvet', Lining: 'Silk Satin', Fit: 'Slim Tailored', Care: 'Dry Clean Only' }),
      variants: [
        { size: 'M', color: 'Onyx Black', colorHex: '#0f0f0f', stock: 8, SKU: 'ALJO-M-TUX01-M-BLK' },
        { size: 'L', color: 'Onyx Black', colorHex: '#0f0f0f', stock: 12, SKU: 'ALJO-M-TUX01-L-BLK' },
        { size: 'XL', color: 'Onyx Black', colorHex: '#0f0f0f', stock: 5, SKU: 'ALJO-M-TUX01-XL-BLK' },
        { size: 'L', color: 'Midnight Navy', colorHex: '#14213d', stock: 6, SKU: 'ALJO-M-TUX01-L-NVY' },
      ],
    },
    {
      name: 'Ivory Cream Silk Evening Gown',
      slug: 'ivory-cream-silk-evening-gown',
      description: 'Fluid mulberry silk dress featuring a dramatic floor-length drape, open back, and delicate gold waist accent.',
      price: 24999,
      discountPrice: 19999,
      categoryId: womenCategory.id,
      subcategory: 'Dresses',
      gender: 'WOMEN',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      SKU: 'ALJO-W-GWN01',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
      ]),
      specifications: JSON.stringify({ Fabric: '100% Pure Mulberry Silk', Hemline: 'Floor-Length', Details: 'Hidden Zip Closure', Care: 'Professional Silk Clean' }),
      variants: [
        { size: 'S', color: 'Ivory Cream', colorHex: '#fdfbf7', stock: 5, SKU: 'ALJO-W-GWN01-S-CRM' },
        { size: 'M', color: 'Ivory Cream', colorHex: '#fdfbf7', stock: 9, SKU: 'ALJO-W-GWN01-M-CRM' },
        { size: 'L', color: 'Champagne Gold', colorHex: '#d4af37', stock: 4, SKU: 'ALJO-W-GWN01-L-GLD' },
      ],
    },
    {
      name: 'Bespoke Double-Breasted Linen Blazer',
      slug: 'bespoke-double-breasted-linen-blazer',
      description: 'Lightweight French flax linen blazer with custom horn buttons. Perfectly structured yet comfortably breathable.',
      price: 11499,
      discountPrice: 8999,
      categoryId: menCategory.id,
      subcategory: 'Blazers',
      gender: 'MEN',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      SKU: 'ALJO-M-BLZ02',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=80',
      ]),
      specifications: JSON.stringify({ Material: '100% French Flax Linen', Pockets: 'Patch Pockets', Vent: 'Double Rear Vents' }),
      variants: [
        { size: 'M', color: 'Royal Beige', colorHex: '#f5f0e6', stock: 14, SKU: 'ALJO-M-BLZ02-M-BGE' },
        { size: 'L', color: 'Royal Beige', colorHex: '#f5f0e6', stock: 10, SKU: 'ALJO-M-BLZ02-L-BGE' },
        { size: 'XL', color: 'Classic Sand', colorHex: '#e6dad0', stock: 3, SKU: 'ALJO-M-BLZ02-XL-SND' },
      ],
    },
    {
      name: 'Heritage Gold Monogram Leather Tote',
      slug: 'heritage-gold-monogram-leather-tote',
      description: 'Hand-burnished full-grain Italian leather bag with signature AL-JO 24K gold plated lock.',
      price: 14999,
      discountPrice: 12999,
      categoryId: accessoriesCategory.id,
      subcategory: 'Bags',
      gender: 'UNISEX',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      SKU: 'ALJO-A-BAG01',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      ]),
      specifications: JSON.stringify({ Leather: 'Full-Grain Tuscan Calfskin', Hardware: '24K Gold Plated Brass', Dimensions: '38 x 28 x 14 cm' }),
      variants: [
        { size: 'Free Size', color: 'Cognac Brown', colorHex: '#8b4513', stock: 15, SKU: 'ALJO-A-BAG01-BRN' },
        { size: 'Free Size', color: 'Onyx Black', colorHex: '#121212', stock: 8, SKU: 'ALJO-A-BAG01-BLK' },
      ],
    },
    {
      name: 'Elysian Cashmere Knit Sweater',
      slug: 'elysian-cashmere-knit-sweater',
      description: 'Ultra-soft 100% Mongolian cashmere crewneck sweater in an effortless relaxed drape.',
      price: 9999,
      discountPrice: 7999,
      categoryId: womenCategory.id,
      subcategory: 'Knitwear',
      gender: 'WOMEN',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      SKU: 'ALJO-W-KNIT02',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
      ]),
      specifications: JSON.stringify({ Material: '100% Grade-A Mongolian Cashmere', Gauge: '12 GG Fine Knit', Care: 'Hand Wash Cold' }),
      variants: [
        { size: 'S', color: 'Almond Beige', colorHex: '#efdecd', stock: 12, SKU: 'ALJO-W-KNIT02-S-BGE' },
        { size: 'M', color: 'Almond Beige', colorHex: '#efdecd', stock: 18, SKU: 'ALJO-W-KNIT02-M-BGE' },
        { size: 'L', color: 'Heather Grey', colorHex: '#808080', stock: 2, SKU: 'ALJO-W-KNIT02-L-GRY' }, // Low stock sample
      ],
    },
    {
      name: 'Junior Royalty Velvet Blazer Set',
      slug: 'junior-royalty-velvet-blazer-set',
      description: 'Matching luxury blazer and trousers tailored for festive and birthday celebrations.',
      price: 6999,
      discountPrice: 5499,
      categoryId: kidsCategory.id,
      subcategory: 'Partywear',
      gender: 'KIDS',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
      SKU: 'ALJO-K-SET01',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80',
      ]),
      specifications: JSON.stringify({ Lining: 'Hypoallergenic Soft Cotton', Occasion: 'Weddings & Celebrations', Includes: 'Blazer + Pants' }),
      variants: [
        { size: '4-5Y', color: 'Royal Navy', colorHex: '#000080', stock: 8, SKU: 'ALJO-K-SET01-45-NVY' },
        { size: '6-7Y', color: 'Royal Navy', colorHex: '#000080', stock: 10, SKU: 'ALJO-K-SET01-67-NVY' },
        { size: '8-9Y', color: 'Wine Red', colorHex: '#722f37', stock: 1, SKU: 'ALJO-K-SET01-89-RED' }, // Low stock sample
      ],
    },
    {
      name: 'Signature Egyptian Cotton Dress Shirt',
      slug: 'signature-egyptian-cotton-dress-shirt',
      description: '200s two-ply Giza Egyptian cotton with mother-of-pearl buttons and stiff French cuffs.',
      price: 5999,
      discountPrice: 4499,
      categoryId: menCategory.id,
      subcategory: 'Shirts',
      gender: 'MEN',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      SKU: 'ALJO-M-SHRT01',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
      ]),
      specifications: JSON.stringify({ Weave: 'Royal Oxford', Collar: 'Cutaway Collar', Buttons: 'Genuine Shell Buttons' }),
      variants: [
        { size: '39 (M)', color: 'Crisp White', colorHex: '#ffffff', stock: 25, SKU: 'ALJO-M-SHRT01-39-WHT' },
        { size: '40 (L)', color: 'Crisp White', colorHex: '#ffffff', stock: 30, SKU: 'ALJO-M-SHRT01-40-WHT' },
        { size: '42 (XL)', color: 'Sky Blue', colorHex: '#87ceeb', stock: 0, SKU: 'ALJO-M-SHRT01-42-BLU' }, // Out of stock sample
      ],
    },
    {
      name: 'Palais Hand-Embroidered Silk Trench',
      slug: 'palais-hand-embroidered-silk-trench',
      description: 'Statement outerwear featuring metallic thread embroidery across the lapels and belt.',
      price: 32999,
      discountPrice: 27999,
      categoryId: womenCategory.id,
      subcategory: 'Coats & Jackets',
      gender: 'WOMEN',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      SKU: 'ALJO-W-COAT01',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80',
      ]),
      specifications: JSON.stringify({ Shell: 'Heavyweight Silk Dupioni', Detail: 'Hand zardozi embroidery', Edition: 'Limited 50 Pieces' }),
      variants: [
        { size: 'S', color: 'Onyx Black & Gold', colorHex: '#000000', stock: 3, SKU: 'ALJO-W-COAT01-S-BLK' },
        { size: 'M', color: 'Onyx Black & Gold', colorHex: '#000000', stock: 4, SKU: 'ALJO-W-COAT01-M-BLK' },
      ],
    },
  ];

  for (const item of productsData) {
    const { variants, ...productInfo } = item;
    const createdProduct = await prisma.product.create({
      data: {
        ...productInfo,
        stock: variants.reduce((acc, v) => acc + v.stock, 0),
        variants: {
          create: variants,
        },
        reviews: {
          create: [
            {
              userId: customerUser.id,
              userName: 'Aarav Sharma',
              rating: 5,
              comment: 'Absolute perfection! The fit and fabric quality feel like a bespoke Milan boutique. Received endless compliments.',
            },
            {
              userId: adminUser.id,
              userName: 'Priya Mehta',
              rating: 5,
              comment: 'The gold detailing is subtle yet captivating. Worth every rupee.',
            },
          ],
        },
      },
    });
    console.log(`Product created: ${createdProduct.name}`);
  }

  // 4. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'ALJO10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 1000,
        isActive: true,
      },
      {
        code: 'WELCOME20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 2000,
        maxDiscount: 3000,
        isActive: true,
      },
      {
        code: 'ROYAL500',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderValue: 3000,
        isActive: true,
      },
    ],
  });
  console.log('Coupons created.');

  // 5. Create Banners
  await prisma.banner.createMany({
    data: [
      {
        title: "The Royal Elegance Collection '26",
        subtitle: "Bespoke Couture for Modern Connoisseurs",
        image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1920&q=80",
        linkUrl: "/shop",
        ctaText: "Shop Collection",
        position: 1,
      },
      {
        title: "Italian Silk & Pure Velvet",
        subtitle: "Uncompromising luxury hand-crafted by master tailors",
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80",
        linkUrl: "/category/women",
        ctaText: "Explore Womenswear",
        position: 2,
      },
    ],
  });
  console.log('Banners created.');

  // 6. Pre-seed Demo Orders
  const sampleProduct = await prisma.product.findFirst({ where: { slug: 'royal-onyx-velvet-tuxedo' }, include: { variants: true } });
  if (sampleProduct) {
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'ALJO-89231',
        userId: customerUser.id,
        status: 'SHIPPED',
        subtotal: 15499,
        discountAmount: 1549,
        shippingFee: 0,
        totalAmount: 13950,
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        paymentId: 'pay_Mz9821Xa0092',
        trackingNumber: 'AWB-BLR-984210',
        carrier: 'Blue Dart Express',
        shippingAddress: JSON.stringify({
          fullName: 'Aarav Sharma',
          phone: '+91 91234 56789',
          addressLine1: 'Flat 402, Royal Residency, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
        }),
        items: {
          create: [
            {
              productId: sampleProduct.id,
              variantId: sampleProduct.variants[0]?.id,
              productName: sampleProduct.name,
              productImage: JSON.parse(sampleProduct.images)[0],
              size: sampleProduct.variants[0]?.size || 'L',
              color: sampleProduct.variants[0]?.color || 'Onyx Black',
              price: 15499,
              quantity: 1,
            },
          ],
        },
      },
    });

    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'ALJO-94821',
        userId: customerUser.id,
        status: 'DELIVERED',
        subtotal: 12999,
        discountAmount: 500,
        shippingFee: 0,
        totalAmount: 12499,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        paymentId: 'upi_ref_44921094',
        trackingNumber: 'AWB-DEL-102948',
        carrier: 'Delhivery Speed',
        shippingAddress: JSON.stringify({
          fullName: 'Aarav Sharma',
          phone: '+91 91234 56789',
          addressLine1: 'Flat 402, Royal Residency, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
        }),
        items: {
          create: [
            {
              productId: sampleProduct.id,
              variantId: sampleProduct.variants[0]?.id,
              productName: 'Heritage Gold Monogram Leather Tote',
              productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
              size: 'Free Size',
              color: 'Cognac Brown',
              price: 12999,
              quantity: 1,
            },
          ],
        },
      },
    });

    console.log('Sample orders seeded:', { order1: order1.orderNumber, order2: order2.orderNumber });
  }

  console.log('Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
