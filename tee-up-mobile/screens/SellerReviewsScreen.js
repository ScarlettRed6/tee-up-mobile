import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserRatingSummary, fetchUserRatings } from '../api/ratingApi';
import styles from './styles/SellerReviewsScreen.styles';

export default function SellerReviewsScreen({ navigation, route }) {
  const userId = route?.params?.userId;
  const sellerName = route?.params?.sellerName || 'Seller';
  const [summary, setSummary] = useState({ average_rating: '0.00', total_raters: 0 });
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRatings = async () => {
      if (!userId) {
        setError('Missing seller ID');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [summaryRes, ratingsRes] = await Promise.all([
          fetchUserRatingSummary(userId),
          fetchUserRatings(userId),
        ]);
        setSummary({
          average_rating: summaryRes?.average_rating || '0.00',
          total_raters: Number(summaryRes?.total_raters || 0),
        });
        setRatings(ratingsRes?.ratings || []);
      } catch (err) {
        console.error('Failed to load seller reviews', err);
        setError(err.response?.data?.message || err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadRatings();
  }, [userId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews for {sellerName}</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : error ? (
        <View style={styles.loadingState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryRating}>
              {Number(summary.average_rating || 0).toFixed(2)}
            </Text>
            <View style={styles.summaryStars}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.summaryCount}>
                {summary.total_raters} {summary.total_raters === 1 ? 'review' : 'reviews'}
              </Text>
            </View>
          </View>

          {ratings.length > 0 ? (
            ratings.map((rating, idx) => {
              const ratingValueDisplay = Number(rating.rating || 0).toFixed(1);
              return (
                <View key={`${rating.created_at || idx}`} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    {rating.reviewer_profile_image ? (
                      <Image source={{ uri: rating.reviewer_profile_image }} style={styles.reviewAvatarImage} />
                    ) : (
                      <Ionicons name="person-circle" size={40} color="#FF6B35" />
                    )}
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.reviewAuthor}>
                        {rating.reviewer_name ? `${rating.reviewer_name} (Buyer)` : `Buyer ${idx + 1}`}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {rating.created_at
                          ? new Date(rating.created_at).toLocaleDateString()
                          : 'Recently'}
                      </Text>
                    </View>
                    <View style={styles.reviewBadge}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.reviewBadgeText}>{ratingValueDisplay}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>
                    {rating.review?.length ? rating.review : 'No written review provided.'}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No reviews yet for this seller.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

