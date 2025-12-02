import React, { useState, useMemo } from 'react';
import type { JSX } from "react";
import { bookingService } from '@/src/services/booking';



import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ListRenderItem,
} from 'react-native';

// Types
type RenderItemProps = { item: string };

export default function BookRideScreen(): JSX.Element {
    const [pickup, setPickup] = useState<string>('');
    const [dropoff, setDropoff] = useState<string>('');
    const [showPickupSuggestions, setShowPickupSuggestions] = useState<boolean>(false);
    const [showDropoffSuggestions, setShowDropoffSuggestions] = useState<boolean>(false);
    const [numRiders, setNumRiders] = useState<number>(1);

    // Static suggestion list
    const LOCATIONS: string[] = useMemo(
        () => [
            'Main Gate, University Campus',
            'North Library, University Campus',
            'South Dorms, University Campus',
            'Bus Stop A - College Road',
            'Cafeteria Plaza',
            'Engineering Block 1',
            'Engineering Block 2',
            'Student Center',
            'Sports Complex',
            'Central Parking Lot',
            'Metro Station - East Exit',
            'Mall of City - North Wing',
            'Airport Terminal 1',
        ],
        []
    );

    const filterSuggestions = (q: string): string[] => {
        if (!q || q.trim() === '') return [];
        const lower = q.toLowerCase();
        return LOCATIONS.filter((l) => l.toLowerCase().includes(lower));
    };

    const pickupSuggestions: string[] = filterSuggestions(pickup);
    const dropoffSuggestions: string[] = filterSuggestions(dropoff);

    const onSelectPickup = (text: string): void => {
        setPickup(text);
        setShowPickupSuggestions(false);
    };

    const onSelectDropoff = (text: string): void => {
        setDropoff(text);
        setShowDropoffSuggestions(false);
    };

    const increment = (): void => setNumRiders((n) => Math.min(8, n + 1));
    const decrement = (): void => setNumRiders((n) => Math.max(1, n - 1));


    const onConfirm = async () => {
     try {
        const data = await bookingService.bookCab(pickup, dropoff, numRiders);

        if (!data || !data.driver_name) {
            alert('No drivers available at the moment. Please try again later.');
            return;
        }
        alert(`
        🎉 Cab Booked Successfully!
            Driver: ${data.driver_name}
            ETA: ${data.eta_minutes} minutes
            Fare: $${data.estimated_fare}


            Pickup: ${data.pickup_location}
            Drop-off: ${data.dropoff_location}
        `);

        console.log('Cab booking response:', data);
  } catch (error) {
    console.error('Failed to book cab:', error);
    alert('Failed to book cab. Please try again.');
  }
};
    // List renderers
    const renderSuggestion: ListRenderItem<string> = ({ item }) => (
        <TouchableOpacity onPress={() => onSelectPickup(item)} style={styles.suggestionRow}>
            <Text style={styles.suggestionText}>📍 {item}</Text>
        </TouchableOpacity>
    );

    const renderDropoffSuggestion: ListRenderItem<string> = ({ item }) => (
        <TouchableOpacity onPress={() => onSelectDropoff(item)} style={styles.suggestionRow}>
            <Text style={styles.suggestionText}>📍 {item}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerIcon}>🚖</Text>
                <Text style={styles.headerTitle}>Book your ride</Text>
                <Text style={styles.headerSubtitle}>Enter your trip details below</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.content}
            >
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>Where are you going?</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Pickup</Text>
                        <TextInput
                            placeholder="Type pickup address or select from suggestions"
                            value={pickup}
                            onChangeText={(t: string) => {
                                setPickup(t);
                                setShowPickupSuggestions(true);
                            }}
                            onFocus={() => setShowPickupSuggestions(true)}
                            style={styles.input}
                        />
                        {showPickupSuggestions && pickupSuggestions.length > 0 && (
                            <FlatList<string>
                                keyboardShouldPersistTaps="handled"
                                data={pickupSuggestions}
                                keyExtractor={(item: string) => item}
                                style={styles.suggestions}
                                renderItem={renderSuggestion}
                            />
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Drop-off</Text>
                        <TextInput
                            placeholder="Type drop-off address or select from suggestions"
                            value={dropoff}
                            onChangeText={(t: string) => {
                                setDropoff(t);
                                setShowDropoffSuggestions(true);
                            }}
                            onFocus={() => setShowDropoffSuggestions(true)}
                            style={styles.input}
                        />
                        {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                            <FlatList<string>
                                keyboardShouldPersistTaps="handled"
                                data={dropoffSuggestions}
                                keyExtractor={(item: string) => item}
                                style={styles.suggestions}
                                renderItem={renderDropoffSuggestion}
                            />
                        )}
                    </View>

                    <View style={styles.inlineRow}>
                        <View>
                            <Text style={styles.inputLabel}>Number of riders</Text>
                            <View style={styles.counterRow}>
                                <TouchableOpacity onPress={decrement} style={styles.counterBtn}>
                                    <Text style={styles.counterBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>{numRiders}</Text>
                                <TouchableOpacity onPress={increment} style={styles.counterBtn}>
                                    <Text style={styles.counterBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.summaryRow}>
                        <View>
                            <Text style={styles.summaryLabel}>Summary</Text>
                            <Text style={styles.summaryText} numberOfLines={2}>
                                {pickup || '<pickup not set>'} → {dropoff || '<drop-off not set>'}
                            </Text>
                            <Text style={[styles.summaryText, { marginTop: 6 }]}>Riders: {numRiders}</Text>
                        </View>

                        <TouchableOpacity onPress={onConfirm} style={styles.confirmBtn}>
                            <Text style={styles.confirmBtnText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.notice}></Text>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F7F9' },
    header: {
        backgroundColor: '#0A84FF',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 18,
        height: 150,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        justifyContent: 'center',
    },
    headerIcon: { color: '#fff', fontSize: 20, marginBottom: 8 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '600' },
    headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },

    content: { flex: 1, padding: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 6,
    },
    cardSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },

    inputGroup: { marginBottom: 12 },
    inputLabel: { fontSize: 13, color: '#222', marginBottom: 6, fontWeight: '500' },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#E6E9EE',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FFF',
    },
    suggestions: {
        maxHeight: 140,
        borderWidth: 1,
        borderColor: '#EEF1F5',
        marginTop: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    suggestionRow: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F5F7',
    },
    suggestionText: { fontSize: 14 },

    inlineRow: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 8 },
    counterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    counterBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E6E9EE',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    counterBtnText: { fontSize: 20, fontWeight: '600' },
    counterValue: { marginHorizontal: 12, fontSize: 16, fontWeight: '600' },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 18,
    },
    summaryLabel: { color: '#888', fontSize: 12 },
    summaryText: { fontSize: 14, maxWidth: 220 },

    confirmBtn: {
        backgroundColor: '#0A84FF',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnText: { color: '#fff', fontWeight: '700' },

    notice: { marginTop: 14, color: '#666', fontSize: 12, textAlign: 'center' },
});
