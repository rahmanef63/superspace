# Inventory Module Product Requirements Document (PRD)

## 1. Executive Summary

### 1.1 Overview
The Inventory Module provides comprehensive inventory management capabilities for businesses of all sizes. It transforms basic stock tracking into an intelligent, automated system that optimizes inventory levels, reduces waste, and improves operational efficiency.

### 1.2 Business Value
- Reduced carrying costs through optimal inventory levels
- Improved cash flow with just-in-time inventory
- Enhanced customer satisfaction with accurate stock availability
- Minimized stockouts and overstock situations
- Streamlined warehouse operations with advanced picking strategies
- Compliance with industry regulations through batch/lot tracking

### 1.3 Target Users
- Warehouse Managers
- Inventory Clerks
- Procurement Officers
- Operations Managers
- Supply Chain Managers
- Quality Control Teams

## 2. Current State vs Future State

### 2.1 Current State
- Basic stock tracking
- Manual inventory counts
- Simple stock level monitoring
- No multi-location support
- Manual reorder decisions
- Limited reporting capabilities

### 2.2 Future State
- Automated inventory management with AI-powered forecasting
- Multi-location, multi-warehouse support
- Real-time stock visibility across all channels
- Automated reorder point calculations
- Advanced reporting and analytics
- Complete traceability from receiving to shipping

## 3. Feature Specifications

### 3.1 Barcode/QR Code Management

#### 3.1.1 User Stories
- As a warehouse clerk, I want to scan barcodes for fast inventory updates
- As a manager, I want to generate unique barcodes for all products
- As an auditor, I want to track all barcode scanning activities
- As a mobile user, I want to scan barcodes using my phone camera

#### 3.1.2 Functional Requirements
- Barcode generation (Code 128, EAN-13, UPC-A)
- QR code generation
- Bulk barcode printing
- Mobile scanning support
- Batch scanning operations
- Barcode label templates
- Custom barcode formats
- Scanner device integration

#### 3.1.3 Technical Requirements
- Barcode generation library
- Camera API integration for mobile
- Bluetooth scanner support
- Label printing integration
- Offline scanning capability
- Synchronization of scanned data

### 3.2 Stock Transfers

#### 3.2.1 User Stories
- As a warehouse manager, I want to transfer stock between locations
- As an auditor, I want complete transfer history and approval chain
- As a logistics coordinator, I want to track in-transit inventory
- As a system admin, I want to configure transfer approval rules

#### 3.2.2 Functional Requirements
- Inter-location transfers
- Transfer request creation
- Multi-level approval workflow
- In-transit tracking
- Transfer documentation
- Partial transfer support
- Transfer cost allocation
- Transfer history audit

#### 3.2.3 Technical Requirements
- Transfer state machine
- Location hierarchy support
- Real-time stock updates
- Email/SMS notifications
- Transfer document generation
- Integration with shipping module

### 3.3 Stock Adjustments

#### 3.3.1 User Stories
- As an inventory clerk, I want to adjust stock for damages or discrepancies
- As a manager, I want to approve all stock adjustments
- As an accountant, I want to track financial impact of adjustments
- As an auditor, I want complete adjustment audit trail

#### 3.3.2 Functional Requirements
- Stock adjustment types (Write-off, Damage, Loss, Gain)
- Adjustment reason codes
- Approval workflow
- Batch adjustments
- Adjustment value calculation
- GL account integration
- Adjustment reporting
- Auto-adjustment rules

#### 3.3.3 Technical Requirements
- Adjustment validation rules
- Financial integration
- Audit logging
- Role-based approval
- Historical adjustment tracking
- Costing method support

### 3.4 Reorder Points

#### 3.4.1 User Stories
- As a procurement manager, I want automatic reorder suggestions
- As a planner, I want to set minimum and maximum stock levels
- As a system, I want to calculate optimal reorder quantities
- As a manager, I want to review reorder recommendations

#### 3.4.2 Functional Requirements
- Min/max level configuration
- Lead time tracking
- Safety stock calculation
- Economic Order Quantity (EOQ)
- Reorder point calculation
- Automated reorder suggestions
- Seasonal demand adjustment
- Supplier lead time variance

#### 3.4.3 Technical Requirements
- Inventory forecasting algorithms
- Historical data analysis
- Lead time calculation engine
- Optimization algorithms
- Machine learning for demand prediction
- Real-time stock monitoring

### 3.5 Batch/Lot Tracking

#### 3.5.1 User Stories
- As a quality manager, I want to track products by batch numbers
- As a compliance officer, I want complete traceability for recalls
- As a warehouse clerk, I want to select specific batches for orders
- As a customer, I want to know the expiry date of products

#### 3.5.2 Functional Requirements
- Batch number generation
- Expiry date tracking
- Manufacturing date recording
- Batch quarantine management
- Recall management
- Shelf life monitoring
- FIFO/FEFO picking
- Batch transaction history

#### 3.5.3 Technical Requirements
- Batch numbering system
- Expiry date alerts
- Recall workflow
- Traceability engine
- Regulatory compliance tracking
- Quality control integration

### 3.6 Serial Number Tracking

#### 3.6.1 User Stories
- As a retailer, I want to track individual high-value items
- As a warranty manager, I want to track warranty by serial number
- As a customer, I want to register my product by serial number
- As an auditor, I want complete serial number lifecycle tracking

#### 3.6.2 Functional Requirements
- Serial number assignment
- Serial number history
- Warranty tracking
- Product registration
- Theft prevention
- Asset tracking
- Service history
- Return/repair tracking

#### 3.6.3 Technical Requirements
- Unique serial number generation
- Serial number lifecycle tracking
- Integration with warranty system
- Mobile scanning support
- Anti-theft measures

### 3.7 Stock Valuation

#### 3.7.1 User Stories
- As an accountant, I want to value inventory using different methods
- As a manager, I want to know the real value of my inventory
- As an auditor, I want transparent valuation methods
- As a system, I want to support multiple valuation methods

#### 3.7.2 Functional Requirements
- FIFO valuation
- LIFO valuation
- Weighted average
- Standard cost
- Actual cost
- Valuation reports
- Cost layer tracking
- Inventory aging analysis

#### 3.7.3 Technical Requirements
- Cost calculation engine
- Multiple costing method support
- Historical cost tracking
- Financial reporting integration
- Audit trail for cost changes

### 3.8 Inventory Forecasting

#### 3.8.1 User Stories
- As a planner, I want AI-powered demand forecasts
- As a manager, I want to see forecast accuracy metrics
- As a buyer, I want to plan purchases based on forecasts
- As a system, I want to continuously improve forecast accuracy

#### 3.8.2 Functional Requirements
- Demand forecasting models
- Seasonal trend analysis
- Forecast accuracy tracking
- Exception handling
- Manual forecast overrides
- Forecast confidence levels
- ABC analysis integration
- New product forecasting

#### 3.8.3 Technical Requirements
- Machine learning models
- Time series analysis
- Statistical algorithms
- Historical data processing
- Model training pipeline
- Real-time forecast updates

### 3.9 Cycle Counting

#### 3.9.1 User Stories
- As a warehouse manager, I want to schedule regular cycle counts
- As an inventory clerk, I want to perform counts using mobile devices
- As an auditor, I want variance analysis and reporting
- As a system, I want to optimize count schedules

#### 3.9.2 Functional Requirements
- Count schedule management
- ABC-based counting
- Mobile count entry
- Variance analysis
- Approval workflow
- Auto-adjustment option
- Count history tracking
- Performance metrics

#### 3.9.3 Technical Requirements
- Count scheduling engine
- Mobile data capture
- Real-time updates
- Variance calculation
- Reporting dashboard
- Integration with adjustment module

### 3.10 Product Bundles/Kitting

#### 3.10.1 User Stories
- As a product manager, I want to create product bundles
- As a warehouse clerk, I want to assemble kits from components
- As an order processor, I want to automatically reserve kit components
- As an analyst, I want to track bundle performance

#### 3.10.2 Functional Requirements
- Bundle definition
- Bill of Materials (BOM)
- Kit assembly workflow
- Component reservation
- Bundle pricing
- Kit disassembly
- Bundle analytics
- Component substitution

#### 3.10.3 Technical Requirements
- BOM management system
- Component tracking
- Assembly workflow engine
- Pricing calculation
- Inventory allocation rules

### 3.11 Multi-Location Management

#### 3.11.1 User Stories
- As a multi-site manager, I want to see stock across all locations
- As a picker, I want optimized picking routes
- As a planner, I want to balance stock across locations
- As a customer, I want to see availability at nearby stores

#### 3.11.2 Functional Requirements
- Location hierarchy
- Zone management
- Bin location tracking
- Cross-location visibility
- Location-based transfers
- Picking route optimization
- Store locator
- Regional allocation

#### 3.11.3 Technical Requirements
- Location management system
- Real-time synchronization
- GIS integration
- Route optimization algorithms
- Distributed database support

### 3.12 Stock Reservations

#### 3.12.1 User Stories
- As an order processor, I want to reserve stock for customer orders
- As a manager, I want to see reserved vs available stock
- As a customer service rep, I want to check if stock can be reserved
- As a system, I want to automatically release expired reservations

#### 3.12.2 Functional Requirements
- Stock reservation creation
- Reservation priority rules
- Automatic reservation release
- Partial reservation support
- Reservation reporting
- Reservation audit trail
- Customer-specific allocation
- Backorder management

#### 3.12.3 Technical Requirements
- Reservation engine
- Priority queue system
- Automated release rules
- Real-time availability checks
- Integration with order management

### 3.13 Supplier Management

#### 3.13.1 User Stories
- As a procurement manager, I want to maintain supplier information
- As a buyer, I want to see supplier lead times and performance
- As a system, I want to suggest best suppliers for products
- As an auditor, I want complete supplier transaction history

#### 3.13.2 Functional Requirements
- Supplier profiles
- Product-supplier mapping
- Lead time tracking
- Performance scoring
- Preferred supplier selection
- Supplier catalogs
- Quality ratings
- Communication history

#### 3.13.3 Technical Requirements
- Supplier database
- Performance calculation engine
- Catalog integration
- Communication logging
- Approval workflow for new suppliers

### 3.14 Stock Alerts

#### 3.14.1 User Stories
- As a manager, I want to be alerted when stock is running low
- As a quality manager, I want alerts for approaching expiry dates
- As a system, I want to send proactive alerts about inventory issues
- As a user, I want to customize my alert preferences

#### 3.14.2 Functional Requirements
- Low stock alerts
- Overstock alerts
- Expiry date alerts
- Slow-moving inventory alerts
- Reorder reminders
- Custom alert rules
- Alert escalation
- Multi-channel notifications

#### 3.14.3 Technical Requirements
- Alert engine
- Rule-based alerting
- Notification channels
- Alert history
- Preference management
- Real-time monitoring

## 4. Data Model

### 4.1 Core Entities

```typescript
// Product
interface Product {
  id: string
  sku: string
  name: string
  description: string
  category: string
  brand?: string
  unit: string
  weight?: number
  dimensions?: Dimensions
  barcode?: string
  isActive: boolean
  trackByBatch: boolean
  trackBySerial: boolean
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
  reorderQuantity: number
  leadTime: number
  cost: number
  price: number
  locations: ProductLocation[]
  suppliers: ProductSupplier[]
  createdAt: Date
  updatedAt: Date
}

// Stock Location
interface StockLocation {
  id: string
  code: string
  name: string
  type: 'warehouse' | 'store' | 'virtual'
  parentId?: string
  address: Address
  isActive: boolean
  zones: LocationZone[]
  createdAt: Date
  updatedAt: Date
}

// Location Zone
interface LocationZone {
  id: string
  locationId: string
  code: string
  name: string
  type: 'picking' | 'storage' | 'receiving' | 'shipping'
  bins: Bin[]
  createdAt: Date
}

// Bin Location
interface Bin {
  id: string
  zoneId: string
  code: string
  name: string
  capacity?: number
  currentStock: number
  isActive: boolean
}

// Stock Transaction
interface StockTransaction {
  id: string
  transactionNumber: string
  type: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'return'
  subType: string
  productId: string
  locationId: string
  binId?: string
  quantity: number
  unitCost?: number
  referenceNumber?: string
  referenceType?: 'po' | 'so' | 'transfer' | 'adjustment'
  batchNumber?: string
  serialNumbers?: string[]
  expiryDate?: Date
  reasonCode?: string
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdBy: string
  createdAt: Date
  confirmedAt?: Date
  approvedBy?: string
  approvedAt?: Date
}

// Stock Transfer
interface StockTransfer {
  id: string
  transferNumber: string
  fromLocationId: string
  toLocationId: string
  status: 'draft' | 'requested' | 'approved' | 'in_transit' | 'received' | 'cancelled'
  items: TransferItem[]
  requestedBy: string
  approvedBy?: string
  approvedAt?: Date
  shippedAt?: Date
  receivedAt?: Date
  notes?: string
  attachments?: string[]
  createdAt: Date
  updatedAt: Date
}

// Batch/Lot
interface Batch {
  id: string
  batchNumber: string
  productId: string
  quantity: number
  availableQuantity: number
  manufacturingDate?: Date
  expiryDate?: Date
  receivedDate: Date
  supplierId?: string
  locationId: string
  status: 'available' | 'quarantined' | 'expired' | 'recalled'
  qualityStatus?: 'pending' | 'approved' | 'rejected'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Serial Number
interface SerialNumber {
  id: string
  serialNumber: string
  productId: string
  batchId?: string
  locationId: string
  status: 'in_stock' | 'allocated' | 'sold' | 'returned' | 'repaired' | 'scrapped'
  cost?: number
  warrantyStart?: Date
  warrantyEnd?: Date
  customerId?: string
  saleId?: string
  notes?: string
  history: SerialHistory[]
  createdAt: Date
  updatedAt: Date
}

// Stock Count
interface StockCount {
  id: string
  countNumber: string
  locationId: string
  type: 'full' | 'cycle' | 'spot'
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate: Date
  startedAt?: Date
  completedAt?: Date
  items: CountItem[]
  totalVariance: number
  totalValue: number
  approvedBy?: string
  approvedAt?: Date
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Stock Alert
interface StockAlert {
  id: string
  alertType: 'low_stock' | 'overstock' | 'expiry' | 'slow_moving'
  severity: 'low' | 'medium' | 'high' | 'critical'
  productId: string
  locationId?: string
  message: string
  isRead: boolean
  isResolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
}

// Inventory Forecast
interface Forecast {
  id: string
  productId: string
  locationId: string
  forecastType: 'demand' | 'supply'
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  confidence: number
  model: string
  data: ForecastData[]
  lastUpdated: Date
  accuracy?: number
}
```

### 4.2 Relationships

- Product → Stock Locations (M:N)
- Product → Suppliers (M:N)
- Product → Batches (1:N)
- Product → Serial Numbers (1:N)
- Location → Zones (1:N)
- Zone → Bins (1:N)
- Transfer → Transfer Items (1:N)
- Stock Count → Count Items (1:N)

## 5. API Design

### 5.1 REST Endpoints

```typescript
// Products
GET    /api/products                     // List products
POST   /api/products                     // Create product
GET    /api/products/:id                 // Get product
PUT    /api/products/:id                 // Update product
DELETE /api/products/:id                 // Delete product
GET    /api/products/:id/stock           // Get stock levels
GET    /api/products/:id/transactions    // Get transactions
POST   /api/products/:id/adjustments     // Create adjustment

// Stock Management
GET    /api/stock/locations              // List locations
POST   /api/stock/transactions           // Create transaction
GET    /api/stock/transactions           // List transactions
POST   /api/stock/transfers              // Create transfer
GET    /api/stock/transfers              // List transfers
POST   /api/stock/transfers/:id/approve  // Approve transfer
POST   /api/stock/adjustments            // Create adjustment
GET    /api/stock/adjustments            // List adjustments

// Barcode/Scanning
POST   /api/barcode/generate             // Generate barcode
POST   /api/barcode/scan                 // Process scan
GET    /api/barcode/labels               // Get label templates

// Batches
GET    /api/batches                      // List batches
POST   /api/batches                      // Create batch
GET    /api/batches/:id                  // Get batch
PUT    /api/batches/:id                  // Update batch
POST   /api/batches/:id/quarantine       // Quarantine batch
POST   /api/batches/:id/recall           // Recall batch

// Serial Numbers
GET    /api/serials                      // List serial numbers
POST   /api/serials                      // Create serial
GET    /api/serials/:id                  // Get serial
PUT    /api/serials/:id                  // Update serial
POST   /api/serials/:id/allocate         // Allocate serial

// Stock Counts
GET    /api/counts                       // List counts
POST   /api/counts                       // Create count
GET    /api/counts/:id                   // Get count
PUT    /api/counts/:id                   // Update count
POST   /api/counts/:id/complete          // Complete count
POST   /api/counts/:id/approve           // Approve count

// Reports
GET    /api/reports/inventory            // Inventory reports
GET    /api/reports/valuation            // Valuation report
GET    /api/reports/movement             // Movement report
GET    /api/reports/aging                // Aging report
GET    /api/reports/forecast             // Forecast report

// Alerts
GET    /api/alerts                       // List alerts
PUT    /api/alerts/:id                   // Update alert
POST   /api/alerts/:id/resolve           // Resolve alert

// Forecasts
GET    /api/forecasts                    // List forecasts
POST   /api/forecasts                    // Generate forecast
GET    /api/forecasts/:id                // Get forecast
POST   /api/forecasts/:id/recalculate    // Recalculate forecast
```

### 5.2 Webhooks

```typescript
// Stock Events
stock.low
stock.out
stock.adjusted
stock.transferred
stock.received
stock.issued

// Product Events
product.created
product.updated
product.discontinued
product.low_stock

// Batch Events
batch.created
batch.expiring
batch.expired
batch.quarantined
batch.recalled

// Count Events
count.started
count.completed
count.approved
count.variance_detected

// Alert Events
alert.created
alert.escalated
alert.resolved
```

## 6. Integration Points

### 6.1 Internal Integrations

- **Purchase Module**: PO receiving, supplier integration
- **Sales Module**: Order fulfillment, stock allocation
- **Accounting Module**: Inventory valuation, cost of goods sold
- **Quality Module**: Quality checks, quarantine management
- **Manufacturing Module**: BOM consumption, production output
- **E-commerce Module**: Real-time stock sync
- **Reporting Module**: Inventory analytics

### 6.2 External Integrations

- **Barcode Scanners**: Zebra, Honeywell, Socket Mobile
- **Printer Services**: Zebra, Dymo, Brother
- **Shipping Carriers**: UPS, FedEx, DHL
- **Supplier Systems**: EDI integration
- **ERP Systems**: SAP, Oracle NetSuite
- **Marketplaces**: Amazon, eBay integration

## 7. Security & Compliance

### 7.1 Security Requirements

- Role-based access control for all inventory operations
- Audit trail for all stock movements
- Two-factor authentication for critical operations
- Data encryption at rest and in transit
- Network segmentation for warehouse systems
- Secure API access with rate limiting
- Biometric authentication for warehouse access

### 7.2 Compliance Requirements

- FDA 21 CFR Part 11 (for regulated industries)
- GS1 standards for barcodes
- ISO 9001 quality management
- SOX compliance for inventory valuation
- Industry-specific regulations (pharma, food, aerospace)
- Data retention policies
- Right to audit for supply chain partners

## 8. Performance Requirements

### 8.1 Response Times

- Stock lookup: < 100ms
- Transaction posting: < 500ms
- Report generation: < 10 seconds
- Barcode scan processing: < 200ms
- Stock count sync: Real-time
- Forecast calculation: < 30 minutes

### 8.2 Scalability

- Support 100,000+ SKUs
- Handle 1M+ transactions/day
- 99.95% uptime SLA
- Concurrent users: 10,000+
- Real-time sync across locations
- Mobile app performance optimization

## 9. User Experience Design

### 9.1 Key User Flows

#### 9.1.1 Receiving Flow
1. Scan PO barcode
2. Verify items received
3. Capture batch/serial numbers
4. Record receipts to specific bins
5. Print labels
6. Update inventory
7. Notify stakeholders

#### 9.1.2 Picking Flow
1. Receive picking list
2. Optimize picking route
3. Scan items during picking
4. Verify quantities
5. Update allocations
6. Move to shipping
7. Confirm shipment

#### 9.1.3 Stock Count Flow
1. Schedule count
2. Generate count sheets
3. Perform physical count
4. Enter variances
5. Investigate differences
6. Approve adjustments
7. Update records

### 9.2 UI/UX Considerations

- Large touch-friendly buttons for warehouse use
- High contrast for visibility
- Voice-guided operations
- Offline capability for poor connectivity areas
- Progressive web app for mobile devices
- Role-specific dashboards
- KPI-driven interfaces
- Contextual help and training

## 10. Testing Strategy

### 10.1 Unit Tests
- Inventory calculation logic
- FIFO/LIFO algorithms
- Costing methods
- Validation rules

### 10.2 Integration Tests
- API endpoint testing
- Database operations
- External system integration
- Real-time synchronization

### 10.3 End-to-End Tests
- Complete receiving process
- Order fulfillment
- Stock count procedures
- Transfer workflows

### 10.4 Performance Tests
- High volume transactions
- Concurrent users
- Mobile app performance
- Report generation

## 11. Deployment Strategy

### 11.1 Phased Rollout

#### Phase 1: Core Functionality (4 weeks)
- Product management
- Basic stock tracking
- Simple transactions
- Manual adjustments

#### Phase 2: Advanced Features (4 weeks)
- Multi-location support
- Barcode integration
- Batch tracking
- Stock transfers

#### Phase 3: Intelligence (4 weeks)
- Forecasting
- Auto-reorder
- Analytics
- Mobile app

#### Phase 4: Optimization (4 weeks)
- Route optimization
- Advanced reporting
- AI insights
- Full automation

## 12. Success Metrics

### 12.1 Operational KPIs
- Inventory accuracy: > 99.5%
- Stockout frequency: < 2%
- Carrying cost reduction: 20%
- Picking efficiency: +40%
- Cycle time reduction: 50%
- Forecast accuracy: > 85%

### 12.2 Technical KPIs
- System uptime: 99.95%
- Scan success rate: > 99%
- Sync latency: < 5 seconds
- User adoption: > 90%
- Error rate: < 0.05%

### 12.3 Financial KPIs
- Inventory turnover: Increase by 30%
- Working capital optimization: 25% reduction
- Labor cost savings: 35%
- Waste reduction: 40%
- Service level: > 98%

## 13. Risk Assessment

### 13.1 Technical Risks
- System downtime during peak operations
- Data synchronization issues
- Hardware failure in warehouses
- Integration failures with legacy systems
- Performance bottlenecks

### 13.2 Operational Risks
- User adoption resistance
- Inaccurate data entry
- Theft and shrinkage
- Supply chain disruptions
- Regulatory compliance

### 13.3 Mitigation Strategies
- Redundant systems and failover
- Comprehensive training programs
- Regular system backups
- Gradual rollout with pilot testing
- Continuous monitoring and alerts

## 14. Future Enhancements

### 14.1 Short Term (6 months)
- Voice picking
- RFID integration
- Drones for inventory
- AR/VR for training
- Predictive maintenance

### 14.2 Medium Term (12 months)
- Blockchain for traceability
- IoT sensor integration
- Machine learning optimization
- Autonomous robots
- Advanced analytics

### 14.3 Long Term (18+ months)
- Fully autonomous warehouses
- AI-driven supply chain
- Predictive supply network
- Digital twins
- Quantum computing optimization

## 15. Resource Requirements

### 15.1 Development Team
- Product Manager: 1
- Backend Developers: 4
- Frontend Developers: 3
- Mobile Developers: 2
- UI/UX Designer: 2
- QA Engineers: 3
- DevOps Engineer: 2

### 15.2 Timeline
- Total Duration: 20 weeks
- Development: 16 weeks
- Testing: 3 weeks
- Deployment: 1 week

### 15.3 Infrastructure
- Cloud servers with auto-scaling
- Database with read replicas
- CDN for static assets
- IoT gateway for devices
- Backup and disaster recovery

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-20 | ERP Team | Initial PRD creation |

## Sign-off

- [ ] Product Manager
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] QA Lead
- [ ] Operations Manager
- [ ] Business Stakeholder