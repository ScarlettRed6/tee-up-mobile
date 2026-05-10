import { useEffect, useMemo, useState } from 'react';
import UserHeader from './UserHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert } from './ui/alert';
import { ChevronLeft } from 'lucide-react';
import { createListing, updateListing } from '../api/userListingsApi';
import { PHILIPPINE_CITIES_BY_REGION, PHILIPPINE_LOCATION_OPTIONS } from '../constants/philippineLocations';
import './SellListingPage.css';

const CATEGORY_OPTIONS = ['Driver', 'Woods', 'Iron', 'Putters', 'Apparel', 'Accessories', 'Others'];
const FLEX_OPTIONS = ['Ladies', 'Senior', 'Medium', 'Regular', 'Stiff', 'Extra Stiff'];
const HAND_OPTIONS = ['Right Hand', 'Left Hand'];
const CONDITION_OPTIONS = ['New', 'Slightly Used', 'Well Used'];
const MAX_PHOTOS = 10;

function SellListingPage({
  user,
  onSearch,
  onSell,
  onMessages,
  onMyListings,
  onNotifications,
  onViewAllNotifications,
  onNotificationClick,
  onOpenProfile,
  onLogout,
  onGoHome,
  onListingCreated,
  mode = 'create',
  initialListing = null,
  onListingUpdated,
  onBack,
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
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const showFlexSection = category === 'Driver' || category === 'Woods' || category === 'Iron';
  const showHandSection =
    category === 'Driver' || category === 'Woods' || category === 'Iron' || category === 'Putters';
  const hasCustomLocation = location && !PHILIPPINE_LOCATION_OPTIONS.includes(location);

  useEffect(() => {
    if (!initialListing || mode !== 'edit') return;
    setTitle(initialListing.title || '');
    setBrand(initialListing.brand || '');
    setCategory(initialListing.category || '');
    setCondition(initialListing.condition || '');
    setFlex(initialListing.flex || '');
    setHand(initialListing.hand || '');
    setPrice(initialListing.price != null ? String(initialListing.price) : '');
    setLocation(initialListing.location || '');
    setDescription(initialListing.description || '');
    setExistingPhotos(Array.isArray(initialListing.photos) ? initialListing.photos.filter(Boolean) : []);
    setFiles([]);
    setError(null);
  }, [initialListing, mode]);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    const remainingSlots = Math.max(0, MAX_PHOTOS - existingPhotos.length);
    setFiles((prev) => [...prev, ...selectedFiles].slice(0, remainingSlots));
    e.target.value = '';
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  const allPhotoPreviews = [...existingPhotos, ...previewUrls];

  useEffect(() => () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const handleRemovePhotoAt = (indexToRemove) => {
    if (indexToRemove < existingPhotos.length) {
      setExistingPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
      return;
    }
    const fileIndex = indexToRemove - existingPhotos.length;
    handleRemoveFile(fileIndex);
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
      if (mode === 'edit' && initialListing?.listing_id) {
        const updated = await updateListing(
          initialListing.listing_id,
          {
            ...listingData,
            status: initialListing.status || 'available',
          },
          files,
          existingPhotos
        );
        onListingUpdated?.(updated);
      } else {
        const created = await createListing(listingData, files);
        if (onListingCreated) {
          onListingCreated(created, status);
        }
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
        onViewAllNotifications={onViewAllNotifications}
        onNotificationClick={onNotificationClick}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onGoHome={onGoHome}
      />

      <main className="sell-page-main">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="sell-back-btn"
          onClick={() => {
            if (onBack) {
              onBack();
              return;
            }
            onGoHome?.();
          }}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Card className="sell-card">
          <CardHeader className="sell-card-header">
            <CardTitle>{mode === 'edit' ? 'Edit Listing' : 'List Your Gear'}</CardTitle>
            <CardDescription>
              {mode === 'edit'
                ? 'Update your listing details and keep your photos in sync.'
                : 'Fill in the details to get your equipment in front of local golfers.'}
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
                  Add up to ten photos. Use clear, natural lighting.
                </p>
                <div className="sell-photos-row">
                  {Array.from({ length: MAX_PHOTOS }).map((_, idx) => (
                    <div key={idx} className="sell-photo-slot">
                      {allPhotoPreviews[idx] ? (
                        <>
                          <img
                            src={allPhotoPreviews[idx]}
                            alt={`Selected upload ${idx + 1}`}
                            className="sell-photo-preview"
                          />
                          <button
                            type="button"
                            className="sell-photo-remove"
                            aria-label={`Remove photo ${idx + 1}`}
                            onClick={() => handleRemovePhotoAt(idx)}
                          >
                            x
                          </button>
                        </>
                      ) : (
                        <div className="sell-photo-placeholder" />
                      )}
                    </div>
                  ))}
                  <label
                    className={`sell-photo-upload ${allPhotoPreviews.length >= MAX_PHOTOS ? 'sell-photo-upload-disabled' : ''}`}
                  >
                    <span>{allPhotoPreviews.length >= MAX_PHOTOS ? 'Max photos reached' : 'Upload photos'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFilesChange}
                      disabled={allPhotoPreviews.length >= MAX_PHOTOS}
                    />
                  </label>
                </div>
                {allPhotoPreviews.length > 0 && (
                  <p className="sell-photos-count">
                    {allPhotoPreviews.length} photo{allPhotoPreviews.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </section>

              <section className="sell-grid">
                <div className="sell-form-header span-2">
                  <h3 className="sell-section-title">Listing Details</h3>
                  <p className="sell-section-subtitle">Describe your gear clearly so buyers can decide faster.</p>
                </div>
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
                <select
                  id="location"
                  className="sell-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value || '')}
                >
                  <option value="">Select location (Region, City)</option>
                  {hasCustomLocation ? (
                    <option value={location}>{location}</option>
                  ) : null}
                  {Object.entries(PHILIPPINE_CITIES_BY_REGION).map(([region, cities]) => (
                    <optgroup key={region} label={region}>
                      {cities.map((city) => {
                        const value = `${region}, ${city}`;
                        return (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
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
            {mode !== 'edit' && (
              <Button
                variant="outline"
                size="lg"
                className="sell-btn-secondary"
                disabled={submitting}
                onClick={() => handleSubmit('pending')}
              >
                Save Draft
              </Button>
            )}
            <Button
              size="lg"
              className="sell-btn-primary"
              disabled={!isFormValid || submitting}
              onClick={() => handleSubmit(mode === 'edit' ? (initialListing?.status || 'available') : 'available')}
            >
              {submitting ? (mode === 'edit' ? 'Saving…' : 'Posting…') : mode === 'edit' ? 'Save Changes' : 'Post to Marketplace'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default SellListingPage;

