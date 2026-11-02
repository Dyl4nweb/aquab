import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      barangayId,
      landmarkOrNotes,
      deliveryMethod,
      deliveryDate,
      deliveryTimeSlot,
      paymentMethod,
      gcashReference,
      items, // array of { productId, isExchange, quantity }
    } = body;

    // Basic Validations
    if (!customerName || !customerPhone || !deliveryDate || !deliveryTimeSlot || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required customer and delivery schedule fields' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add items before checking out.' },
        { status: 400 }
      );
    }

    if (deliveryMethod === 'DELIVERY' && (!deliveryAddress || !barangayId)) {
      return NextResponse.json(
        { error: 'Please specify your delivery address and barangay.' },
        { status: 400 }
      );
    }

    if (paymentMethod === 'GCASH' && !gcashReference) {
      return NextResponse.json(
        { error: 'Please enter your GCash payment reference number.' },
        { status: 400 }
      );
    }

    // Retrieve active barangay and delivery fee from DB
    let deliveryFee = 0;
    let barangayName = null;
    if (deliveryMethod === 'DELIVERY') {
      const barangay = await prisma.barangay.findUnique({
        where: { id: barangayId },
      });
      if (!barangay || !barangay.isActive) {
        return NextResponse.json(
          { error: 'Selected barangay is currently not available for delivery.' },
          { status: 400 }
        );
      }
      deliveryFee = barangay.deliveryFee;
      barangayName = barangay.name;
    }

    // Retrieve all products from DB to validate pricing & inventory on the server!
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Validate availability & calculate server totals
    let calculatedSubtotal = 0;
    let exchangeGallonsCount = 0;
    let newGallonsCount = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct || !dbProduct.isActive) {
        return NextResponse.json(
          { error: `One of your selected products is no longer available.` },
          { status: 400 }
        );
      }

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.stock}, requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

      const isExchange = dbProduct.supportsExchange ? Boolean(item.isExchange) : false;
      const containerFee = isExchange ? 0 : (dbProduct.supportsExchange ? dbProduct.newContainerFee : 0);
      const unitPrice = dbProduct.price;
      const lineTotal = (unitPrice + containerFee) * item.quantity;

      calculatedSubtotal += lineTotal;

      if (dbProduct.supportsExchange) {
        if (isExchange) {
          exchangeGallonsCount += item.quantity;
        } else {
          newGallonsCount += item.quantity;
        }
      }

      orderItemsData.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        waterType: dbProduct.waterType,
        containerType: dbProduct.containerType,
        capacity: dbProduct.capacity,
        price: unitPrice,
        isExchange,
        containerFee,
        quantity: item.quantity,
        subtotal: lineTotal,
      });
    }

    const totalAmount = calculatedSubtotal + deliveryFee;

    // Generate unique order reference number: AQB-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AQB-${dateStr}-${randomSuffix}`;

    // Execute order creation and stock deduction in a Prisma transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          deliveryAddress: deliveryMethod === 'DELIVERY' ? deliveryAddress : 'Store Pickup at Station',
          barangayId: deliveryMethod === 'DELIVERY' ? barangayId : null,
          barangayName: deliveryMethod === 'DELIVERY' ? barangayName : 'Store Pickup',
          landmarkOrNotes: landmarkOrNotes || null,
          deliveryMethod,
          deliveryDate,
          deliveryTimeSlot,
          deliveryFee,
          subtotal: calculatedSubtotal,
          totalAmount,
          status: 'PENDING',
          paymentMethod,
          paymentStatus: 'PENDING',
          gcashReference: paymentMethod === 'GCASH' ? gcashReference : null,
          exchangeGallonsCount,
          newGallonsCount,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: [
              {
                status: 'PENDING',
                notes: paymentMethod === 'GCASH'
                  ? `Order placed online via GCash (Ref: ${gcashReference}). Naghihintay ng manual approval ng Admin.`
                  : `Order placed online (${deliveryMethod}). Total: ₱${totalAmount.toFixed(2)}`,
                changedByName: customerName,
              },
            ],
          },
        },
      });

      // 2. Decrement inventory and record transactions
      for (const item of items) {
        const dbProduct = productMap.get(item.productId)!;
        const previousStock = dbProduct.stock;
        const newStock = previousStock - item.quantity;

        await tx.product.update({
          where: { id: dbProduct.id },
          data: { stock: newStock },
        });

        await tx.inventoryTransaction.create({
          data: {
            productId: dbProduct.id,
            type: 'ORDER_FULFILLMENT',
            quantity: -item.quantity,
            previousStock,
            newStock,
            reason: `Order ${orderNumber} placed by ${customerName}`,
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to place order. Please try again.' },
      { status: 500 }
    );
  }
}

