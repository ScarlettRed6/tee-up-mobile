import { useState } from 'react';
import UserHeader from './UserHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert } from './ui/alert';
import { createListing } from '../api/userListingsApi';
import './SellListingPage.css';

const CATEGORY_OPTIONS = ['Driver', 'Woods', 'Iron', 'Putters', 'Apparel', 'Accessories', 'Others'];
const FLEX_OPTIONS = ['Ladies', 'Senior', 'Medium', 'Regular', 'Stiff', 'Extra Stiff'];
const HAND_OPTIONS = ['Right Hand', 'Left Hand'];
const CONDITION_OPTIONS = ['New', 'Slightly Used', 'Well Used'];

function SellListingPage({
  user,
  onSearch,
  onSell,
  onMessages,
  onMyListings,
  onNotifications,
  onOpenProfile,
  onLogout,
  onGoHome,
  onViewAllNotifications,
  onListingCreated,
}) {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [flex, setFlex] = useState('');
  const [hand, setHand] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const showFlexSection = category === 'Driver' || category === 'Woods' || category === 'Iron';
  const showHandSection =
    category === 'Driver' || category === 'Woods' || category === 'Iron' || category === 'Putters';

  const handleFilesChange = (e) => {
    const list = Array.from(e.target.files || []).slice(0, 5);
    setFiles(list);
  };

  const priceNumber = price ? Number(price.replace(/,/g, '')) : 0;

  const isFormValid =
    title.trim() &&
    priceNumber > 0 &&
    category &&
    condition &&
    description.trim() &&
    (!showFlexSection || flex) &&
    (!showHandSection || hand);

  const handleSubmit = async (status) => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const listingData = {
        title: title.trim(),
        description: description.trim(),
        category,
        brand: brand.trim() || null,
        flex: showFlexSection ? flex || null : null,
        hand: showHandSection ? hand || null : null,
        condition,
        price: priceNumber,
        status,
        location: location.trim() || null,
      };
      const created = await createListing(listingData, files);
      if (onListingCreated) {
        onListingCreated(created, status);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Failed to save listing.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sell-page" style={{ backgroundColor: 'var(--color-background)' }}>
      <UserHeader
        user={user}
        onSearch={onSearch}
        onSell={onSell}
        onMessages={onMessages}
        onMyListings={onMyListings}
        onNotifications={onNotifications}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onGoHome={onGoHome}
        onViewAllNotifications={onViewAllNotifications}
      />

      <main className="sell-page-main">
        <Card className="sell-card">
          <CardHeader className="sell-card-header">
            <CardTitle>List Your Gear</CardTitle>
            <CardDescription>
              Fill in the details to get your equipment in front of local golfers.
            </CardDescription>
          </CardHeader>
          <CardContent className="sell-card-content">
            {error && (
              <Alert variant="destructive" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="sell-layout">
              <section className="sell-section">
                <h3 className="sell-section-title">Photos</h3>
                <p className="sell-section-subtitle">
                  Add up to five photos. Use clear, natural lighting.
                </p>
                <div className="sell-photos-row">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="sell-photo-placeholder" />
                  ))}
                  <label className="sell-photo-upload">
                    <span>Upload photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFilesChange}
                    />
                  </label>
                </div>
                {files.length > 0 && (
                  <p className="sell-photos-count">
                    {files.length} photo{files.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </section>

              <section className="sell-grid">
                <div className="sell-field span-2">
                <Label htmlFor="title">Listing Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. TaylorMade Stealth Driver 10.5°"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="sell-field span-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g. TaylorMade"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="sell-field">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="sell-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value || '')}
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sell-field">
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  className="sell-select"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value || '')}
                >
                  <option value="">Select condition</option>
                  {CONDITION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {showFlexSection && (
                <div className="sell-field">
                  <Label htmlFor="flex">Flex</Label>
                  <select
                    id="flex"
                    className="sell-select"
                    value={flex}
                    onChange={(e) => setFlex(e.target.value || '')}
                  >
                    <option value="">Select flex</option>
                    {FLEX_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showHandSection && (
                <div className="sell-field">
                  <Label htmlFor="hand">Hand</Label>
                  <select
                    id="hand"
                    className="sell-select"
                    value={hand}
                    onChange={(e) => setHand(e.target.value || '')}
                  >
                    <option value="">Select hand</option>
                    {HAND_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="sell-field">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="sell-field">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, Region"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="sell-field span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="sell-textarea"
                  rows={4}
                  placeholder="Share details like shaft, loft, condition, and why you're selling."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              </section>
            </div>
          </CardContent>
          <CardFooter className="sell-card-footer">
            <Button
              variant="outline"
              size="lg"
              className="sell-btn-secondary"
              disabled={submitting}
              onClick={() => handleSubmit('pending')}
            >
              Save Draft
            </Button>
            <Button
              size="lg"
              className="sell-btn-primary"
              disabled={!isFormValid || submitting}
              onClick={() => handleSubmit('available')}
            >
              {submitting ? 'Posting…' : 'Post to Marketplace'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default SellListingPage;

