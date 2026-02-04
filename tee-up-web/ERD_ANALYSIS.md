# TeeUp Admin Web - Simplified ERD Analysis

## Overview
Simplified database schema for a golf marketplace app focusing on core features: Users, Listings, Reports, and Chat.

---

## Core Entities

### 1. **Users**
**Purpose**: Store all user accounts (buyers, sellers, and admins)

**Attributes**:
- `id` (PK) - Unique identifier
- `username` - Unique username
- `email` - Unique email address
- `name` - Full name
- `password_hash` - Encrypted password
- `user_type` - Enum: 'user' | 'admin'
- `status` - Enum: 'active' | 'suspended' | 'banned'
- `profile_photo_url` - Optional profile image
- `location` - Optional location
- `created_at` - Timestamp
- `updated_at` - Timestamp

---

### 2. **Listings**
**Purpose**: Store golf items for sale

**Attributes**:
- `id` (PK) - Unique identifier
- `seller_id` (FK) - References Users.id
- `title` - Listing title
- `description` - Product description
- `category` - Enum: 'Driver' | 'Woods' | 'Iron' | 'Putters' | 'Apparel' | 'Accessories' | 'Others'
- `condition` - Enum: 'New' | 'Slightly Used' | 'Well Used'
- `price` - Decimal (Philippine Peso)
- `images` - JSON array of image URLs
- `status` - Enum: 'active' | 'pending' | 'sold' | 'rejected'
- `location` - String
- `approved_by` (FK) - References Users.id (admin who approved, nullable)
- `created_at` - Timestamp
- `updated_at` - Timestamp

---

### 3. **Reports**
**Purpose**: Track reports made by users about other users or listings

**Attributes**:
- `id` (PK) - Unique identifier
- `reported_type` - Enum: 'user' | 'listing'
- `reported_id` - Integer (ID of user or listing)
- `reporter_id` (FK) - References Users.id (who made the report)
- `reason` - Text
- `status` - Enum: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
- `reviewed_by` (FK) - References Users.id (admin, nullable)
- `reviewed_at` - Timestamp (nullable)
- `created_at` - Timestamp
- `updated_at` - Timestamp

---

### 4. **Messages**
**Purpose**: Store chat messages between users about listings

**Attributes**:
- `id` (PK) - Unique identifier
- `listing_id` (FK) - References Listings.id
- `sender_id` (FK) - References Users.id
- `receiver_id` (FK) - References Users.id
- `message` - Text
- `read` - Boolean (default: false)
- `created_at` - Timestamp

---

## Relationships

### One-to-Many Relationships:

1. **Users → Listings**
   - `Users.id` → `Listings.seller_id`
   - One user can have many listings

2. **Users → Listings (Approval)**
   - `Users.id` → `Listings.approved_by`
   - One admin can approve many listings

3. **Users → Reports (Reporter)**
   - `Users.id` → `Reports.reporter_id`
   - One user can make many reports

4. **Users → Reports (Reviewer)**
   - `Users.id` → `Reports.reviewed_by`
   - One admin can review many reports

5. **Listings → Messages**
   - `Listings.id` → `Messages.listing_id`
   - One listing can have many messages

6. **Users → Messages (Sender)**
   - `Users.id` → `Messages.sender_id`
   - One user can send many messages

7. **Users → Messages (Receiver)**
   - `Users.id` → `Messages.receiver_id`
   - One user can receive many messages

---

## Enums/Constants

### User Status:
- `active` - User can use the platform
- `suspended` - Temporarily restricted
- `banned` - Permanently banned

### User Type:
- `user` - Regular user (buyer/seller)
- `admin` - Administrator

### Listing Status:
- `pending` - Awaiting admin approval
- `active` - Approved and visible
- `sold` - Item has been sold
- `rejected` - Rejected by admin

### Listing Category:
- `Driver`
- `Woods`
- `Iron`
- `Putters`
- `Apparel`
- `Accessories`
- `Others`

### Listing Condition:
- `New`
- `Slightly Used`
- `Well Used`

### Report Status:
- `pending` - Newly reported, not reviewed
- `reviewed` - Currently under review
- `resolved` - Issue resolved
- `dismissed` - Report was invalid

### Report Type:
- `user` - Report about a user
- `listing` - Report about a listing

---

## Dashboard Metrics (Derived Data)

1. **Total Users**: `COUNT(Users WHERE user_type = 'user')`
2. **Active Users**: `COUNT(Users WHERE status = 'active' AND user_type = 'user')`
3. **Total Listings**: `COUNT(Listings)`
4. **Top Sellers**: Users with most listings (WHERE status = 'active')
5. **Flagged Listings**: `COUNT(Reports WHERE reported_type = 'listing' AND status IN ('pending', 'reviewed'))`

---

## Indexes (Performance Optimization)

### Recommended Indexes:
1. `Users.username` - Unique index
2. `Users.email` - Unique index
3. `Users.status` - Index for filtering
4. `Listings.seller_id` - Index for filtering by seller
5. `Listings.status` - Index for filtering by status
6. `Listings.category` - Index for filtering by category
7. `Listings.created_at` - Index for sorting by date
8. `Reports.reported_type` - Index for filtering
9. `Reports.status` - Index for filtering
10. `Messages.listing_id` - Index for fetching conversation
11. `Messages.sender_id` - Index for user's sent messages
12. `Messages.receiver_id` - Index for user's received messages

---

## ERD Diagram Summary

```
Users (1) ────< (M) Listings (via seller_id)
Users (1) ────< (M) Listings (via approved_by)
Users (1) ────< (M) Reports (via reporter_id)
Users (1) ────< (M) Reports (via reviewed_by)
Users (1) ────< (M) Messages (via sender_id)
Users (1) ────< (M) Messages (via receiver_id)

Listings (1) ────< (M) Messages
```

---

## Simplified Design Decisions

### Removed:
- **User Reviews** - Can add simple rating system later if needed
- **Transactions** - Simple marketplace: mark listing as "sold" when purchased
- **Saves/Favorites** - Nice to have, not essential for MVP
- **Flagged Listings** - Merged into Reports (more flexible)
- **Admin Actions** - Can log via Reports table
- **Listing Images Table** - Store as JSON array in Listings (simpler)
- **Product Reviews** - Can add later if needed

### Kept:
- **Users** - Core entity for all user management
- **Listings** - Core entity for marketplace items
- **Reports** - Essential for moderation (users and listings)
- **Messages** - Essential for buyer-seller communication

---

## Next Steps

1. Update visual ERD diagram in admin web
2. Generate database migration scripts
3. Implement database models in backend
4. Create API endpoints for CRUD operations
5. Update admin dashboard to reflect simplified schema
