const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Aqua B Database Seeding...');

  // 1. Business Settings
  await prisma.businessSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessName: 'Aqua B Water Station',
      tagline: 'Pure, Clean & Safe Drinking Water for Your Family',
      municipality: 'Lingayen, Pangasinan',
      address: 'Pangapisan North, Lingayen, Pangasinan',
      phone: '+63 917 888 2782 / (075) 542-1234',
      email: 'orders@aquabwater.ph',
      openingHour: '07:00 AM',
      closingHour: '07:00 PM',
      operatingDays: 'Monday to Sunday',
      gcashNumber: '0917-888-2782',
      gcashName: 'AQUA B WATER STATION',
      defaultDeliveryFee: 15.0,
      containerDepositFee: 180.0,
      announcement: 'Free delivery for orders of 5 gallons and above within Pangapisan! Same-day delivery available for orders placed before 4:00 PM.',
    },
  });

  // 2. Users (Staff)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@aquab.ph' },
    update: { password: passwordHash },
    create: {
      name: 'Super Admin Juan',
      email: 'superadmin@aquab.ph',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      phone: '09171234567',
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aquab.ph' },
    update: { password: passwordHash },
    create: {
      name: 'Maria Santos (Manager)',
      email: 'admin@aquab.ph',
      password: passwordHash,
      role: 'ADMIN',
      phone: '09181234567',
      isActive: true,
    },
  });

  const rider1 = await prisma.user.upsert({
    where: { email: 'rider1@aquab.ph' },
    update: { password: passwordHash },
    create: {
      name: 'Rico "Speedy" Morales',
      email: 'rider1@aquab.ph',
      password: passwordHash,
      role: 'RIDER',
      phone: '09191234567',
      isActive: true,
    },
  });

  const rider2 = await prisma.user.upsert({
    where: { email: 'rider2@aquab.ph' },
    update: { password: passwordHash },
    create: {
      name: 'Eduardo Dalisay',
      email: 'rider2@aquab.ph',
      password: passwordHash,
      role: 'RIDER',
      phone: '09201234567',
      isActive: true,
    },
  });

  console.log('✅ Staff users created:');
  console.log('   - superadmin@aquab.ph / Password123!');
  console.log('   - admin@aquab.ph / Password123!');
  console.log('   - rider1@aquab.ph / Password123!');
  console.log('   - rider2@aquab.ph / Password123!');

  // 3. Barangays in Lingayen, Pangasinan
  const barangaysData = [
    { name: 'Pangapisan North', deliveryFee: 10.0, estimatedDeliveryMinutes: 20 },
    { name: 'Pangapisan South', deliveryFee: 15.0, estimatedDeliveryMinutes: 25 },
    { name: 'Poblacion', deliveryFee: 15.0, estimatedDeliveryMinutes: 25 },
    { name: 'Maniboc', deliveryFee: 15.0, estimatedDeliveryMinutes: 25 },
    { name: 'Baay', deliveryFee: 20.0, estimatedDeliveryMinutes: 30 },
    { name: 'Libsong East', deliveryFee: 20.0, estimatedDeliveryMinutes: 30 },
    { name: 'Libsong West', deliveryFee: 20.0, estimatedDeliveryMinutes: 30 },
    { name: 'Domalandan Center', deliveryFee: 25.0, estimatedDeliveryMinutes: 35 },
    { name: 'Domalandan East', deliveryFee: 25.0, estimatedDeliveryMinutes: 35 },
    { name: 'Domalandan West', deliveryFee: 25.0, estimatedDeliveryMinutes: 35 },
    { name: 'Estanza', deliveryFee: 25.0, estimatedDeliveryMinutes: 35 },
    { name: 'Sabangan', deliveryFee: 20.0, estimatedDeliveryMinutes: 30 },
  ];

  const barangayMap = {};
  for (const b of barangaysData) {
    const barangay = await prisma.barangay.upsert({
      where: { name: b.name },
      update: { deliveryFee: b.deliveryFee, estimatedDeliveryMinutes: b.estimatedDeliveryMinutes, municipality: 'Lingayen, Pangasinan' },
      create: {
        name: b.name,
        municipality: 'Lingayen, Pangasinan',
        deliveryFee: b.deliveryFee,
        estimatedDeliveryMinutes: b.estimatedDeliveryMinutes,
        isActive: true,
      },
    });
    barangayMap[b.name] = barangay;
  }
  console.log(`✅ ${barangaysData.length} Barangays seeded`);

  // 4. Categories
  const categoriesData = [
    { name: 'Round Gallons', slug: 'round-gallons', description: 'Standard 5-gallon reusable containers for water dispensers', displayOrder: 1 },
    { name: 'Square Gallons', slug: 'square-gallons', description: 'Slim and space-saving gallon containers with built-in tap faucet', displayOrder: 2 },
    { name: '10 Liter Containers', slug: '10-liter-containers', description: 'Medium capacity compact containers ideal for condos and small families', displayOrder: 3 },
    { name: '5 Liter Containers', slug: '5-liter-containers', description: 'Handy grab-and-go sealed containers with sturdy carrying handles', displayOrder: 4 },
    { name: 'Bottled Water Packs', slug: 'bottled-water-packs', description: 'Convenient multi-packs of sealed bottles for events, trips, and schools', displayOrder: 5 },
    { name: 'Water Accessories', slug: 'water-accessories', description: 'High quality manual pumps, faucet valves, and dispenser stands', displayOrder: 6 },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    const cat = await prisma.productCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, displayOrder: c.displayOrder },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        displayOrder: c.displayOrder,
        isActive: true,
      },
    });
    catMap[c.slug] = cat;
  }
  console.log(`✅ ${categoriesData.length} Product categories seeded`);

  // 5. Products (3 Essential Water Products)
  const productsData = [
    {
      name: 'Purified Water — Round Gallon',
      slug: 'purified-water-round-gallon',
      description: '16-stage purified water with reverse osmosis and UV sterilization. Compatible with standard water dispensers.',
      categoryId: catMap['round-gallons'].id,
      waterType: 'Purified Water',
      containerType: 'Round Gallon (Dispenser compatible)',
      capacity: '18.9 Liters (5 Gallons)',
      price: 35.0,
      supportsExchange: true,
      newContainerFee: 180.0,
      imageUrl: '/images/products/round-gallon.jpg',
      stock: 150,
      minStockAlert: 20,
      isFeatured: true,
    },
    {
      name: 'Purified Water — Slim Square Gallon',
      slug: 'purified-water-square-gallon',
      description: 'Slim space-saving container with built-in leak-free spigot faucet. Perfect for refrigerators and kitchen counters.',
      categoryId: catMap['square-gallons'].id,
      waterType: 'Purified Water',
      containerType: 'Square Gallon with Spigot',
      capacity: '18.9 Liters (5 Gallons)',
      price: 40.0,
      supportsExchange: true,
      newContainerFee: 200.0,
      imageUrl: '/images/products/square-gallon.jpg',
      stock: 80,
      minStockAlert: 15,
      isFeatured: true,
    },
    {
      name: 'Purified Water — Small Square Gallon',
      slug: 'alkaline-water-round-gallon',
      description: 'Compact square gallon with tap faucet. Easy to carry and ideal for small families or compact spaces.',
      categoryId: catMap['square-gallons'].id,
      waterType: 'Purified Water',
      containerType: 'Small Square Gallon with Tap',
      capacity: '10 Liters',
      price: 30.0,
      supportsExchange: true,
      newContainerFee: 150.0,
      imageUrl: '/images/products/small-square-gallon.jpg',
      stock: 60,
      minStockAlert: 10,
      isFeatured: true,
    },
  ];

  const productMap = {};
  for (const p of productsData) {
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        price: p.price,
        stock: p.stock,
        supportsExchange: p.supportsExchange,
        newContainerFee: p.newContainerFee,
      },
      create: p,
    });
    productMap[p.slug] = prod;

    // Seed initial inventory transaction
    await prisma.inventoryTransaction.create({
      data: {
        productId: prod.id,
        type: 'STOCK_IN',
        quantity: prod.stock,
        previousStock: 0,
        newStock: prod.stock,
        reason: 'Initial business stock intake',
        performedById: superAdmin.id,
      },
    });
  }
  console.log(`✅ ${productsData.length} Products and initial inventory logs seeded`);

  // 6. Sample Live Orders to demonstrate full workflow
  // Order 1: Delivered
  const order1 = await prisma.order.upsert({
    where: { orderNumber: 'AQB-20261031-1001' },
    update: {},
    create: {
      orderNumber: 'AQB-20261031-1001',
      customerName: 'Rosario Bautista',
      customerPhone: '09175551234',
      deliveryAddress: 'Sitio Centro, Pangapisan North, Lingayen',
      barangayId: barangayMap['Pangapisan North'].id,
      barangayName: 'Pangapisan North',
      landmarkOrNotes: 'Near Pangapisan Elementary School',
      deliveryMethod: 'DELIVERY',
      deliveryDate: '2026-10-31',
      deliveryTimeSlot: '10:00 AM - 12:00 PM',
      deliveryFee: 15.0,
      subtotal: 105.0,
      totalAmount: 120.0,
      status: 'DELIVERED',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PAID',
      exchangeGallonsCount: 3,
      newGallonsCount: 0,
      items: {
        create: [
          {
            productId: productMap['purified-water-round-gallon'].id,
            productName: 'Purified Water — Round Gallon',
            waterType: 'Purified Water',
            containerType: 'Round Gallon',
            capacity: '18.9L (5 Gallons)',
            price: 35.0,
            isExchange: true,
            containerFee: 0.0,
            quantity: 3,
            subtotal: 105.0,
          },
        ],
      },
      assignments: {
        create: [
          {
            riderId: rider1.id,
            status: 'DELIVERED',
            assignedAt: new Date(Date.now() - 3600000 * 3),
            acceptedAt: new Date(Date.now() - 3600000 * 2.5),
            deliveredAt: new Date(Date.now() - 3600000 * 1.5),
            cashCollected: 120.0,
            deliveryNotes: 'Delivered to Mrs. Bautista, 3 empty gallons collected.',
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', notes: 'Order placed by customer', changedByName: 'Customer' },
          { status: 'CONFIRMED', notes: 'Confirmed by station admin', changedById: admin.id, changedByName: admin.name },
          { status: 'READY_FOR_DELIVERY', notes: '3 gallons sanitized and prepared', changedById: admin.id, changedByName: admin.name },
          { status: 'ASSIGNED', notes: 'Assigned to Rico Morales', changedById: admin.id, changedByName: admin.name },
          { status: 'OUT_FOR_DELIVERY', notes: 'Rider is on the way', changedById: rider1.id, changedByName: rider1.name },
          { status: 'DELIVERED', notes: 'Completed delivery and cash collected', changedById: rider1.id, changedByName: rider1.name },
        ],
      },
      payments: {
        create: [
          {
            amount: 120.0,
            method: 'CASH_ON_DELIVERY',
            status: 'PAID',
            notes: 'Cash received upon delivery by Rider Rico',
            collectedById: rider1.id,
          },
        ],
      },
    },
  });

  // Order 2: Out for Delivery
  const order2 = await prisma.order.upsert({
    where: { orderNumber: 'AQB-20261031-1002' },
    update: {},
    create: {
      orderNumber: 'AQB-20261031-1002',
      customerName: 'Carlos Mendoza',
      customerPhone: '09185559876',
      deliveryAddress: 'Beach Road, Brgy. Maniboc, Lingayen',
      barangayId: barangayMap['Maniboc'].id,
      barangayName: 'Maniboc',
      landmarkOrNotes: 'Please call before arriving, blue house near resort',
      deliveryMethod: 'DELIVERY',
      deliveryDate: '2026-10-31',
      deliveryTimeSlot: '01:00 PM - 03:00 PM',
      deliveryFee: 25.0,
      subtotal: 295.0,
      totalAmount: 320.0,
      status: 'OUT_FOR_DELIVERY',
      paymentMethod: 'GCASH',
      paymentStatus: 'PAID',
      gcashReference: 'GC-9823419082',
      exchangeGallonsCount: 1,
      newGallonsCount: 1,
      items: {
        create: [
          {
            productId: productMap['alkaline-water-round-gallon'].id,
            productName: 'Alkaline Water — Round Gallon',
            waterType: 'Alkaline Water (pH 9.5)',
            containerType: 'Round Gallon',
            capacity: '18.9L (5 Gallons)',
            price: 55.0,
            isExchange: true,
            containerFee: 0.0,
            quantity: 1,
            subtotal: 55.0,
          },
          {
            productId: productMap['purified-water-square-gallon'].id,
            productName: 'Purified Water — Slim Square Gallon with Tap',
            waterType: 'Purified Water',
            containerType: 'Square Gallon with Spigot',
            capacity: '18.9L (5 Gallons)',
            price: 40.0,
            isExchange: false,
            containerFee: 200.0,
            quantity: 1,
            subtotal: 240.0,
          },
        ],
      },
      assignments: {
        create: [
          {
            riderId: rider1.id,
            status: 'OUT_FOR_DELIVERY',
            assignedAt: new Date(Date.now() - 3600000),
            acceptedAt: new Date(Date.now() - 1800000),
            deliveryNotes: 'Rider departed station with 1 exchange alkaline and 1 new square gallon.',
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', notes: 'Order placed by customer via GCash', changedByName: 'Customer' },
          { status: 'CONFIRMED', notes: 'GCash payment verified (GC-9823419082)', changedById: admin.id, changedByName: admin.name },
          { status: 'PREPARING', notes: 'Filling alkaline gallon & inspecting square gallon', changedById: admin.id, changedByName: admin.name },
          { status: 'READY_FOR_DELIVERY', notes: 'Ready for rider pickup', changedById: admin.id, changedByName: admin.name },
          { status: 'ASSIGNED', notes: 'Assigned to Rico Morales', changedById: admin.id, changedByName: admin.name },
          { status: 'OUT_FOR_DELIVERY', notes: 'Rider is on the way to Maniboc', changedById: rider1.id, changedByName: rider1.name },
        ],
      },
      payments: {
        create: [
          {
            amount: 320.0,
            method: 'GCASH',
            status: 'PAID',
            referenceNumber: 'GC-9823419082',
            notes: 'Verified via station GCash App',
            collectedById: admin.id,
          },
        ],
      },
    },
  });

  // Order 3: Pending Confirmation
  const order3 = await prisma.order.upsert({
    where: { orderNumber: 'AQB-20261031-1003' },
    update: {},
    create: {
      orderNumber: 'AQB-20261031-1003',
      customerName: 'Atty. Fernando Reyes',
      customerPhone: '09228884321',
      deliveryAddress: 'Avenida Rizal East, Brgy. Poblacion, Lingayen',
      barangayId: barangayMap['Poblacion'].id,
      barangayName: 'Poblacion',
      landmarkOrNotes: 'Near the municipal plaza, white SUV parked outside',
      deliveryMethod: 'DELIVERY',
      deliveryDate: '2026-10-31',
      deliveryTimeSlot: '03:00 PM - 05:00 PM',
      deliveryFee: 20.0,
      subtotal: 360.0,
      totalAmount: 380.0,
      status: 'PENDING',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      exchangeGallonsCount: 0,
      newGallonsCount: 0,
      items: {
        create: [
          {
            productId: productMap['purified-water-500ml-pack-24'].id,
            productName: 'Purified Water — 500ml Bottled Water (Pack of 24)',
            waterType: 'Purified Water',
            containerType: 'Pack of 24 Bottles (500ml each)',
            capacity: '12 Liters Total (24 x 500ml)',
            price: 180.0,
            isExchange: false,
            containerFee: 0.0,
            quantity: 2,
            subtotal: 360.0,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', notes: 'Order placed by customer on web storefront', changedByName: 'Customer' },
        ],
      },
    },
  });

  console.log('✅ Sample orders seeded with full history and assignments!');
  console.log('🎉 Seed complete! Aqua B database is ready.');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
