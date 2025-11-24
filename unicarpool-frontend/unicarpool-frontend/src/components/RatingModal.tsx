import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  driverName: string;
  vehicleInfo?: string;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  driverName,
  vehicleInfo,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const ratingLabels: { [key: number]: string } = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  const ratingColors: { [key: number]: string } = {
    1: '#ff3b30',
    2: '#ff9500',
    3: '#ffcc00',
    4: '#34c759',
    5: '#00c853',
  };

  const handleRatingPress = (value: number) => {
    setRating(value);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit(rating, comment);
    // Reset form
    setRating(0);
    setComment('');
  };

  const handleSkip = () => {
    // Reset form
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rate Your Trip</Text>
            <Text style={styles.headerSubtitle}>Help us improve your experience</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Driver Info */}
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>
                  {driverName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </Text>
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{driverName}</Text>
                {vehicleInfo && (
                  <Text style={styles.vehicleInfo}>{vehicleInfo}</Text>
                )}
                <View style={styles.tripBadge}>
                  <Text style={styles.tripBadgeText}>Trip Completed</Text>
                </View>
              </View>
            </View>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>How was your ride?</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => handleRatingPress(value)}
                    style={styles.starButton}
                  >
                    <Text
                      style={[
                        styles.star,
                        rating >= value && styles.starFilled,
                      ]}
                    >
                      {rating >= value ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text
                  style={[
                    styles.ratingText,
                    { color: ratingColors[rating] },
                  ]}
                >
                  {ratingLabels[rating]}
                </Text>
              )}
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <View style={styles.commentLabelRow}>
                <Text style={styles.commentLabel}>Add a comment</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalText}>Optional</Text>
                </View>
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your experience with this trip..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{comment.length}/500</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.btnSkip} onPress={handleSkip}>
                <Text style={styles.btnSkipText}>Skip for Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnSubmit,
                  rating === 0 && styles.btnSubmitDisabled,
                ]}
                onPress={handleSubmit}
                disabled={rating === 0}
              >
                <Text style={styles.btnSubmitText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    backgroundColor: '#667eea',
    padding: 25,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  body: {
    padding: 30,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  driverAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  tripBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tripBadgeText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
  },
  ratingSection: {
    marginBottom: 25,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 40,
    color: '#ddd',
  },
  starFilled: {
    color: '#FFD700',
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    minHeight: 25,
  },
  commentSection: {
    marginBottom: 25,
  },
  commentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  optionalBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  optionalText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '500',
  },
  commentInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    maxHeight: 150,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 13,
    color: '#999',
    marginTop: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  btnSkip: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSkipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  btnSubmit: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSubmitDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  btnSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default RatingModal;