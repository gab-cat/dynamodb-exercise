export const InventorySchema = {
  format: 'onetable:1.1.0',
  version: '0.0.1',
  indexes: {
    primary: { hash: 'pk', sort: 'sk' },
    gsi1: { hash: 'gsi1pk', sort: 'gsi1sk', follow: true },
    gsi2: { hash: 'gsi2pk', sort: 'gsi2sk', follow: true },
    gsi3: { hash: 'gsi3pk', sort: 'gsi3sk', follow: true },
  },
  models: {
    // Product Model
    Product: {
      pk: { type: String, value: 'PRODUCT#${id}' },
      sk: { type: String, value: 'METADATA' },
      gsi1pk: { type: String, value: 'CATEGORY#${categoryId}' },
      gsi1sk: { type: String, value: 'PRODUCT#${name}' },
      gsi2pk: { type: String, value: 'SUPPLIER#${supplierId}' },
      gsi2sk: { type: String, value: 'PRODUCT#${id}' },
      gsi3pk: { type: String, value: 'SKU' },
      gsi3sk: { type: String, value: '${sku}' },

      id: { type: String, generate: 'ulid', required: true },
      name: { type: String, required: true },
      description: { type: String },
      sku: { type: String, required: true, unique: true },
      categoryId: { type: String, required: true },
      supplierId: { type: String, required: true },
      unitPrice: { type: Number, required: true },
      unitCost: { type: Number, required: true },
      minimumStock: { type: Number, default: 0 },
      maximumStock: { type: Number },
      weight: { type: Number },
      dimensions: {
        type: Object,
        schema: {
          length: { type: Number },
          width: { type: Number },
          height: { type: Number },
        },
      },
      isActive: { type: Boolean, default: true },
      tags: { type: Array },
    },

    // Category Model
    Category: {
      pk: { type: String, value: 'CATEGORY#${id}' },
      sk: { type: String, value: 'METADATA' },
      gsi1pk: { type: String, value: 'CATEGORIES' },
      gsi1sk: { type: String, value: 'CATEGORY#${name}' },

      id: { type: String, generate: 'ulid', required: true },
      name: { type: String, required: true },
      description: { type: String },
      parentCategoryId: { type: String },
      isActive: { type: Boolean, default: true },
    },

    // Supplier Model
    Supplier: {
      pk: { type: String, value: 'SUPPLIER#${id}' },
      sk: { type: String, value: 'METADATA' },
      gsi1pk: { type: String, value: 'SUPPLIERS' },
      gsi1sk: { type: String, value: 'SUPPLIER#${name}' },

      id: { type: String, generate: 'ulid', required: true },
      name: { type: String, required: true },
      contactEmail: { type: String, required: true },
      contactPhone: { type: String },
      address: {
        type: Object,
        schema: {
          street: { type: String },
          city: { type: String },
          state: { type: String },
          zipCode: { type: String },
          country: { type: String, default: 'US' },
        },
      },
      paymentTerms: { type: String },
      leadTimeDays: { type: Number },
      isActive: { type: Boolean, default: true },
    },

    // Warehouse Model
    Warehouse: {
      pk: { type: String, value: 'WAREHOUSE#${id}' },
      sk: { type: String, value: 'METADATA' },
      gsi1pk: { type: String, value: 'WAREHOUSES' },
      gsi1sk: { type: String, value: 'WAREHOUSE#${name}' },

      id: { type: String, generate: 'ulid', required: true },
      name: { type: String, required: true },
      address: {
        type: Object,
        schema: {
          street: { type: String },
          city: { type: String },
          state: { type: String },
          zipCode: { type: String },
          country: { type: String, default: 'US' },
        },
      },
      capacity: { type: Number },
      isActive: { type: Boolean, default: true },
    },

    // Inventory Level Model (Stock by Product and Warehouse)
    InventoryLevel: {
      pk: { type: String, value: 'WAREHOUSE#${warehouseId}' },
      sk: { type: String, value: 'PRODUCT#${productId}' },
      gsi1pk: { type: String, value: 'PRODUCT#${productId}' },
      gsi1sk: { type: String, value: 'WAREHOUSE#${warehouseId}' },
      gsi2pk: { type: String, value: 'LOW_STOCK' },
      gsi2sk: {
        type: String,
        value: '${quantityOnHand}#${productId}',
        condition: '${quantityOnHand} <= ${reorderPoint}',
      },

      productId: { type: String, required: true },
      warehouseId: { type: String, required: true },
      quantityOnHand: { type: Number, default: 0 },
      quantityReserved: { type: Number, default: 0 },
      quantityAvailable: {
        type: Number,
        value: '${quantityOnHand} - ${quantityReserved}',
      },
      reorderPoint: { type: Number, default: 10 },
      reorderQuantity: { type: Number, default: 50 },
      lastStockCount: { type: Date },
      lastUpdated: { type: Date },
    },

    // Purchase Order Model
    PurchaseOrder: {
      pk: { type: String, value: 'PURCHASE_ORDER#${id}' },
      sk: { type: String, value: 'METADATA' },
      gsi1pk: { type: String, value: 'SUPPLIER#${supplierId}' },
      gsi1sk: { type: String, value: 'PO#${orderDate}#${id}' },
      gsi2pk: { type: String, value: 'PO_STATUS#${status}' },
      gsi2sk: { type: String, value: 'PO#${orderDate}#${id}' },

      id: { type: String, generate: 'ulid', required: true },
      supplierId: { type: String, required: true },
      warehouseId: { type: String, required: true },
      orderDate: { type: Date, required: true },
      expectedDeliveryDate: { type: Date },
      actualDeliveryDate: { type: Date },
      status: {
        type: String,
        enum: [
          'DRAFT',
          'PENDING',
          'APPROVED',
          'ORDERED',
          'RECEIVED',
          'CANCELLED',
        ],
        default: 'DRAFT',
      },
      totalAmount: { type: Number },
      notes: { type: String },
    },

    // Purchase Order Line Item Model
    PurchaseOrderItem: {
      pk: { type: String, value: 'PURCHASE_ORDER#${purchaseOrderId}' },
      sk: { type: String, value: 'ITEM#${productId}' },
      gsi1pk: { type: String, value: 'PRODUCT#${productId}' },
      gsi1sk: { type: String, value: 'PO_ITEM#${purchaseOrderId}' },

      purchaseOrderId: { type: String, required: true },
      productId: { type: String, required: true },
      quantityOrdered: { type: Number, required: true },
      quantityReceived: { type: Number, default: 0 },
      unitCost: { type: Number, required: true },
      totalCost: { type: Number, value: '${quantityOrdered} * ${unitCost}' },
    },

    // Stock Movement Model (Transaction History)
    StockMovement: {
      pk: { type: String, value: 'PRODUCT#${productId}' },
      sk: { type: String, value: 'MOVEMENT#${timestamp}#${id}' },
      gsi1pk: { type: String, value: 'WAREHOUSE#${warehouseId}' },
      gsi1sk: { type: String, value: 'MOVEMENT#${timestamp}#${id}' },
      gsi2pk: { type: String, value: 'MOVEMENT_TYPE#${movementType}' },
      gsi2sk: { type: String, value: 'MOVEMENT#${timestamp}#${id}' },

      id: { type: String, generate: 'ulid', required: true },
      productId: { type: String, required: true },
      warehouseId: { type: String, required: true },
      movementType: {
        type: String,
        enum: ['RECEIPT', 'SHIPMENT', 'ADJUSTMENT', 'TRANSFER', 'RETURN'],
        required: true,
      },
      quantity: { type: Number, required: true }, // Positive for inbound, negative for outbound
      previousQuantity: { type: Number, required: true },
      newQuantity: { type: Number, required: true },
      unitCost: { type: Number },
      referenceType: { type: String }, // 'PURCHASE_ORDER', 'SALES_ORDER', 'MANUAL', etc.
      referenceId: { type: String },
      notes: { type: String },
      performedBy: { type: String, required: true },
      timestamp: { type: Date, required: true },
    },
  },
  params: {
    isoDates: true,
    timestamps: true,
    createdField: 'createdAt',
    updatedField: 'updatedAt',
  },
} as const;
